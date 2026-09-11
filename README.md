# Urban Water Distribution Complaint & Monitoring System

A complaint registration, prioritization, and monitoring platform for urban water distribution networks — built as a Data Structures & Algorithms class project, using real supply-schedule data from Ahmedabad Municipal Corporation (AMC) zones as a working case study.

> Water distribution is a recurring, high-friction issue in many Indian municipalities. This project models the complaint lifecycle — from citizen report to engineer resolution — as a set of classic data structure problems, and uses that model to compare how different scheduling policies affect response efficiency.

---

## Table of Contents

- [Motivation](#motivation)
- [Users](#users)
- [Features](#features)
- [Research Question](#research-question)
- [Tech Stack](#tech-stack)
- [System Design](#system-design)
  - [Graph Model](#graph-model)
  - [Complaint Lifecycle](#complaint-lifecycle)
- [DSA Concepts Used](#dsa-concepts-used)
- [Case Study Data: AMC Supply Zones](#case-study-data-amc-supply-zones)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Motivation

Water distribution in many Indian cities is intermittent rather than continuous. Complaints — leaks, no-supply, low pressure, contamination — pile up faster than municipal staff can triage them by hand. This project builds a system to register, prioritize, and route those complaints intelligently, and to measure whether smarter scheduling policies actually reduce response time.

## Users

| User | Needs |
|---|---|
| **Citizens** | Report complaints (leakage, no supply, etc.) and check status |
| **Municipal officers** | View, prioritize, and assign complaints; monitor zone-level trends |
| **Engineers** | Receive routed/scheduled complaints and update resolution status |

## Features

- **Complaint registration** — citizens submit complaints with location, type, and description
- **Leakage reporting** — a dedicated report type feeding the maintenance queue
- **Water supply schedules** — per-zone supply windows and duration are tracked and surfaced
- **Complaint prioritization** — complaints are ranked, not just queued FIFO
- **Maintenance planning** — engineers get routed/scheduled work based on network topology
- **GIS visualization** — complaints and zones are plotted spatially
- **Analytics dashboard** — sorting/searching over historical complaint data, response-time metrics

## Research Question

> **How do different complaint scheduling policies affect response efficiency?**

The system is built so scheduling policy is a swappable component, not a hardcoded rule. This lets us run the same batch of complaints through multiple policies (FIFO, priority-based, shortest-response-time-first, zone-weighted) and compare metrics like average response time, backlog size, and fairness across zones.

## Tech Stack

- **Backend / core logic:** C++ (STL containers: `unordered_map`, `queue`, `priority_queue`, graph as adjacency list)
- **Frontend:** *(already implemented — see `/frontend`)*
- **Data:** Zone and infrastructure data sourced from public AMC information (see [Case Study Data](#case-study-data-amc-supply-zones))

## System Design

### Graph Model

The distribution network is modeled as a directed graph with three node types:

```
[Raw Water Sources] ──▶ [Water Treatment Plants] ──▶ [Supply Zones]
```

- **Source nodes** — e.g. Narmada Main Canal (Sardar Sarovar Project), Sabarmati River (Dharoi Reservoir / Vasna Barrage)
- **WTP nodes** — e.g. Kotarpur WTP, Raska WTP, Dudheshwar Water Works
- **Zone nodes** — the four AMC supply zones, each carrying supply-duration and schedule attributes

This structure supports BFS-based impact queries, e.g. *"which zones are affected if this WTP goes offline?"*

```cpp
enum class NodeType { SOURCE, WTP, ZONE };

struct Node {
    int id;
    NodeType type;
    std::string name;
    double supplyHours = 0;
    std::string scheduleWindow;
};

class WaterNetwork {
    std::unordered_map<int, Node> nodes;
    std::unordered_map<int, std::vector<int>> adj;

public:
    void addNode(const Node& n);
    void addEdge(int from, int to);
    std::vector<int> affectedFrom(int startId); // BFS traversal
};
```

### Complaint Lifecycle

```
Citizen submits complaint
        │
        ▼
  Hash map (O(1) lookup by ID) + Queue (arrival order)
        │
        ▼
  Priority Queue (ranked by severity / zone risk / wait time)
        │
        ▼
  Scheduling policy (pluggable: FIFO / priority / SRTF / zone-weighted)
        │
        ▼
  Engineer assignment + resolution
        │
        ▼
  Dashboard (sort/search over resolved + pending complaints)
```

## DSA Concepts Used

| Concept | Where it's used |
|---|---|
| **Hash Map** | O(1) complaint lookup/update by ID |
| **Queue** | Arrival-order intake buffer |
| **Priority Queue** | Complaint ranking by severity/urgency |
| **Graph** | Modeling sources → treatment plants → zones |
| **BFS** | Impact analysis (what's affected downstream of an outage) |
| **Sorting** | Dashboard views (by resolution time, by zone) |
| **Searching** | Locating complaints by location/status |
| **Scheduling algorithms** | Comparing policies for the research question |

## Case Study Data: AMC Supply Zones

Real intermittent-supply data used to seed and validate the system:

| Zone | Areas / Localities | Duration/Day | Schedule Details |
|---|---|---|---|
| West Zone | Navrangpura, Paldi, Chandkheda, Stadium | ~3 hrs | ~1.5–2 hrs morning (6:00–7:30 AM) + ~1.5 hrs afternoon/evening (3:00–4:30 PM) |
| New West Zone | Jodhpur, Thaltej, Bodakdev, Sola | ~2 hrs | Staggered 2-hour morning supply |
| North-West Zone / Bopal | Maktampura, Bopal, Ghuma | ~2–2.75 hrs | 2 hrs morning; some areas +45 min evening |
| Central, East, North & South | Walled City, Naroda, Danilimda, Vatva | ~2–2.5 hrs | Single 2–2.5 hr morning window |

**Infrastructure:**
- **Primary sources:** Narmada Main Canal (Sardar Sarovar Project), Sabarmati River (Dharoi Reservoir / Vasna Barrage), supplemented by French wells and deep borewells
- **Major WTPs:** Kotarpur, Raska, Dudheshwar Water Works
- **Per-capita consumption:** 178–309 liters/person/day, depending on zone

> ⚠️ Source-to-WTP-to-zone connectivity in this repo is a simplified/illustrative graph for the DSA model. It has not been verified against actual pipeline routing — treat it as configurable seed data, not authoritative infrastructure mapping.

## Getting Started

### Prerequisites

- A C++17 (or later) compiler (`g++`, `clang++`, or MSVC)
- `cmake` (recommended) or a simple `Makefile`

### Build

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

mkdir build && cd build
cmake ..
make
./water_distribution_system
```

If you're not using CMake yet:

```bash
g++ -std=c++17 -O2 src/*.cpp -o water_distribution_system
./water_distribution_system
```

## Project Structure

```
.
├── frontend/            # Existing frontend (website)
├── src/                 # C++ source files
│   ├── complaint.hpp    # Complaint struct + intake logic
│   ├── network.hpp      # Graph model (sources → WTPs → zones)
│   ├── scheduler.hpp    # Pluggable scheduling policies
│   ├── dashboard.hpp    # Sorting/searching over complaint data
│   └── main.cpp
├── data/                # Seed data (zones, WTPs, sources)
├── docs/                # Diagrams, research notes
└── README.md
```

## Roadmap

- [x] Define research question and DSA scope
- [x] Frontend implementation
- [x] Zone/infrastructure research (AMC case study)
- [ ] Core data models (Complaint, Node, Edge)
- [ ] Intake layer (hash map + queue)
- [ ] Priority queue + prioritization logic
- [ ] Graph model + BFS impact queries
- [ ] Scheduling policy comparison (FIFO vs priority vs SRTF vs zone-weighted)
- [ ] Analytics dashboard (sorting/searching)
- [ ] Run comparison experiments and document findings

## Contributing

This is a class project — contributions are currently limited to team members. Open an issue or reach out if you'd like to suggest something.

## License

*(Add a license, e.g. MIT, if you plan to make this repo public.)*
