# Python In Depth — Glossary

## Domain language

These terms have precise meanings in this project's content.

### Container models

- **Container sequence** — a Python object that stores references to Python objects (list, tuple). Memory cost = container overhead + per-element PyObject headers.
- **Flat sequence** — a Python object that stores raw C values inline (array.array, bytes, bytearray). No per-element PyObject headers.
- **Streaming iterable** — an iterable that produces values lazily (generator, iterator). Retains suspension frame state between yields.

### Object model

- **Special method** — official Python documentation term for names like `__eq__`, `__iter__`, `__repr__`. Also called "dunder methods" in community shorthand.
- **Identity** — `is` operator. Direct object-pointer comparison. Not overloadable. Not the same as equality.
- **Equality** — `==` operator. Dispatches through `__eq__`. Can be arbitrarily expensive. Returns `NotImplemented` for unsupported types.
- **Hashability** — an object is hashable if it implements `__hash__` and `__eq__` consistently, and its hash-relevant state does not change over its lifetime.

### Runtime

- **GIL (Global Interpreter Lock)** — CPython mechanism that allows only one thread at a time to execute Python bytecode in a given interpreter. Released during I/O and some native-code sections.
- **Bytecode** — the instruction stream CPython executes after compiling source into a code object. Version-sensitive, implementation-specific, not a language guarantee.
- **Free-threaded CPython** — a CPython build configuration (PEP 703, Python 3.13+) where the GIL is disabled. Not the default build.
- **Per-interpreter GIL** — separate interpreters each have their own GIL (PEP 684, Python 3.12+). `InterpreterPoolExecutor` (Python 3.14+) runs tasks across interpreters.

### Concurrency

- **CPU-bound** — workload where the dominant cost is Python bytecode execution. Limited by the GIL in regular CPython.
- **I/O-bound** — workload where the dominant cost is waiting on external resources. Threads overlap effectively because waiting releases the GIL.
- **Cooperative concurrency** — asyncio model where tasks yield control at `await` points. One thread, explicit suspension.

### Data structures

- **Hash table (open-addressed)** — CPython's dict/set implementation. Keys are hashed and placed into a sparse array. Collisions resolved by probing. Load factor triggers resize.
- **Compact dict (Python 3.6+)** — CPython layout that splits indices and entries into separate arrays. Saves ~58% memory vs the old combined-table design. Also preserves insertion order.
- **Key-sharing dict** — CPython optimization where instances of the same class share the same keys object (`__dict__` layout). Requires consistent attribute ordering in `__init__`.

### Sources

- **CPython source** — https://github.com/python/cpython . Primary files: `Objects/dictobject.c`, `Objects/listobject.c`, `Objects/setobject.c`, `Python/ceval.c`, `Objects/clinic/dictobject.c.h`.
- **Python docs** — https://docs.python.org/3/ . Primary sections: Language Reference, Library Reference, Data Model.
- **Fluent Python** — "Fluent Python" 2nd edition by Luciano Ramalho (O'Reilly 2022). Referenced for protocol-driven design insights and production patterns.
