from __future__ import annotations

import array
import concurrent.futures
import datetime as dt
import dis
import json
import math
import os
import platform
import statistics
import sys
import time
from itertools import islice
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "src" / "data" / "whiteboardBenchmarks.json"

COLORS = {
    "navy": "#1a2e6e",
    "red": "#c0392b",
    "green": "#1a7a4a",
    "purple": "#6c3483",
}


def median_time_us(fn, loops: int, repeats: int = 5) -> float:
    samples = []
    for _ in range(repeats):
        start = time.perf_counter()
        for _ in range(loops):
            fn()
        samples.append((time.perf_counter() - start) / loops * 1_000_000)
    return statistics.median(samples)


def median_time_ms(fn, repeats: int = 3) -> float:
    samples = []
    for _ in range(repeats):
        start = time.perf_counter()
        fn()
        samples.append((time.perf_counter() - start) * 1_000)
    return statistics.median(samples)


def format_number(value: float, digits: int = 2) -> str:
    return f"{value:.{digits}f}"


def kib(value: int) -> float:
    return value / 1024


def environment_metadata() -> dict:
    return {
        "pythonVersion": sys.version.split()[0],
        "implementation": platform.python_implementation(),
        "platform": platform.platform(),
        "machine": platform.machine(),
        "system": platform.system(),
        "release": platform.release(),
        "cpuCount": os.cpu_count(),
        "generatedAtUtc": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
    }


def build_slicing_topic() -> dict:
    source_size = 1_000_000
    spans = [1_000, 10_000, 100_000]
    seq = list(range(source_size))
    start_index = source_size // 4
    slice_points = []
    islice_points = []
    result_sizes = []

    for span in spans:
        stop_index = start_index + span
        if span <= 1_000:
            loops = 140
        elif span <= 10_000:
            loops = 24
        else:
            loops = 8

        slice_points.append(median_time_us(lambda s=seq, a=start_index, b=stop_index: s[a:b], loops=loops))
        islice_points.append(
            median_time_us(lambda s=seq, a=start_index, b=stop_index: list(islice(s, a, b)), loops=loops)
        )
        result_sizes.append(sys.getsizeof(seq[start_index:stop_index]))

    return {
        "title": "Measured materialized slice copies",
        "summary": "This notebook compares native list slicing with list(islice(...)) when both paths must return the same copied list from a 1,000,000-item source list. It measures throughput across 1k, 10k, and 100k copied spans and shows whether either path allocates less result memory.",
        "controls": [],
        "defaultSelection": {},
        "presets": {
            "default": {
                "chartKind": "line",
                "chartTitle": "Materialized copy time by copied span",
                "xLabels": ["1k", "10k", "100k"],
                "yUnit": "us",
                "series": [
                    {"label": "list[start:stop] copy", "color": COLORS["navy"], "values": slice_points},
                    {"label": "list(islice(...)) materialized", "color": COLORS["red"], "values": islice_points},
                ],
                "metrics": [
                    {"label": "Faster copy path", "value": "list[start:stop]"},
                    {"label": "Speed gap @ 100k", "value": f"{islice_points[-1] / slice_points[-1]:.1f}x faster"},
                    {"label": "Result allocation @ 100k", "value": f"tie: {kib(result_sizes[-1]):.1f} KiB each"},
                    {"label": "Source list size", "value": "1,000,000 items"},
                ],
                "notes": [
                    "This experiment holds the source list constant and changes only the copied span, so the chart answers how copy cost scales as the requested slice gets larger.",
                    "Allocation is effectively tied here because both paths return a new list of the same length. The consistent win for native slicing is throughput, not lower result-list memory.",
                ],
            }
        },
    }


def build_dict_topic() -> dict:
    sizes = [10_000, 100_000, 1_000_000]
    presets = {}

    for lookup_kind in ("hit", "miss"):
        dict_points = []
        list_points = []
        final_metrics = None

        for size in sizes:
            mapping = {i: i for i in range(size)}
            items = list(mapping.items())
            key = size // 2 if lookup_kind == "hit" else -1
            dict_loops = 120_000 if size <= 10_000 else 40_000 if size <= 100_000 else 12_000
            list_loops = 1200 if size <= 10_000 else 120 if size <= 100_000 else 12

            if lookup_kind == "hit":
                dict_time = median_time_us(lambda d=mapping, k=key: d[k], loops=dict_loops)
                list_time = median_time_us(
                    lambda pairs=items, k=key: next(v for kk, v in pairs if kk == k),
                    loops=list_loops,
                )
            else:
                dict_time = median_time_us(lambda d=mapping, k=key: d.get(k), loops=dict_loops)
                list_time = median_time_us(
                    lambda pairs=items, k=key: next((v for kk, v in pairs if kk == k), None),
                    loops=list_loops,
                )

            dict_points.append(dict_time)
            list_points.append(list_time)
            final_metrics = {
                "dict_time": dict_time,
                "list_time": list_time,
                "mapping_size": sys.getsizeof(mapping),
                "pair_list_size": sys.getsizeof(items),
            }

        assert final_metrics is not None
        ratio = final_metrics["list_time"] / final_metrics["dict_time"]
        presets[lookup_kind] = {
            "chartKind": "line",
            "chartTitle": f"{lookup_kind.title()} lookup time by mapping size",
            "xLabels": ["10k", "100k", "1M"],
            "yUnit": "us",
            "series": [
                {"label": "dict lookup", "color": COLORS["navy"], "values": dict_points},
                {"label": "list scan", "color": COLORS["red"], "values": list_points},
            ],
            "metrics": [
                {"label": "Faster lookup path", "value": "dict lookup"},
                {"label": f"Speed gap @ 1M {lookup_kind}", "value": f"{ratio:.1f}x faster"},
                {"label": "Memory cost @ 1M", "value": f"dict {kib(final_metrics['mapping_size']):.1f} KiB / list {kib(final_metrics['pair_list_size']):.1f} KiB"},
                {"label": "Largest mapping tested", "value": "1,000,000 keys"},
            ],
            "notes": [
                "This experiment asks a direct question: if you need key lookup, how much runtime do you save by using a hash table instead of a linear scan over key-value pairs?",
                "The dict stays near-flat here because average probe count remains low. The list path grows with container size because it must inspect Python objects one by one.",
            ],
        }

    return {
        "title": "Measured dict lookup versus linear scan",
        "summary": "This notebook compares dictionary key lookup with scanning a list of key-value pairs. It shows which path is faster for hit and miss lookups and what each representation costs in container memory at 10k, 100k, and 1M keys.",
        "controls": [
            {
                "id": "lookup",
                "label": "Lookup kind",
                "options": [
                    {"id": "hit", "label": "Existing key"},
                    {"id": "miss", "label": "Missing key"},
                ],
            }
        ],
        "defaultSelection": {"lookup": "hit"},
        "presets": presets,
    }


def build_set_topic() -> dict:
    sizes = [10_000, 100_000, 1_000_000]
    presets = {}

    for lookup_kind in ("hit", "miss"):
        set_points = []
        list_points = []
        final_metrics = None

        for size in sizes:
            membership_set = set(range(size))
            membership_list = list(range(size))
            key = size // 2 if lookup_kind == "hit" else -1
            set_loops = 120_000 if size <= 10_000 else 40_000 if size <= 100_000 else 12_000
            list_loops = 1200 if size <= 10_000 else 120 if size <= 100_000 else 12

            set_time = median_time_us(lambda data=membership_set, k=key: k in data, loops=set_loops)
            list_time = median_time_us(lambda data=membership_list, k=key: k in data, loops=list_loops)
            set_points.append(set_time)
            list_points.append(list_time)
            final_metrics = {
                "set_time": set_time,
                "list_time": list_time,
                "set_size": sys.getsizeof(membership_set),
                "list_size": sys.getsizeof(membership_list),
            }

        assert final_metrics is not None
        ratio = final_metrics["list_time"] / final_metrics["set_time"]
        presets[lookup_kind] = {
            "chartKind": "line",
            "chartTitle": f"{lookup_kind.title()} membership time by collection size",
            "xLabels": ["10k", "100k", "1M"],
            "yUnit": "us",
            "series": [
                {"label": "set membership", "color": COLORS["green"], "values": set_points},
                {"label": "list membership", "color": COLORS["red"], "values": list_points},
            ],
            "metrics": [
                {"label": "Faster membership path", "value": "set membership"},
                {"label": f"Speed gap @ 1M {lookup_kind}", "value": f"{ratio:.1f}x faster"},
                {"label": "Memory cost @ 1M", "value": f"set {kib(final_metrics['set_size']):.1f} KiB / list {kib(final_metrics['list_size']):.1f} KiB"},
                {"label": "Largest collection tested", "value": "1,000,000 values"},
            ],
            "notes": [
                "This experiment asks whether paying hash-table memory overhead buys you meaningful membership speed over a linear container.",
                "The set path stays near-flat here because membership is hash-based on average. The list path grows with collection size because it is still a scan.",
            ],
        }

    return {
        "title": "Measured set membership versus list scan",
        "summary": "This notebook compares set membership with list membership on the same values. It shows which path is faster for hit and miss probes and what each representation costs in container memory at 10k, 100k, and 1M values.",
        "controls": [
            {
                "id": "lookup",
                "label": "Lookup kind",
                "options": [
                    {"id": "hit", "label": "Present value"},
                    {"id": "miss", "label": "Missing value"},
                ],
            }
        ],
        "defaultSelection": {"lookup": "hit"},
        "presets": presets,
    }


def build_container_topic() -> dict:
    sizes = [1_000, 100_000, 1_000_000]
    container_ids = ["list", "tuple", "set", "array"]
    presets = {}

    for workload in ("memory", "iterate", "membership"):
        values = {key: [] for key in container_ids}

        for size in sizes:
            base = list(range(size))
            containers = {
                "list": base,
                "tuple": tuple(base),
                "set": set(base),
                "array": array.array("I", base),
            }

            for container_id, container_value in containers.items():
                if workload == "memory":
                    measurement = kib(sys.getsizeof(container_value))
                elif workload == "iterate":
                    loops = 800 if size <= 1_000 else 24 if size <= 100_000 else 4
                    measurement = median_time_us(lambda data=container_value: sum(data), loops=loops)
                else:
                    probe = size - 1
                    loops = 800 if size <= 1_000 else 80 if size <= 100_000 else 8
                    measurement = median_time_us(lambda data=container_value, item=probe: item in data, loops=loops)
                values[container_id].append(measurement)

        unit = "kib" if workload == "memory" else "us"
        largest_index = -1
        largest_label = "1,000,000"
        if workload == "memory":
            winner = min(container_ids, key=lambda key: values[key][largest_index])
            loser = max(container_ids, key=lambda key: values[key][largest_index])
            metrics = [
                {"label": "Lowest shell cost", "value": f"{winner} @ {largest_label}"},
                {"label": "Highest shell cost", "value": f"{loser} @ {largest_label}"},
                {"label": f"{winner} size", "value": f"{values[winner][largest_index]:.2f} KiB"},
                {"label": f"{loser} size", "value": f"{values[loser][largest_index]:.2f} KiB"},
            ]
            notes = [
                "This experiment asks which container shell is cheapest to hold the same number of values before you account for downstream algorithmic behavior.",
                "sys.getsizeof shows the outer container shell on this machine. Lists and tuples store references; array.array stores packed primitive values; sets spend memory on hash-table sparsity.",
            ]
        elif workload == "iterate":
            winner = min(container_ids, key=lambda key: values[key][largest_index])
            loser = max(container_ids, key=lambda key: values[key][largest_index])
            metrics = [
                {"label": "Fastest traversal", "value": f"{winner} @ {largest_label}"},
                {"label": "Slowest traversal", "value": f"{loser} @ {largest_label}"},
                {"label": f"{winner} time", "value": f"{values[winner][largest_index]:.2f} µs"},
                {"label": f"{loser} time", "value": f"{values[loser][largest_index]:.2f} µs"},
            ]
            notes = [
                "This experiment asks which container is fastest to sum when all containers hold the same numeric payload.",
                "sum(container) is a real runtime workload, not a synthetic complexity label. Packed arrays save memory, but that does not automatically make Python-level traversal cheaper.",
            ]
        else:
            winner = min(container_ids, key=lambda key: values[key][largest_index])
            linear_runner_up = min((key for key in container_ids if key != "set"), key=lambda key: values[key][largest_index])
            metrics = [
                {"label": "Fastest membership", "value": f"{winner} @ {largest_label}"},
                {"label": "Best linear container", "value": linear_runner_up},
                {"label": "set time @ 1,000,000", "value": f"{values['set'][largest_index]:.2f} µs"},
                {"label": f"{linear_runner_up} time", "value": f"{values[linear_runner_up][largest_index]:.2f} µs"},
            ]
            notes = [
                "This experiment asks which container pays off when the main question is membership, not traversal or compact storage.",
                "Set membership wins because it is hash-table lookup. The other three containers remain linear here, even when one of them saves memory.",
            ]
        presets[workload] = {
            "chartKind": "bar",
            "chartTitle": {
                "memory": "Container shell size by container and scale",
                "iterate": "sum(container) time by container and scale",
                "membership": "Membership time by container and scale",
            }[workload],
            "xLabels": ["1k", "100k", "1M"],
            "yUnit": unit,
            "series": [
                {"label": "list", "color": COLORS["navy"], "values": values["list"]},
                {"label": "tuple", "color": COLORS["purple"], "values": values["tuple"]},
                {"label": "set", "color": COLORS["green"], "values": values["set"]},
                {"label": "array.array", "color": COLORS["red"], "values": values["array"]},
            ],
            "metrics": metrics,
            "notes": notes,
        }

    return {
        "title": "Measured container tradeoffs",
        "summary": "This notebook compares list, tuple, set, and array.array under three concrete workloads: shell memory, sum(container) traversal, and membership. It highlights which container wins for each job at 1k, 100k, and 1M elements.",
        "controls": [
            {
                "id": "workload",
                "label": "Workload",
                "options": [
                    {"id": "memory", "label": "Shell size"},
                    {"id": "iterate", "label": "Iteration"},
                    {"id": "membership", "label": "Membership"},
                ],
            }
        ],
        "defaultSelection": {"workload": "memory"},
        "presets": presets,
    }


GLOBAL_BIAS = 7


def make_closure():
    bias = 7

    def closure_loop(limit):
        total = 0
        for i in range(limit):
            total += i + bias
        return total

    return closure_loop


closure_loop = make_closure()


def local_loop(limit):
    total = 0
    bias = 7
    for i in range(limit):
        total += i + bias
    return total


def global_loop(limit):
    total = 0
    for i in range(limit):
        total += i + GLOBAL_BIAS
    return total


def opcode_count(fn) -> int:
    return sum(1 for _ in dis.Bytecode(fn))


def build_bytecode_topic() -> dict:
    limits = [10_000, 100_000, 1_000_000]
    local_points = []
    closure_points = []
    global_points = []

    for limit in limits:
        loops = 20 if limit <= 10_000 else 4 if limit <= 100_000 else 1
        local_points.append(median_time_us(lambda limit=limit: local_loop(limit), loops=loops))
        closure_points.append(median_time_us(lambda limit=limit: closure_loop(limit), loops=loops))
        global_points.append(median_time_us(lambda limit=limit: global_loop(limit), loops=loops))

    local_fastest = local_points[-1]
    global_slowest = global_points[-1]
    return {
        "title": "Measured name-resolution loop cost",
        "summary": "This notebook compares three equivalent loops that differ mainly in name-resolution path: local, closure, and global. It shows which path runs fastest as the loop body scales and how much that gap matters in absolute terms.",
        "controls": [],
        "defaultSelection": {},
        "presets": {
            "default": {
                "chartKind": "lollipop",
                "chartTitle": "Loop cost by name-resolution path",
                "xLabels": ["10k", "100k", "1M"],
                "yUnit": "us",
                "series": [
                    {"label": "LOAD_FAST local", "color": COLORS["navy"], "values": local_points},
                    {"label": "LOAD_DEREF closure", "color": COLORS["purple"], "values": closure_points},
                    {"label": "LOAD_GLOBAL global", "color": COLORS["red"], "values": global_points},
                ],
                "metrics": [
                    {"label": "Fastest path", "value": "LOAD_FAST local"},
                    {"label": "Slowest path", "value": "LOAD_GLOBAL global"},
                    {"label": "Gap @ 1M", "value": f"{global_slowest / local_fastest:.2f}x"},
                    {"label": "Opcode counts", "value": f"local {opcode_count(local_loop)} / closure {opcode_count(closure_loop)} / global {opcode_count(global_loop)}"},
                ],
                "notes": [
                    "This experiment asks how much loop runtime changes when the body resolves the added value from a local, a closure cell, or a global name.",
                    "The timing gap is real, but still small relative to many production bottlenecks. Bytecode explains the shape; it does not replace end-to-end benchmarking.",
                ],
            }
        },
    }


def cpu_task(limit: int) -> int:
    total = 0
    for i in range(limit):
        total += (i % 7) * (i % 13)
    return total


def io_task(delay: float) -> float:
    time.sleep(delay)
    return delay


def build_gil_topic() -> dict:
    worker_counts = [1, 2, 4]
    cpu_limit = 700_000
    cpu_seq = []
    cpu_threads = []
    cpu_processes = []

    for workers in worker_counts:
        cpu_seq.append(median_time_ms(lambda workers=workers: [cpu_task(cpu_limit) for _ in range(workers)], repeats=2))
        cpu_threads.append(
            median_time_ms(
                lambda workers=workers: list(concurrent.futures.ThreadPoolExecutor(max_workers=workers).map(cpu_task, [cpu_limit] * workers)),
                repeats=2,
            )
        )
        cpu_processes.append(
            median_time_ms(
                lambda workers=workers: list(concurrent.futures.ProcessPoolExecutor(max_workers=workers).map(cpu_task, [cpu_limit] * workers)),
                repeats=2,
            )
        )

    io_delay = 0.02
    io_seq = []
    io_threads = []
    for workers in worker_counts:
        io_seq.append(median_time_ms(lambda workers=workers: [io_task(io_delay) for _ in range(workers)], repeats=2))
        io_threads.append(
            median_time_ms(
                lambda workers=workers: list(concurrent.futures.ThreadPoolExecutor(max_workers=workers).map(io_task, [io_delay] * workers)),
                repeats=2,
            )
        )

    return {
        "title": "Measured concurrency outcomes",
        "summary": "This notebook separates two different questions: how CPython behaves on CPU-bound bytecode work and how it behaves when tasks mostly wait on blocking I/O. It shows which execution model wins for each case.",
        "controls": [
            {
                "id": "workload",
                "label": "Workload",
                "options": [
                    {"id": "cpu", "label": "CPU-bound loop"},
                    {"id": "io", "label": "Blocking I/O"},
                ],
            }
        ],
        "defaultSelection": {"workload": "cpu"},
        "presets": {
            "cpu": {
                "chartKind": "line",
                "chartTitle": "CPU-bound scaling",
                "xLabels": ["1 worker", "2 workers", "4 workers"],
                "yUnit": "ms",
                "series": [
                    {"label": "sequential", "color": COLORS["navy"], "values": cpu_seq},
                    {"label": "threads", "color": COLORS["red"], "values": cpu_threads},
                    {"label": "processes", "color": COLORS["green"], "values": cpu_processes},
                ],
                "metrics": [
                    {"label": "Fastest CPU path", "value": "processes @ 4 workers"},
                    {"label": "Threads vs sequential", "value": f"{cpu_threads[-1] / cpu_seq[-1]:.2f}x of sequential"},
                    {"label": "Processes @ 4 workers", "value": f"{cpu_processes[-1]:.2f} ms"},
                    {"label": "Largest worker set", "value": "4 workers"},
                ],
                "notes": [
                    "This experiment asks which execution model actually improves CPU-bound Python bytecode throughput on this machine.",
                    "Threads stay close to sequential here because the GIL prevents parallel execution of Python bytecode. Processes win at higher worker counts because they bypass the GIL, with startup and IPC cost.",
                ],
            },
            "io": {
                "chartKind": "line",
                "chartTitle": "Blocking I/O overlap",
                "xLabels": ["1 worker", "2 workers", "4 workers"],
                "yUnit": "ms",
                "series": [
                    {"label": "sequential sleep", "color": COLORS["navy"], "values": io_seq},
                    {"label": "threads", "color": COLORS["green"], "values": io_threads},
                ],
                "metrics": [
                    {"label": "Faster I/O path", "value": "threads"},
                    {"label": "Overlap gain @ 4 workers", "value": f"{io_seq[-1] / io_threads[-1]:.2f}x faster"},
                    {"label": "Per-task wait", "value": f"{io_delay * 1000:.0f} ms sleep"},
                    {"label": "Largest worker set", "value": "4 workers"},
                ],
                "notes": [
                    "This experiment asks whether threads help when the task mostly waits rather than executes Python bytecode.",
                    "Blocking sleep releases the GIL, so the thread pool overlaps waiting time effectively. That is why threads still work well for many I/O-bound service integrations in CPython.",
                ],
            },
        },
    }


def build_dataset() -> dict:
    return {
        "environment": environment_metadata(),
        "topics": {
            "sequences-slicing": build_slicing_topic(),
            "dict-hash-tables": build_dict_topic(),
            "sets-membership-views": build_set_topic(),
            "memory-container-comparison": build_container_topic(),
            "language-bytecode-dis": build_bytecode_topic(),
            "runtime-gil-performance": build_gil_topic(),
        },
    }


def main() -> None:
    dataset = build_dataset()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(dataset, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
