import { TOPIC_SECTIONS } from "@/data/topicIndex"
import type { TopicCardData } from "@/types"

export type WhiteboardIconKind =
  | "sequence"
  | "memory"
  | "runtime"
  | "async"
  | "code"
  | "types"
  | "hash"
  | "classes"

export type WhiteboardVisualKind =
  | "slice-window"
  | "match-flow"
  | "alias-graph"
  | "signature-map"
  | "shared-default"
  | "closure-scope"
  | "type-boundary"
  | "bytecode-stream"
  | "protocol-grid"
  | "refcount-flow"
  | "hash-probe"
  | "grouping-buckets"
  | "set-algebra"
  | "container-matrix"
  | "storage-tracks"
  | "tuple-layout"
  | "stream-pipeline"
  | "record-choices"
  | "field-generation"
  | "gil-threads"
  | "event-loop"
  | "backpressure-flow"
  | "server-pipeline"
  | "async-stream"
  | "async-boundary"
  | "task-tree"
  | "log-pipeline"

export type WhiteboardSimulationKind =
  | "sequence"
  | "branching"
  | "call"
  | "memory"
  | "hash"
  | "containers"
  | "classes"
  | "bytecode"
  | "gil"
  | "async"
  | "logging"

export interface WhiteboardTopic extends TopicCardData {
  chapterNumber: number
  boardNumber: string
  sectionNumber: number
  sectionLabel: string
  tocIcon: WhiteboardIconKind
  boardIntro: string
  whatItIs: string[]
  howItWorks: string[]
  whenToUseIt: string[]
  takeaways: string[]
  tryItOutCode: string
  visualKind: WhiteboardVisualKind
  simulationKind: WhiteboardSimulationKind
  simulationTitle: string
  reminder: string
}

export interface WhiteboardSection {
  id: string
  label: string
  boardNumber: number
  tocIcon: WhiteboardIconKind
  cards: WhiteboardTopic[]
}

interface TopicBoardDetails {
  boardIntro: string
  whatItIs: string[]
  howItWorks: string[]
  whenToUseIt: string[]
  takeaways: string[]
  tryItOutCode: string
  visualKind: WhiteboardVisualKind
  simulationKind: WhiteboardSimulationKind
  simulationTitle: string
  reminder: string
}

const SECTION_ICON_MAP: Record<string, WhiteboardIconKind> = {
  sequences: "sequence",
  language: "code",
  hashing: "hash",
  memory: "memory",
  classes: "classes",
  production: "runtime",
}

const TOPIC_DETAILS: Record<string, TopicBoardDetails> = {
  "sequences-slicing": {
    boardIntro: "Treat slices as interval notation, not magic punctuation.",
    whatItIs: [
      "A slice selects a half-open range from a sequence and returns a new container for list, tuple, and str style objects.",
      "The important contract is start-inclusive and stop-exclusive, which makes adjacent ranges compose cleanly.",
    ],
    howItWorks: [
      "Python normalizes omitted bounds and negative indices against the sequence length.",
      "For built-in sequences, the result copies references or values for the selected span into a new object.",
      "Stride values change traversal order and can skip or reverse positions without changing the source object.",
    ],
    whenToUseIt: [
      "Use it when position ranges are the real model and callers already think in offsets.",
      "Name common slices if the range itself has domain meaning.",
      "Avoid large slice copies in hot paths when an iterator or view-like approach is enough.",
    ],
    takeaways: [
      "Half-open ranges remove off-by-one drift.",
      "List slicing allocates proportional to slice length.",
      "Negative strides are expressive but can hide copy cost.",
    ],
    tryItOutCode: "items = [10, 20, 30, 40, 50, 60]\nmiddle = items[2:5]\nreverse_every_other = items[::-2]\nprint(middle, reverse_every_other)",
    visualKind: "slice-window",
    simulationKind: "sequence",
    simulationTitle: "Slice Cost vs Span Length",
    reminder: "Copying the slice is the hidden cost to remember.",
  },
  "sequences-pattern-matching": {
    boardIntro: "Pattern matching is structural branching, not a prettier if-chain.",
    whatItIs: [
      "Sequence patterns let you branch on shape and bind names in one pass.",
      "The feature is strongest when your input already behaves like a protocol or decoded record stream.",
    ],
    howItWorks: [
      "The interpreter checks whether the subject satisfies sequence-pattern rules before trying element positions.",
      "Cases are tried in order, so the first matching shape wins.",
      "Guards run only after a case pattern has matched and bound names.",
    ],
    whenToUseIt: [
      "Use it for command decoding, parser outputs, and shape-based dispatch.",
      "Prefer normal conditionals for simple boolean predicates.",
      "Keep cases narrow and ordered from most specific to fallback.",
    ],
    takeaways: [
      "Case order is semantic.",
      "Bindings appear only after a successful match.",
      "It improves clarity when structure matters more than indexes.",
    ],
    tryItOutCode: "def classify(msg):\n    match msg:\n        case [\"push\", name, value]:\n            return f\"store {name}={value}\"\n        case [\"quit\"]:\n            return \"stop\"\n        case _:\n            return \"unknown\"\n\nprint(classify([\"push\", \"mode\", \"fast\"]))",
    visualKind: "match-flow",
    simulationKind: "branching",
    simulationTitle: "Case Order and Match Cost",
    reminder: "Put specific patterns above broad fallbacks.",
  },
  "language-identity-equality": {
    boardIntro: "Identity answers 'same object'; equality answers 'same value contract'.",
    whatItIs: [
      "Python names point at objects, so aliasing and equality are separate questions.",
      "The `is` operator is about object identity, while `==` delegates to value comparison behavior.",
    ],
    howItWorks: [
      "Assignment binds another name to the same object until a rebinding happens.",
      "Built-in containers compare recursively by value for `==`.",
      "User types can override `__eq__`, but identity remains the pointer-level check.",
    ],
    whenToUseIt: [
      "Use `is` for sentinels such as `None` and singleton-style markers.",
      "Use `==` for business values and domain equality.",
      "Audit aliasing carefully when mutating shared containers.",
    ],
    takeaways: [
      "`is` is not a speed shortcut for equality.",
      "Aliasing bugs come from shared references, not syntax.",
      "Value equality is only as good as the type's `__eq__` contract.",
    ],
    tryItOutCode: "a = [1, 2]\nb = a\nc = [1, 2]\nprint(a is b, a == b)\nprint(a is c, a == c)",
    visualKind: "alias-graph",
    simulationKind: "call",
    simulationTitle: "Alias Count vs Comparison Work",
    reminder: "Shared mutable objects create the surprising bugs.",
  },
  "language-parameters": {
    boardIntro: "A function signature is part of the API contract, not decoration.",
    whatItIs: [
      "Python signatures can restrict call shapes with positional-only and keyword-only markers.",
      "Good signatures encode intent before runtime validation even begins.",
    ],
    howItWorks: [
      "The call binder maps positional arguments first, then keywords, then variadic captures.",
      "Positional-only markers prevent callers from depending on parameter names you may want to change.",
      "Keyword-only parameters force explicitness at call sites for risky or optional behavior.",
    ],
    whenToUseIt: [
      "Use positional-only for stable low-level APIs and mathematically obvious operands.",
      "Use keyword-only for flags, defaults with semantic meaning, and public service boundaries.",
      "Avoid `*args` and `**kwargs` when the real contract is known and stable.",
    ],
    takeaways: [
      "A better signature removes downstream ambiguity.",
      "Keyword-only parameters reduce call-site mistakes.",
      "Loose variadics trade short-term convenience for long-term uncertainty.",
    ],
    tryItOutCode: "def connect(host, /, port, *, timeout=1.0, ssl=False):\n    return host, port, timeout, ssl\n\nprint(connect(\"db\", 5432, timeout=2.5, ssl=True))",
    visualKind: "signature-map",
    simulationKind: "call",
    simulationTitle: "Call Shape vs Binding Overhead",
    reminder: "Design the call boundary before writing the body.",
  },
  "language-mutable-defaults": {
    boardIntro: "Mutable defaults are one object reused across calls.",
    whatItIs: [
      "Default expressions are evaluated once when the function is defined, not each time it runs.",
      "That makes a mutable default an accidental shared state cell.",
    ],
    howItWorks: [
      "The function object stores default values in its metadata.",
      "Each call reuses the same stored list or dict when the caller omits that argument.",
      "Mutations therefore persist into later calls that look unrelated.",
    ],
    whenToUseIt: [
      "Use a sentinel such as `None` and allocate inside the function body.",
      "Only rely on persistent defaults when you intentionally want memoized or accumulated state.",
      "Review helper APIs and decorators carefully because the bug hides well in convenience functions.",
    ],
    takeaways: [
      "The surprise is definition-time evaluation.",
      "Sentinel allocation is the standard safe fix.",
      "Shared state belongs in an explicit object, not a hidden default.",
    ],
    tryItOutCode: "def append_item(value, bucket=None):\n    if bucket is None:\n        bucket = []\n    bucket.append(value)\n    return bucket\n\nprint(append_item(1))\nprint(append_item(2))",
    visualKind: "shared-default",
    simulationKind: "memory",
    simulationTitle: "Call Count vs Shared-State Drift",
    reminder: "Definition time is the trap.",
  },
  "language-decorators-closures": {
    boardIntro: "Closures capture state; decorators package that capture around another callable.",
    whatItIs: [
      "A closure is a function carrying references to variables from an enclosing scope.",
      "A decorator uses that mechanism to wrap or register another callable while keeping a clean interface.",
    ],
    howItWorks: [
      "Free variables are stored in cell objects and loaded through closure-aware opcodes.",
      "Wrappers add another call boundary around the original function.",
      "Metadata such as `__name__` and annotations need explicit preservation with `functools.wraps`.",
    ],
    whenToUseIt: [
      "Use closures for lightweight stateful callbacks and factories.",
      "Use decorators for cross-cutting concerns like tracing, retries, and registration.",
      "Avoid deeply stacked decorators when observability and debugging matter.",
    ],
    takeaways: [
      "Captured state is explicit runtime data.",
      "Decorators change call shape and introspection unless wrapped carefully.",
      "Nonlocal mutation is powerful but should stay narrow and obvious.",
    ],
    tryItOutCode: "from functools import wraps\n\ndef traced(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(\"calling\", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper\n\n@traced\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))",
    visualKind: "closure-scope",
    simulationKind: "call",
    simulationTitle: "Wrapper Depth vs Dispatch Cost",
    reminder: "Preserve metadata when the wrapper is public.",
  },
  "language-type-hints": {
    boardIntro: "Type hints help humans and tooling; they do not replace runtime policy.",
    whatItIs: [
      "Annotations describe callable and data contracts for readers, IDEs, and type checkers.",
      "They work best when they express capability boundaries rather than incidental concrete types.",
    ],
    howItWorks: [
      "Annotations are stored on functions and classes as metadata.",
      "Static tools interpret those annotations to reason about compatibility and misuse.",
      "Runtime behavior stays unchanged unless you add explicit validation or generated behavior on top.",
    ],
    whenToUseIt: [
      "Accept abstract protocols or collections when callers can provide many concrete implementations.",
      "Return concrete types when downstream code needs specific operations or guarantees.",
      "Keep `Any` deliberate and local to uncertain boundaries.",
    ],
    takeaways: [
      "Typing is an API design tool before it is a checker tool.",
      "Static and runtime validation are separate concerns.",
      "Abstract inputs and concrete outputs are often the right tradeoff.",
    ],
    tryItOutCode: "from collections.abc import Iterable\n\ndef total(xs: Iterable[int]) -> list[int]:\n    return [x * 2 for x in xs]\n\nprint(total((1, 2, 3)))",
    visualKind: "type-boundary",
    simulationKind: "classes",
    simulationTitle: "Boundary Specificity vs Reuse",
    reminder: "Annotation quality matters more than annotation count.",
  },
  "language-bytecode-dis": {
    boardIntro: "Bytecode explains execution shape, not final machine performance by itself.",
    whatItIs: [
      "The `dis` module shows the instruction stream CPython executes after compiling your source.",
      "That makes it a practical tool for understanding name lookups, call overhead, and specialized opcodes.",
    ],
    howItWorks: [
      "Source compiles to code objects containing bytecode and metadata.",
      "The interpreter dispatches opcodes, with newer CPython versions specializing some operations at runtime.",
      "Different source forms can lead to measurably different opcode counts and hot-path structure.",
    ],
    whenToUseIt: [
      "Use it when two snippets look similar but benchmark differently.",
      "Inspect scope behavior, closure loads, comprehensions, and call-heavy hot loops.",
      "Do not use opcode inspection as a substitute for timing real workloads.",
    ],
    takeaways: [
      "Bytecode is a diagnostic layer.",
      "Fewer or more specialized opcodes can explain overhead differences.",
      "Always confirm with measurement after disassembly.",
    ],
    tryItOutCode: "import dis\n\ndef total(xs):\n    return [x * 2 for x in xs]\n\ndis.dis(total)",
    visualKind: "bytecode-stream",
    simulationKind: "bytecode",
    simulationTitle: "Opcode Count vs Loop Time",
    reminder: "Inspect first, benchmark second, conclude last.",
  },
  "language-dunder-methods": {
    boardIntro: "Special methods are how syntax reaches your objects.",
    whatItIs: [
      "Dunder methods connect operators and protocols such as iteration, equality, truthiness, and context management to user-defined objects.",
      "They are not arbitrary hooks; each one belongs to a specific language protocol.",
    ],
    howItWorks: [
      "The interpreter looks for special methods on the type when syntax triggers a protocol.",
      "Some operations have fallback paths, such as iteration falling back to sequence protocol behavior in narrow cases.",
      "Method combinations matter: defining `__eq__` changes the hashing conversation, truthiness involves `__bool__` or `__len__`, and so on.",
    ],
    whenToUseIt: [
      "Implement them when your object genuinely models that protocol.",
      "Keep semantics unsurprising and aligned with Python built-ins.",
      "Avoid adding magic methods just to make an API feel clever.",
    ],
    takeaways: [
      "Special methods define behavior contracts.",
      "Protocol correctness matters more than syntactic novelty.",
      "Hashing, equality, and mutability must be designed together.",
    ],
    tryItOutCode: "class Batch:\n    def __init__(self, items):\n        self.items = list(items)\n    def __len__(self):\n        return len(self.items)\n    def __iter__(self):\n        return iter(self.items)\n\nprint(len(Batch([1, 2, 3])))",
    visualKind: "protocol-grid",
    simulationKind: "call",
    simulationTitle: "Protocol Dispatch Paths",
    reminder: "Implement only the protocols your type can honor cleanly.",
  },
  "runtime-del-gc": {
    boardIntro: "Deleting a name is not the same as destroying an object.",
    whatItIs: [
      "`del` removes a binding or container entry, while object reclamation depends on remaining references and the runtime's GC behavior.",
      "Resource cleanup should be explicit because garbage collection timing is not a reliable ownership model.",
    ],
    howItWorks: [
      "CPython decrements reference counts immediately when references disappear.",
      "Cycles need cyclic GC because reference counting alone cannot reclaim them.",
      "Finalizers complicate collection order and should not be your primary cleanup mechanism.",
    ],
    whenToUseIt: [
      "Use `with` and explicit close/teardown for files, sockets, and handlers.",
      "Use `del` mainly to drop large temporary references or remove names from namespaces and containers.",
      "Treat `__del__` as a last resort with careful constraints.",
    ],
    takeaways: [
      "`del` changes bindings, not object identity.",
      "Reference counting is immediate in CPython but not a language guarantee everywhere.",
      "Ownership should be explicit in production code.",
    ],
    tryItOutCode: "import weakref\n\nclass Resource:\n    pass\n\nobj = Resource()\nfinalizer = weakref.finalize(obj, print, \"cleanup\")\ndel obj\nprint(finalizer.alive)",
    visualKind: "refcount-flow",
    simulationKind: "memory",
    simulationTitle: "Reference Lifetime Pressure",
    reminder: "Cleanup belongs to ownership boundaries, not GC luck.",
  },
  "dict-hash-tables": {
    boardIntro: "Dictionary speed comes from hash-table indexing plus memory overhead.",
    whatItIs: [
      "A dict maps hashable keys to values with average-case constant-time lookup.",
      "The tradeoff is sparse-table memory cost and dependence on good hash/equality behavior.",
    ],
    howItWorks: [
      "Python hashes the key, finds a candidate slot, and probes until it finds a match or empty slot.",
      "Open addressing keeps keys and values in table structures optimized for lookup locality.",
      "Insertion order is guaranteed in modern Python, but the underlying memory layout is still an implementation detail.",
    ],
    whenToUseIt: [
      "Use dicts when keyed lookup is the real operation.",
      "Prefer sets when you only need membership and no associated value.",
      "Keep keys immutable and hash-stable for the lifetime of membership.",
    ],
    takeaways: [
      "Average O(1) lookup depends on hash-table invariants.",
      "Memory overhead buys speed and ordering behavior.",
      "Bad key design breaks the whole abstraction.",
    ],
    tryItOutCode: "cache = {(\"user\", 42): \"active\"}\nprint(cache[(\"user\", 42)])\ntry:\n    cache[[\"user\", 42]] = \"bad\"\nexcept TypeError as exc:\n    print(type(exc).__name__)",
    visualKind: "hash-probe",
    simulationKind: "hash",
    simulationTitle: "Lookup Time vs Table Pressure",
    reminder: "Hashability is a correctness rule, not just a speed rule.",
  },
  "dict-setdefault": {
    boardIntro: "Bucket-per-key updates should not require manual branch noise.",
    whatItIs: [
      "`setdefault` and `defaultdict` help you initialize and update mutable buckets under a key in one pattern.",
      "They are about expressing grouped accumulation clearly and cheaply.",
    ],
    howItWorks: [
      "`setdefault` performs a lookup and inserts the provided default if the key is missing.",
      "`defaultdict` goes one step further by generating missing values through a factory.",
      "Both patterns reduce repeated branching in grouping and indexing workflows.",
    ],
    whenToUseIt: [
      "Use them for grouping, inverted indexes, and many-to-one accumulation.",
      "Prefer `defaultdict` when the missing-value factory is the real model.",
      "Avoid them when missing keys mean a business error rather than a new bucket.",
    ],
    takeaways: [
      "The gain is clarity plus one stable pattern for bucket creation.",
      "Factories beat repeated literal defaults for mutable buckets.",
      "Missing keys should only auto-initialize when that is semantically correct.",
    ],
    tryItOutCode: "from collections import defaultdict\n\nby_role = defaultdict(list)\nfor name, role in [(\"Ana\", \"admin\"), (\"Leo\", \"admin\"), (\"Mia\", \"viewer\")]:\n    by_role[role].append(name)\nprint(dict(by_role))",
    visualKind: "grouping-buckets",
    simulationKind: "hash",
    simulationTitle: "Grouping Growth vs Lookup Churn",
    reminder: "Auto-create buckets only when the domain allows it.",
  },
  "sets-membership-views": {
    boardIntro: "Sets are about membership and algebra, not positional storage.",
    whatItIs: [
      "Sets hold unique hashable elements and optimize membership checks plus algebraic operations.",
      "Dictionary views also expose live set-like behavior without copying keys or items eagerly.",
    ],
    howItWorks: [
      "Set membership uses the same hash-table ideas as dict key lookup.",
      "Duplicate insertions collapse to one element because equality and hashing define identity within the set.",
      "Dictionary key views can participate in comparisons and intersections without allocating a separate set first in many cases.",
    ],
    whenToUseIt: [
      "Use sets for deduplication, access control, and overlap tests.",
      "Use `frozenset` for immutable set membership or as a hashable composite key.",
      "Avoid sets when order or duplicates carry meaning.",
    ],
    takeaways: [
      "Hash discipline matters here too.",
      "Set algebra can replace slower nested loops.",
      "Dictionary views are often the cheapest comparison surface.",
    ],
    tryItOutCode: "allowed = {\"read\", \"write\"}\nrequested = {\"write\", \"delete\"}\nprint(requested & allowed)\nprint({\"role\": 1, \"name\": 2}.keys() & {\"name\", \"email\"})",
    visualKind: "set-algebra",
    simulationKind: "hash",
    simulationTitle: "Membership Checks vs Collision Risk",
    reminder: "Use set algebra when overlap is the question.",
  },
  "memory-container-comparison": {
    boardIntro: "Container choice is a memory and access-pattern decision, not just a syntax preference.",
    whatItIs: [
      "Lists, tuples, sets, and `array.array` optimize different combinations of mutation, lookup, and storage density.",
      "The right choice depends on your dominant operation and the shape of the stored data.",
    ],
    howItWorks: [
      "Lists and tuples are reference containers, so element payloads live in separate objects.",
      "Sets pay extra hash-table overhead to buy fast membership.",
      "`array.array` stores packed primitive values and removes per-element object references.",
    ],
    whenToUseIt: [
      "Use lists for general mutable ordered work.",
      "Use tuples for fixed records and immutable sequence semantics.",
      "Use sets for membership and `array.array` for dense homogeneous numerics.",
    ],
    takeaways: [
      "Memory layout drives real performance behavior.",
      "Measure the dominant workload, not a folklore rule.",
      "Container semantics should match the domain contract first.",
    ],
    tryItOutCode: "from array import array\nvalues = [1, 2, 3]\npacked = array('I', values)\nprint(type(values).__name__, type(packed).__name__, len(values), len(packed))",
    visualKind: "container-matrix",
    simulationKind: "containers",
    simulationTitle: "Memory vs Membership Tradeoff",
    reminder: "Pick the container by workload, not habit.",
  },
  "memory-list-alternatives": {
    boardIntro: "List is a solid default, but some workloads want packed values or streaming behavior instead.",
    whatItIs: [
      "Alternatives such as `array.array`, `deque`, `memoryview`, and generators target specific memory or throughput constraints.",
      "Each one changes the storage model and therefore the operational tradeoffs.",
    ],
    howItWorks: [
      "`array.array` packs primitive values contiguously.",
      "`deque` optimizes append and pop operations at both ends.",
      "`memoryview` exposes binary buffers without copying, while generators avoid materialization entirely.",
    ],
    whenToUseIt: [
      "Use packed containers for dense numeric or binary data.",
      "Use `deque` for queue-like behavior.",
      "Use generators or iterators when laziness beats cached random access.",
    ],
    takeaways: [
      "Different storage models remove different forms of overhead.",
      "Zero-copy access is often worth more than clever Python loops.",
      "List is only wrong when the workload says so clearly.",
    ],
    tryItOutCode: "from collections import deque\nfrom array import array\n\nqueue = deque([1, 2, 3])\nqueue.appendleft(0)\npacked = array('d', [1.0, 2.0, 3.0])\nprint(queue, packed)",
    visualKind: "storage-tracks",
    simulationKind: "containers",
    simulationTitle: "Storage Model vs Throughput",
    reminder: "The storage model is the optimization.",
  },
  "memory-tuples-lists": {
    boardIntro: "Tuples win when fixed shape and exact-size allocation fit the problem.",
    whatItIs: [
      "Lists are resizable mutable arrays of references, while tuples are fixed-size immutable sequences of references.",
      "That structural difference changes allocation strategy, memory footprint, and optimization opportunities.",
    ],
    howItWorks: [
      "Lists over-allocate spare capacity so append remains amortized efficient.",
      "Tuples allocate exactly enough slots up front because size never changes.",
      "The interpreter can treat tuple literals and constant tuples more aggressively in compiled code paths.",
    ],
    whenToUseIt: [
      "Use tuples for fixed records, return bundles, and constants.",
      "Use lists for accumulation and in-place editing.",
      "Do not replace lists with tuples unless the immutability and size stability are genuinely useful.",
    ],
    takeaways: [
      "Tuple wins are layout and contract wins.",
      "List spare capacity is deliberate, not waste by accident.",
      "Immutability helps both reasoning and some runtime behavior.",
    ],
    tryItOutCode: "record = (\"Ana\", 42, True)\nitems = [\"Ana\", 42, True]\nprint(len(record), len(items))",
    visualKind: "tuple-layout",
    simulationKind: "containers",
    simulationTitle: "Allocation Slack vs Fixed Shape",
    reminder: "Use tuple when fixed shape is the truth.",
  },
  "memory-iterables": {
    boardIntro: "Streaming and stored containers solve different memory problems.",
    whatItIs: [
      "A container owns stored elements; an iterable may instead produce values on demand.",
      "That distinction matters when memory pressure and data volume dominate design choices.",
    ],
    howItWorks: [
      "Lists and tuples keep references to all elements in memory at once.",
      "Generators store frame state and compute the next value lazily.",
      "Buffer-backed iterables such as `memoryview` can expose raw bytes without materializing Python objects per element.",
    ],
    whenToUseIt: [
      "Use iterators and generators for one-pass pipelines and large streams.",
      "Use containers when you need repeated traversal or random access.",
      "Document one-shot iterables clearly so callers do not accidentally consume them twice.",
    ],
    takeaways: [
      "Laziness trades replayability for memory savings.",
      "Flat binary views can be much denser than object containers.",
      "An iterable contract says less than a container contract.",
    ],
    tryItOutCode: "def rows():\n    for i in range(3):\n        yield i * 10\n\nstream = rows()\nprint(list(stream))",
    visualKind: "stream-pipeline",
    simulationKind: "memory",
    simulationTitle: "Materialization vs Stream Pressure",
    reminder: "One-shot iterables need caller discipline.",
  },
  "classes-data-builders": {
    boardIntro: "Record helpers differ in mutability, typing, defaults, and generated behavior.",
    whatItIs: [
      "`namedtuple`, `typing.NamedTuple`, and `@dataclass` all build record-like objects with different tradeoffs.",
      "The right pick depends on whether the shape is tuple-like, class-like, mutable, or generated-heavy.",
    ],
    howItWorks: [
      "`namedtuple` and `NamedTuple` create tuple-based types with positional storage semantics.",
      "Dataclasses generate class methods and field handling over regular class instances.",
      "Type annotations and field defaults influence both readability and generated method behavior.",
    ],
    whenToUseIt: [
      "Use tuple-based records when immutability and positional semantics fit.",
      "Use dataclasses when named mutable fields and generated comparisons or reprs are valuable.",
      "Avoid treating them as interchangeable just because they all hold fields.",
    ],
    takeaways: [
      "Tuple-backed and class-backed records have different memory and behavior profiles.",
      "Generated behavior is part of the public contract.",
      "Choose the record model that matches mutation and access expectations.",
    ],
    tryItOutCode: "from dataclasses import dataclass\nfrom typing import NamedTuple\n\nclass PointNT(NamedTuple):\n    x: int\n    y: int\n\n@dataclass\nclass PointDC:\n    x: int\n    y: int\n\nprint(PointNT(1, 2), PointDC(1, 2))",
    visualKind: "record-choices",
    simulationKind: "classes",
    simulationTitle: "Record Shape vs Mutation Cost",
    reminder: "Generated convenience still defines long-term API shape.",
  },
  "classes-dataclass-fields": {
    boardIntro: "Dataclass options are code generation switches with real semantics.",
    whatItIs: [
      "Dataclass field declarations control constructor behavior, defaults, ordering, hashing, and post-init hooks.",
      "These knobs are small, but each one changes the class contract.",
    ],
    howItWorks: [
      "The decorator inspects annotations and field configuration to generate methods.",
      "`default_factory` defers mutable default creation until instance construction.",
      "`frozen`, `order`, `slots`, `ClassVar`, and `InitVar` each affect generated behavior differently.",
    ],
    whenToUseIt: [
      "Use explicit field configuration whenever defaults or generated comparisons matter.",
      "Use `slots=True` when many instances exist and dynamic attributes are unnecessary.",
      "Keep post-init logic narrow; it should validate or derive, not hide unrelated side effects.",
    ],
    takeaways: [
      "Dataclass options are policy, not cosmetics.",
      "Factories fix the same shared-default problem seen in functions.",
      "Generated methods should match the domain semantics exactly.",
    ],
    tryItOutCode: "from dataclasses import dataclass, field\n\n@dataclass(slots=True)\nclass Batch:\n    items: list[int] = field(default_factory=list)\n\nprint(Batch())",
    visualKind: "field-generation",
    simulationKind: "classes",
    simulationTitle: "Generated Fields vs Instance Footprint",
    reminder: "Treat dataclass flags as public behavior choices.",
  },
  "runtime-gil-performance": {
    boardIntro: "The GIL limits Python bytecode parallelism, not all useful threading.",
    whatItIs: [
      "In regular CPython builds, one thread at a time executes Python bytecode under the global interpreter lock.",
      "That shapes the difference between CPU-bound and I/O-bound threading results.",
    ],
    howItWorks: [
      "Threads share memory but serialize Python-level bytecode execution through the lock.",
      "C extensions and blocking I/O can release the GIL, allowing overlap.",
      "For CPU-bound Python work, process-based or free-threaded strategies change the scaling story.",
    ],
    whenToUseIt: [
      "Use threads freely for I/O orchestration and latency hiding.",
      "Use processes or native-code escapes for CPU-heavy Python loops.",
      "Measure before rewriting architecture around GIL folklore.",
    ],
    takeaways: [
      "The GIL is a throughput constraint on Python bytecode, not a blanket ban on threads.",
      "Shared memory remains a thread advantage.",
      "Workload shape determines the right concurrency primitive.",
    ],
    tryItOutCode: "from concurrent.futures import ThreadPoolExecutor\n\ndef cpu_task(n):\n    total = 0\n    for i in range(n):\n        total += i\n    return total\n\nwith ThreadPoolExecutor(max_workers=2) as pool:\n    print(list(pool.map(cpu_task, [10_000, 10_000])))",
    visualKind: "gil-threads",
    simulationKind: "gil",
    simulationTitle: "Threads vs Processes Under Load",
    reminder: "Separate CPU-bound and I/O-bound stories every time.",
  },
  "async-foundations-awaitables": {
    boardIntro: "Async works by explicit suspension points, not invisible parallelism.",
    whatItIs: [
      "Awaitables represent computations the event loop can suspend and resume cooperatively.",
      "The model is about structured scheduling around I/O waits and other explicit handoff points.",
    ],
    howItWorks: [
      "A coroutine runs until it hits an await boundary and yields control back to the loop.",
      "The event loop decides which ready task runs next.",
      "Any blocking CPU or synchronous I/O section delays every other task sharing that loop.",
    ],
    whenToUseIt: [
      "Use it for high-concurrency I/O services and orchestrators.",
      "Keep blocking work out of coroutine hot paths.",
      "Model ownership and cancellation up front, not as a patch later.",
    ],
    takeaways: [
      "Concurrency comes from yielding, not magic background execution.",
      "Blocking one task can stall them all.",
      "Await boundaries are the unit of cooperation.",
    ],
    tryItOutCode: "import asyncio\n\nasync def work(name):\n    await asyncio.sleep(0.1)\n    return name\n\nprint(asyncio.run(work(\"job\")))",
    visualKind: "event-loop",
    simulationKind: "async",
    simulationTitle: "Ready Tasks vs Loop Delay",
    reminder: "Every blocking boundary is everyone’s problem on the loop.",
  },
  "async-context-backpressure": {
    boardIntro: "Async needs pressure control, not just more tasks.",
    whatItIs: [
      "Backpressure keeps producers, consumers, and outbound concurrency within limits the system can actually sustain.",
      "Async context managers and bounded coordination tools are part of that discipline.",
    ],
    howItWorks: [
      "Semaphores, queues, and `as_completed` shape how work enters and leaves the loop.",
      "`async with` gives cleanup boundaries around resources and permits.",
      "Offloading sync work to threads is useful, but only when bounded and explicit.",
    ],
    whenToUseIt: [
      "Use it when fan-out can outrun services, disks, or downstream APIs.",
      "Bound concurrency per resource, not just globally.",
      "Watch queue growth as a signal of overload rather than ignoring it.",
    ],
    takeaways: [
      "Throughput without pressure control becomes latency collapse.",
      "Resource ownership belongs in async context blocks.",
      "Backpressure is a design responsibility, not a library feature toggle.",
    ],
    tryItOutCode: "import asyncio\n\nasync def fetch(i, limit):\n    async with limit:\n        await asyncio.sleep(0.05)\n        return i\n\nasync def main():\n    limit = asyncio.Semaphore(2)\n    return await asyncio.gather(*(fetch(i, limit) for i in range(4)))\n\nprint(asyncio.run(main()))",
    visualKind: "backpressure-flow",
    simulationKind: "async",
    simulationTitle: "Queue Depth vs Service Latency",
    reminder: "Bound the fan-out where the resource actually hurts.",
  },
  "async-servers-services": {
    boardIntro: "Async servers are event-loop pipelines with explicit read, write, and drain boundaries.",
    whatItIs: [
      "Service handlers built on asyncio streams or protocols coordinate sockets, buffers, and cleanup around the event loop.",
      "The key question is not syntax; it is flow control and ownership under load.",
    ],
    howItWorks: [
      "Readers await incoming bytes, handlers transform or route them, and writers must respect drain/backpressure behavior.",
      "Connection lifecycle includes setup, steady-state I/O, cancellation, and teardown.",
      "Slow peers and stalled writes are just as important as handler logic.",
    ],
    whenToUseIt: [
      "Use async servers when high connection counts and I/O overlap dominate.",
      "Treat write buffering and shutdown paths as first-class design problems.",
      "Avoid burying CPU-heavy parsing or blocking database drivers in the handler loop.",
    ],
    takeaways: [
      "Service correctness includes flow control and cleanup.",
      "Drain boundaries are operationally important.",
      "Network backpressure is a real part of application design.",
    ],
    tryItOutCode: "import asyncio\n\nasync def handler(reader, writer):\n    data = await reader.readline()\n    writer.write(data)\n    await writer.drain()\n    writer.close()\n    await writer.wait_closed()",
    visualKind: "server-pipeline",
    simulationKind: "async",
    simulationTitle: "Connection Count vs Drain Latency",
    reminder: "Slow writes are part of the server model, not an edge case.",
  },
  "async-iterators-generators": {
    boardIntro: "Async streams let you yield progressively without materializing whole result sets.",
    whatItIs: [
      "Async iterators and generators pair streaming delivery with awaitable production.",
      "They are the async equivalent of 'produce one item when ready' instead of 'build the whole container first'.",
    ],
    howItWorks: [
      "Each `async for` iteration awaits the next produced value.",
      "Async generators keep internal state between yields while still participating in event-loop scheduling.",
      "Cancellation and finalization still matter because unfinished streams often hold network or resource state.",
    ],
    whenToUseIt: [
      "Use them for paginated APIs, chunked processing, and event feeds.",
      "Prefer them when downstream consumers can process incrementally.",
      "Document whether the stream is replayable or one-shot.",
    ],
    takeaways: [
      "Streaming reduces peak memory and time-to-first-item.",
      "The consumer now participates in scheduling cost.",
      "Lifecycle management still matters for partially consumed streams.",
    ],
    tryItOutCode: "import asyncio\n\nasync def stream():\n    for item in [1, 2, 3]:\n        await asyncio.sleep(0.01)\n        yield item\n\nasync def main():\n    return [x async for x in stream()]\n\nprint(asyncio.run(main()))",
    visualKind: "async-stream",
    simulationKind: "async",
    simulationTitle: "Chunk Size vs Stream Latency",
    reminder: "Streaming shifts memory cost into coordination cost.",
  },
  "async-limits-type-hints": {
    boardIntro: "Async stops helping when the loop is forced to wait on CPU or opaque sync boundaries.",
    whatItIs: [
      "Not every latency problem is an async problem, and not every async API is cheap to maintain.",
      "Typing async boundaries helps describe which values are coroutines, streams, or concrete results.",
    ],
    howItWorks: [
      "CPU-heavy work still monopolizes the loop unless moved elsewhere.",
      "Awaitable and async-iterator types communicate scheduling shape to callers and tooling.",
      "The point where async stops helping is often visible in queue growth, latency spikes, or event-loop lag.",
    ],
    whenToUseIt: [
      "Use async where I/O overlap dominates.",
      "Move CPU work out of the loop or change architecture when the model stops scaling.",
      "Type async APIs precisely so ownership and consumption patterns are obvious.",
    ],
    takeaways: [
      "Async is not a universal performance switch.",
      "Type clarity matters more when control flow is indirect.",
      "Measure loop lag and backlog, not just raw task counts.",
    ],
    tryItOutCode: "from collections.abc import AsyncIterator\n\nasync def rows() -> AsyncIterator[int]:\n    for value in [1, 2, 3]:\n        yield value",
    visualKind: "async-boundary",
    simulationKind: "async",
    simulationTitle: "CPU Share vs Event-Loop Lag",
    reminder: "Async boundaries need both runtime and type clarity.",
  },
  "asyncio-task-groups": {
    boardIntro: "Structured concurrency is about owning fan-out and failure, not just launching tasks.",
    whatItIs: [
      "`TaskGroup` gives a parent scope responsibility for child task lifetime and failure propagation.",
      "It is a better default than ad hoc task spawning when work belongs to one operation.",
    ],
    howItWorks: [
      "Tasks started in a group are joined at scope exit.",
      "Failure of one task cancels siblings and re-raises in a grouped form.",
      "This creates a clear lifecycle boundary around parallel sub-work.",
    ],
    whenToUseIt: [
      "Use it when several async operations are one logical unit of work.",
      "Use queues or semaphores beside it when fan-out still needs bounding.",
      "Avoid detached background tasks unless you also define ownership, shutdown, and observability.",
    ],
    takeaways: [
      "Ownership of tasks should be visible in the code structure.",
      "Failure boundaries matter as much as launch concurrency.",
      "Structured concurrency reduces orphaned work.",
    ],
    tryItOutCode: "import asyncio\n\nasync def worker(name):\n    await asyncio.sleep(0.05)\n    return name\n\nasync def main():\n    async with asyncio.TaskGroup() as tg:\n        tg.create_task(worker(\"a\"))\n        tg.create_task(worker(\"b\"))\n\nasyncio.run(main())",
    visualKind: "task-tree",
    simulationKind: "async",
    simulationTitle: "Fan-out Width vs Cancellation Cost",
    reminder: "Tasks need an owner or they become cleanup debt.",
  },
  "production-stdlib-logging": {
    boardIntro: "Logging is a data pipeline for operators, not a print statement upgrade.",
    whatItIs: [
      "The stdlib logging stack gives named loggers, handlers, formatters, levels, and contextual fields.",
      "Its job is to move structured operational events through a hierarchy without distorting the application boundary.",
    ],
    howItWorks: [
      "Loggers emit records that propagate through the hierarchy unless configured otherwise.",
      "Handlers decide destinations and formatters decide representation.",
      "Context belongs in fields and message design, not in random string concatenation.",
    ],
    whenToUseIt: [
      "Use logger hierarchies that match subsystem ownership.",
      "Attach stable contextual fields that operators can filter and aggregate.",
      "Never log secrets, raw tokens, or request bodies casually.",
    ],
    takeaways: [
      "Logger structure is observability architecture.",
      "Level discipline matters more than log volume.",
      "Contextual fields beat free-form strings for production use.",
    ],
    tryItOutCode: "import logging\n\nlogger = logging.getLogger(\"service.auth\")\nlogger.setLevel(logging.INFO)\nlogger.info(\"login\", extra={\"user_id\": 42})",
    visualKind: "log-pipeline",
    simulationKind: "logging",
    simulationTitle: "Event Volume vs Signal Quality",
    reminder: "Logs should help operators decide, not just narrate.",
  },
}

export const WHITEBOARD_SECTIONS: WhiteboardSection[] = TOPIC_SECTIONS.map((section, sectionIndex) => {
  const tocIcon = SECTION_ICON_MAP[section.id] ?? "code"

  return {
    id: section.id,
    label: section.label,
    boardNumber: sectionIndex + 1,
    tocIcon,
    cards: section.cards.map((card, cardIndex) => {
      const topicIndex = TOPIC_SECTIONS
        .slice(0, sectionIndex)
        .reduce((sum, item) => sum + item.cards.length, 0) + cardIndex + 1
      const details = TOPIC_DETAILS[card.id]
      if (!details) {
        throw new Error(`Missing whiteboard details for topic ${card.id}`)
      }

      return {
        ...card,
        chapterNumber: topicIndex,
        boardNumber: `${sectionIndex + 1}.${cardIndex + 1}`,
        sectionNumber: sectionIndex + 1,
        sectionLabel: section.label,
        tocIcon,
        ...details,
      }
    }),
  }
})

export const WHITEBOARD_TOPICS: WhiteboardTopic[] = WHITEBOARD_SECTIONS.flatMap((section) => section.cards)

export function getWhiteboardTopic(id: string) {
  return WHITEBOARD_TOPICS.find((topic) => topic.id === id) ?? null
}

export function getWhiteboardTopicIndex(id: string) {
  return WHITEBOARD_TOPICS.findIndex((topic) => topic.id === id)
}

export function getUpcomingTopics(id: string, count = 3) {
  const index = getWhiteboardTopicIndex(id)
  if (index < 0) return []
  return WHITEBOARD_TOPICS.slice(index + 1, index + 1 + count)
}
