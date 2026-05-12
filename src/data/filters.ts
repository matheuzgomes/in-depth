import { BookOpen, Braces, Database, GitBranch, MemoryStick, Puzzle, Server, Shuffle, Zap } from "lucide-react"
import type { FilterItem } from "@/types"

export const FILTERS: FilterItem[] = [
  { id: "all",             label: "All topics",      Icon: BookOpen  },
  { id: "sequences",       label: "Sequences",       Icon: GitBranch },
  { id: "language",        label: "Language",        Icon: Puzzle    },
  { id: "data-structures", label: "Data structures", Icon: Database  },
  { id: "memory",          label: "Memory",          Icon: MemoryStick },
  { id: "performance",     label: "Performance",     Icon: Zap       },
  { id: "classes",         label: "Classes",         Icon: Braces    },
  { id: "async",           label: "Async",           Icon: Shuffle   },
  { id: "patterns",        label: "Patterns",        Icon: Puzzle    },
  { id: "production",      label: "Production",      Icon: Server    },
]
