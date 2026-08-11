# Agent Rules

Terse like caveman. Technical substance exact. Only fluff die.
Drop: articles, filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift.
Code/commits/PRs: normal. Off: "stop caveman" / "normal mode".

<!-- MCP Graph Tools -->

## MCP Tools: graphify & code-review-graph

**IMPORTANT: This project has knowledge graphs. ALWAYS use graphify or code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore the codebase.** The graphs are faster, cheaper (fewer tokens), and provide structural/semantic context that file scanning cannot.

### Key Tools

#### 1. graphify (Fast Q&A & Concept Mapping)

| Tool            | Use when                                           |
| --------------- | -------------------------------------------------- |
| `query_graph`   | Broad natural language/keyword traversal           |
| `get_node`      | View attributes and direct connections of a symbol |
| `shortest_path` | Trace the path between two distant concepts        |
| `get_community` | View nodes in a co-occurring cluster               |
| `graph_stats`   | Check nodes/edges and community stats              |
| `god_nodes`     | Identify highly connected core abstractions        |

#### 2. code-review-graph (Code Reviews & Structural Analysis)

| Tool                             | Use when                                       |
| -------------------------------- | ---------------------------------------------- |
| `detect_changes_tool`            | Risk analysis of modified/staged changes       |
| `get_review_context_tool`        | Get source context snippet for a code review   |
| `get_impact_radius_tool`         | Map dependencies/blast radius of changes       |
| `get_affected_flows_tool`        | Find impacted execution paths                  |
| `query_graph_tool`               | Structural traversal of tree-sitter references |
| `semantic_search_nodes_tool`     | Search functions/classes by similarity         |
| `get_architecture_overview_tool` | High-level system structure analysis           |
| `refactor_tool`                  | Find dead code or prepare renames              |

### Workflow

1. Use `graphify` for general architectural Q&A and concept traces.
2. Use `code-review-graph` for change analysis, risk reviews, and impact mapping.
3. Keep graphs fresh: run `graphify update .` and `code-review-graph update` after changing files.

<!-- UI & Animation Engineering -->

## UI & Animation Engineering

When building or reviewing UI, animations, transitions, or styling changes, apply rules from `.agents/skills/`:
- `emil-design-eng`: UI polish, component craft, invisible details, taste standards.
- `animate`: Building animations/motion from scratch with exact easing/durations and reduced-motion support.
- `review-animations` & `improve-animations`: Auditing and reviewing UI motion quality.
- `find-animation-opportunities`: Identifying micro-interaction opportunities.

