---
title: "Coding Interview Preparation: A Week-by-Week Study Plan"
slug: "coding-interview-preparation-week-by-week-study-plan"
date: "2026-08-29"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "12 min de leitura"
tags: ["Coding Interview", "LeetCode", "Algorithm Patterns", "System Design", "Behavioral Interview", "US Tech Jobs", "Dev na Gringa"]
summary: "A concrete, structured week-by-week study plan for US tech coding interviews: key algorithm patterns, dynamic programming triage, 1/4/8-week schedules, tool recommendations, and readiness checkpoints."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/coding-interview-preparation-week-by-week-study-plan"
preSoldTarget: "mentoria"
---

# Coding Interview Preparation: A Week-by-Week Study Plan

Most developers preparing for US tech interviews don't fail because they lack ability. They fail because their **coding interview preparation has no structure**. 

They grind random problems on LeetCode for weeks, burn out on advanced topics that rarely appear in actual loops, and walk into the interview room completely unprepared for system design or behavioral rounds. The result: rejection letters that feel deeply unfair, because the underlying technical knowledge was there all along.

```
+-----------------------------------------------------------------------+
|                      THE UNSTRUCTURED TRAP                           |
|  [ Random LeetCode ] ---> [ DP Rabbit Holes ] ---> [ Rejection ]     |
|  (No sequencing)          (Burnout & Silo)         (Communication Gap)|
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                 STRUCTURED INTERVIEW PREP FRAMEWORK                   |
|                                                                       |
|  +-------------------+   +-------------------+   +-----------------+  |
|  | 1. High-Yield     |   | 2. Timed Mocks    |   | 3. STAR &       |  |
|  |    Patterns       |-->|    & Narration    |-->|    System Design|  |
|  | (10 Core Levers)  |   | (Real Pressure)   |   | (Complete Loop) |  |
|  +-------------------+   +-------------------+   +-----------------+  |
+-----------------------------------------------------------------------+
```

This article gives you a concrete framework for coding interview preparation: **what to study, when to study it, which resources to trust, and how to know when you're actually ready**. 

Whether you have one week, four weeks, or eight weeks, you will leave with a clear plan you can execute today. If you're a Brazilian developer targeting US tech companies specifically, programs like [Dev na Gringa Training](https://treinamento.robsoncassiano.software/) build exactly this kind of structured interview coaching into their mentorship track, eliminating the guesswork of piecing together a study plan from scratch.

---

## How US Tech Company Interviews Are Actually Structured

Before you build a prep plan, you must understand what you are optimizing for. US tech company interview loops follow a remarkably predictable shape. Knowing each stage prevents you from over-investing in one area while completely ignoring another.

### The Four Rounds You'll Face in Most Hiring Loops

Most US tech companies run a standardized sequence:

1. **Recruiter Phone Screen (20–30 min):** High-level career overview, visa/contracting status (W2 or B2B/PJ), salary expectations, and communication baseline.
2. **Online Assessment / OA (60–90 min):** Automated algorithm test, typically hosted on **CodeSignal**, **HackerRank**, or **Karat**.
3. **Technical Coding Rounds (2 to 3 sessions, 45–60 min each):** Live pair programming on CoderPad or a shared editor solving data structure and algorithm problems with an engineer.
4. **System Design Session (45–60 min):** Architecture discussion where you clarify requirements, sketch high-level designs, scale bottlenecks, and deep-dive into critical components (databases, caches, message queues). At companies like Amazon, expect Leadership Principles to be tested inside this conversation.
5. **Behavioral Round (45–60 min):** Deep-dive into past leadership, conflict resolution, ownership, and engineering trade-offs using the STAR framework.

```
+-------------------------------------------------------------------------+
|                       STANDARD US HIRING LOOP                          |
|                                                                         |
|  [ Recruiter Screen ]                                                   |
|          │                                                              |
|          ▼                                                              |
|  [ Online Assessment (OA) ] ────► CodeSignal / HackerRank               |
|          │                                                              |
|          ▼                                                              |
|  [ Technical Coding (x2-3) ] ───► CoderPad / Live Data Structures       |
|          │                                                              |
|          ▼                                                              |
|  [ System Design Round ] ───────► Architecture & Scalability            |
|          │                                                              |
|          ▼                                                              |
|  [ Behavioral Round ] ──────────► STAR Format & Leadership Principles   |
|          │                                                              |
|          ▼                                                              |
|  [ Formal Offer / Contract ] ───► $5k–$10k+/mo ($60k–$120k+/yr)         |
+-------------------------------------------------------------------------+
```

### What Interviewers Are Evaluating Beyond Your Code

US interviewers score candidates on four distinct pillars:

- **Problem-Solving Approach:** Do you ask clarifying questions before jumping into code? Do you explore edge cases upfront?
- **Communication & Narration:** Can you articulate your thought process while typing? Going completely silent while thinking consistently produces lower evaluation scores than explaining your reasoning in real time.
- **Time and Space Complexity Analysis:** Can you derive Big-O notation unprompted, explain memory tradeoffs, and suggest optimizations?
- **Code Cleanliness & Idiomatic Syntax:** Readable naming conventions, modular helper functions, and appropriate error handling.

> "The code compiling is just the baseline. Verbalizing your thought process is a distinct skill that requires deliberate practice, completely separate from your ability to write correct algorithms."

### Why the Behavioral Round Trips Up International Candidates

The behavioral round is the most underestimated component of the loop for developers outside the United States. US companies evaluate cultural fit and seniority through structured behavioral frameworks, most commonly the **STAR format**:

- **Situation:** Set the context and business environment briefly (15–20% of time).
- **Task:** What was your specific responsibility or problem statement?
- **Action:** What technical or leadership initiatives did *you* personally drive? (60% of time).
- **Result:** Measurable business impact (e.g., latency dropped by 40%, revenue increased by $1.2M, team delivery velocity doubled).

The most frequent questions center on teamwork, handling disagreements with product managers or senior architects, managing technical debt, and ownership during production outages. Behavioral prep deserves dedicated time in your calendar, not a rushed review the night before.

---

## Coding Interview Preparation: The Topics You Must Master

Not all coding topics carry equal weight. Knowing where to focus first is the difference between a high-yield preparation and months of scattered practice that leaves you exhausted.

```
+-----------------------------------------------------------------------+
|                    HIGH-YIELD VS. LOW-YIELD TOPICS                    |
+-----------------------------------------------------------------------+
|  TIER 1 (MUST MASTER):                                                |
|  • Arrays & Strings (Two Pointers, Sliding Window, Prefix Sums)       |
|  • Hash Tables (Frequency Counting, Lookup Acceleration)              |
|  • Binary Trees & BSTs (DFS, BFS, Recursion, Level Order)             |
|  • Graphs (BFS, DFS, Topological Sort, Connected Components)          |
+-----------------------------------------------------------------------+
|  TIER 2 (ESSENTIAL BASICS):                                           |
|  • Binary Search & Sorted Array Invariants                            |
|  • Stacks, Queues & Monotonic Stacks                                  |
|  • Heaps / Priority Queues (Top K Elements)                           |
|  • 1D Dynamic Programming (Coin Change, House Robber, LIS)            |
+-----------------------------------------------------------------------+
|  TIER 3 (LOW YIELD - STUDY LAST):                                     |
|  • 2D Dynamic Programming (Knapsack variants, complex DP tables)     |
|  • Segment Trees, Tries, Bit Manipulation, Math Puzzles               |
+-----------------------------------------------------------------------+
```

### The Essential 10 Problems Starter Pack

If you solve nothing else first, master these ten foundational problems. They cover the most common patterns in the most efficient sequence possible:

| # | Problem | Core Pattern | Why It Matters |
|---|---|---|---|
| 1 | **Two Sum** | Hash Map Lookup | The standard $O(n)$ space-time tradeoff baseline. |
| 2 | **Group Anagrams** | Hashing & Canonical Keys | String normalization and bucket aggregation. |
| 3 | **Longest Substring Without Repeating Characters** | Sliding Window | Dynamic window resizing with character frequency tracking. |
| 4 | **Merge Intervals** | Sorting & Array Invariants | Overlapping range resolution, fundamental in real-world scheduling. |
| 5 | **Binary Tree Level Order Traversal** | BFS & Queue Processing | Tier-by-tier tree exploration and state separation. |
| 6 | **Lowest Common Ancestor** | Tree Recursion & DFS | Post-order traversal and parent pointer propagation. |
| 7 | **Number of Islands** | Matrix Graph DFS / BFS | Connected component traversal and grid visited-state management. |
| 8 | **Product of Array Except Self** | Prefix & Suffix Products | Array precomputations without division operators. |
| 9 | **Coin Change** | 1D Dynamic Programming | Bottom-up tabulation and optimal substructure formulation. |
| 10 | **Course Schedule** | Topological Sort (Kahn / DFS) | Cycle detection in Directed Acyclic Graphs (DAGs). |

### Algorithm Patterns That Appear in Almost Every Interview

Interviewers reuse a small set of patterns rather than inventing novel problems. Your goal is not to memorize solutions; it is to **recognize which pattern a problem triggers within the first 60 seconds of reading it**:

- **Two Pointers:** Converging from opposite ends of a sorted array or maintaining fast/slow pointers.
- **Sliding Window:** Finding subarrays/substrings satisfying a specific condition without recalculating from scratch.
- **Prefix Sums:** Answering range sum queries in $O(1)$ time after an $O(n)$ preprocessing step.
- **Binary Search:** Searching over a sorted space or finding the boundary condition in a monotonic search space (*Binary Search on Answer*).
- **Depth-First Search (DFS) & Breadth-First Search (BFS):** Exploring trees, grids, and graphs with stack/recursion or queue mechanics.
- **Backtracking Basics:** Generating permutations, subsets, and combinations.

### How Deep to Go on Dynamic Programming

Dynamic Programming (DP) is the most intimidating topic and the most commonly overstudied by underprepared candidates. 

For most generalist and backend engineering roles, you only need to recognize **1D DP problems** (such as *Coin Change*, *House Robber*, and *Longest Increasing Subsequence*) and understand the three-step framework:

1. **State Definition:** What does `dp[i]` represent in plain English?
2. **Transition Equation:** How does `dp[i]` derive from previous states (`dp[i-1]`, `dp[i-2]`, etc.)?
3. **Base Cases & Initialization:** What are the starting values when $i = 0$ or $i = 1$?

Spending three weeks on advanced 2D DP, multi-dimensional grid games, or bitmask DP while neglecting trees and graphs is one of the most common and costly prep mistakes.

---

## Coding Interview Preparation Study Schedule: 1-Week, 4-Week, and 8-Week Plans

The right schedule depends on your available timeline. Each plan follows the same core principle: **prioritize pattern recognition over raw volume, and finish with timed repetition and mock interviews.**

```
+-------------------------------------------------------------------------+
|                  STUDY SCHEDULE TIMELINE COMPARISON                     |
+-------------------------------------------------------------------------+
| 1-WEEK TRIAGE:                                                          |
| Day 1: Audit & Big-O  ──► Days 2-3: Top Patterns ──► Day 6: Mocks       |
+-------------------------------------------------------------------------+
| 4-WEEK PATTERN-FIRST:                                                   |
| W1: Linear & Hash  ──► W2: Trees & Graphs ──► W3: DP ──► W4: Mocks       |
+-------------------------------------------------------------------------+
| 8-WEEK LAYERED DEEP DIVE:                                               |
| W1-2: Foundations  ──► W3-4: Trees/Graphs ──► W5-6: DP ──► W7-8: Mocks   |
+-------------------------------------------------------------------------+
```

### The 1-Week Triage Plan (For an Imminent Interview)

When an interview is scheduled in 7 days, there is no time for exhaustive exploration. Focus purely on high-yield patterns and active recall:

- **Day 1 (Audit & Big-O):** Review time/space complexity analysis. Audit your weakest areas.
- **Days 2 & 3 (Highest-Yield Core):** Two pointers, sliding window, hash maps, binary trees, and basic DFS/BFS.
- **Day 4 (Search & Backtracking):** Binary search variations and basic backtracking (subsets/permutations).
- **Day 5 (Targeted Weakness Practice):** Mixed timed sessions strictly focused on your two weakest patterns.
- **Day 6 (Simulation Day):** Two full mock interview sessions with a peer or mentor. No new theory.
- **Day 7 (Rest & Light Review):** Re-read your mistake notebook. Confirm audio, video, and environment setup. Rest your brain.

### The 4-Week Pattern-First Schedule

The 4-week timeline is ideal for candidates actively applying or scheduling loops 30 days out.

- **Week 1 (Linear Patterns):** Arrays, strings, two pointers, sliding window, and hash tables. Target 12–15 problems.
- **Week 2 (Non-Linear Structures):** Binary trees, binary search trees (BST), grid DFS/BFS, and basic graph traversal.
- **Week 3 (Recursion, Backtracking & 1D DP):** Permutations, subsets, 1D DP memoization and tabulation.
- **Week 4 (Timed Mocks & Behavioral Polish):** Full timed simulations on CoderPad, system design sketches, and STAR story rehearsals.

#### The Weekly Operating Rhythm:
- **Monday–Thursday:** Pattern drilling (2 to 4 problems per day, max 30 min per problem).
- **Friday:** Mistake review and re-solving previously failed problems without hints.
- **Saturday:** Full timed mock interview under pressure.
- **Sunday:** Light planning and behavioral storytelling prep.

### The 8-Week Layered Approach (For Comprehensive Mastery)

For engineers preparing for senior roles at top US tech firms, the 8-week plan builds deep structural intuition:

- **Week 1:** Setup, diagnostic test, and Big-O foundational review.
- **Week 2:** Arrays, strings, two pointers, and sliding window patterns.
- **Week 3:** Hash tables, linked lists, stacks, and binary search invariants.
- **Week 4:** Trees, tree recursion, and BFS level order processing.
- **Week 5:** Graphs, topological sorting, connected components, and Union-Find basics.
- **Week 6:** Backtracking, 1D dynamic programming, and heaps (top K elements).
- **Week 7:** Full mixed-pattern mock interviews and system design fundamentals (caching, load balancing, sharding).
- **Week 8:** Speed runs, final mistake review, and behavioral STAR calibration.

```
+-----------------------------------------------------------------------+
|                 RECOMMENDED TIME ALLOCATION (8-WEEK)                  |
+-----------------------------------------------------------------------+
|  Problem Solving & Pattern Drilling:   40% – 50%                     |
|  Theory & Complexity Analysis:         20% – 25%                     |
|  Live Mock Interviews:                 15% – 20%                     |
|  Behavioral & STAR Preparation:        10% – 15%                     |
+-----------------------------------------------------------------------+
```

Candidates preparing for competitive US remote loops typically log **150 to 300 focused hours total**, depending on their existing data structures background.

---

## The Best Tools and Resources for Algorithm Practice

A curated, deliberate stack consistently outperforms bouncing between dozens of platforms.

### Free Platforms That Deliver Real Value

- **[LeetCode](https://leetcode.com/):** The industry-standard problem repository. Use it for volume, filtering by frequency tags, and familiarizing yourself with standard problem statements.
- **[NeetCode.io](https://neetcode.io/):** The best structured progression through core interview patterns (NeetCode 75 and NeetCode 150), eliminating decision fatigue.
- **[HackerRank](https://www.hackerrank.com/):** Familiarize yourself with its editor and automated test runner, as many initial screening assessments use this exact platform.

### Paid Tools Worth the Investment

- **AlgoExpert:** Helpful for visual learners who benefit from structured video walkthroughs and clean architectural explanations.
- **Cracking the Coding Interview (Gayle Laakmann McDowell):** The definitive conceptual guide. Pair the conceptual frameworks from the book with active coding on LeetCode for maximum retention.

### Mock Interview Services for Realistic Calibration

- **[Pramp](https://www.pramp.com/):** Free peer-to-peer mock interviews. Excellent for building initial confidence and practicing speaking in English while coding.
- **[interviewing.io](https://interviewing.io/):** Anonymous mock interviews with senior engineers from top US tech companies. Best used 2 to 3 weeks before your real interview loops for rigorous feedback.

---

## How to Know You're Ready & The Final Week Protocol

Readiness is not a subjective feeling—it is a verifiable set of operational milestones.

```
+-----------------------------------------------------------------------+
|                      READINESS SCORECARD CHECKLIST                    |
+-----------------------------------------------------------------------+
| [ ] Solve LeetCode Medium problems in 25–30 minutes without hints     |
| [ ] Derive Big-O time and space complexity automatically and fluently |
| [ ] Complete at least 2 mock interviews with positive feedback        |
| [ ] Have 3–5 verified STAR behavioral stories ready to articulate     |
| [ ] Walk through an end-to-end System Design architecture cleanly     |
+-----------------------------------------------------------------------+
```

### The Value of a Structured Roadmap Over Self-Directed Study

The fundamental risk of preparing alone is **unconscious avoidance**: without external accountability and structured sequencing, candidates naturally gravitate toward topics they already understand while avoiding their true blind spots.

Programs like [Dev na Gringa Training](https://treinamento.robsoncassiano.software/) provide international engineers with a sequenced curriculum, direct technical mentorship, and a community of Brazilian developers navigating the exact same international loops. Having experienced mentors review your code and evaluate your live communication bridges the gap between knowing theory and actually passing real US interviews.

### Your Final Week Protocol

In the final 7 days before your interview:

1. **Zero New Topics:** Do not start new algorithms or complex paradigms.
2. **Review Solved Problems:** Re-read your mistake notebook and re-code high-yield patterns from scratch.
3. **One Final Warmup Mock:** Schedule one light mock interview 3 days before the loop to keep your communication sharp.
4. **Logistics & Environment Check:** Verify internet stability, dual-monitor setup, microphone audio quality, and camera lighting.

---

## Start With the Right Plan, Not Just More Problems

Effective coding interview preparation requires structure, disciplined time management, and milestone tracking. Pick your timeline today (1-week, 4-week, or 8-week), commit to your first pattern session, and practice articulating your engineering decisions out loud.

If you want a proven roadmap with personalized mentorship, live mock interviews, and technical English coaching tailored for international developers, explore the [Dev na Gringa Training](https://treinamento.robsoncassiano.software/) track.

The plan works. The only question is when you begin.
