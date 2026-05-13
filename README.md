# Python In Depth

Python In Depth is an open source educational project for studying Python beyond surface-level syntax.

The goal is to help people understand the more technical and intrinsic parts of the language: how Python works under the hood, which choices affect memory and performance, which APIs fit which situations, and which traps appear when code moves from small examples into production systems.

Python is often described as a slow language, but that statement is too shallow to be useful by itself. This project starts from a more honest position: Python has real costs, especially for pure CPU-bound code, but it also gives you data structures, protocols, runtime tools, and engineering patterns that let you write expressive, correct, and surprisingly efficient software when your choices match how the runtime works.

This is also a personal study project by the creator(me). It works as a living technical notebook: every guide, card, simulation, and benchmark exists to turn Python internals into visual models and practical explanations.

## What The Project Teaches

The content focuses on modern Python, with special attention to the current project range: Python 3.10 to 3.14.

Topics include:

- slicing, sequences, and pattern matching;
- identity, equality, parameters, mutable defaults, and closures;
- type hints, bytecode, protocols, and special methods;
- `dict`, `set`, hashing, views, and patterns such as `setdefault`;
- memory, lists, tuples, arrays, iterators, and generators;
- dataclasses, named tuples, and data builders;
- `asyncio`, async iterators, backpressure, Task Groups, and async limits;
- the GIL, threads, processes, multiple interpreters, and performance;
- logging, observability, and practical production decisions.

The point is not to sell simplistic rules such as "always use X." The point is to show the mechanism, the cost, the relevant Python version, and the engineering tradeoff.

## Teaching Philosophy

The project follows a deep technical teaching style:

- explain the visible behavior of the language;
- connect that behavior to the CPython runtime when relevant;
- separate language guarantees from implementation-specific details;
- include version context for important features and APIs;
- treat Python 3.9 and earlier as End-of-Life;
- use small examples that stay technically honest;
- show whether performance comes from data structures, algorithms, bytecode, C-level built-ins, I/O, concurrency, or simply measuring the right thing.

Primary references include the official Python documentation, PEPs, CPython internals, and study material such as Fluent Python.

## Interactive Experience

Beyond written lessons, the project includes a visual study experience:

- short cards for quick review;
- longer guides for deeper study;
- an interactive whiteboard with notes and visual models;
- hand-drawn-style diagrams for language concepts;
- execution and state simulations;
- measured notebooks with local benchmarks and cost comparisons;
- MDX examples integrated directly into the content.

The intent is to let the reader move between explanation, visualization, and measurement without leaving the same study flow.

## Technologies

The project is built with:

- Next.js 16;
- React 19;
- TypeScript 5;
- MDX with `@next/mdx` and `@mdx-js/react`;
- Tailwind CSS 4;
- Rough.js for hand-drawn-style diagrams;
- Framer Motion for animation;
- Lucide React for icons;
- Three.js for 3D elements;
- Python scripts for benchmark and measured-data generation;
- ESLint for static validation.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the project at:

```text
http://localhost:3000
```

Useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Project Structure

```text
src/content/cards      Short MDX lesson cards
src/content/guides     In-depth MDX guides
src/components         UI, whiteboard, book, and simulation components
src/data               Topic indexes, simulations, and benchmark data
scripts                Data and benchmark generation
public                 Public assets
```

## License

This project is distributed under the MIT License.

It is completely open source: anyone can study, use, modify, distribute, and adapt the project under the terms of the license.
