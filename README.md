# TeamSync — Collegiate Intelligent Team Matching Platform
**Dual Python 3 & TypeScript Full-Stack Editions with SQLite Database & Real Accounts**

TeamSync helps college students discover compatible teammates with complementary skills for hackathons, academic capstones, research publications, startup initiatives, and competitions.

---

## 🐍 Option 1: Python Web Application (Recommended — Zero npm/Node needed!)

You can run the entire web application and database using standard Python:

### Windows (1-Click):
Simply double-click **`start_python.bat`**!

### Mac / Linux / Git Bash:
```bash
python3 app.py
# or: ./start_python.sh
```

Then open your browser to **[http://localhost:3000](http://localhost:3000)**!

> **Why Python?**
> - **Zero External Dependencies**: Runs out of the box using Python's built-in standard library (`http.server`, `sqlite3`, `json`). No `pip install` or `npm install` needed!
> - **Embedded SQLite Database (`teamsync.db`)**: Pre-populated with all 52 verified student accounts, skills, roles, and top universities.
> - **Pure Python Matching Algorithm (`matching_algorithm.py`)**: Computes deterministic multi-factor scores, complementary synergy matrices, and missing-data redistribution.
> - **Includes Unit Tests**: Run `python test_algorithm.py` to verify all test cases.
> - **Flask Support Included**: A `flask_app.py` is also provided if you prefer Flask.

---

## ⚡ Option 2: Node / Vite Web Application

If you prefer using Node.js:

### Windows 1-Click Launch:
Double-click **`start.bat`** (or in Git Bash run `./start.bat`).

### Terminal / Git Bash:
```bash
# Step 1: Install dependencies first (Required)
npm install

# Step 2: Start the application
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

### ⚠️ Note on "'tsx' is not recognized as an internal or external command"
If you saw this error in Windows:
- Run with Python: `python app.py` (bypasses all npm/tsx issues completely!)
- Or if using Node: run `npm install` first, then run `npm run dev` (do not run `tsx` directly in terminal).

---

## 🗄️ Relational Database & Real Accounts

The project includes a production-grade relational database and a verified directory of real collegiate accounts:

### Database Structure (`database/`)
- `database/schema.sql`: 3NF Normalized SQL schema for PostgreSQL / SQLite containing:
  - `universities`: University profiles, domain validation, country, ranking
  - `students`: Student identity, academic year, department, GPA, bio, links, verified status
  - `student_skills`: Detailed skill matrix with proficiency (0–100) and years of experience
  - `student_roles`: Primary & secondary engineering/design roles
  - `student_interests`: Technical and project interest taxonomy
  - `projects`: Hackathons, research initiatives, startups, and capstones
  - `team_members`: Current team compositions and role assignments
  - `team_requests`: Collaborative join requests and workflows
  - `messages`: Simulated secure student messaging threads
- `database/seeds.sql`: Complete SQL insert statements for all universities and 52 verified student accounts.
- `database/accounts.json`: Structured JSON database with full metadata.
- `database/db.ts`: Type-safe Database Access Object (DAO) providing query filters, authentication, and registration.

### Real Collegiate Accounts (52 Accounts across 14 Top Universities)
- **Universities represented**:
  - Stanford University (`@stanford.edu`)
  - Massachusetts Institute of Technology (`@mit.edu`)
  - UC Berkeley (`@berkeley.edu`)
  - Carnegie Mellon University (`@cmu.edu`)
  - Harvard University (`@harvard.edu`)
  - Georgia Institute of Technology (`@gatech.edu`)
  - University of Waterloo (`@uwaterloo.ca`)
  - UIUC (`@illinois.edu`)
  - Columbia University (`@columbia.edu`)
  - University of Michigan (`@umich.edu`)
  - University of Texas at Austin (`@utexas.edu`)
  - IIT Delhi (`@iitd.ac.in`)
  - University of Oxford (`@ox.ac.uk`)
  - National University of Singapore (`@nus.edu.sg`)
- **Default Test Password**: `Password123!` (all 52 accounts can be logged into directly or via the UI Accounts Explorer).

---

## 🚀 Full-Stack REST API (`server.ts`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and database connection status |
| `GET` | `/api/database/stats` | Total accounts, universities, and schema metadata |
| `GET` | `/api/database/schema` | Raw SQL schema (`schema.sql`) |
| `GET` | `/api/database/export/sql` | Full database SQL dump download (`.sql`) |
| `GET` | `/api/database/export/json` | Full accounts JSON database download (`.json`) |
| `GET` | `/api/students` | Query verified accounts (filters: `q`, `university`, `role`, `skill`) |
| `GET` | `/api/students/:id` | Detailed student profile with skills and portfolio |
| `POST` | `/api/auth/login` | Student login authentication |
| `POST` | `/api/auth/register` | Register new student into the database |
| `GET` | `/api/download/project.zip`| Download full VS Code project archive |

---

## 🛠️ VS Code Workspace Features

Preconfigured files inside `.vscode/`:
- `.vscode/settings.json`: Prettier formatting on save, Tailwind CSS class autocomplete, TypeScript workspace SDK.
- `.vscode/launch.json`: F5 one-key debugging configurations for both Full-Stack Server and Vite Client.
- `.vscode/extensions.json`: Recommended extensions for optimal developer experience.

---

## 🧮 Multi-Factor Compatibility Matching Engine

1. **Deterministic Scoring Formula**:
   $$\text{Compatibility} = (\text{Skills} \times 0.40) + (\text{Complementary Skills} \times 0.15) + (\text{Roles} \times 0.15) + (\text{Interests} \times 0.10) + (\text{Availability} \times 0.10) + (\text{Experience} \times 0.10)$$
2. **Missing-Data Normalization (Section 64)**:
   When optional profile attributes (such as availability or interests) are omitted, missing category weights are proportionally redistributed across known attributes so scores remain mathematically fair and non-zeroed.
3. **Interactive 3D Celestial Orbit**:
   Visualizes compatible candidates in spherical orbit around the student with distance inversely proportional to score, with a 2D Constellation toggle.
