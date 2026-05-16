import {
  Braces,
  Database,
  GitBranch,
  Layers,
  List,
  MemoryStick,
  PackageCheck,
  Puzzle,
  Scale,
  Server,
  Shuffle,
  Tags,
  Timer,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react"
import type { TopicSection } from "@/types"

export const TOPIC_SECTIONS: TopicSection[] = [
  {
    id: "sequences",
    label: "Sequences & matching",
    cards: [
      { id: "sequences-slicing", color: "purple", Icon: List, title: "Readable slicing in production code", desc: "Half-open intervals, named slices, slice assignment, and copy behavior", badges: [{ label: "Sequences", color: "purple" }], cats: ["sequences", "performance"], kw: "slice slicing sequence half open named slice assignment copy stride" },
      { id: "sequences-pattern-matching", color: "teal", Icon: GitBranch, title: "Sequence pattern matching", desc: "Use match/case for shape-based branching without brittle index code", badges: [{ label: "Sequences", color: "teal" }], cats: ["sequences", "patterns"], kw: "match case pattern matching sequence destructuring unpacking as guard" },
    ],
  },
  {
    id: "language",
    label: "Language model",
    cards: [
      { id: "language-identity-equality", color: "amber", Icon: Scale, title: "Identity, equality and aliases", desc: "Know when names share objects and when value comparison is the contract", badges: [{ label: "Language", color: "amber" }], cats: ["language", "production"], kw: "identity equality is == alias reference id none singleton" },
      { id: "language-parameters", color: "blue", Icon: Tags, title: "Function signatures as API design", desc: "Positional-only, keyword-only, *args, **kwargs, and safer call sites", badges: [{ label: "API design", color: "blue" }], cats: ["language", "patterns"], kw: "function signature positional only keyword only args kwargs slash star" },
      { id: "language-mutable-defaults", color: "coral", Icon: Wand2, title: "Mutable defaults are shared state", desc: "The classic default-list bug and the sentinel pattern that prevents it", badges: [{ label: "Bug pattern", color: "coral" }], cats: ["language", "production"], kw: "mutable default argument list dict sentinel none shared state" },
      { id: "language-decorators-closures", color: "green", Icon: Puzzle, title: "Decorators, closures, and nonlocal", desc: "Build wrappers that keep metadata, state, and scope behavior correct", badges: [{ label: "Functions", color: "green" }], cats: ["language", "patterns"], kw: "decorator closure nonlocal wraps free variable first class function callable" },
      { id: "language-type-hints", color: "purple", Icon: Braces, title: "Type hints that help callers", desc: "Use abstract inputs, concrete outputs, Any intentionally, and runtime validation separately", badges: [{ label: "Typing", color: "purple" }], cats: ["language", "classes"], kw: "typing type hints Any object Optional Union Iterable Mapping Sequence" },
      { id: "language-bytecode-dis", color: "blue", Icon: Braces, title: "Python bytecode and the dis module", desc: "Read opcode output, inspect code objects, and understand when bytecode explains speed", badges: [{ label: "Runtime", color: "blue" }], cats: ["language", "performance", "production"], kw: "bytecode dis opcode code object load_fast load_global load_deref list_append adaptive interpreter" },
      { id: "language-dunder-methods", color: "green", Icon: Puzzle, title: "Dunder methods and Python protocols", desc: "How __eq__, __iter__, __repr__, __len__, and friends map syntax to behavior", badges: [{ label: "Data model", color: "green" }], cats: ["language", "classes", "patterns"], kw: "dunder special methods protocol eq hash iter len repr contains bool enter exit" },
      { id: "runtime-del-gc", color: "amber", Icon: Trash2, title: "del, references, and garbage collection", desc: "Deleting a name is not deleting an object; resource cleanup needs with", badges: [{ label: "Runtime", color: "amber" }], cats: ["language", "memory", "production"], kw: "del garbage collection reference count __del__ weakref finalize context manager" },
    ],
  },
  {
    id: "hashing",
    label: "Dictionaries & sets",
    cards: [
      { id: "dict-hash-tables", color: "blue", Icon: Database, title: "How dict gets constant-time lookup", desc: "Hashability, collisions, load factor, memory cost, and stable key order", badges: [{ label: "dict", color: "blue" }], cats: ["data-structures", "performance"], kw: "dict hash table hashable collision load factor key lookup order" },
      { id: "dict-setdefault", color: "teal", Icon: PackageCheck, title: "Updating mutable values in dicts", desc: "Use setdefault or defaultdict to avoid repeated lookups and branch noise", badges: [{ label: "dict", color: "teal" }], cats: ["data-structures", "patterns"], kw: "dict setdefault defaultdict mutable list index grouping" },
      { id: "sets-membership-views", color: "green", Icon: Layers, title: "Sets and dictionary views", desc: "Fast membership, set algebra, frozenset, and zero-copy key comparisons", badges: [{ label: "set", color: "green" }], cats: ["data-structures", "performance"], kw: "set frozenset dict views keys items membership intersection union difference" },
    ],
  },
  {
    id: "memory",
    label: "Memory & throughput",
    cards: [
      { id: "memory-container-comparison", color: "amber", Icon: Scale, title: "List vs set vs tuple vs array.array", desc: "Memory cost, lookup speed, mutation model, and dense numeric tradeoffs", badges: [{ label: "Comparison", color: "amber" }], cats: ["memory", "performance", "data-structures"], kw: "list set tuple array array.array compare comparison memory performance membership packed numeric" },
      { id: "memory-list-alternatives", color: "coral", Icon: Zap, title: "When list is not the right container", desc: "array, deque, memoryview, and generators for tighter memory and I/O", badges: [{ label: "Performance", color: "coral" }], cats: ["memory", "performance", "data-structures"], kw: "list alternatives array deque memoryview generator flat sequence binary io" },
      { id: "memory-tuples-lists", color: "purple", Icon: MemoryStick, title: "Why tuples can beat lists", desc: "Constants, copy elision, exact allocation, and record-like data", badges: [{ label: "Memory", color: "purple" }], cats: ["memory", "performance", "sequences"], kw: "tuple list memory allocation constants copy immutable record" },
      { id: "memory-iterables", color: "teal", Icon: Shuffle, title: "Container vs flat iterables", desc: "Understand references, raw values, arrays, memoryview, and streaming", badges: [{ label: "Iterables", color: "teal" }], cats: ["memory", "performance", "sequences"], kw: "iterable iterator generator container flat sequence array memoryview bytes deque" },
    ],
  },
  {
    id: "classes",
    label: "Data classes & types",
    cards: [
      { id: "classes-data-builders", color: "blue", Icon: Braces, title: "namedtuple, NamedTuple or dataclass?", desc: "Pick the right data class builder for records, typed tuples, and mutable objects", badges: [{ label: "Classes", color: "blue" }], cats: ["classes", "language"], kw: "namedtuple NamedTuple dataclass record immutable mutable fields annotations" },
      { id: "classes-dataclass-fields", color: "amber", Icon: Layers, title: "Dataclass fields and generated behavior", desc: "default_factory, frozen, order, ClassVar, InitVar, and __post_init__", badges: [{ label: "dataclass", color: "amber" }], cats: ["classes", "patterns"], kw: "dataclass field default_factory frozen order ClassVar InitVar post_init slots" },
    ],
  },
  {
    id: "production",
    label: "Production runtime",
    cards: [
      { id: "runtime-gil-performance", color: "green", Icon: Zap, title: "The GIL, threads, and performance", desc: "Why CPython has a GIL, when it blocks scaling, and when threads still work well", badges: [{ label: "Runtime", color: "green" }], cats: ["production", "performance", "language"], kw: "gil global interpreter lock threads cpu bound io bound processpool free threaded interpreterpool" },
      { id: "async-foundations-awaitables", color: "teal", Icon: Timer, title: "Async foundations: awaitables and scheduling", desc: "Native coroutines, await boundaries, event-loop control flow, and blocking hazards", badges: [{ label: "Async", color: "teal" }], cats: ["async", "language", "production"], kw: "async await awaitable coroutine event loop scheduling suspension blocking asyncio" },
      { id: "async-context-backpressure", color: "amber", Icon: Layers, title: "Async context, backpressure, and offloading", desc: "async with, as_completed, semaphores, and thread delegation at blocking boundaries", badges: [{ label: "Async", color: "amber" }], cats: ["async", "production", "patterns"], kw: "async with as_completed semaphore backpressure to_thread offload concurrency limit" },
      { id: "async-servers-services", color: "blue", Icon: Server, title: "Async servers and service handlers", desc: "TCP handlers, read and drain boundaries, cleanup, and event-loop service mechanics", badges: [{ label: "Async", color: "blue" }], cats: ["async", "production", "networking"], kw: "async server start_server streams reader writer drain handler tcp service" },
      { id: "async-iterators-generators", color: "purple", Icon: Shuffle, title: "Async iterators, generators, and comprehensions", desc: "Stream values incrementally with async for, async generators, and async comprehensions", badges: [{ label: "Async", color: "purple" }], cats: ["async", "language", "iterables"], kw: "async for async iterable async iterator async generator comprehension stream" },
      { id: "async-limits-type-hints", color: "coral", Icon: Braces, title: "Async limits and protocol type hints", desc: "Where async stops helping, how CPU work stalls the loop, and how to type async boundaries", badges: [{ label: "Async", color: "coral" }], cats: ["async", "production", "typing"], kw: "async limits cpu bound awaitable coroutine asynciterator asynciterable asyncgenerator typing" },
      { id: "asyncio-task-groups", color: "green", Icon: Timer, title: "asyncio without accidental overload", desc: "Use TaskGroup, gather, queues, and semaphores with clear failure boundaries", badges: [{ label: "Async", color: "green" }], cats: ["async", "production"], kw: "asyncio await TaskGroup gather queue semaphore to_thread cancellation" },
      { id: "production-stdlib-logging", color: "coral", Icon: Server, title: "Production logging with the stdlib", desc: "Use logger hierarchy, levels, extra context, and safe exception logging", badges: [{ label: "Production", color: "coral" }], cats: ["production"], kw: "logging logger handler formatter level extra exception production observability" },
    ],
  },
]

export const ALL_TOPICS = TOPIC_SECTIONS.flatMap((section) => section.cards)
