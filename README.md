# CareBridge 360 — An Explainable Database-Driven Hospital Appointment and Resource Optimization System

**University Digital Assignment II (DA2) Project for BCSE302L Database Systems**

CareBridge 360 is a full-stack, enterprise-grade healthcare operations platform built with **PostgreSQL (3NF Normalized)**, **Supabase Authentication & Row Level Security (RLS)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

---

## 🌟 Primary Academic Novelties

1. **Smart Cancelled-Slot Recovery Engine**:
   - Matches waitlisted patients to cancelled doctor slots using an explainable formula:
     $$\text{Match Score} = 70 \times \text{Time Compatibility} + 30 \times \text{Waiting Age}$$
   - Executed via an atomic PostgreSQL transaction with pessimistic row-level locking (`FOR UPDATE`) to prevent concurrency race conditions.

2. **Live Dynamic Queue Estimation**:
   - Dynamic token board with real-time wait time estimation:
     $$\text{Estimated Wait} = (\text{Tokens Ahead}) \times \text{Empirical Doctor Consultation Duration}$$
   - Adapts dynamically to completed consultation timings.

3. **FEFO Medicine Expiry & Inventory Intelligence**:
   - First-Expiry-First-Out dispensing recommendations across 100 medicine batches.
   - Enforced database invariant: `CHECK (current_stock >= 0)`.

4. **Simulation Experiment Dashboard**:
   - Side-by-side benchmark comparing baseline First-Come-First-Served (FCFS) matching vs. CareBridge 360’s explainable weighted heuristic on identical datasets.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Installation
```bash
cd carebridge-360
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```

---

## 👥 Pre-Configured Test Roles

Use the **Role Selector** in the top navigation bar to switch between user roles instantly:

| Role | Test User Profile | Permissions |
| :--- | :--- | :--- |
| **Admin** | Dr. Rajesh Ramanathan (`admin@carebridge360.local`) | Full operational & audit access |
| **Doctor** | Dr. Priya Sundaram (`doctor@carebridge360.local`) | Queue token caller, consultation notes |
| **Receptionist** | Ananya Krishnan (`receptionist@carebridge360.local`) | Patient registrations, slot recoveries, billing |
| **Inventory Manager**| Karthik Narayanan (`pharmacy@carebridge360.local`) | FEFO batch dispensing, expiry monitoring |

---

## 🗄️ Database Architecture & Migrations

All SQL migrations and demonstration files are located in `supabase/migrations/`:
- `001_schema.sql`: Complete 13-table 3NF schema, check constraints, foreign keys, and indexes.
- `002_functions_triggers.sql`: Stored functions, trigger functions, and atomic transaction procedures.
- `003_rls.sql`: Row Level Security policies for all tables.
- `004_seed.sql` & `supabase/seed.sql`: Master reproducible dataset (100 patients, 10 doctors, 200 appointments, 100 medicine batches).
- `005_demo_queries.sql`: 10 comprehensive queries for BCSE302L requirements.
- `006_constraint_tests.sql`: 6 database integrity and security constraint tests.

---

## 📚 Academic Documentation

- [Academic Project Report (25 Sections)](./docs/project-report.md)
- [Entity-Relationship Diagram & Multiplicity Tables](./docs/er-diagram.md)
- [Database Documentation & 3NF Normalization Proof](./docs/database-documentation.md)
- [Constraint & Query Execution Test Results](./docs/test-results.md)
