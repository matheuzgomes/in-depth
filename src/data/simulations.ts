import type {
  AsyncTimelineLabData,
  BytecodeLabData,
  ContainerComparisonLabData,
  DictLookupSimulationData,
  GILLabData,
  LoopSimulationData,
  PatternMatchingSimulationData,
  SpecialMethodLabData,
  SetMembershipSimulationData,
  SliceSimulationData,
} from "@/types"

export const loopTraversalSimulation: LoopSimulationData = {
  title: "Step Through a for Loop",
  summary: "Walk through how Python traverses a concrete list, binds the loop variable, updates an accumulator, and finishes with the computed result.",
  ctaLabel: "See simulation",
  sourceCode: `
items = [3, 5, 2]
total = 0

for item in items:
    total += item

print(total)
`,
  iterableLabel: "items",
  itemVariableLabel: "item",
  accumulatorLabel: "total",
  resultLabel: "total",
  items: [3, 5, 2],
  steps: [
    {
      label: "Create the list",
      explanation: "Python creates the list object and binds the name items to it. No iteration has started yet.",
      activeLine: 1,
      pointer: null,
      currentItem: null,
      accumulatorValue: 0,
      visitedIndices: [],
    },
    {
      label: "Initialize the accumulator",
      explanation: "The name total is bound to 0. This value will be updated once for each element produced by the loop.",
      activeLine: 2,
      pointer: null,
      currentItem: null,
      accumulatorValue: 0,
      visitedIndices: [],
    },
    {
      label: "Enter the loop",
      explanation: "The for statement conceptually asks for iter(items), then pulls the first value with next(...). That value is bound to item.",
      activeLine: 4,
      pointer: 0,
      currentItem: 3,
      accumulatorValue: 0,
      visitedIndices: [],
    },
    {
      label: "Run the loop body",
      explanation: "The loop body executes with item = 3, so total becomes 0 + 3. The first element has now been consumed.",
      activeLine: 5,
      pointer: 0,
      currentItem: 3,
      accumulatorValue: 3,
      visitedIndices: [0],
    },
    {
      label: "Advance to the next element",
      explanation: "The loop asks the iterator for the next value. Python binds item to 5 and prepares to run the body again.",
      activeLine: 4,
      pointer: 1,
      currentItem: 5,
      accumulatorValue: 3,
      visitedIndices: [0],
    },
    {
      label: "Accumulate again",
      explanation: "The body runs with item = 5, so total becomes 3 + 5 = 8.",
      activeLine: 5,
      pointer: 1,
      currentItem: 5,
      accumulatorValue: 8,
      visitedIndices: [0, 1],
    },
    {
      label: "Read the final element",
      explanation: "The iterator yields the last element, 2. Python rebinds item to that value for the final body execution.",
      activeLine: 4,
      pointer: 2,
      currentItem: 2,
      accumulatorValue: 8,
      visitedIndices: [0, 1],
    },
    {
      label: "Finish the accumulation",
      explanation: "The body runs one last time. total becomes 8 + 2 = 10.",
      activeLine: 5,
      pointer: 2,
      currentItem: 2,
      accumulatorValue: 10,
      visitedIndices: [0, 1, 2],
    },
    {
      label: "Loop completes",
      explanation: "The next request to the iterator would raise StopIteration, so the loop exits and execution continues after the loop.",
      activeLine: 7,
      pointer: null,
      currentItem: null,
      accumulatorValue: 10,
      visitedIndices: [0, 1, 2],
      done: true,
    },
  ],
}

export const slicingSimulation: SliceSimulationData = {
  title: "Step Through a Slice",
  summary: "See how Python interprets a half-open slice, selects source positions, and allocates a new list for the result.",
  ctaLabel: "See simulation",
  sourceCode: `
items = [10, 20, 30, 40, 50, 60]
middle = items[2:5]

print(middle)
`,
  sourceLabel: "items",
  resultLabel: "middle",
  items: [10, 20, 30, 40, 50, 60],
  steps: [
    {
      label: "Create the source list",
      explanation: "Python creates the source list and binds the name items to it. The slice has not been evaluated yet.",
      activeLine: 1,
      start: 2,
      stop: 5,
      selectedIndices: [],
      resultItems: [],
    },
    {
      label: "Read the slice bounds",
      explanation: "The expression items[2:5] means start at index 2 and stop before index 5. Because slicing is half-open, index 5 itself is excluded.",
      activeLine: 2,
      start: 2,
      stop: 5,
      selectedIndices: [],
      resultItems: [],
    },
    {
      label: "Select the covered positions",
      explanation: "Python identifies the positions covered by the slice: indices 2, 3, and 4. Those are the references that will be copied into the result list.",
      activeLine: 2,
      start: 2,
      stop: 5,
      selectedIndices: [2, 3, 4],
      resultItems: [],
    },
    {
      label: "Allocate the result list",
      explanation: "Python allocates a brand new list object sized for the selected range. The outer list is new even though the selected element references are reused.",
      activeLine: 2,
      start: 2,
      stop: 5,
      selectedIndices: [2, 3, 4],
      resultItems: [],
      allocated: true,
    },
    {
      label: "Copy the selected references",
      explanation: "The selected references are copied into the new list, so middle becomes [30, 40, 50]. This is why list slicing costs time and memory proportional to slice length.",
      activeLine: 2,
      start: 2,
      stop: 5,
      selectedIndices: [2, 3, 4],
      resultItems: [30, 40, 50],
      allocated: true,
      done: true,
    },
  ],
}

export const dictLookupSimulation: DictLookupSimulationData = {
  title: "Step Through a Dict Lookup",
  summary: "Follow a conceptual hash-table lookup from home bucket to collision handling to the final matched value.",
  ctaLabel: "See simulation",
  sourceCode: `
record = {
    "role": "admin",
    "name": "Ana",
    "email": "ana@example.com",
}

value = record["email"]
`,
  tableLabel: "Conceptual hash table",
  resultLabel: "value",
  note: "This uses illustrative bucket numbers so the probing story is easy to follow. Real Python hash values are intentionally not stable across runs.",
  steps: [
    {
      label: "Build the mapping",
      explanation: "The dictionary already contains three key-value pairs. We are about to look up the key email in the existing hash table.",
      activeLine: 1,
      lookupKey: "email",
      homeBucket: 2,
      probeBucket: null,
      probePath: [],
      resultValue: null,
      slots: [
        { key: "role", value: "admin", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: "name", value: "Ana", status: "occupied" },
        { key: "email", value: "ana@example.com", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: null, value: null, status: "empty" },
      ],
    },
    {
      label: "Compute the home bucket",
      explanation: "Python hashes the lookup key and maps that hash into a table position. In this illustrative example, email starts probing at bucket 2.",
      activeLine: 7,
      lookupKey: "email",
      homeBucket: 2,
      probeBucket: 2,
      probePath: [2],
      resultValue: null,
      slots: [
        { key: "role", value: "admin", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: "name", value: "Ana", status: "active" },
        { key: "email", value: "ana@example.com", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: null, value: null, status: "empty" },
      ],
    },
    {
      label: "Hit a collision",
      explanation: "Bucket 2 is occupied, but the stored key is name rather than email. The hash table must probe again instead of returning this value.",
      activeLine: 7,
      lookupKey: "email",
      homeBucket: 2,
      probeBucket: 2,
      probePath: [2],
      resultValue: null,
      slots: [
        { key: "role", value: "admin", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: "name", value: "Ana", status: "collision" },
        { key: "email", value: "ana@example.com", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: null, value: null, status: "empty" },
      ],
    },
    {
      label: "Probe the next bucket",
      explanation: "Python follows its probing strategy to the next candidate slot. In this example the next bucket is 3.",
      activeLine: 7,
      lookupKey: "email",
      homeBucket: 2,
      probeBucket: 3,
      probePath: [2, 3],
      resultValue: null,
      slots: [
        { key: "role", value: "admin", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: "name", value: "Ana", status: "occupied" },
        { key: "email", value: "ana@example.com", status: "active" },
        { key: null, value: null, status: "empty" },
        { key: null, value: null, status: "empty" },
      ],
    },
    {
      label: "Find the matching key",
      explanation: "Bucket 3 stores the exact key email, so Python returns the associated value immediately. The lookup stops as soon as the key matches.",
      activeLine: 7,
      lookupKey: "email",
      homeBucket: 2,
      probeBucket: 3,
      probePath: [2, 3],
      resultValue: "ana@example.com",
      slots: [
        { key: "role", value: "admin", status: "occupied" },
        { key: null, value: null, status: "empty" },
        { key: "name", value: "Ana", status: "occupied" },
        { key: "email", value: "ana@example.com", status: "match" },
        { key: null, value: null, status: "empty" },
        { key: null, value: null, status: "empty" },
      ],
      done: true,
    },
  ],
}

export const patternMatchingSimulation: PatternMatchingSimulationData = {
  title: "Step Through Pattern Matching",
  summary: "See how Python tests cases in order, rejects the wrong shape, binds names from the matching shape, and only then runs the selected branch.",
  ctaLabel: "See simulation",
  sourceCode: `
command = ["rotate", "90"]

match command:
    case ["move", x, y]:
        result = ("move", float(x), float(y))
    case ["rotate", degrees]:
        result = ("rotate", int(degrees))
    case ["stop"]:
        result = ("stop",)
`,
  subjectLabel: "command",
  resultLabel: "result",
  steps: [
    {
      label: "Load the subject",
      explanation: "Python evaluates the subject expression once. The list ['rotate', '90'] becomes the single object all cases will test against.",
      activeLine: 1,
      subject: ["rotate", "90"],
      bindings: [],
      resultValue: null,
      cases: [
        { pattern: '["move", x, y]', status: "pending", note: "not tried yet" },
        { pattern: '["rotate", degrees]', status: "pending", note: "not tried yet" },
        { pattern: '["stop"]', status: "pending", note: "not tried yet" },
      ],
    },
    {
      label: "Try the first case",
      explanation: "Pattern matching starts at the first case. Python checks whether the subject is a three-item sequence that starts with the literal 'move' and has a third element to bind.",
      activeLine: 4,
      subject: ["rotate", "90"],
      bindings: [],
      resultValue: null,
      cases: [
        { pattern: '["move", x, y]', status: "active", note: "checking length and first literal" },
        { pattern: '["rotate", degrees]', status: "pending", note: "not tried yet" },
        { pattern: '["stop"]', status: "pending", note: "not tried yet" },
      ],
    },
    {
      label: "Reject the first case",
      explanation: "The first case fails immediately. The subject has only two elements, so it cannot satisfy ['move', x, y]. Python does not bind x or y from a failed case.",
      activeLine: 4,
      subject: ["rotate", "90"],
      bindings: [],
      resultValue: null,
      cases: [
        { pattern: '["move", x, y]', status: "failed", note: "failed: length mismatch" },
        { pattern: '["rotate", degrees]', status: "pending", note: "next case to try" },
        { pattern: '["stop"]', status: "pending", note: "not tried yet" },
      ],
    },
    {
      label: "Try the second case",
      explanation: "Python moves to the next case. This pattern expects a two-item sequence whose first element is the literal 'rotate'.",
      activeLine: 6,
      subject: ["rotate", "90"],
      bindings: [],
      resultValue: null,
      cases: [
        { pattern: '["move", x, y]', status: "failed", note: "failed earlier" },
        { pattern: '["rotate", degrees]', status: "active", note: "checking literal and capture slot" },
        { pattern: '["stop"]', status: "pending", note: "not tried yet" },
      ],
    },
    {
      label: "Bind the capture",
      explanation: "The literal part matches, so the remaining element is bound to degrees. Name binding only happens for a successful pattern path.",
      activeLine: 6,
      subject: ["rotate", "90"],
      bindings: [{ name: "degrees", value: "90" }],
      resultValue: null,
      cases: [
        { pattern: '["move", x, y]', status: "failed", note: "failed earlier" },
        { pattern: '["rotate", degrees]', status: "matched", note: "matched and bound degrees = '90'" },
        { pattern: '["stop"]', status: "pending", note: "never reached" },
      ],
    },
    {
      label: "Run the selected branch",
      explanation: "After the pattern matches, Python executes that case block and computes the final value. No later cases are considered once a match succeeds.",
      activeLine: 7,
      subject: ["rotate", "90"],
      bindings: [{ name: "degrees", value: "90" }],
      resultValue: '("rotate", 90)',
      cases: [
        { pattern: '["move", x, y]', status: "failed", note: "failed earlier" },
        { pattern: '["rotate", degrees]', status: "matched", note: "selected branch runs" },
        { pattern: '["stop"]', status: "pending", note: "skipped after match" },
      ],
      done: true,
    },
  ],
}

export const setMembershipSimulation: SetMembershipSimulationData = {
  title: "Step Through Set Membership",
  summary: "Follow how a set membership test uses a hash table probe path instead of scanning every element one by one.",
  ctaLabel: "See simulation",
  sourceCode: `
blocked = {"root", "admin", "system", "ops"}

is_blocked = "admin" in blocked
`,
  setLabel: "blocked",
  resultLabel: "is_blocked",
  note: "Bucket numbers are illustrative. Real Python hash values vary across runs because hash randomization is a security feature.",
  steps: [
    {
      label: "Build the set",
      explanation: "The set already contains four unique elements. Unlike a list, it stores them in a hash table shaped for fast membership tests rather than preserving insertion positions for indexed access.",
      activeLine: 1,
      lookupValue: "admin",
      homeBucket: 1,
      probeBucket: null,
      probePath: [],
      resultValue: null,
      slots: [
        { value: "root", status: "occupied" },
        { value: "ops", status: "occupied" },
        { value: "system", status: "occupied" },
        { value: "admin", status: "occupied" },
        { value: null, status: "empty" },
        { value: null, status: "empty" },
      ],
    },
    {
      label: "Compute the home bucket",
      explanation: "Python hashes the candidate value 'admin' and maps that hash into an initial bucket. In this illustrative table, the first probe lands at bucket 1.",
      activeLine: 3,
      lookupValue: "admin",
      homeBucket: 1,
      probeBucket: 1,
      probePath: [1],
      resultValue: null,
      slots: [
        { value: "root", status: "occupied" },
        { value: "ops", status: "active" },
        { value: "system", status: "occupied" },
        { value: "admin", status: "occupied" },
        { value: null, status: "empty" },
        { value: null, status: "empty" },
      ],
    },
    {
      label: "Handle the collision",
      explanation: "Bucket 1 is occupied, but it contains 'ops' rather than 'admin'. The set does not scan linearly from the beginning; it follows its probing strategy to another candidate slot.",
      activeLine: 3,
      lookupValue: "admin",
      homeBucket: 1,
      probeBucket: 1,
      probePath: [1],
      resultValue: null,
      slots: [
        { value: "root", status: "occupied" },
        { value: "ops", status: "collision" },
        { value: "system", status: "occupied" },
        { value: "admin", status: "occupied" },
        { value: null, status: "empty" },
        { value: null, status: "empty" },
      ],
    },
    {
      label: "Probe the next slot",
      explanation: "The next probe lands on bucket 3. Python compares the stored element in that slot to the lookup value.",
      activeLine: 3,
      lookupValue: "admin",
      homeBucket: 1,
      probeBucket: 3,
      probePath: [1, 3],
      resultValue: null,
      slots: [
        { value: "root", status: "occupied" },
        { value: "ops", status: "occupied" },
        { value: "system", status: "occupied" },
        { value: "admin", status: "active" },
        { value: null, status: "empty" },
        { value: null, status: "empty" },
      ],
    },
    {
      label: "Return the membership result",
      explanation: "Bucket 3 stores the exact element 'admin', so the membership test returns True immediately. That short probe path is the reason average-case set membership is close to constant time.",
      activeLine: 3,
      lookupValue: "admin",
      homeBucket: 1,
      probeBucket: 3,
      probePath: [1, 3],
      resultValue: true,
      slots: [
        { value: "root", status: "occupied" },
        { value: "ops", status: "occupied" },
        { value: "system", status: "occupied" },
        { value: "admin", status: "match" },
        { value: null, status: "empty" },
        { value: null, status: "empty" },
      ],
      done: true,
    },
  ],
}

export const containerComparisonLabData: ContainerComparisonLabData = {
  title: "Compare the Four Containers Side by Side",
  summary: "Switch workload and container focus to compare storage model, measured local proof, complexity shape, and the production fit of list, tuple, set, and array.array.",
  ctaLabel: "Open comparison lab",
  note: "Measured values shown in this lab were collected locally on CPython 3.12.3, 64-bit Linux. They are useful for cost shape, not byte-exact promises across interpreters or builds.",
  defaultContainer: "list",
  defaultWorkload: "memory",
  workloads: [
    {
      id: "memory",
      label: "Memory",
      summary: "Container-only footprint and why the underlying representation changes the cost model.",
    },
    {
      id: "membership",
      label: "Membership",
      summary: "Whether membership is a linear scan, a hash-table lookup, or a poor fit for the data structure.",
    },
    {
      id: "growth",
      label: "Growth",
      summary: "What happens when the collection needs to grow or accept new values during normal operation.",
    },
    {
      id: "iteration",
      label: "Iteration",
      summary: "Traversal cost shape and what the local sum-of-many-elements benchmark looked like.",
    },
    {
      id: "numeric",
      label: "Numeric data",
      summary: "How much overhead you pay when the workload is dense numbers rather than generic Python objects.",
    },
  ],
  containers: [
    {
      id: "list",
      label: "list",
      shortLabel: "List",
      summary: "General-purpose mutable ordered container of Python object references.",
      storageModel: "Resizable array of references to Python objects. On CPython the list object points at a separately managed reference array with spare capacity for future growth.",
      orderContract: "Preserves insertion order and supports positional indexing.",
      uniquenessContract: "Allows duplicates.",
      languageGuarantee: "Language-level mutable sequence with indexed access and slicing.",
      cpythonNote: "Local measurements reflect CPython overallocation behavior during growth.",
      metrics: {
        memory: {
          headline: "Flexible, but pays for future growth",
          complexity: "Indexed access O(1)",
          measured: "1000 refs container: 8056 B",
          technical: "The local 8056-byte figure is only the list container plus reference slots. It does not include the pointed-to objects.",
          bestWhen: "You need ordered mutation, append-heavy building, or an API callers are expected to modify.",
          avoidWhen: "You need uniqueness, fixed-shape records, or packed numeric storage.",
          code: `# Works on Python 3.x
import sys

values = list(range(1000))
print(sys.getsizeof(values))`,
        },
        membership: {
          headline: "Linear scan membership",
          complexity: "Membership O(n)",
          measured: "9999 in list(range(10000)): 0.607 s / 10k checks",
          technical: "A list answers membership by scanning element by element until it finds a match or reaches the end.",
          bestWhen: "You care about order and membership checks are rare or the collection is small.",
          avoidWhen: "Repeated membership testing is the dominant workload.",
          code: `# Works on Python 3.x
import timeit

setup = "data = list(range(10000))"
print(timeit.timeit("9999 in data", setup=setup, number=10000))`,
        },
        growth: {
          headline: "Best at right-edge growth",
          complexity: "append amortized O(1)",
          measured: "append: 0.00126 s / 100k calls",
          technical: "On CPython, spare capacity protects append throughput by avoiding a resize on every push.",
          bestWhen: "You are accumulating results, buffering rows, or extending a sequence over time.",
          avoidWhen: "You need fast left-edge pops or hash-based uniqueness.",
          code: `# Works on Python 3.x
import timeit

print(timeit.timeit("x.append(1)", setup="x=[]", number=100000))`,
        },
        iteration: {
          headline: "Good general traversal baseline",
          complexity: "Iteration O(n)",
          measured: "sum(list(range(100000))): 0.157 s / 300 runs",
          technical: "Iteration walks contiguous reference slots, but each element is still a full Python object.",
          bestWhen: "You need to traverse ordinary Python objects in order.",
          avoidWhen: "You need packed numeric throughput or set-style membership semantics.",
          code: `# Works on Python 3.x
import timeit

setup = "data = list(range(100000))"
print(timeit.timeit("sum(data)", setup=setup, number=300))`,
        },
        numeric: {
          headline: "Expensive for dense numbers",
          complexity: "Stores refs + Python number objects",
          measured: "1000 floats total: 32056 B",
          technical: "The total includes the list container and 1000 separate Python float objects. That is why list is dramatically larger than array.array for dense numeric buffers.",
          bestWhen: "You need mixed types or the numeric collection is small and flexibility matters more than footprint.",
          avoidWhen: "You have millions of homogeneous numbers.",
          code: `# Works on Python 3.x
import sys

n = 1000
total = sys.getsizeof([1.0] * n) + n * sys.getsizeof(1.0)
print(total)`,
        },
      },
    },
    {
      id: "tuple",
      label: "tuple",
      shortLabel: "Tuple",
      summary: "Fixed-size ordered container of Python object references.",
      storageModel: "Fixed-size array of references stored directly in the tuple object on current CPython builds.",
      orderContract: "Preserves order and supports positional indexing.",
      uniquenessContract: "Allows duplicates.",
      languageGuarantee: "Language-level immutable sequence. The container shape is immutable, but elements can still be mutable.",
      cpythonNote: "The smaller base size compared with list is a CPython layout detail, not a language guarantee.",
      metrics: {
        memory: {
          headline: "Slightly leaner than list",
          complexity: "Indexed access O(1)",
          measured: "1000 refs container: 8040 B",
          technical: "The container is slightly smaller than a same-length list because it has no spare growth capacity and no separate resizable reference array.",
          bestWhen: "The size and order are part of the meaning of the value.",
          avoidWhen: "The collection must grow, shrink, or be updated in place.",
          code: `# Works on Python 3.x
import sys

values = tuple(range(1000))
print(sys.getsizeof(values))`,
        },
        membership: {
          headline: "Linear scan, like list",
          complexity: "Membership O(n)",
          measured: "9999 in tuple(range(10000)): 0.528 s / 10k checks",
          technical: "Tuple preserves order and supports scanning, but it is not a hash table and does not optimize repeated membership checks.",
          bestWhen: "The collection is a fixed record and membership is incidental.",
          avoidWhen: "Membership is the main operation.",
          code: `# Works on Python 3.x
import timeit

setup = "data = tuple(range(10000))"
print(timeit.timeit("9999 in data", setup=setup, number=10000))`,
        },
        growth: {
          headline: "No in-place growth",
          complexity: "append unavailable",
          measured: "tuple(t) reuses same object: True",
          technical: "Tuple is fixed-size. Growing it means allocating a new tuple, not mutating the old one.",
          bestWhen: "You want fixed-shape return values, cache keys, or immutable records.",
          avoidWhen: "You are building a result incrementally.",
          code: `# Works on Python 3.x
t = (1, 2, 3)
print(tuple(t) is t)`,
        },
        iteration: {
          headline: "Similar traversal shape to list",
          complexity: "Iteration O(n)",
          measured: "sum(tuple(range(100000))): 0.158 s / 300 runs",
          technical: "Local timing was almost identical to list for a simple sum benchmark. The main advantage of tuple is contract clarity and slightly smaller container cost, not a dramatic traversal win.",
          bestWhen: "You want stable ordered data that should not be mutated.",
          avoidWhen: "You need a mutable work buffer.",
          code: `# Works on Python 3.x
import timeit

setup = "data = tuple(range(100000))"
print(timeit.timeit("sum(data)", setup=setup, number=300))`,
        },
        numeric: {
          headline: "Still an object container",
          complexity: "Stores refs + Python number objects",
          measured: "1000 floats total: 32040 B",
          technical: "Tuple saves only the container overhead relative to list. The per-element Python float cost is still there.",
          bestWhen: "The numeric values are small in count and semantically form a fixed record.",
          avoidWhen: "The goal is dense numeric storage.",
          code: `# Works on Python 3.x
import sys

n = 1000
total = sys.getsizeof((1.0,) * n) + n * sys.getsizeof(1.0)
print(total)`,
        },
      },
    },
    {
      id: "set",
      label: "set",
      shortLabel: "Set",
      summary: "Hash table optimized for uniqueness, membership, and set algebra.",
      storageModel: "Open-addressed hash table of entries plus spare capacity to keep average-case lookup fast.",
      orderContract: "Not a sorting contract and not sequence-style positional access.",
      uniquenessContract: "Only unique hashable elements are allowed.",
      languageGuarantee: "Language-level mutable set with hash-based membership semantics. Iteration order is intentionally not a sorted sequence contract.",
      cpythonNote: "Local byte counts reflect CPython hash-table growth steps and empty-table overhead.",
      metrics: {
        memory: {
          headline: "Most expensive baseline footprint",
          complexity: "Average membership O(1)",
          measured: "1000 elements container: 32984 B",
          technical: "A set spends memory on spare buckets and hash-table metadata because its main job is fast membership, not compact linear storage.",
          bestWhen: "Repeated membership testing, deduplication, or set algebra is the real workload.",
          avoidWhen: "You need positional indexing, duplicates, or compact numeric storage.",
          code: `# Works on Python 3.x
import sys

values = set(range(1000))
print(sys.getsizeof(values))`,
        },
        membership: {
          headline: "This is the membership specialist",
          complexity: "Membership average O(1)",
          measured: "9999 in set(range(10000)): 0.000235 s / 10k checks",
          technical: "The local measurement is orders of magnitude faster than list or tuple because the set hashes the candidate and probes the table directly.",
          bestWhen: "You ask 'is this value present?' over and over.",
          avoidWhen: "You need sequence semantics or stable duplicates.",
          code: `# Works on Python 3.x
import timeit

setup = "data = set(range(10000))"
print(timeit.timeit("9999 in data", setup=setup, number=10000))`,
        },
        growth: {
          headline: "Cheap uniqueness-preserving growth",
          complexity: "add average O(1)",
          measured: "add: 0.00193 s / 100k calls",
          technical: "Set growth adds by hash and preserves uniqueness. It is not a positional append model, so 'adding at the end' is not a meaningful contract.",
          bestWhen: "You are building a unique membership index.",
          avoidWhen: "You need order-sensitive accumulation.",
          code: `# Works on Python 3.x
import timeit

print(timeit.timeit("x.add(1)", setup="x=set()", number=100000))`,
        },
        iteration: {
          headline: "Iteration is fine, but not the point",
          complexity: "Iteration O(n)",
          measured: "sum(set(range(100000))): 0.214 s / 300 runs",
          technical: "The local traversal benchmark was slower than list and tuple. Set is optimized for hash-table semantics, not for ordered linear scans.",
          bestWhen: "Iteration is secondary to uniqueness or membership.",
          avoidWhen: "The workload is mostly ordered traversal of a stable sequence.",
          code: `# Works on Python 3.x
import timeit

setup = "data = set(range(100000))"
print(timeit.timeit("sum(data)", setup=setup, number=300))`,
        },
        numeric: {
          headline: "Bad fit for dense numeric buffers",
          complexity: "Hash table + uniqueness rules",
          measured: "1000 ints container: 32984 B",
          technical: "Packed numeric storage is the wrong mental model for set. It stores hashed unique objects, not a contiguous numeric payload.",
          bestWhen: "The goal is unique numeric membership, not compact numeric storage.",
          avoidWhen: "You want to keep every numeric value in order or in the smallest space.",
          code: `# Works on Python 3.x
values = {1, 2, 2, 3}
print(values)`,
        },
      },
    },
    {
      id: "array",
      label: "array.array",
      shortLabel: "array",
      summary: "Packed homogeneous C values for numeric or binary-adjacent workloads.",
      storageModel: "Contiguous raw C values in one Python object, controlled by a typecode such as 'I' or 'd'.",
      orderContract: "Preserves order and supports positional indexing.",
      uniquenessContract: "Allows duplicates.",
      languageGuarantee: "Stable stdlib container API. Actual element width depends on the platform C type used by the selected typecode.",
      cpythonNote: "The local size figures already include the raw payload because the values live inside the array object rather than as separate Python objects.",
      metrics: {
        memory: {
          headline: "Compact when the data is homogeneous",
          complexity: "Indexed access O(1)",
          measured: "array('I', range(1000)): 4200 B",
          technical: "Unlike list or tuple, the container size already includes the integer payload. There is no per-element Python int object inside the array.",
          bestWhen: "You need many homogeneous numeric values and care about footprint.",
          avoidWhen: "You need mixed Python object types or hash-table semantics.",
          code: `# Works on Python 3.x
import sys
from array import array

values = array("I", range(1000))
print(sys.getsizeof(values))`,
        },
        membership: {
          headline: "Packed does not mean fast membership",
          complexity: "Membership O(n)",
          measured: "9999 in array('I', range(10000)): 1.644 s / 10k checks",
          technical: "Local membership timing was slower than list and tuple. Packed numeric storage helps footprint, not hash-table lookup.",
          bestWhen: "The values are dense numbers and membership is not the dominant operation.",
          avoidWhen: "You need repeated 'in' checks over large collections.",
          code: `# Works on Python 3.x
import timeit

setup = 'from array import array; data = array(\"I\", range(10000))'
print(timeit.timeit("9999 in data", setup=setup, number=10000))`,
        },
        growth: {
          headline: "Can grow, but still homogeneous",
          complexity: "Right-edge append supported",
          measured: "append: 0.00240 s / 100k calls",
          technical: "The array can append compatible values, but every value must fit the chosen typecode and the API is much narrower than list.",
          bestWhen: "You are accumulating homogeneous numeric samples or binary-friendly values.",
          avoidWhen: "You need arbitrary Python objects or many list-style convenience methods.",
          code: `# Works on Python 3.x
import timeit

setup = 'from array import array; x = array(\"I\")'
print(timeit.timeit("x.append(1)", setup=setup, number=100000))`,
        },
        iteration: {
          headline: "Compact, not automatically faster",
          complexity: "Iteration O(n)",
          measured: "sum(array('I', range(100000))): 0.438 s / 300 runs",
          technical: "The local sum benchmark was slower than list and tuple because the packed representation does not automatically beat the cost of producing Python-level values for operations like sum().",
          bestWhen: "Storage density and binary I/O matter more than raw Python-level iteration speed.",
          avoidWhen: "You assumed packed storage automatically means every Python operation is faster.",
          code: `# Works on Python 3.x
import timeit

setup = 'from array import array; data = array(\"I\", range(100000))'
print(timeit.timeit("sum(data)", setup=setup, number=300))`,
        },
        numeric: {
          headline: "This is the dense numeric winner",
          complexity: "Packed C values",
          measured: "1000 floats total: 8080 B",
          technical: "For 1000 floats, the array stored the payload in one object instead of paying for 1000 separate Python float headers. That is why it was about 4x smaller than list or tuple locally.",
          bestWhen: "You have large homogeneous numeric buffers or want fast binary file I/O.",
          avoidWhen: "You need rich Python object behavior per element.",
          code: `# Works on Python 3.x
import sys
from array import array

values = array("d", [1.0] * 1000)
print(sys.getsizeof(values))`,
        },
      },
    },
  ],
}

export const specialMethodLabData: SpecialMethodLabData = {
  title: "Map Python Syntax to Special Methods",
  summary: "Switch between common Python operations and see whether Python dispatches through a special method, which method it prefers, what fallback exists, and what a production-grade implementation should guarantee.",
  ctaLabel: "Open method lab",
  note: "Python documentation calls these special method names. “Dunder” is community shorthand for the double underscores on both sides, such as __eq__.",
  defaultCase: "equality",
  cases: [
    {
      id: "equality",
      label: "Equality",
      trigger: "a == b",
      summary: "Equality is operator syntax over the rich-comparison protocol.",
      primaryMethod: "__eq__",
      fallback: "If the left side returns NotImplemented, Python can try the reflected comparison on the right operand before deciding the result.",
      implementationRule: "Return NotImplemented for unsupported types instead of forcing False. Keep equality consistent with the meaning of the type.",
      warning: "`==` is not the same as `is`. Equality can run user code and may be expensive.",
      code: `# Works on Python 3.x
class UserId:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        if not isinstance(other, UserId):
            return NotImplemented
        return self.value == other.value

print(UserId(7) == UserId(7))`,
    },
    {
      id: "identity",
      label: "Identity",
      trigger: "a is b",
      summary: "Identity is a direct object-identity check, not a special-method dispatch.",
      primaryMethod: "No dunder method",
      fallback: "Python compares object identity directly. User code cannot overload `is`.",
      implementationRule: "Use identity for None, sentinels, and true object identity. Do not try to emulate identity through __eq__.",
      warning: "The common confusion is backward: `==` may call __eq__, but `is` never does.",
      code: `# Works on Python 3.x
a = [1, 2]
b = a
c = [1, 2]

print(a is b)
print(a is c)
print(a == c)`,
    },
    {
      id: "repr",
      label: "Representation",
      trigger: "repr(obj)",
      summary: "repr() asks the object for a developer-facing representation.",
      primaryMethod: "__repr__",
      fallback: "If you do not implement it, you inherit object.__repr__ with the default <Class object at ...> style.",
      implementationRule: "Make repr precise, unambiguous, and useful during debugging. Prefer including the fields that explain identity or state.",
      warning: "Do not turn __repr__ into a pretty end-user formatter. That is a different concern.",
      code: `# Works on Python 3.x
class Job:
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority

    def __repr__(self):
        return f"Job(name={self.name!r}, priority={self.priority!r})"

print(repr(Job("backup", 3)))`,
    },
    {
      id: "truthiness",
      label: "Truthiness",
      trigger: "if obj: ...",
      summary: "Truth testing first prefers __bool__, then falls back to __len__ when __bool__ is absent.",
      primaryMethod: "__bool__",
      fallback: "If __bool__ is not defined, Python uses __len__ and treats zero as False and non-zero as True.",
      implementationRule: "Keep truthiness cheap and obvious. Use __bool__ only when the notion of empty / ready / valid is a real part of the type contract.",
      warning: "A clever truthiness rule is usually a maintenance problem. If callers cannot predict it, it should probably be an explicit method instead.",
      code: `# Works on Python 3.x
class Batch:
    def __init__(self, rows):
        self.rows = list(rows)

    def __len__(self):
        return len(self.rows)

print(bool(Batch([])))
print(bool(Batch([1, 2, 3])))`,
    },
    {
      id: "iteration",
      label: "Iteration",
      trigger: "for item in obj",
      summary: "The loop asks iter(obj), which normally dispatches to __iter__.",
      primaryMethod: "__iter__",
      fallback: "Older sequence-style fallback can use indexed access via __getitem__ until IndexError, but new container APIs should implement __iter__ directly.",
      implementationRule: "Return a real iterator and keep iteration semantics stable. If repeated passes are supported, document whether each iter() call starts fresh.",
      warning: "If your object is one-shot, say so clearly. Hidden exhaustion behavior is a production bug factory.",
      code: `# Works on Python 3.x
class Countdown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        current = self.start
        while current > 0:
            yield current
            current -= 1

print(list(Countdown(3)))`,
    },
    {
      id: "membership",
      label: "Membership",
      trigger: "x in obj",
      summary: "Membership first asks for __contains__. If that is absent, Python can fall back to iteration.",
      primaryMethod: "__contains__",
      fallback: "Without __contains__, Python may iterate through the object and compare candidates one by one.",
      implementationRule: "Implement __contains__ when membership is a first-class operation and you can answer it more directly than linear iteration.",
      warning: "Do not promise hash-table speed unless the representation actually supports it.",
      code: `# Works on Python 3.x
class RoleSet:
    def __init__(self, roles):
        self._roles = set(roles)

    def __contains__(self, role):
        return role in self._roles

print("admin" in RoleSet({"admin", "billing"}))`,
    },
    {
      id: "context",
      label: "Context manager",
      trigger: "with obj as value:",
      summary: "The with statement uses a pair of special methods to enter and exit a managed scope.",
      primaryMethod: "__enter__ / __exit__",
      fallback: "There is no useful fallback. If the protocol is missing, the object is not a context manager.",
      implementationRule: "Use it when the object owns a resource or temporary state boundary that must be reliably released or restored.",
      warning: "__exit__ controls cleanup, not business success. It should not silently swallow exceptions unless that is the explicit API contract.",
      code: `# Works on Python 3.x
class Demo:
    def __enter__(self):
        print("enter")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("exit")
        return False

with Demo():
    print("body")`,
    },
  ],
}

export const asyncFoundationsTimelineData: AsyncTimelineLabData = {
  title: "See Async Scheduling on a Timeline",
  summary: "Follow how native coroutines enter the event loop, suspend at await points, and resume when awaited work becomes ready.",
  ctaLabel: "Open timeline",
  note: "The timeline is a teaching model, not a literal trace of every internal event-loop callback. The point is to make scheduling boundaries and blocking mistakes visible.",
  defaultScenarioId: "await-chain",
  scenarios: [
    {
      id: "await-chain",
      label: "Await chain",
      summary: "A top-level coroutine awaits another coroutine, which eventually awaits a low-level operation.",
      sourceCode: `
import asyncio

async def fetch_flag():
    await asyncio.sleep(0.1)
    return "BR"

async def main():
    code = await fetch_flag()
    return code

print(asyncio.run(main()))
`,
      takeaway: "`await` is a scheduling boundary. The current coroutine pauses so the event loop can drive other work until the awaited operation becomes ready.",
      steps: [
        {
          label: "Start the top-level coroutine",
          explanation: "asyncio.run creates the event loop, schedules main, and begins running it until the first suspension point.",
          activeLine: 7,
          tick: 0,
          event: "main starts running",
          tasks: [
            { name: "main", status: "running", detail: "Entered by asyncio.run" },
            { name: "fetch_flag", status: "ready", detail: "Not created yet" },
          ],
        },
        {
          label: "main awaits fetch_flag",
          explanation: "main reaches await fetch_flag(). Control flows into fetch_flag until that coroutine also suspends.",
          activeLine: 8,
          tick: 1,
          event: "main delegates to fetch_flag",
          tasks: [
            { name: "main", status: "awaiting", detail: "Waiting for fetch_flag to complete" },
            { name: "fetch_flag", status: "running", detail: "Now executing inside the await chain" },
          ],
        },
        {
          label: "fetch_flag awaits I/O-like work",
          explanation: "fetch_flag hits await asyncio.sleep(...). At that point the await chain reaches a low-level awaitable the event loop can manage.",
          activeLine: 4,
          tick: 2,
          event: "sleep timer registered",
          tasks: [
            { name: "main", status: "awaiting", detail: "Still waiting for fetch_flag" },
            { name: "fetch_flag", status: "awaiting", detail: "Suspended until the timer fires" },
          ],
        },
        {
          label: "The timer completes",
          explanation: "Once the timer expires, the event loop marks fetch_flag ready to resume.",
          activeLine: 4,
          tick: 3,
          event: "timer wakes fetch_flag",
          tasks: [
            { name: "main", status: "awaiting", detail: "Still blocked on fetch_flag" },
            { name: "fetch_flag", status: "ready", detail: "Ready to resume after sleep" },
          ],
        },
        {
          label: "fetch_flag returns",
          explanation: "fetch_flag resumes, returns 'BR', and unblocks the coroutine that awaited it.",
          activeLine: 5,
          tick: 4,
          event: "fetch_flag produces result",
          tasks: [
            { name: "main", status: "ready", detail: "Can resume with code = 'BR'" },
            { name: "fetch_flag", status: "done", detail: "Completed with result 'BR'" },
          ],
        },
        {
          label: "main completes",
          explanation: "main resumes after await, returns the code, and asyncio.run can shut down the loop.",
          activeLine: 9,
          tick: 5,
          event: "main returns final result",
          tasks: [
            { name: "main", status: "done", detail: "Returned 'BR'" },
            { name: "fetch_flag", status: "done", detail: "Already complete" },
          ],
          done: true,
        },
      ],
    },
    {
      id: "interleaving",
      label: "Two tasks interleave",
      summary: "Two tasks make progress because both hit await points instead of monopolizing the thread.",
      sourceCode: `
import asyncio

async def worker(name, delay):
    print("start", name)
    await asyncio.sleep(delay)
    print("done", name)

async def main():
    await asyncio.gather(worker("A", 0.2), worker("B", 0.1))

asyncio.run(main())
`,
      takeaway: "Concurrency in asyncio is cooperative. The event loop can switch tasks only when the current task awaits something incomplete.",
      steps: [
        {
          label: "main creates concurrent child tasks",
          explanation: "gather schedules both workers so the event loop can run whichever task is ready next.",
          activeLine: 9,
          tick: 0,
          event: "worker A and B scheduled",
          tasks: [
            { name: "worker A", status: "ready", detail: "Waiting for first run slice" },
            { name: "worker B", status: "ready", detail: "Waiting for first run slice" },
          ],
        },
        {
          label: "worker A starts first",
          explanation: "The loop runs worker A until it reaches await asyncio.sleep(0.2).",
          activeLine: 5,
          tick: 1,
          event: "worker A hits first await",
          tasks: [
            { name: "worker A", status: "awaiting", detail: "Sleeping for 0.2 s" },
            { name: "worker B", status: "ready", detail: "Can now run" },
          ],
        },
        {
          label: "worker B runs while A waits",
          explanation: "Because A suspended cleanly, B gets a chance to run instead of waiting behind A's entire workload.",
          activeLine: 5,
          tick: 2,
          event: "worker B hits first await",
          tasks: [
            { name: "worker A", status: "awaiting", detail: "Still sleeping" },
            { name: "worker B", status: "awaiting", detail: "Sleeping for 0.1 s" },
          ],
        },
        {
          label: "worker B wakes first",
          explanation: "The shorter timer fires first, so B becomes ready before A.",
          activeLine: 5,
          tick: 3,
          event: "worker B timer fires",
          tasks: [
            { name: "worker A", status: "awaiting", detail: "Still sleeping" },
            { name: "worker B", status: "ready", detail: "Ready to finish" },
          ],
        },
        {
          label: "worker B finishes",
          explanation: "The loop resumes B, it prints done, and completes. A is still awaiting its timer.",
          activeLine: 6,
          tick: 4,
          event: "worker B completes",
          tasks: [
            { name: "worker A", status: "awaiting", detail: "Still sleeping" },
            { name: "worker B", status: "done", detail: "Completed first" },
          ],
        },
        {
          label: "worker A wakes and finishes",
          explanation: "Once A's longer timer fires, it resumes and finishes. gather can now return.",
          activeLine: 6,
          tick: 5,
          event: "worker A completes",
          tasks: [
            { name: "worker A", status: "done", detail: "Completed second" },
            { name: "worker B", status: "done", detail: "Already complete" },
          ],
          done: true,
        },
      ],
    },
    {
      id: "blocking-freeze",
      label: "Blocking freeze",
      summary: "A blocking call inside one coroutine freezes unrelated asyncio tasks because the loop cannot preempt it.",
      sourceCode: `
import asyncio
import time

async def bad_worker():
    time.sleep(0.5)
    return "done"

async def heartbeat():
    await asyncio.sleep(0.1)
    return "tick"
`,
      takeaway: "Asyncio cannot rescue a coroutine that calls blocking synchronous code on the event-loop thread. If it does not await, nothing else runs.",
      steps: [
        {
          label: "Two coroutines are scheduled",
          explanation: "The loop has both bad_worker and heartbeat available. In a healthy async program, they would take turns at await points.",
          activeLine: 4,
          tick: 0,
          event: "bad_worker chosen first",
          tasks: [
            { name: "bad_worker", status: "running", detail: "About to call blocking sleep" },
            { name: "heartbeat", status: "ready", detail: "Could run if the loop got control back" },
          ],
        },
        {
          label: "bad_worker blocks the thread",
          explanation: "time.sleep does not cooperate with asyncio. The event loop thread is blocked, so heartbeat cannot run at all.",
          activeLine: 5,
          tick: 1,
          event: "event loop frozen by blocking call",
          tasks: [
            { name: "bad_worker", status: "blocked", detail: "Inside time.sleep on the loop thread" },
            { name: "heartbeat", status: "ready", detail: "Starved even though it is ready" },
          ],
        },
        {
          label: "Only after the blocking call ends can the loop continue",
          explanation: "When bad_worker returns control, the loop can finally schedule heartbeat. The stall already happened.",
          activeLine: 6,
          tick: 2,
          event: "loop regains control late",
          tasks: [
            { name: "bad_worker", status: "done", detail: "Returned after blocking everyone else" },
            { name: "heartbeat", status: "ready", detail: "Only now allowed to run" },
          ],
        },
        {
          label: "heartbeat finally runs",
          explanation: "The heartbeat did not fail because of its own logic. It failed to run on time because another coroutine never yielded.",
          activeLine: 9,
          tick: 3,
          event: "heartbeat starts too late",
          tasks: [
            { name: "bad_worker", status: "done", detail: "Already complete" },
            { name: "heartbeat", status: "awaiting", detail: "Now sleeping for 0.1 s" },
          ],
        },
        {
          label: "heartbeat completes after the freeze",
          explanation: "The loop can now finish heartbeat, but the responsiveness loss already happened.",
          activeLine: 10,
          tick: 4,
          event: "heartbeat completes after delay",
          tasks: [
            { name: "bad_worker", status: "done", detail: "Already complete" },
            { name: "heartbeat", status: "done", detail: "Completed later than intended" },
          ],
          done: true,
        },
      ],
    },
  ],
}

export const asyncBackpressureTimelineData: AsyncTimelineLabData = {
  title: "See Backpressure and Offloading",
  summary: "Visualize throttling, completion order, and moving blocking work off the event-loop thread.",
  ctaLabel: "Open timeline",
  note: "These scenarios are simplified models of common asyncio production patterns. They show control flow, not every callback or future object involved internally.",
  defaultScenarioId: "semaphore-throttle",
  scenarios: [
    {
      id: "semaphore-throttle",
      label: "Semaphore throttle",
      summary: "A semaphore limits how many coroutines can enter a critical I/O section concurrently.",
      sourceCode: `
import asyncio

async def fetch(url, sem):
    async with sem:
        await asyncio.sleep(0.2)
        return url
`,
      takeaway: "The semaphore does not make tasks faster. It keeps concurrency inside a limit your process and upstream dependency can absorb.",
      steps: [
        {
          label: "Three fetches are ready, limit is two",
          explanation: "All three tasks exist, but only two can acquire the semaphore immediately.",
          activeLine: 4,
          tick: 0,
          event: "semaphore capacity = 2",
          tasks: [
            { name: "fetch A", status: "running", detail: "Acquired semaphore slot 1" },
            { name: "fetch B", status: "running", detail: "Acquired semaphore slot 2" },
            { name: "fetch C", status: "ready", detail: "Waiting for a free slot" },
          ],
        },
        {
          label: "A and B await network delay",
          explanation: "While A and B are inside the protected section, C cannot enter even though it exists and is ready in principle.",
          activeLine: 5,
          tick: 1,
          event: "A and B are in-flight",
          tasks: [
            { name: "fetch A", status: "awaiting", detail: "Holding slot while awaiting I/O" },
            { name: "fetch B", status: "awaiting", detail: "Holding slot while awaiting I/O" },
            { name: "fetch C", status: "ready", detail: "Queued behind semaphore limit" },
          ],
        },
        {
          label: "A completes and releases one slot",
          explanation: "As soon as A leaves the async with block, one waiting task can enter.",
          activeLine: 6,
          tick: 2,
          event: "slot released by fetch A",
          tasks: [
            { name: "fetch A", status: "done", detail: "Finished and released slot" },
            { name: "fetch B", status: "awaiting", detail: "Still in-flight" },
            { name: "fetch C", status: "running", detail: "Now acquired the freed slot" },
          ],
        },
        {
          label: "C now awaits its own I/O",
          explanation: "The third task was not starved forever. It was intentionally delayed to keep peak concurrency bounded.",
          activeLine: 5,
          tick: 3,
          event: "fetch C finally in-flight",
          tasks: [
            { name: "fetch A", status: "done", detail: "Already complete" },
            { name: "fetch B", status: "awaiting", detail: "Still in-flight" },
            { name: "fetch C", status: "awaiting", detail: "Now inside protected section" },
          ],
        },
        {
          label: "Remaining tasks finish under the cap",
          explanation: "All tasks complete, but no more than two were inside the costly section at once.",
          activeLine: 6,
          tick: 4,
          event: "bounded fan-out completes",
          tasks: [
            { name: "fetch A", status: "done", detail: "Done" },
            { name: "fetch B", status: "done", detail: "Done" },
            { name: "fetch C", status: "done", detail: "Done" },
          ],
          done: true,
        },
      ],
    },
    {
      id: "as-completed",
      label: "Completion order",
      summary: "Results are consumed as tasks finish, not in the order they were originally scheduled.",
      sourceCode: `
import asyncio

async def main():
    tasks = [job(0.3), job(0.1), job(0.2)]
    for done in asyncio.as_completed(tasks):
        result = await done
        print(result)
`,
      takeaway: "as_completed is about response order. It lets you react to the earliest finished task instead of waiting for slower siblings.",
      steps: [
        {
          label: "Three tasks are scheduled",
          explanation: "The caller created three jobs with different completion times.",
          activeLine: 4,
          tick: 0,
          event: "jobs 1, 2, 3 scheduled",
          tasks: [
            { name: "job 1", status: "awaiting", detail: "Sleep 0.3" },
            { name: "job 2", status: "awaiting", detail: "Sleep 0.1" },
            { name: "job 3", status: "awaiting", detail: "Sleep 0.2" },
          ],
        },
        {
          label: "The shortest job finishes first",
          explanation: "as_completed yields the awaitable for the finished task instead of preserving original input order.",
          activeLine: 5,
          tick: 1,
          event: "job 2 becomes first completed result",
          tasks: [
            { name: "job 1", status: "awaiting", detail: "Still sleeping" },
            { name: "job 2", status: "ready", detail: "First completion delivered to caller" },
            { name: "job 3", status: "awaiting", detail: "Still sleeping" },
          ],
        },
        {
          label: "The caller consumes job 2",
          explanation: "Awaiting the yielded object returns the finished result immediately because that task is already done.",
          activeLine: 6,
          tick: 2,
          event: "job 2 result consumed",
          tasks: [
            { name: "job 1", status: "awaiting", detail: "Still sleeping" },
            { name: "job 2", status: "done", detail: "Consumed first" },
            { name: "job 3", status: "awaiting", detail: "Still sleeping" },
          ],
        },
        {
          label: "Then the medium job finishes",
          explanation: "The next completion is job 3, not job 1, because its delay was shorter.",
          activeLine: 5,
          tick: 3,
          event: "job 3 becomes next result",
          tasks: [
            { name: "job 1", status: "awaiting", detail: "Still sleeping" },
            { name: "job 2", status: "done", detail: "Already consumed" },
            { name: "job 3", status: "ready", detail: "Second completion" },
          ],
        },
        {
          label: "The longest job arrives last",
          explanation: "Completion order reflects real finish time, which is why as_completed is useful for streaming results progressively.",
          activeLine: 6,
          tick: 4,
          event: "job 1 completes last",
          tasks: [
            { name: "job 1", status: "done", detail: "Last result" },
            { name: "job 2", status: "done", detail: "First result" },
            { name: "job 3", status: "done", detail: "Second result" },
          ],
          done: true,
        },
      ],
    },
    {
      id: "to-thread",
      label: "to_thread offload",
      summary: "A blocking call is moved off the event-loop thread so other coroutines keep making progress.",
      sourceCode: `
import asyncio
from pathlib import Path

async def load_text(path):
    return await asyncio.to_thread(Path(path).read_text, encoding="utf-8")
`,
      takeaway: "to_thread does not make the blocking call non-blocking. It moves the blocking work to a worker thread so the event loop thread stays responsive.",
      steps: [
        {
          label: "The coroutine reaches a blocking boundary",
          explanation: "read_text is synchronous. Running it directly on the event loop would stall unrelated tasks.",
          activeLine: 5,
          tick: 0,
          event: "load_text decides to offload",
          tasks: [
            { name: "load_text", status: "running", detail: "About to call asyncio.to_thread" },
            { name: "heartbeat", status: "ready", detail: "Another task can still run" },
          ],
        },
        {
          label: "The file read moves to a worker thread",
          explanation: "The event-loop task suspends while a thread performs the blocking file operation.",
          activeLine: 5,
          tick: 1,
          event: "blocking file read running off-loop",
          tasks: [
            { name: "load_text", status: "awaiting", detail: "Waiting for thread result" },
            { name: "heartbeat", status: "running", detail: "Still free to progress on the loop" },
          ],
        },
        {
          label: "Other tasks keep moving",
          explanation: "Unlike the blocking-freeze scenario, the loop thread is not trapped inside the file read.",
          activeLine: 5,
          tick: 2,
          event: "loop remains responsive",
          tasks: [
            { name: "load_text", status: "awaiting", detail: "Thread still reading file" },
            { name: "heartbeat", status: "awaiting", detail: "Yielded normally on its own await" },
          ],
        },
        {
          label: "The thread returns the result",
          explanation: "Once the blocking function finishes in the worker thread, the event loop marks the awaiting coroutine ready.",
          activeLine: 5,
          tick: 3,
          event: "thread result delivered back to loop",
          tasks: [
            { name: "load_text", status: "ready", detail: "Ready to resume with file contents" },
            { name: "heartbeat", status: "ready", detail: "Also ready independently" },
          ],
        },
        {
          label: "The coroutine resumes with the data",
          explanation: "The loop can now resume load_text without having sacrificed responsiveness during the blocking file read.",
          activeLine: 5,
          tick: 4,
          event: "offloaded operation complete",
          tasks: [
            { name: "load_text", status: "done", detail: "Received thread result" },
            { name: "heartbeat", status: "done", detail: "Completed independently" },
          ],
          done: true,
        },
      ],
    },
  ],
}

export const asyncServersTimelineData: AsyncTimelineLabData = {
  title: "See an Async Server Handle Work",
  summary: "Follow a small server as it accepts a connection, awaits network input, responds, and returns control to the event loop.",
  ctaLabel: "Open timeline",
  note: "The chapter includes a FastAPI example and an asyncio TCP server. This lab focuses on the Python and event-loop mechanics that both styles depend on.",
  defaultScenarioId: "tcp-request",
  scenarios: [
    {
      id: "tcp-request",
      label: "TCP request lifecycle",
      summary: "A handler coroutine accepts a client, awaits input, writes a response, and closes cleanly.",
      sourceCode: `
import asyncio

async def handle(reader, writer):
    line = await reader.readline()
    writer.write(line.upper())
    await writer.drain()
    writer.close()
    await writer.wait_closed()
`,
      takeaway: "Async servers are mostly about waiting efficiently: accept, read, flush, and close without blocking the loop for unrelated clients.",
      steps: [
        {
          label: "Server is idle in the event loop",
          explanation: "The loop is waiting for network readiness events, not spinning in user code.",
          activeLine: 3,
          tick: 0,
          event: "listener waiting for connection",
          tasks: [
            { name: "server", status: "awaiting", detail: "Listening for a client connection" },
            { name: "handler", status: "ready", detail: "No client yet; handler not started" },
          ],
        },
        {
          label: "A client connects and the handler starts",
          explanation: "The loop schedules a handler coroutine for the accepted connection.",
          activeLine: 3,
          tick: 1,
          event: "connection accepted",
          tasks: [
            { name: "server", status: "ready", detail: "Can go back to listening for more clients" },
            { name: "handler", status: "running", detail: "Started for one client connection" },
          ],
        },
        {
          label: "The handler awaits a line of input",
          explanation: "reader.readline suspends the handler until bytes actually arrive from the network.",
          activeLine: 4,
          tick: 2,
          event: "handler waiting for client bytes",
          tasks: [
            { name: "server", status: "awaiting", detail: "Still accepting other clients" },
            { name: "handler", status: "awaiting", detail: "Waiting for readable socket" },
          ],
        },
        {
          label: "Input arrives and the handler becomes ready",
          explanation: "When the socket is readable, the loop can resume the suspended handler.",
          activeLine: 4,
          tick: 3,
          event: "socket becomes readable",
          tasks: [
            { name: "server", status: "awaiting", detail: "Still listening" },
            { name: "handler", status: "ready", detail: "Has input line to process" },
          ],
        },
        {
          label: "The handler writes and drains",
          explanation: "write buffers output immediately, but drain awaits flow-control readiness before assuming the peer can accept more data.",
          activeLine: 6,
          tick: 4,
          event: "response flush waits for transport",
          tasks: [
            { name: "server", status: "awaiting", detail: "Can still serve others" },
            { name: "handler", status: "awaiting", detail: "Waiting for output buffer to drain" },
          ],
        },
        {
          label: "The connection closes cleanly",
          explanation: "After the flush, the handler closes the writer and awaits the close handshake before finishing.",
          activeLine: 8,
          tick: 5,
          event: "handler closes connection",
          tasks: [
            { name: "server", status: "awaiting", detail: "Still available for new clients" },
            { name: "handler", status: "done", detail: "Client lifecycle complete" },
          ],
          done: true,
        },
      ],
    },
  ],
}

export const asyncIterationTimelineData: AsyncTimelineLabData = {
  title: "See Async Iteration Pull Values",
  summary: "Watch an async consumer pull values one by one from an async iterable while the producer suspends between items.",
  ctaLabel: "Open timeline",
  note: "Async iteration is still pull-based from the consumer side. The loop just makes each step awaitable instead of requiring all values to be ready synchronously.",
  defaultScenarioId: "async-for",
  scenarios: [
    {
      id: "async-for",
      label: "async for over a stream",
      summary: "An async consumer awaits each next item from an async iterable rather than blocking for the whole dataset up front.",
      sourceCode: `
import asyncio

async def ticker():
    for value in (1, 2, 3):
        await asyncio.sleep(0.1)
        yield value

async def main():
    async for item in ticker():
        print(item)
`,
      takeaway: "async for does not turn iteration into parallelism. It makes each step of iteration an awaitable boundary so the loop can interleave other tasks between items.",
      steps: [
        {
          label: "The consumer enters async for",
          explanation: "The loop asks the async iterable for its next value through the asynchronous iteration protocol.",
          activeLine: 9,
          tick: 0,
          event: "consumer requests first item",
          tasks: [
            { name: "consumer", status: "running", detail: "Entering async for" },
            { name: "ticker", status: "ready", detail: "Can start producing item 1" },
          ],
        },
        {
          label: "The producer awaits before yielding",
          explanation: "ticker pauses on asyncio.sleep before it can yield the first value. The consumer is therefore awaiting the next item.",
          activeLine: 5,
          tick: 1,
          event: "producer delayed before first yield",
          tasks: [
            { name: "consumer", status: "awaiting", detail: "Waiting for next item" },
            { name: "ticker", status: "awaiting", detail: "Sleeping before yield 1" },
          ],
        },
        {
          label: "The first value becomes available",
          explanation: "Once the timer finishes, ticker resumes and yields the first item back to the consumer.",
          activeLine: 6,
          tick: 2,
          event: "producer yields item 1",
          tasks: [
            { name: "consumer", status: "ready", detail: "Can resume loop body with item = 1" },
            { name: "ticker", status: "ready", detail: "Paused after yielding value 1" },
          ],
        },
        {
          label: "The consumer handles item 1 and asks again",
          explanation: "After processing the item, the loop requests the next value. The cycle repeats for each item.",
          activeLine: 10,
          tick: 3,
          event: "consumer prints and requests next item",
          tasks: [
            { name: "consumer", status: "awaiting", detail: "Waiting for item 2" },
            { name: "ticker", status: "awaiting", detail: "Sleeping before yield 2" },
          ],
        },
        {
          label: "The producer finishes after the last yield",
          explanation: "After yielding 3, the producer eventually terminates, signalling the end of the async iteration.",
          activeLine: 6,
          tick: 4,
          event: "producer signals iteration end",
          tasks: [
            { name: "consumer", status: "done", detail: "Loop ended after final item" },
            { name: "ticker", status: "done", detail: "No more values to yield" },
          ],
          done: true,
        },
      ],
    },
  ],
}

export const asyncLimitsTimelineData: AsyncTimelineLabData = {
  title: "See Where Async Helps and Where It Stops",
  summary: "Contrast cooperative I/O waiting with blocking or CPU-heavy work that starves the event loop.",
  ctaLabel: "Open timeline",
  note: "Asyncio is strongest when work waits on external readiness. It is not a magic parallelism switch for CPU-bound Python code.",
  defaultScenarioId: "cpu-trap",
  scenarios: [
    {
      id: "cpu-trap",
      label: "CPU-bound trap",
      summary: "A coroutine doing long CPU work without awaiting monopolizes the event loop thread.",
      sourceCode: `
async def crunch():
    total = 0
    for i in range(50_000_000):
        total += i
    return total
`,
      takeaway: "Async syntax alone does not create preemption. If CPU-heavy Python code does not await, the loop cannot schedule anything else.",
      steps: [
        {
          label: "crunch starts on the loop thread",
          explanation: "The coroutine begins executing normal Python bytecode in a long loop.",
          activeLine: 2,
          tick: 0,
          event: "CPU loop begins",
          tasks: [
            { name: "crunch", status: "running", detail: "No await yet" },
            { name: "heartbeat", status: "ready", detail: "Could run only if crunch yielded" },
          ],
        },
        {
          label: "The loop cannot preempt crunch",
          explanation: "Unlike OS threads, asyncio tasks do not get forcibly time-sliced. The current coroutine must await or return.",
          activeLine: 3,
          tick: 1,
          event: "event loop starved by CPU work",
          tasks: [
            { name: "crunch", status: "blocked", detail: "Busy in Python bytecode" },
            { name: "heartbeat", status: "ready", detail: "Starved behind crunch" },
          ],
        },
        {
          label: "Only after crunch ends can anything else run",
          explanation: "The loss of responsiveness is not an asyncio bug. It is the predictable result of CPU work with no cooperative suspension point.",
          activeLine: 4,
          tick: 2,
          event: "CPU loop finally ends",
          tasks: [
            { name: "crunch", status: "done", detail: "Returned total" },
            { name: "heartbeat", status: "ready", detail: "Still waiting for its first turn" },
          ],
          done: true,
        },
      ],
    },
  ],
}

export const bytecodeLabData: BytecodeLabData = {
  title: "Inspect CPython Bytecode",
  summary: "Compare source code, representative disassembly, and the real engineering lesson behind a few common bytecode patterns.",
  ctaLabel: "See bytecode lab",
  note: "These disassembly samples come from local CPython 3.12.3. Opcode names, specialization details, and exact layouts are version-sensitive interpreter details, not cross-version language guarantees.",
  defaultCase: "comprehension",
  cases: [
    {
      id: "locals",
      label: "Local vs global",
      question: "Why does local state usually cost less to load than global state?",
      sourceCode: `RATE = 1.25

def total_local(x, y):
    return x + y

def total_global(x):
    return x * RATE
`,
      disassembly: `local
  4           0 RESUME                   0

  5           2 LOAD_FAST                0 (x)
              4 LOAD_FAST                1 (y)
              6 BINARY_OP                0 (+)
             10 RETURN_VALUE

global
  7           0 RESUME                   0

  8           2 LOAD_FAST                0 (x)
              4 LOAD_GLOBAL              0 (RATE)
             14 BINARY_OP                5 (*)
             18 RETURN_VALUE`,
      keyOpcodes: ["LOAD_FAST", "LOAD_GLOBAL", "BINARY_OP"],
      headline: "Locals are stored in the function's fast-locals array, while globals require dictionary-based resolution rules before the operation can proceed.",
      whyItCanMatter: "Extra lookup work shows up in bytecode shape, but real speed still depends on surrounding work, specialization, and whether the hot path is dominated by Python-level dispatch or C-level built-ins.",
      productionRule: "Prefer clean local state and explicit parameters for clarity. Treat global-lookup bytecode as a diagnostic clue, not a reason to contort APIs into micro-optimized local aliases.",
      warning: "On CPython 3.11+, adaptive specialization narrows some traditional lookup gaps. Old folklore like 'always bind builtins to locals for speed' is much less reliable than it used to be.",
      versionNote: "Representative CPython 3.12.3 output. Local/global opcode names are stable concepts, but specialization behavior changed materially in 3.11+ [PEP 659].",
    },
    {
      id: "closure",
      label: "Closure cell access",
      question: "What changes when a function reads an enclosing variable instead of a local one?",
      sourceCode: `def make_adder(base):
    def add(x):
        return base + x
    return add
`,
      disassembly: `              0 COPY_FREE_VARS           1

  4           2 RESUME                   0

  5           4 LOAD_DEREF               1 (base)
              6 LOAD_FAST                0 (x)
              8 BINARY_OP                0 (+)
             12 RETURN_VALUE`,
      keyOpcodes: ["COPY_FREE_VARS", "LOAD_DEREF", "LOAD_FAST"],
      headline: "A closure read is not a normal local read. CPython stores the captured binding in a closure cell and uses LOAD_DEREF to fetch it.",
      whyItCanMatter: "Closure cells make state retention explicit in the interpreter model. That matters for understanding hidden state, function factories, decorators, and why closure-heavy code is not the same thing as a plain local computation.",
      productionRule: "Use disassembly to understand semantics first: which names are local, free, global, or cell variables. Use that insight to improve API shape and readability before you worry about nanosecond-level differences.",
      warning: "LOAD_DEREF does not mean 'closures are bad.' It means the function genuinely depends on captured state. Replace a closure with a class only when lifecycle, observability, or multi-method state makes the closure hard to reason about.",
      versionNote: "Closure-cell opcodes are CPython implementation details, but the underlying lexical-scope semantics are language-level behavior.",
    },
    {
      id: "comprehension",
      label: "Comprehension vs loop",
      question: "Why are simple list comprehensions often faster than manual append loops?",
      sourceCode: `def manual(rows):
    out = []
    for row in rows:
        out.append(row * 2)
    return out

def comp(rows):
    return [row * 2 for row in rows]
`,
      disassembly: `manual
  3           0 RESUME                   0

  4           2 BUILD_LIST               0
              4 STORE_FAST               1 (out)

  5           6 LOAD_FAST                0 (rows)
              8 GET_ITER
        >>   10 FOR_ITER                22 (to 58)
             14 STORE_FAST               2 (row)

  6          16 LOAD_FAST                1 (out)
             18 LOAD_ATTR                1 (NULL|self + append)
             38 LOAD_FAST                2 (row)
             40 LOAD_CONST               1 (2)
             42 BINARY_OP                5 (*)
             46 CALL                     1
             54 POP_TOP
             56 JUMP_BACKWARD           24 (to 10)

  7          60 LOAD_FAST                1 (out)
             62 RETURN_VALUE

comp
  9           0 RESUME                   0

 10           2 LOAD_FAST                0 (rows)
              4 GET_ITER
              6 LOAD_FAST_AND_CLEAR      1 (row)
              8 SWAP                     2
             10 BUILD_LIST               0
             12 SWAP                     2
        >>   14 FOR_ITER                 7 (to 32)
             18 STORE_FAST               1 (row)
             20 LOAD_FAST                1 (row)
             22 LOAD_CONST               1 (2)
             24 BINARY_OP                5 (*)
             28 LIST_APPEND              2
             30 JUMP_BACKWARD            9 (to 14)
             38 RETURN_VALUE`,
      keyOpcodes: ["BUILD_LIST", "LOAD_ATTR", "CALL", "LIST_APPEND"],
      headline: "The manual loop performs attribute lookup and a method call for append on every iteration. The comprehension uses a dedicated LIST_APPEND path inside its own compiled loop.",
      whyItCanMatter: "This is one of the clearest places where bytecode explains a common benchmark result. Fewer Python-level dispatch steps often means less overhead for simple transformations.",
      productionRule: "Use a comprehension when the transformation is local, side-effect free, and readable in one pass. Switch back to an explicit loop when control flow, error handling, or instrumentation matters more than a small dispatch win.",
      warning: "Do not turn 'comprehensions are faster' into an absolute rule. Allocation size, object work, branch complexity, cache effects, and readability often matter more than the opcode count.",
      versionNote: "Exact comprehension bytecode changed across versions. LIST_APPEND is a long-standing clue, but 3.12 disassembly layout is not a universal template.",
    },
    {
      id: "adaptive",
      label: "Adaptive interpreter",
      question: "Why can the same source code produce different disassembly views on modern CPython?",
      sourceCode: `import dis

def total(xs):
    return sum(xs)

dis.dis(total)
dis.dis(total, show_caches=True, adaptive=True)
`,
      disassembly: `dis.dis signature on CPython 3.12:
(x=None, *, file=None, depth=None, show_caches=False, adaptive=False)

dis.get_instructions signature on CPython 3.12:
(x, *, first_line=None, show_caches=False, adaptive=False)

Representative unspecialized instructions for:
def total(xs):
    return sum(xs)

  3           0 RESUME                   0
  4           2 LOAD_GLOBAL              1 (NULL + sum)
             14 LOAD_FAST                0 (xs)
             16 CALL                     1
             24 RETURN_VALUE`,
      keyOpcodes: ["LOAD_GLOBAL", "CALL", "inline caches", "adaptive view"],
      headline: "Modern CPython can specialize instruction streams at runtime. The default disassembly is one view; cache-aware or adaptive views can expose more of what the interpreter is doing internally.",
      whyItCanMatter: "This is why cross-version bytecode tutorials age quickly. The interpreter now rewrites or specializes parts of execution internally, so the performance story is not just 'count generic opcodes.'",
      productionRule: "Compare bytecode on the same Python version you deploy. If the question is performance, pair disassembly with measurement using timeit, pyperf, or production profiling rather than relying on static opcode intuition alone.",
      warning: "Adaptive disassembly is a CPython runtime optimization view, not a language guarantee. Different Python versions may expose different cache metadata, opcode names, or specialization behavior.",
      versionNote: "show_caches=True and adaptive=True are available on current CPython 3.11+ and reflect the specializing adaptive interpreter from [PEP 659].",
    },
  ],
}

export const gilLabData: GILLabData = {
  title: "See What the GIL Changes",
  summary: "Compare CPU-bound threads, I/O-bound threads, process-based parallelism, and free-threaded CPython so the GIL story stays concrete.",
  ctaLabel: "See GIL lab",
  note: "Representative local measurements below were gathered on CPython 3.12.3 on a 16-core machine. They explain shape, not universal constants. The official semantic guidance comes from the Python docs and PEPs linked in the guide.",
  defaultCase: "cpu_threads",
  cases: [
    {
      id: "cpu_threads",
      label: "CPU-bound threads",
      question: "Why do two Python threads often fail to speed up pure Python CPU work?",
      sourceCode: `from concurrent.futures import ThreadPoolExecutor

def cpu_task(n):
    total = 0
    for i in range(n):
        total += i
    return total

with ThreadPoolExecutor(max_workers=2) as ex:
    list(ex.map(cpu_task, [12_000_000, 12_000_000]))`,
      measurement: "serial 1.088 s · 2 threads 1.057 s",
      bytecodeParallelism: "No on a regular CPython build",
      sharedMemory: "Yes, one process and one interpreter state",
      mechanism: "Only one thread can execute Python bytecode at a time while sharing the same interpreter GIL, so the workers largely time-slice instead of running Python code simultaneously on separate cores.",
      productionRule: "Do not use threads for pure-Python CPU loops expecting multi-core speedup. Reach for processes, multiple interpreters, native extensions that release the GIL, or a free-threaded build where appropriate.",
      warning: "Similar elapsed time is normal here. Slight wins or losses can come from OS scheduling noise, cache effects, and task shape, but the GIL still blocks true parallel bytecode execution in the regular build.",
      versionNote: "This describes regular CPython behavior in the supported range. The `threading` docs still warn that only one thread executes Python bytecode at a time in the default build.",
    },
    {
      id: "io_threads",
      label: "I/O-bound threads",
      question: "Why can threads still help when Python has a GIL?",
      sourceCode: `from concurrent.futures import ThreadPoolExecutor
from time import sleep

def io_task(delay):
    sleep(delay)
    return delay

with ThreadPoolExecutor(max_workers=2) as ex:
    list(ex.map(io_task, [0.25, 0.25]))`,
      measurement: "serial 0.500 s · 2 threads 0.251 s",
      bytecodeParallelism: "Not the point; waiting overlaps",
      sharedMemory: "Yes, one process and one interpreter state",
      mechanism: "The GIL is released during I/O and many blocking waits, so while one thread is waiting on external readiness another can run.",
      productionRule: "Use threads for file I/O, socket I/O, waiting-heavy clients, and orchestration around external latency. The value is overlap of waiting time, not parallel Python bytecode.",
      warning: "Not every third-party library releases the GIL in the places you hope. Measure the actual client stack, especially if the code mixes Python callbacks, parsing, or CPU-heavy response handling.",
      versionNote: "The Python glossary explicitly notes that the GIL is always released during I/O, and some extension modules also release it during heavy native work.",
    },
    {
      id: "processes",
      label: "Processes or interpreters",
      question: "What do you use when you actually need multi-core Python execution?",
      sourceCode: `from concurrent.futures import ProcessPoolExecutor

def cpu_task(n):
    total = 0
    for i in range(n):
        total += i
    return total

with ProcessPoolExecutor(max_workers=2) as ex:
    list(ex.map(cpu_task, [12_000_000, 12_000_000]))`,
      measurement: "2 processes 0.591 s",
      bytecodeParallelism: "Yes, across separate runtimes",
      sharedMemory: "No implicit shared mutable memory",
      mechanism: "Processes bypass the process-wide GIL issue by running separate interpreters in separate OS processes. In modern Python, multiple interpreters can also provide true multi-core execution because each interpreter has its own GIL.",
      productionRule: "For CPU-bound Python code, default first to `ProcessPoolExecutor`. In Python 3.14+, consider `InterpreterPoolExecutor` when interpreter isolation tradeoffs are acceptable and you want true multi-core parallelism without full process separation.",
      warning: "Parallel execution is not free. You pay in serialization, startup cost, memory duplication or isolation rules, and more deliberate data movement.",
      versionNote: "Python 3.14 adds `InterpreterPoolExecutor`. PEP 684 introduced the per-interpreter GIL foundation in CPython 3.12.",
    },
    {
      id: "free_threaded",
      label: "Free-threaded CPython",
      question: "What changes when the GIL is disabled in a free-threaded build?",
      sourceCode: `# Requires Python 3.13+ free-threaded build [PEP 703]
# Build CPython with --disable-gil, then run with:
#   python -X gil=0 your_program.py
# or set PYTHON_GIL=0

from threading import Thread`,
      measurement: "Potential true thread parallelism, but not default and not automatic speedup",
      bytecodeParallelism: "Yes, if the build runs with the GIL disabled",
      sharedMemory: "Yes, but now thread-safety costs move elsewhere",
      mechanism: "Removing the GIL requires other thread-safety machinery inside CPython, including different handling for reference counting, container safety, and specialization. The bottleneck changes shape; it does not disappear into magic.",
      productionRule: "Treat free-threaded CPython as a deployment choice, not just a syntax feature. Audit extension compatibility, shared-state assumptions, and single-thread regressions before claiming it is the right answer.",
      warning: "As of the current docs, free-threaded Python is supported starting in 3.13 but is not the default build. Some extensions may re-enable the GIL at runtime or may not yet support the free-threaded build cleanly.",
      versionNote: "PEP 703 was accepted for Python 3.13. The docs describe free-threaded builds as a separate configuration and not the default python.org experience.",
    },
  ],
}
