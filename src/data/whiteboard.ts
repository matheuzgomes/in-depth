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
    boardIntro: "A slice with half-open bounds is the difference between `a[:n]` + `a[n:]` composing perfectly and staring at off-by-one errors at 2 AM.",
    whatItIs: [
      "Think of slices like train cars: each car has a number, but you board at the front edge of car N and get off at the front edge of car M. The car you exit is the one you do NOT ride. That is half-open: start included, stop excluded.",
      "The beauty is composition. If you split a list at index n, `a[:n]` and `a[n:]` cover every element exactly once. No overlap, no gap — that is the entire point of half-open.",
    ],
    howItWorks: [
      "Python normalizes omitted bounds and negative indices against the sequence length before performing the slice.",
      "For built-in sequences, slicing creates a new container and copies references (or values for flat types) for the selected range. List slicing allocates proportional to the slice length.",
      "Stride values change traversal order. `[::-1]` reverses. `[::2]` skips every other. Stride still allocates a copy, even if you are skipping elements.",
    ],
    whenToUseIt: [
      "Use slicing when position ranges are the natural model and the caller already thinks in offsets.",
      "Name common slices with `slice(0, 8)` instead of bare `[:8]` — the name encodes domain meaning.",
      "Avoid large slices in hot paths when an iterator or view approach is enough.",
    ],
    takeaways: [
      "Half-open ranges eliminate off-by-one drift when composing adjacent slices.",
      "List slicing allocates every time — the copy is the hidden cost.",
      "Negative strides are expressive but still pay full allocation cost.",
    ],
    tryItOutCode: "items = [10, 20, 30, 40, 50, 60]\nmiddle = items[2:5]\nreverse_every_other = items[::-2]\nprint(middle, reverse_every_other)",
    visualKind: "slice-window",
    simulationKind: "sequence",
    simulationTitle: "Slice Cost vs Span Length",
    reminder: "Copy is the hidden cost.",
  },
  "sequences-pattern-matching": {
    boardIntro: "A sequence pattern is a structural branch that rejects mismatched shapes before the body runs — fundamentally different from an if-chain.",
    whatItIs: [
      "Think of pattern matching like a package sorting machine: you drop a box on the belt, and the machine checks its shape first. If it is a small cube, it goes to bin A. If it is a long tube, bin B. The shape is checked before you open the box.",
      "That is what sequence patterns do. They branch on structure and bind names to positions only when the shape matches. No more `parts[0]`, `parts[1]` guesswork with a crash waiting at runtime.",
    ],
    howItWorks: [
      "The interpreter checks whether the subject is a sequence, then verifies element count and structure before binding names.",
      "Cases are tried in order. The first matching shape wins — so ordering is semantic, not cosmetic.",
      "Guards (`if` conditions on a case) run only after a pattern has matched and names have been bound. You can filter on value after filtering on shape.",
    ],
    whenToUseIt: [
      "Use it for command decoding, parser outputs, and shape-based dispatch where structure is the discriminator.",
      "Prefer normal conditionals for simple boolean flags — pattern matching buys nothing there.",
      "Order cases from most specific to most general, with a bare `case _:` fallback at the bottom.",
    ],
    takeaways: [
      "Case order is semantic — the first match wins.",
      "Names are bound only after a successful match, never before.",
      "Pattern matching clarifies code when structure matters more than indices.",
    ],
    tryItOutCode: "def classify(msg):\n    match msg:\n        case [\"push\", name, value]:\n            return f\"store {name}={value}\"\n        case [\"quit\"]:\n            return \"stop\"\n        case _:\n            return \"unknown\"\n\nprint(classify([\"push\", \"mode\", \"fast\"]))",
    visualKind: "match-flow",
    simulationKind: "branching",
    simulationTitle: "Case Order and Match Cost",
    reminder: "Specific cases before broad fallbacks.",
  },
  "language-identity-equality": {
    boardIntro: "You have probably debugged this: `a == c` is True but mutating `a` does not affect `c`. Meanwhile mutating `a` does affect `b`. That is the difference between `==` and `is`.",
    whatItIs: [
      "Think of Python variables like sticky notes, not boxes. Assignment does not put a value into a container — it sticks a name onto an object. Multiple sticky notes can point to the same object.",
      "`==` asks: do these two sticky notes point to objects that consider themselves equal? It calls `__eq__`, which can be arbitrarily expensive. `is` asks: are these two sticky notes stuck to the exact same object? It compares pointer addresses — one machine instruction, no method dispatch.",
    ],
    howItWorks: [
      "Assignment binds a name to an object in a namespace. Rebinding attaches the name to a different object. The original object does not change — only the name-object mapping changes.",
      "Built-in containers compare recursively by value for `==`. Two lists with the same elements in the same order are `==` but may not be `is`.",
      "User types can override `__eq__` to define custom equality. But `__eq__` is never called for `is` — identity is always a direct pointer check.",
    ],
    whenToUseIt: [
      "Use `is None` for sentinels and singleton-style markers. Never use `== None`.",
      "Use `==` for business values, strings, numbers, and domain equality.",
      "Audit aliasing carefully when mutating shared containers — the root cause is the alias assignment, not the mutation line.",
    ],
    takeaways: [
      "`is` and `==` answer different questions — identity versus value equality. They are not interchangeable.",
      "Aliasing bugs come from shared references, not from syntax.",
      "Value equality is only as trustworthy as the type's `__eq__` contract.",
    ],
    tryItOutCode: "a = [1, 2]\nb = a\nc = [1, 2]\nprint(a is b, a == b)\nprint(a is c, a == c)",
    visualKind: "alias-graph",
    simulationKind: "call",
    simulationTitle: "Alias Count vs Comparison Work",
    reminder: "Names are sticky notes, not boxes.",
  },
  "language-parameters": {
    boardIntro: "Every function signature is a contract you negotiate once and your callers pay for every time. Make invalid calls structurally impossible.",
    whatItIs: [
      "Think of a signature like a physical key: a key cut wrong cannot enter the lock. Python's `/` and `*` markers cut your function's key such that wrong calls are rejected before the body runs.",
      "Positional-only (`/`) means callers cannot use keyword form for those parameters — you can rename the parameter later without breaking anyone. Keyword-only (`*`) means callers must name those arguments, eliminating position confusion with booleans and flags.",
    ],
    howItWorks: [
      "The call binder maps positional arguments first, then keyword arguments, then variadic captures. The `/` and `*` markers define boundaries between these phases.",
      "Parameters before `/` are positional-only — `connect(host=value)` raises TypeError.",
      "Parameters after `*` are keyword-only — they must be named at the call site, preventing `connect(db, 5432, true, false)` disasters.",
    ],
    whenToUseIt: [
      "Use positional-only for stable low-level APIs and mathematically obvious operands where naming adds noise.",
      "Use keyword-only for boolean flags, optional configuration, and any parameter with a non-obvious meaning.",
      "Avoid `*args` and `**kwargs` when the real parameter set is known and stable — variadics trade long-term clarity for short-term flexibility.",
    ],
    takeaways: [
      "A well-designed signature prevents mistakes before they happen.",
      "Keyword-only parameters eliminate mystery-boolean bugs at call sites.",
      "Loose variadics exchange downstream clarity for upstream convenience.",
    ],
    tryItOutCode: "def connect(host, /, port, *, timeout=1.0, ssl=False):\n    return host, port, timeout, ssl\n\nprint(connect(\"db\", 5432, timeout=2.5, ssl=True))",
    visualKind: "signature-map",
    simulationKind: "call",
    simulationTitle: "Call Shape vs Binding Overhead",
    reminder: "Design the call boundary before writing the body.",
  },
  "language-mutable-defaults": {
    boardIntro: "You wrote `def add_user(name, users=[])`, called it twice, and the second call had both users. That was not a coincidence — it was a singleton.",
    whatItIs: [
      "Default arguments are like a shared coffee mug in the office kitchen. Everyone assumes it is clean when they pour, but yesterday's coffee is still there. Python evaluates defaults once when the function is defined, not once per call.",
      "That means `[]` is created once and stored on the function object. Every caller who omits that argument gets the same list object. Append to it, and the next caller sees your append.",
    ],
    howItWorks: [
      "The function object stores default values in `__defaults__` (and `__kwdefaults__` for keyword-only). These are regular Python objects, evaluated at `def` time.",
      "Each call that omits the argument reuses the same stored default. Mutations persist across calls.",
      "The fix: use `None` as the default and allocate inside the function body. That moves allocation from `def` time to call time — one fresh list per call.",
    ],
    whenToUseIt: [
      "Use `None` (or a private sentinel) as the default, then allocate inside the body.",
      "Only rely on persistent defaults when you intentionally want memoized or accumulated state.",
      "Review helper APIs and decorators carefully — the bug hides especially well in convenience wrappers.",
    ],
    takeaways: [
      "Defaults are evaluated at definition time, not call time.",
      "The sentinel pattern (`if x is None: x = []`) is the standard fix.",
      "Shared state belongs in an explicit object, not a hidden default.",
    ],
    tryItOutCode: "def append_item(value, bucket=None):\n    if bucket is None:\n        bucket = []\n    bucket.append(value)\n    return bucket\n\nprint(append_item(1))\nprint(append_item(2))",
    visualKind: "shared-default",
    simulationKind: "memory",
    simulationTitle: "Call Count vs Shared-State Drift",
    reminder: "Definition time is the trap.",
  },
  "language-decorators-closures": {
    boardIntro: "A decorator runs once — at import time — and swaps your function for another. The closure is how the replacement remembers the original.",
    whatItIs: [
      "Think of a decorator like a mailing service: you hand it your letter (the original function), they put it in a new envelope with extra services (logging, timing, retries), and hand you back the new envelope. You call it by the same name, but it is not the same callable.",
      "The closure is the glue. The wrapper function captures `fn` from the enclosing scope so it can forward calls later. Without the closure, the wrapper would have no way to reach the original function.",
    ],
    howItWorks: [
      "Free variables (like `fn` in the wrapper) are stored in cell objects on the function's `__closure__` tuple. The interpreter loads them through `LOAD_DEREF` opcodes.",
      "The decorator syntax `@traced def add(...):` is sugar for `add = traced(add)`. The assignment happens at module import time, not at call time.",
      "`functools.wraps` copies `__name__`, `__doc__`, `__module__`, and the signature from the original function to the wrapper. Without it, introspection tools see the wrapper's metadata.",
    ],
    whenToUseIt: [
      "Use closures for lightweight stateful callbacks and factories that remember configuration.",
      "Use decorators for cross-cutting concerns: tracing, retries, registration, access control.",
      "Avoid deeply stacked decorators (more than 3-4) when debugging and stack trace clarity matter.",
    ],
    takeaways: [
      "Decorators run at import time, not call time.",
      "`functools.wraps` is not optional — skipping it breaks introspection.",
      "Nonlocal mutation inside a closure is powerful but should stay narrow and obvious.",
    ],
    tryItOutCode: "from functools import wraps\n\ndef traced(fn):\n    @wraps(fn)\n    def wrapper(*args, **kwargs):\n        print(\"calling\", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper\n\n@traced\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))",
    visualKind: "closure-scope",
    simulationKind: "call",
    simulationTitle: "Wrapper Depth vs Dispatch Cost",
    reminder: "Always use `@wraps`.",
  },
  "language-type-hints": {
    boardIntro: "Type hints are a contract for humans and static checkers. The runtime ignores nearly all of them.",
    whatItIs: [
      "Think of type hints like a blueprint annotation: \"this wall is load-bearing.\" The blueprint carries the information, but the wall does not check that annotation every time someone leans on it. Type hints are the same — they describe intent for readers and tools, not runtime enforcement.",
      "The power is in the boundary: accept broad protocols (`Iterable`, `Mapping`), return narrow concrete types (`list[str]`). That gives callers maximum flexibility on the input side and maximum guarantees on the output side.",
    ],
    howItWorks: [
      "Annotations are stored in the function's `__annotations__` dict and the class's `__annotations__`. They are regular Python objects — strings in `from __future__ import annotations` mode, type objects otherwise.",
      "Static type checkers (mypy, pyright) interpret annotations before runtime to reason about compatibility and misuse. At runtime, they are ignored unless you build explicit validation on top.",
      "Generic types from `collections.abc` (`Iterable`, `Mapping`) describe capabilities. Concrete types (`list`, `dict`) describe implementations. The difference is the level of constraint.",
    ],
    whenToUseIt: [
      "Accept abstract protocols (`Iterable`, `Mapping`) when callers could provide many concrete types.",
      "Return concrete types (`list[str]`, `dict[str, int]`) when downstream code needs specific operations.",
      "Keep `Any` deliberate and local to boundaries where the type truly is unknown.",
    ],
    takeaways: [
      "Typing is an API design tool before it is a checker tool.",
      "Static validation and runtime validation are separate concerns — one does not replace the other.",
      "Abstract inputs + concrete outputs is the right tradeoff for most public APIs.",
    ],
    tryItOutCode: "from collections.abc import Iterable\n\ndef total(xs: Iterable[int]) -> list[int]:\n    return [x * 2 for x in xs]\n\nprint(total((1, 2, 3)))",
    visualKind: "type-boundary",
    simulationKind: "classes",
    simulationTitle: "Boundary Specificity vs Reuse",
    reminder: "Annotation quality matters more than annotation count.",
  },
  "language-bytecode-dis": {
    boardIntro: "Two snippets that do the same thing — but one has twice the opcodes. Bytecode shows you why.",
    whatItIs: [
      "Think of bytecode like the assembly language CPython actually runs. Your source code compiles to a stream of opcodes before execution, and `dis` lets you read that stream.",
      "Different source patterns produce different opcode sequences. A list comprehension might use `LIST_APPEND` while a manual loop uses `STORE_FAST` + `LOAD_FAST` + `CALL_FUNCTION`. Same result, different interpreter cost.",
    ],
    howItWorks: [
      "Source compiles to a code object containing the bytecode string, constants, variable names, and metadata. `dis.dis()` disassembles that bytecode into a human-readable listing.",
      "The interpreter dispatches opcodes in a loop. Newer CPython versions (3.10+) add adaptive/quickening bytecode that specializes at runtime — the first execution may compile different opcodes than subsequent ones.",
      "Opcode count alone is not the full picture. Some opcodes (like `LOAD_FAST`) are a single array lookup; others (like `LOAD_ATTR`) may trigger descriptor protocol, `__getattr__`, or property calls.",
    ],
    whenToUseIt: [
      "Use it when two snippets look similar but benchmark differently — the bytecode often reveals the structural difference.",
      "Inspect comprehension overhead, closure variable access, and call-heavy hot loops.",
      "Do not use opcode inspection as a substitute for timing real workloads. Bytecode explains shape; measurements still decide.",
    ],
    takeaways: [
      "Bytecode is a diagnostic layer, not a performance guarantee.",
      "Fewer or more specialized opcodes often explain overhead differences.",
      "Always confirm with measurement after disassembly.",
    ],
    tryItOutCode: "import dis\n\ndef total(xs):\n    return [x * 2 for x in xs]\n\ndis.dis(total)",
    visualKind: "bytecode-stream",
    simulationKind: "bytecode",
    simulationTitle: "Opcode Count vs Loop Time",
    reminder: "Inspect first, benchmark second.",
  },
  "language-dunder-methods": {
    boardIntro: "Special methods are Python's protocol API. You write them; the language calls them automatically.",
    whatItIs: [
      "Think of dunder methods like electrical outlets in a wall: the prongs have a specific shape for a reason. `__eq__` fits the equality socket. `__iter__` fits the iteration socket. If you wire them wrong, nothing blows up — but the language cannot use your type in the places it was designed to fit.",
      "Each dunder method belongs to a specific protocol: `__eq__` and `__hash__` together define the hashable-equality protocol. `__bool__` and `__len__` define truthiness. Implement only the ones your type genuinely models.",
    ],
    howItWorks: [
      "The interpreter looks up special methods on the **type**, not the instance. `type(obj).__eq__(obj, other)` is called, not `obj.__eq__(other)`. This is why special methods work even on objects where the method might have been shadowed as an instance attribute.",
      "Some operations have fallback paths. Iteration falls back to `__getitem__` with increasing integer indexes if `__iter__` is not defined. `__bool__` falls back to `__len__`.",
      "Method combinations matter: `__eq__` and `__hash__` must be designed together. If you define `__eq__` without `__hash__`, Python sets `__hash__ = None` for mutable classes — a safety measure.",
    ],
    whenToUseIt: [
      "Implement a special method only when your type genuinely models that protocol.",
      "Keep semantics unsurprising — `__eq__` should compare values, not log to a file.",
      "Avoid adding magic methods just to make an API feel clever. A method named `items()` is clearer than a class that handles `__getitem__` in surprising ways.",
    ],
    takeaways: [
      "Special methods define behavior contracts, not just operator overloads.",
      "Protocol correctness matters more than syntactic cleverness.",
      "Hashing, equality, and mutability must be designed together — not independently.",
    ],
    tryItOutCode: "class Batch:\n    def __init__(self, items):\n        self.items = list(items)\n    def __len__(self):\n        return len(self.items)\n    def __iter__(self):\n        return iter(self.items)\n\nprint(len(Batch([1, 2, 3])))",
    visualKind: "protocol-grid",
    simulationKind: "call",
    simulationTitle: "Protocol Dispatch Paths",
    reminder: "Implement only what your type can honour.",
  },
  "runtime-del-gc": {
    boardIntro: "`del` deletes names, not objects. The object survives as long as one reference sticks to it.",
    whatItIs: [
      "Think of `del` like taking a sticker off a filing cabinet. The cabinet is still there — someone else's sticker may still point to it. Only when the last sticker is gone can the cabinet be recycled.",
      "CPython uses reference counting: every `del`, every variable going out of scope, every removed list element decrements a counter. When the counter hits zero, the object is freed immediately. No sweep phase, no pause.",
    ],
    howItWorks: [
      "Every Python object has an `ob_refcnt` field. Incremented on new references, decremented when references go away. When it reaches zero, `tp_dealloc` is called.",
      "Reference counting cannot handle cycles (two objects referencing each other with no external references). CPython's cyclic garbage collector runs periodically to detect and collect unreachable cycles.",
      "`__del__` finalizers complicate collection order. If a cycle has objects with `__del__`, CPython cannot collect them (they are uncollectable) and moves them to `gc.garbage`. Do not rely on `__del__` for production resource cleanup.",
    ],
    whenToUseIt: [
      "Use `with` blocks and explicit close/teardown for files, sockets, locks, and handles.",
      "Use `del` mainly to drop large temporary references early in long-lived scopes.",
      "Treat `__del__` as a last resort with narrow constraints — never for production resource management.",
    ],
    takeaways: [
      "`del` changes bindings, not object identity.",
      "Reference counting is immediate in CPython but not a language guarantee.",
      "Resource cleanup belongs in `with` blocks, not finalizers.",
    ],
    tryItOutCode: "import weakref\n\nclass Resource:\n    pass\n\nobj = Resource()\nfinalizer = weakref.finalize(obj, print, \"cleanup\")\ndel obj\nprint(finalizer.alive)",
    visualKind: "refcount-flow",
    simulationKind: "memory",
    simulationTitle: "Reference Lifetime Pressure",
    reminder: "Cleanup belongs in `with`, not `__del__`.",
  },
  "dict-hash-tables": {
    boardIntro: "A dict lookup is O(1). A list search is O(n). The difference is the hash — and hashability is a hard rule, not a suggestion.",
    whatItIs: [
      "Think of a dict like a coat check. You hand your coat, get a ticket with a number. When you come back, you hand the ticket — not the coat. Dict lookup works the same way: it hashes the key and uses the hash as the ticket number. No scanning racks, no comparing every coat.",
      "The tradeoff is memory. A hash table keeps empty slots so lookups stay fast. Pack the table too dense and collisions spike. Python maintains a load factor around 2/3 — resize when two-thirds full. Sparse, but fast.",
    ],
    howItWorks: [
      "Python calls `__hash__()` on the key to get an integer, then applies a mask to map that integer to a slot index. If the slot is empty, the pair is placed there.",
      "If occupied by a different key (a collision), Python probes forward using perturbed pseudo-random probing until it finds either a matching key or an empty slot. The amortized cost is still O(1) — but only if the hash function distributes well.",
      "Since Python 3.6, dicts use a compact two-array layout: a sparse index array (hash-derived offsets) and a dense entries array (insertion order). This saves ~58% memory over the old combined-table design and gives insertion order as a reliable guarantee.",
    ],
    whenToUseIt: [
      "Use dicts when you need to look up values by a key, not by position.",
      "Prefer sets when only membership matters — same hash table, no value storage.",
      "Keep keys immutable for their lifetime in the dict. A key whose hash changes becomes unreachable — the entry leaks until overwritten or the dict dies.",
    ],
    takeaways: [
      "O(1) lookup is amortized — degenerate hashing collapses it to O(n).",
      "Memory overhead is the price of speed: sparse tables beat dense scans.",
      "Hashability is a correctness invariant, not a performance hint.",
    ],
    tryItOutCode: "cache = {(\"user\", 42): \"active\"}\nprint(cache[(\"user\", 42)])\ntry:\n    cache[[\"user\", 42]] = \"bad\"\nexcept TypeError as exc:\n    print(type(exc).__name__)",
    visualKind: "hash-probe",
    simulationKind: "hash",
    simulationTitle: "Lookup Time vs Table Pressure",
    reminder: "Hashability is not optional.",
  },
  "dict-setdefault": {
    boardIntro: "You have written `if key not in d: d[key] = []` followed by `d[key].append(x)`. That is two lookups. `setdefault` does it in one.",
    whatItIs: [
      "Think of `setdefault` like a hotel front desk: you ask \"Is room 42 registered?\" If yes, they hand you the key. If not, they register a new guest and hand you that key. One query, not two.",
      "`defaultdict` takes this further: the factory function generates missing values automatically. `by_role[role].append(name)` works on the first call because the factory called `list()` for you.",
    ],
    howItWorks: [
      "`dict.setdefault(key, default)` performs a single lookup. If the key is present, it returns the existing value. If missing, it inserts `default` and returns it. No double probing.",
      "`collections.defaultdict(factory)` overrides `__missing__`, which `__getitem__` calls when a key is not found. The factory is called with no arguments to produce the default value.",
      "`setdefault` evaluates its default argument eagerly (before the lookup). `defaultdict` calls the factory lazily — only when a key is actually missing.",
    ],
    whenToUseIt: [
      "Use `setdefault` or `defaultdict` for grouping, inverted indexes, and many-to-one accumulation.",
      "Prefer `defaultdict` when the missing-value factory is the natural model for the container.",
      "Do not use them when a missing key means a business error rather than a new bucket — let the `KeyError` surface.",
    ],
    takeaways: [
      "`setdefault` collapses a two-lookup pattern into one probe.",
      "Factories beat repeated literal defaults for mutable buckets.",
      "Missing keys should only auto-initialize when that is semantically correct.",
    ],
    tryItOutCode: "from collections import defaultdict\n\nby_role = defaultdict(list)\nfor name, role in [(\"Ana\", \"admin\"), (\"Leo\", \"admin\"), (\"Mia\", \"viewer\")]:\n    by_role[role].append(name)\nprint(dict(by_role))",
    visualKind: "grouping-buckets",
    simulationKind: "hash",
    simulationTitle: "Grouping Growth vs Lookup Churn",
    reminder: "Auto-create only when the domain allows it.",
  },
  "sets-membership-views": {
    boardIntro: "Set membership is O(1) average case. List membership is O(n). That difference compounds fast when the collection grows.",
    whatItIs: [
      "Think of a set like a bouncer with perfect memory. You show up, they check your face — instant yes/no. No scanning the guest list line by line. That is the hash table: the face (hash) tells the bouncer exactly where to look.",
      "Dictionary keys are also hashable, so `dict_keys` and `dict_items` participate in set operations without building a new set. `payload.keys() - allowed_keys` is a set difference on a live view — no intermediate `set()` allocation.",
    ],
    howItWorks: [
      "Set membership uses the same hash-table mechanics as dict keys: hash the element, probe the table, O(1) average. Duplicates collapse to one element because equality and hashing define identity within the set.",
      "`dict_keys` implements the `collections.abc.Set` interface, supporting `&`, `|`, `-`, `^` without materializing a new set object. The view is a live window into the dict — changes to the dict are reflected immediately.",
      "`dict_items` is set-like only when every value is also hashable. If a dict has a list as a value, `items()` cannot be used in set operations.",
    ],
    whenToUseIt: [
      "Use sets for deduplication, access control checks, and overlap tests (intersection, difference).",
      "Use `frozenset` for immutable set membership or as a hashable composite key in another dict or set.",
      "Use dict view set operations (`keys()` &, `keys() -`) to validate request payload keys without allocating intermediate sets.",
    ],
    takeaways: [
      "Hash discipline matters for sets just as much as dicts — elements must be hashable and hash-stable.",
      "Set algebra (`|`, `&`, `-`, `^`) can replace slower nested loops with a single O(n) pass.",
      "`dict_keys` is often the cheapest comparison surface for key validation.",
    ],
    tryItOutCode: "allowed = {\"read\", \"write\"}\nrequested = {\"write\", \"delete\"}\nprint(requested & allowed)\nprint({\"role\": 1, \"name\": 2}.keys() & {\"name\", \"email\"})",
    visualKind: "set-algebra",
    simulationKind: "hash",
    simulationTitle: "Membership Checks vs Collision Risk",
    reminder: "Set algebra for overlap questions.",
  },
  "memory-container-comparison": {
    boardIntro: "Picking the wrong container costs memory, speed, or both. The four main choices optimize for very different workloads.",
    whatItIs: [
      "Think of containers like storage units: `list` is a shelf where every item is in its own box (PyObject reference). `tuple` is the same shelf but welded shut — no adding or removing items. `set` is a warehouse with an instant-lookup catalog (hash table) but wasted floor space (load factor overhead). `array.array` is a pallet of identical crates packed tight, no individual boxes at all.",
      "The syntactic difference (`[]`, `()`, `{}`, `array()`) hides a fundamental difference in memory representation. Choosing by syntax alone is choosing by accident.",
    ],
    howItWorks: [
      "Lists and tuples store PyObject pointers (8 bytes each on 64-bit). The actual objects live elsewhere on the heap. List over-allocates for amortized append; tuple allocates exactly.",
      "Sets use a hash table with load-factor overhead — the table is ~1/3 empty at all times. That empty space is the price of O(1) membership.",
      "`array.array` stores C primitives inline, packed contiguously. No per-element PyObject headers. An `array('I')` of 1000 ints takes ~4KB vs ~28KB for a list of 1000 ints.",
    ],
    whenToUseIt: [
      "Use lists for general mutable ordered work — the default choice.",
      "Use tuples for fixed records and immutable sequence semantics.",
      "Use sets for fast membership queries and deduplication.",
      "Use `array.array` for dense homogeneous numeric data where memory matters.",
    ],
    takeaways: [
      "Memory layout drives real performance behavior more than syntax does.",
      "Measure the dominant workload; do not rely on folklore.",
      "Container semantics (mutability, ordering, duplicates) must match the domain contract first.",
    ],
    tryItOutCode: "from array import array\nvalues = [1, 2, 3]\npacked = array('I', values)\nprint(type(values).__name__, type(packed).__name__, len(values), len(packed))",
    visualKind: "container-matrix",
    simulationKind: "containers",
    simulationTitle: "Memory vs Membership Tradeoff",
    reminder: "Pick by workload, not habit.",
  },
  "memory-list-alternatives": {
    boardIntro: "Lists are flexible — but flexibility has a cost. For numeric data, queues, and binary buffers, specialized containers skip the overhead.",
    whatItIs: [
      "A list of floats is an array of PyObject pointers pointing to individual float objects scattered on the heap — not a contiguous array of C doubles. Each float has ~24 bytes of PyObject overhead plus the 8 bytes for the value itself.",
      "Specialized containers trade flexibility for density: `array.array('d')` stores C doubles inline, one after another. `collections.deque` is a linked block structure optimized for fast append/pop on both ends. `memoryview` exposes a buffer's bytes without copying.",
    ],
    howItWorks: [
      "`array.array` packs C primitives contiguously in a single memory allocation. Appending may reallocate, but elements are never individually allocated. Memory per element: 8 bytes for `'d'` vs ~32 bytes for a list of floats.",
      "`deque` uses a doubly-linked list of fixed-size blocks. Appending to either end is O(1) amortized — no shifting elements like `list.insert(0, x)` or `list.pop(0)`.",
      "`memoryview` exposes the buffer protocol. Slice assignment like `view[2:4] = b'XY'` writes directly into the underlying buffer — no new object allocation.",
    ],
    whenToUseIt: [
      "Use `array.array` for large homogeneous numeric datasets where memory pressure matters.",
      "Use `deque` for FIFO queues, streaming windows, and breadth-first traversal.",
      "Use generators and iterators when one-pass processing avoids storing data at all.",
    ],
    takeaways: [
      "Different storage models eliminate different kinds of overhead.",
      "Zero-copy buffer access (memoryview) is often worth more than clever Python-level optimization.",
      "List is only the wrong choice when the workload says so clearly.",
    ],
    tryItOutCode: "from collections import deque\nfrom array import array\n\nqueue = deque([1, 2, 3])\nqueue.appendleft(0)\npacked = array('d', [1.0, 2.0, 3.0])\nprint(queue, packed)",
    visualKind: "storage-tracks",
    simulationKind: "containers",
    simulationTitle: "Storage Model vs Throughput",
    reminder: "The storage model is the optimization.",
  },
  "memory-tuples-lists": {
    boardIntro: "A tuple allocates exactly. A list over-allocates. That extra capacity is the price of append — deliberate, not wasteful.",
    whatItIs: [
      "Think of tuple like a fixed-size parking lot: you buy exactly N spaces and that is what you get. No expansion possible, but no wasted asphalt. A list is like a parking lot with expansion land bought alongside: you pay for a few extra empty spaces so that when a new car arrives, you do not have to build a whole new lot.",
      "That expansion land is the over-allocation. CPython allocates ~12.5% more slots than needed so `append` stays O(1) amortized. Without it, every append would require a full reallocation and copy of all existing elements.",
    ],
    howItWorks: [
      "Lists store a pointer to a dynamic array of `PyObject*` plus allocated capacity and current length. When `len == capacity`, the list resizes to `(len >> 3) + (len < 9 ? 3 : 6) + len` — roughly 1.125× growth. The old array is freed; existing references are copied.",
      "Tuples store a fixed-length array of `PyObject*` with no capacity field. The size is frozen at construction. The interpreter can optimize tuple creation aggressively — `tuple(t)` of an existing tuple returns the same object.",
      "Tuple's immutability also enables its use as dict keys and in sets. Lists cannot fill those roles.",
    ],
    whenToUseIt: [
      "Use tuples for fixed records, return bundles, function arguments, and any collection that should not change size.",
      "Use lists for accumulation, sorting, filtering, and in-place editing.",
      "Do not replace lists with tuples just because the data happens to be small. Use tuples when the contract is \"fixed shape,\" not when the data is short.",
    ],
    takeaways: [
      "Tuple's advantage is fixed shape and exact allocation — not speed.",
      "List's spare capacity is deliberate — it enables efficient growth.",
      "Immutability helps both reasoning and certain runtime optimizations.",
    ],
    tryItOutCode: "record = (\"Ana\", 42, True)\nitems = [\"Ana\", 42, True]\nprint(len(record), len(items))",
    visualKind: "tuple-layout",
    simulationKind: "containers",
    simulationTitle: "Allocation Slack vs Fixed Shape",
    reminder: "Use tuple when fixed shape is the truth.",
  },
  "memory-iterables": {
    boardIntro: "A list holds everything in memory. An iterable may produce each value on demand. That difference matters when data is large or streams are infinite.",
    whatItIs: [
      "Think of a list like a book: every page exists, bound together, ready to flip to any page instantly. An iterable is like reading a scroll from a spool: you see one section at a time, you cannot jump ahead, and once read, the text is behind the spool — gone unless you recorded it.",
      "Generators are the scroll: they store only the suspension frame (local variables, instruction pointer) and compute each value when asked. No materialized collection. That is why they handle large datasets without memory pressure.",
    ],
    howItWorks: [
      "Lists and tuples store references to all elements in a contiguous array. Every element exists simultaneously. `len()` is O(1) because the length is stored as a field.",
      "Generator functions (`def f(): yield x`) compile to generator objects. Each call to `next(gen)` resumes the frame, runs to the next `yield`, produces a value, and suspends again. The frame stores locals and the current instruction pointer — typically ~100 bytes regardless of the data volume.",
      "`memoryview` exposes a buffer's raw bytes without materializing Python objects per element. Combined with a generator, you get zero-copy access to streaming binary data.",
    ],
    whenToUseIt: [
      "Use iterators and generators for one-pass pipelines — reading lines from a file, streaming API responses, processing large datasets.",
      "Use containers (lists, tuples) when you need repeated traversal or random access.",
      "Document one-shot iterables clearly so callers do not accidentally consume them twice.",
    ],
    takeaways: [
      "Laziness trades replayability for memory savings.",
      "A generator's memory cost is the frame, not the data.",
      "An iterable contract guarantees less than a container contract — document accordingly.",
    ],
    tryItOutCode: "def rows():\n    for i in range(3):\n        yield i * 10\n\nstream = rows()\nprint(list(stream))",
    visualKind: "stream-pipeline",
    simulationKind: "memory",
    simulationTitle: "Materialization vs Stream Pressure",
    reminder: "One-shot iterables need caller discipline.",
  },
  "classes-data-builders": {
    boardIntro: "NamedTuple, typing.NamedTuple, and @dataclass all build records. None is strictly better — each makes a different tradeoff.",
    whatItIs: [
      "Think of the three builders like different types of luggage: NamedTuple is a rigid suitcase (tuple subclass, immutable, unpackable). @dataclass is a soft duffel bag (mutable, expandable, customizable pockets). The choice depends on what you need to do with it, not which is newer.",
      "NamedTuple records are tuples — they support indexing, unpacking, and pattern matching. @dataclass instances are regular class instances with generated `__init__`, `__repr__`, `__eq__`, and optionally `__hash__` and `__order__`.",
    ],
    howItWorks: [
      "`typing.NamedTuple` creates a tuple subclass with named field accessors. Field values are stored as tuple elements — access by index or by name. Memory footprint is that of a tuple: exact allocation, no per-field PyObject headers beyond the tuple's array of pointers.",
      "`@dataclass` generates `__init__`, `__repr__`, `__eq__`, and `__hash__` from class annotations. Fields are stored as instance attributes (in `__dict__` or `__slots__`). `default_factory` handles mutable defaults correctly: it runs the factory once per instance.",
      "With `slots=True`, a dataclass stores fields in a compact array instead of `__dict__`, reducing memory by ~30% and speeding attribute access.",
    ],
    whenToUseIt: [
      "Use NamedTuple when you want an immutable record that also behaves as a tuple — supports indexing, unpacking, and pattern matching.",
      "Use @dataclass when you need mutable fields, default factories, generated comparisons, or flexible field configuration.",
      "Do not treat them as interchangeable just because they both hold fields — they produce objects with different capabilities and constraints.",
    ],
    takeaways: [
      "Tuple-backed (NamedTuple) and class-backed (dataclass) records have different memory and behavior profiles.",
      "Generated methods (`__init__`, `__repr__`, `__eq__`) are part of the public API.",
      "Choose the record model that matches mutation and access expectations.",
    ],
    tryItOutCode: "from dataclasses import dataclass\nfrom typing import NamedTuple\n\nclass PointNT(NamedTuple):\n    x: int\n    y: int\n\n@dataclass\nclass PointDC:\n    x: int\n    y: int\n\nprint(PointNT(1, 2), PointDC(1, 2))",
    visualKind: "record-choices",
    simulationKind: "classes",
    simulationTitle: "Record Shape vs Mutation Cost",
    reminder: "Generated convenience still defines API shape.",
  },
  "classes-dataclass-fields": {
    boardIntro: "One @dataclass decorator generates __init__, __repr__, __eq__, and __hash__. The field options decide how — and that is where the design lives.",
    whatItIs: [
      "Think of dataclass field options like a car's options package: `frozen` is like the child lock (no one can change the seats after delivery). `order` is like having a VIN comparator — you can sort by all fields in order. `default_factory` is like a custom trunk organizer that is built fresh for each car instead of sharing one across the assembly line.",
      "Each option controls a different axis of generated behavior. They are not cosmetic — they change the class contract. `frozen=True` makes the instance hashable if `__eq__` is also generated. `order=True` generates `<`, `<=`, `>`, `>=`.",
    ],
    howItWorks: [
      "The decorator inspects `__annotations__` and field configuration to generate `__init__`, `__repr__`, `__eq__`, `__hash__`, and optionally `__lt__`, `__le__`, `__gt__`, `__ge__`.",
      "`default_factory=list` stores a callable. Each instance construction calls `list()` to produce a fresh default. This avoids the shared-mutable trap — the same problem as function mutable defaults, fixed the same way.",
      "`slots=True` generates `__slots__` from the field names, eliminating `__dict__`. Instances use less memory and attribute access is faster. But dynamic attribute assignment (`obj.extra = x`) is disabled.",
    ],
    whenToUseIt: [
      "Use explicit field configuration whenever defaults or generated comparisons are part of the API.",
      "Use `slots=True` when you have many instances and do not need dynamic attributes.",
      "Keep `__post_init__` narrow — it should validate or derive, not hide unrelated side effects.",
    ],
    takeaways: [
      "Dataclass options are API policy, not cosmetics.",
      "`default_factory` fixes the same shared-default problem seen in function defaults.",
      "Generated methods should match the domain semantics exactly — or do not generate them.",
    ],
    tryItOutCode: "from dataclasses import dataclass, field\n\n@dataclass(slots=True)\nclass Batch:\n    items: list[int] = field(default_factory=list)\n\nprint(Batch())",
    visualKind: "field-generation",
    simulationKind: "classes",
    simulationTitle: "Generated Fields vs Instance Footprint",
    reminder: "Treat dataclass flags as public behaviour choices.",
  },
  "runtime-gil-performance": {
    boardIntro: "Eight threads cannot divide a CPU loop by eight. But eight threads waiting on HTTP responses finish faster than one. That is the GIL.",
    whatItIs: [
      "Think of the GIL like a single bathroom key in an office building. Only one person can use the bathroom at a time. If everyone needs the bathroom (CPU-bound), the key serializes access. But if people mostly wait at their desks for phone calls (I/O-bound), the key is almost always available when someone needs it — waiting overlaps efficiently.",
      "The GIL is a mutex on the CPython interpreter that prevents two threads from executing Python bytecode simultaneously. It does not prevent I/O overlap because most I/O operations release the GIL while waiting.",
    ],
    howItWorks: [
      "Every bytecode instruction (or every ~30 instructions in the check interval) must acquire the GIL. A thread holding the GIL that performs I/O releases it — the kernel does the I/O in parallel while other threads run Python code.",
      "C extensions can release the GIL explicitly for long-running native operations. CPU-heavy C work (numpy, regex on large strings) can run truly in parallel with Python code in other threads.",
      "Free-threaded CPython (PEP 703, Python 3.13+) removes the GIL entirely in a per-interpreter mode. Each interpreter instance in Python 3.12+ can also have its own GIL (PEP 684).",
    ],
    whenToUseIt: [
      "Use threads freely for I/O orchestration — the GIL is released during waits.",
      "Use `ProcessPoolExecutor` or multiprocessing for CPU-bound Python code.",
      "Measure before rewriting architecture around GIL assumptions. Many workloads are I/O-bound and threads work fine.",
    ],
    takeaways: [
      "The GIL is a throughput constraint on Python bytecode, not a blanket ban on threads.",
      "Shared memory remains a thread advantage over processes — no serialization overhead.",
      "Workload shape (CPU vs I/O) determines the right concurrency primitive, not GIL folklore.",
    ],
    tryItOutCode: "from concurrent.futures import ThreadPoolExecutor\n\ndef cpu_task(n):\n    total = 0\n    for i in range(n):\n        total += i\n    return total\n\nwith ThreadPoolExecutor(max_workers=2) as pool:\n    print(list(pool.map(cpu_task, [10_000, 10_000])))",
    visualKind: "gil-threads",
    simulationKind: "gil",
    simulationTitle: "Threads vs Processes Under Load",
    reminder: "CPU vs I/O — separate the stories every time.",
  },
  "async-foundations-awaitables": {
    boardIntro: "`await` is a suspension point that pauses the coroutine so the event loop can run something else — no parallelism implied.",
    whatItIs: [
      "Think of async like a chef with multiple orders: instead of standing at the stove stirring one pot until it boils (blocking), the chef starts the pot, turns to chop vegetables for another order, and checks the first pot periodically. The chef never does two things at once — but nothing sits idle waiting for a timer.",
      "That is cooperative concurrency: the coroutine decides when to yield (at `await`). The event loop decides which ready coroutine resumes next. No preemption, no parallelism at the Python level.",
    ],
    howItWorks: [
      "A coroutine runs until it hits an `await` on an awaitable (another coroutine, a Future, a Task). At that point it suspends, saving its frame state, and returns control to the event loop.",
      "The event loop maintains a queue of ready tasks. It picks the next one, resumes it (calls `send(None)` on the coroutine), and lets it run until the next suspension.",
      "Any blocking CPU work or synchronous I/O inside a coroutine stalls the entire loop — no other task can run while that bytecode executes.",
    ],
    whenToUseIt: [
      "Use async for high-concurrency I/O services — web servers, API clients, database drivers with async support.",
      "Keep CPU-heavy work, synchronous I/O, and blocking calls out of coroutine hot paths.",
      "Model ownership and cancellation up front — async without teardown is a resource leak.",
    ],
    takeaways: [
      "Concurrency comes from yielding, not from magic background execution.",
      "One blocking coroutine can stall every task on the loop.",
      "Await boundaries are the unit of cooperation — every `await` is an opportunity for the loop.",
    ],
    tryItOutCode: "import asyncio\n\nasync def work(name):\n    await asyncio.sleep(0.1)\n    return name\n\nprint(asyncio.run(work(\"job\")))",
    visualKind: "event-loop",
    simulationKind: "async",
    simulationTitle: "Ready Tasks vs Loop Delay",
    reminder: "Every blocking boundary is everyone's problem.",
  },
  "async-context-backpressure": {
    boardIntro: "Fan-out without a bound is a reliability incident waiting for a traffic spike.",
    whatItIs: [
      "Think of a semaphore like a turnstile at a stadium: only N people enter per minute, no matter how many show up. In async, the semaphore limits how many coroutines run concurrently. The rest wait outside until someone exits.",
      "Backpressure is the system's way of saying \"I can only handle this much.\" Without it, 10,000 concurrent requests all land on the database at once. With it, they queue at the semaphore and trickle in at a rate the database can sustain.",
    ],
    howItWorks: [
      "`asyncio.Semaphore(N)` is an async context manager. Acquiring it decrements a counter. If the counter is zero, the coroutine suspends until another coroutine releases the semaphore.",
      "`asyncio.Queue(maxsize=N)` provides producer-consumer backpressure. A producer putting into a full queue suspends until a consumer takes an item.",
      "`asyncio.as_completed()` yields futures as they complete, letting you process results incrementally instead of waiting for all of them with `gather()`.",
    ],
    whenToUseIt: [
      "Use semaphores to bound concurrency per resource (database pool, external API rate limit).",
      "Use queues when producers and consumers operate at different speeds.",
      "Watch queue growth as a signal of overload — if the queue grows unbounded, the system cannot keep up.",
    ],
    takeaways: [
      "Throughput without pressure control becomes latency collapse under load.",
      "Resource ownership (which coroutine holds which permit) belongs in `async with` blocks.",
      "Backpressure is a design responsibility, not a library feature toggle.",
    ],
    tryItOutCode: "import asyncio\n\nasync def fetch(i, limit):\n    async with limit:\n        await asyncio.sleep(0.05)\n        return i\n\nasync def main():\n    limit = asyncio.Semaphore(2)\n    return await asyncio.gather(*(fetch(i, limit) for i in range(4)))\n\nprint(asyncio.run(main()))",
    visualKind: "backpressure-flow",
    simulationKind: "async",
    simulationTitle: "Queue Depth vs Service Latency",
    reminder: "Bound fan-out where the resource actually hurts.",
  },
  "async-servers-services": {
    boardIntro: "A server's job is mostly waiting — for connections, socket data, output buffers to drain. Async makes that waiting explicit and returns control to the loop between waits.",
    whatItIs: [
      "Think of an async server like a busy receptionist who handles calls one at a time but never puts anyone on hold. Instead, they start a call, ask a question, and while waiting for the answer, they start the next call. No call blocks another — not because the receptionist works faster, but because waiting is shared.",
      "The asyncio stream API (`await reader.readline()`, `await writer.drain()`) makes every I/O boundary a suspension point. Between those points, the loop serves other connections.",
    ],
    howItWorks: [
      "Each connection handler is a coroutine. When it awaits a read, the loop suspends it until data arrives. When it awaits drain, the loop suspends it until the write buffer flushes.",
      "The connection lifecycle is explicit: open, read/write loop, close, wait for close. Each step has an await point that returns control to the loop.",
      "Slow peers are a fact of network programming. A handler that writes to a slow client will block at `drain()` — but only that handler blocks. Other connections proceed.",
    ],
    whenToUseIt: [
      "Use async servers when you need high connection counts (thousands of concurrent clients).",
      "Treat write buffering and shutdown paths as first-class design problems, not afterthoughts.",
      "Do not bury CPU-heavy parsing or synchronous database calls in a handler coroutine — offload to a thread or process.",
    ],
    takeaways: [
      "Service correctness includes flow control and deterministic cleanup.",
      "Drain boundaries are operationally important — a stalled write blocks a handler, not the server.",
      "Network backpressure (slow peers, backpressure from downstream) is a real part of async application design.",
    ],
    tryItOutCode: "import asyncio\n\nasync def handler(reader, writer):\n    data = await reader.readline()\n    writer.write(data)\n    await writer.drain()\n    writer.close()\n    await writer.wait_closed()",
    visualKind: "server-pipeline",
    simulationKind: "async",
    simulationTitle: "Connection Count vs Drain Latency",
    reminder: "Slow writes are part of the server model.",
  },
  "async-iterators-generators": {
    boardIntro: "An async generator lets you produce values lazily while the event loop stays responsive between items.",
    whatItIs: [
      "Think of an async generator like a vending machine that restocks each item just before dispensing. You do not wait for the whole inventory to be loaded — you wait for one item, receive it, and the machine restocks the next one while you eat the first.",
      "Where a regular generator suspends between yields (cooperative at the Python level), an async generator suspends the coroutine at each `await` inside it. The event loop fills the gap by running other tasks.",
    ],
    howItWorks: [
      "An async generator function (`async def ticker(): ... yield value`) returns an async generator object. It implements `__aiter__` and `__anext__` — each `__anext__` call resumes the frame, runs to the next `yield`, and produces a value.",
      "Between `yield` statements, `await` points suspend the generator's coroutine frame, giving the event loop a chance to run other tasks.",
      "Unfinished async generators should be cleaned up with `aclose()` or `async for` exhaustion, otherwise they hold the generator frame and any resources it references.",
    ],
    whenToUseIt: [
      "Use async generators for paginated API responses, chunked file processing, and event feeds.",
      "Prefer them when downstream consumers can process items incrementally — they reduce time-to-first-item and peak memory.",
      "Document whether the stream is replayable or one-shot. An exhausted async generator cannot be restarted.",
    ],
    takeaways: [
      "Streaming reduces both peak memory and time-to-first-item.",
      "The consumer now participates in scheduling cost — each `async for` iteration is an await point.",
      "Lifecycle management matters for partially consumed streams — use `async with` or `aclose()`.",
    ],
    tryItOutCode: "import asyncio\n\nasync def stream():\n    for item in [1, 2, 3]:\n        await asyncio.sleep(0.01)\n        yield item\n\nasync def main():\n    return [x async for x in stream()]\n\nprint(asyncio.run(main()))",
    visualKind: "async-stream",
    simulationKind: "async",
    simulationTitle: "Chunk Size vs Stream Latency",
    reminder: "Streaming shifts memory cost to coordination cost.",
  },
  "async-limits-type-hints": {
    boardIntro: "Async helps with I/O latency. It does not make CPU work faster. Type hints tell you the shape, not the scheduling cost.",
    whatItIs: [
      "Think of async like a highway carpool lane: it helps when everyone is waiting at toll booths (I/O). It does not help when everyone is driving slow cars (CPU). Putting a slow car in the carpool lane still blocks everyone behind it.",
      "CPU-heavy work inside a coroutine monopolizes the event loop. No other task runs until that bytecode finishes. Async does not make it parallel — it makes it worse, because now even I/O waits for that CPU work to yield.",
    ],
    howItWorks: [
      "A coroutine that spends 5 seconds in a pure-Python loop without `await` blocks every other task on the same event loop. The loop cannot schedule around it because there is no suspension point.",
      "`Awaitable`, `AsyncIterator`, and `AsyncGenerator` are type-level protocols. They tell callers and checkers which values are coroutines vs concrete results — but no type catches `async def cpu_bound() -> int` that never awaits.",
      "The point where async stops helping is measurable: event loop lag (time between scheduling and running), growing task queues, latency spikes under load.",
    ],
    whenToUseIt: [
      "Use async where I/O overlap is the dominant workload — HTTP, database, file I/O.",
      "Move CPU-heavy work to a thread pool (`loop.run_in_executor`) or process pool when it appears inside async code.",
      "Type async APIs precisely (`Awaitable[int]` vs `int`) so ownership and consumption patterns are obvious to callers.",
    ],
    takeaways: [
      "Async optimizes for I/O overlap — it is a targeted concurrency tool, not a universal performance switch.",
      "Type clarity matters more when control flow is indirect (callbacks, futures, coroutines).",
      "Measure event loop lag and backlog, not just raw task counts.",
    ],
    tryItOutCode: "from collections.abc import AsyncIterator\n\nasync def rows() -> AsyncIterator[int]:\n    for value in [1, 2, 3]:\n        yield value",
    visualKind: "async-boundary",
    simulationKind: "async",
    simulationTitle: "CPU Share vs Event-Loop Lag",
    reminder: "Type async boundaries precisely.",
  },
  "asyncio-task-groups": {
    boardIntro: "`TaskGroup` guarantees cleanup when a task fails. `gather()` does not. That is the difference between structured and unstructured concurrency.",
    whatItIs: [
      "Think of `TaskGroup` like a tour guide with a group of hikers: if one hiker falls, the guide calls everyone back to base. Everyone is accounted for, no one wanders the mountain alone. `gather()` is like handing everyone a map and hoping they all make it back — if one gets lost, the others may never know.",
      "When a task in a TaskGroup raises, all sibling tasks are cancelled. The exception propagates through the `async with` block. No orphaned tasks, no invisible failures.",
    ],
    howItWorks: [
      "`async with asyncio.TaskGroup() as tg:` creates a scope. Tasks started inside via `tg.create_task()` are children of that scope.",
      "On scope exit, the group waits for all children to finish. If any child raised, all siblings are cancelled and an `ExceptionGroup` is raised containing all child exceptions.",
      "`TaskGroup` does NOT bound fan-out — it only guarantees cleanup. If you start 10,000 tasks inside a group, all 10,000 run concurrently. Use a semaphore alongside the group to limit concurrency.",
    ],
    whenToUseIt: [
      "Use TaskGroup when several async operations form one logical unit of work that should fail together.",
      "Combine TaskGroup with a semaphore or queue when fan-out still needs bounding.",
      "Avoid detached background tasks (`asyncio.ensure_future` without tracking) unless you also define ownership, shutdown, and observability for each.",
    ],
    takeaways: [
      "Ownership of tasks should be visible in the code structure — TaskGroup makes it explicit.",
      "Failure boundaries matter as much as launch concurrency.",
      "Structured concurrency (TaskGroup) reduces orphaned work and invisible failures.",
    ],
    tryItOutCode: "import asyncio\n\nasync def worker(name):\n    await asyncio.sleep(0.05)\n    return name\n\nasync def main():\n    async with asyncio.TaskGroup() as tg:\n        tg.create_task(worker(\"a\"))\n        tg.create_task(worker(\"b\"))\n\nasyncio.run(main())",
    visualKind: "task-tree",
    simulationKind: "async",
    simulationTitle: "Fan-out Width vs Cancellation Cost",
    reminder: "Tasks need an owner or they become cleanup debt.",
  },
  "production-stdlib-logging": {
    boardIntro: "`print()` works until you need levels, routing, or structured output. By then you are writing infrastructure that `logging` already provides.",
    whatItIs: [
      "Think of `logging` like a postal sorting facility: each envelope (log record) has a destination address (logger name), a priority stamp (level), and routing instructions (handlers, formatters). The application drops the envelope in the mail slot — it does not decide which bin the letter lands in or whether it gets an international stamp.",
      "The separation of loggers (who is talking), handlers (where the message goes), and formatters (how it looks) lets you change routing without touching the code that emits the log.",
    ],
    howItWorks: [
      "Logger names form a hierarchy via dot-separated naming. A logger named `orders.payment` is a child of `orders`. Child loggers propagate to parent handlers by default — you can configure the root logger and let all children inherit.",
      "LogRecords are created at each `log.info(...)` call, carrying the message, level, logger name, and any extra context dict. Handlers decide destination (file, stdout, socket). Formatters decide serialization.",
      "`extra={...}` attaches structured fields to the LogRecord. Formatters can reference these with `%(key)s` in the format string, enabling structured output without string concatenation.",
    ],
    whenToUseIt: [
      "Use logger hierarchies that match subsystem ownership — `orders.payment`, `orders.shipping`.",
      "Attach stable contextual fields via `extra=` that operators can filter and aggregate.",
      "Never log secrets, raw tokens, or full request bodies. Pair logging with type-safe boundary validation.",
    ],
    takeaways: [
      "Logger hierarchy structure IS observability architecture.",
      "Level discipline matters more than log volume — `INFO` for normal operations, `WARNING` for recoverable issues, `ERROR` for failures.",
      "Structured context fields beat free-form string interpolation for production parsing.",
    ],
    tryItOutCode: "import logging\n\nlogger = logging.getLogger(\"service.auth\")\nlogger.setLevel(logging.INFO)\nlogger.info(\"login\", extra={\"user_id\": 42})",
    visualKind: "log-pipeline",
    simulationKind: "logging",
    simulationTitle: "Event Volume vs Signal Quality",
    reminder: "Logs should help operators decide.",
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
