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
    sizes = [1024, 8192, 65536, 262144]
    span_options = [32, 4096]
    presets = {}

    for span in span_options:
        slice_points = []
        islice_points = []
        result_sizes = []

        for size in sizes:
            seq = list(range(size))
            actual_span = min(span, max(8, size // 2))
            start_index = max(0, size // 4)
            stop_index = min(size, start_index + actual_span)
            loops = 6000 if size <= 8192 else 1800

            slice_points.append(median_time_us(lambda s=seq, a=start_index, b=stop_index: s[a:b], loops=loops))
            islice_points.append(
                median_time_us(lambda s=seq, a=start_index, b=stop_index: list(islice(s, a, b)), loops=loops)
            )
            result_sizes.append(sys.getsizeof(seq[start_index:stop_index]))

        key = str(span)
        presets[key] = {
            "chartTitle": f"Median copy time for a {min(span, 4096)}-item slice",
            "xLabels": ["1k", "8k", "64k", "256k"],
            "yUnit": "us",
            "series": [
                {"label": "list[start:stop]", "color": COLORS["navy"], "values": slice_points},
                {"label": "list(islice(...))", "color": COLORS["red"], "values": islice_points},
            ],
            "metrics": [
                {"label": "Largest source list", "value": "262,144 items"},
                {"label": "Slice result size", "value": f"{kib(result_sizes[-1]):.1f} KiB"},
                {"label": "Slice / islice gap", "value": f"{islice_points[-1] / slice_points[-1]:.1f}x faster"},
            ],
            "notes": [
                "Both paths allocate a new result container. The list slice stays much cheaper because built-in slicing can copy contiguous references directly.",
                "The copied result size comes from sys.getsizeof(result) on this environment.",
            ],
        }

    return {
        "title": "Measured slice copy cost",
        "summary": "Discrete presets from local CPython timing runs. Results are machine- and build-specific.",
        "controls": [
            {
                "id": "span",
                "label": "Slice span",
                "options": [
                    {"id": "32", "label": "32 items"},
                    {"id": "4096", "label": "4,096 items"},
                ],
            }
        ],
        "defaultSelection": {"span": "32"},
        "presets": presets,
    }


def build_dict_topic() -> dict:
    sizes = [1000, 10000, 100000]
    presets = {}

    for lookup_kind in ("hit", "miss"):
        dict_points = []
        list_points = []
        final_metrics = None

        for size in sizes:
            mapping = {i: i for i in range(size)}
            items = list(mapping.items())
            key = size // 2 if lookup_kind == "hit" else -1
            dict_loops = 200_000 if size <= 10_000 else 80_000
            list_loops = 3000 if size <= 10_000 else 300

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
        presets[lookup_kind] = {
            "chartTitle": f"{lookup_kind.title()} lookups across growing key counts",
            "xLabels": ["1k", "10k", "100k"],
            "yUnit": "us",
            "series": [
                {"label": "dict lookup", "color": COLORS["navy"], "values": dict_points},
                {"label": "list scan", "color": COLORS["red"], "values": list_points},
            ],
            "metrics": [
                {"label": "Largest dict lookup", "value": f"{final_metrics['dict_time']:.3f} µs"},
                {"label": "Largest list scan", "value": f"{final_metrics['list_time']:.3f} µs"},
                {"label": "Container shell sizes", "value": f"dict {kib(final_metrics['mapping_size']):.1f} KiB / list {kib(final_metrics['pair_list_size']):.1f} KiB"},
            ],
            "notes": [
                "The dict stays effectively flat across these sizes because the probe count stays low on average.",
                "The list scan grows with the number of pairs because it is linear search over Python objects.",
            ],
        }

    return {
        "title": "Measured lookup behavior",
        "summary": "Median lookup timings from local CPython runs comparing keyed hash lookup to linear scanning.",
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
    sizes = [1000, 10000, 100000]
    presets = {}

    for lookup_kind in ("hit", "miss"):
        set_points = []
        list_points = []
        final_metrics = None

        for size in sizes:
            membership_set = set(range(size))
            membership_list = list(range(size))
            key = size // 2 if lookup_kind == "hit" else -1
            set_loops = 200_000 if size <= 10_000 else 80_000
            list_loops = 3000 if size <= 10_000 else 300

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
        presets[lookup_kind] = {
            "chartTitle": f"{lookup_kind.title()} membership checks across growing collections",
            "xLabels": ["1k", "10k", "100k"],
            "yUnit": "us",
            "series": [
                {"label": "set membership", "color": COLORS["green"], "values": set_points},
                {"label": "list membership", "color": COLORS["red"], "values": list_points},
            ],
            "metrics": [
                {"label": "Largest set lookup", "value": f"{final_metrics['set_time']:.3f} µs"},
                {"label": "Largest list lookup", "value": f"{final_metrics['list_time']:.3f} µs"},
                {"label": "Container shell sizes", "value": f"set {kib(final_metrics['set_size']):.1f} KiB / list {kib(final_metrics['list_size']):.1f} KiB"},
            ],
            "notes": [
                "The set cost stays near-constant because the lookup is hash-based on average.",
                "The list path is linear and keeps growing because each membership test may inspect many Python objects.",
            ],
        }

    return {
        "title": "Measured membership checks",
        "summary": "Median membership timings from local CPython runs for hash-based sets versus linear containers.",
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
    sizes = [128, 4096, 65536]
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
                    loops = 3000 if size <= 4096 else 500
                    measurement = median_time_us(lambda data=container_value: sum(data), loops=loops)
                else:
                    probe = size - 1
                    loops = 3000 if size <= 4096 else 300
                    measurement = median_time_us(lambda data=container_value, item=probe: item in data, loops=loops)
                values[container_id].append(measurement)

        unit = "kib" if workload == "memory" else "us"
        largest_index = -1
        presets[workload] = {
            "chartTitle": {
                "memory": "Measured container shell size",
                "iterate": "Measured iteration cost via sum(container)",
                "membership": "Measured membership cost",
            }[workload],
            "xLabels": ["128", "4,096", "65,536"],
            "yUnit": unit,
            "series": [
                {"label": "list", "color": COLORS["navy"], "values": values["list"]},
                {"label": "tuple", "color": COLORS["purple"], "values": values["tuple"]},
                {"label": "set", "color": COLORS["green"], "values": values["set"]},
                {"label": "array.array", "color": COLORS["red"], "values": values["array"]},
            ],
            "metrics": [
                {"label": "list @ 65,536", "value": f"{values['list'][largest_index]:.2f} {'KiB' if unit == 'kib' else 'µs'}"},
                {"label": "tuple @ 65,536", "value": f"{values['tuple'][largest_index]:.2f} {'KiB' if unit == 'kib' else 'µs'}"},
                {"label": "set @ 65,536", "value": f"{values['set'][largest_index]:.2f} {'KiB' if unit == 'kib' else 'µs'}"},
                {"label": "array.array @ 65,536", "value": f"{values['array'][largest_index]:.2f} {'KiB' if unit == 'kib' else 'µs'}"},
            ],
            "notes": {
                "memory": [
                    "sys.getsizeof shows the outer container shell on this machine. Lists and tuples store references; array.array stores packed primitive values.",
                    "Sets spend more memory to keep a sparse hash table for fast membership.",
                ],
                "iterate": [
                    "sum(container) is a real runtime workload, not a synthetic complexity label.",
                    "Packed arrays stay competitive on dense numeric data because the storage is flat and the iteration avoids per-element Python object pointers.",
                ],
                "membership": [
                    "Set membership wins because it is hash-table lookup. The other three containers stay linear here.",
                    "array.array saves memory but it does not become a hash table; membership remains scan-based.",
                ],
            }[workload],
        }

    return {
        "title": "Measured container tradeoffs",
        "summary": "Local measurements for shell size, iteration, and membership. These numbers are evidence for this environment, not universal constants.",
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
    limits = [1000, 10000, 50000]
    local_points = []
    closure_points = []
    global_points = []

    for limit in limits:
        loops = 25 if limit <= 10_000 else 10
        local_points.append(median_time_us(lambda limit=limit: local_loop(limit), loops=loops))
        closure_points.append(median_time_us(lambda limit=limit: closure_loop(limit), loops=loops))
        global_points.append(median_time_us(lambda limit=limit: global_loop(limit), loops=loops))

    return {
        "title": "Measured opcode-side loop cost",
        "summary": "Local timing for equivalent loops where the bytecode differs in how it resolves names.",
        "controls": [],
        "defaultSelection": {},
        "presets": {
            "default": {
                "chartTitle": "Loop cost by name-resolution path",
                "xLabels": ["1k", "10k", "50k"],
                "yUnit": "us",
                "series": [
                    {"label": "LOAD_FAST local", "color": COLORS["navy"], "values": local_points},
                    {"label": "LOAD_DEREF closure", "color": COLORS["purple"], "values": closure_points},
                    {"label": "LOAD_GLOBAL global", "color": COLORS["red"], "values": global_points},
                ],
                "metrics": [
                    {"label": "Opcode counts", "value": f"local {opcode_count(local_loop)} / closure {opcode_count(closure_loop)} / global {opcode_count(global_loop)}"},
                    {"label": "50k loop local", "value": f"{local_points[-1]:.3f} µs"},
                    {"label": "50k loop global", "value": f"{global_points[-1]:.3f} µs"},
                ],
                "notes": [
                    "The timing gap is real but small at this scale. Bytecode explains the shape; it does not replace end-to-end benchmarking.",
                    "Opcode counts come from dis.Bytecode on this same Python build.",
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
        "summary": "Local timing that separates CPU-bound bytecode work from blocking I/O overlap on this CPython build.",
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
                "chartTitle": "CPU-bound scaling",
                "xLabels": ["1 worker", "2 workers", "4 workers"],
                "yUnit": "ms",
                "series": [
                    {"label": "sequential", "color": COLORS["navy"], "values": cpu_seq},
                    {"label": "threads", "color": COLORS["red"], "values": cpu_threads},
                    {"label": "processes", "color": COLORS["green"], "values": cpu_processes},
                ],
                "metrics": [
                    {"label": "4-worker sequential", "value": f"{cpu_seq[-1]:.2f} ms"},
                    {"label": "4-worker threads", "value": f"{cpu_threads[-1]:.2f} ms"},
                    {"label": "4-worker processes", "value": f"{cpu_processes[-1]:.2f} ms"},
                ],
                "notes": [
                    "Threads do not buy CPU-bound Python bytecode parallelism here; the GIL keeps the threaded result near the sequential path.",
                    "Processes win at 4 workers on this machine because they bypass the GIL, at the cost of process startup and IPC.",
                ],
            },
            "io": {
                "chartTitle": "Blocking I/O overlap",
                "xLabels": ["1 worker", "2 workers", "4 workers"],
                "yUnit": "ms",
                "series": [
                    {"label": "sequential sleep", "color": COLORS["navy"], "values": io_seq},
                    {"label": "threads", "color": COLORS["green"], "values": io_threads},
                ],
                "metrics": [
                    {"label": "4-worker sequential", "value": f"{io_seq[-1]:.2f} ms"},
                    {"label": "4-worker threads", "value": f"{io_threads[-1]:.2f} ms"},
                    {"label": "Per-task delay", "value": f"{io_delay * 1000:.0f} ms sleep"},
                ],
                "notes": [
                    "Blocking sleep releases the GIL, so the thread pool overlaps waiting time effectively.",
                    "This is why threads still work well for many I/O-bound service integrations in CPython.",
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
