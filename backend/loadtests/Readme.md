This suite uses **Locust** to test API route performance and concurrency limits under heavy traffic, alongside a custom resource monitor.

---

## 🚀 Purpose & Key Features
* **Throughput & Latency**: Benchmark API response speeds (Median, 95th, 99th percentiles).
* **Auto-Cleanup**: A cleanup script deletes database records and local uploaded files from the disk after testing.

---

## 📂 File Breakdown

* **`locustfile.py`**:
  * Simulates concurrent virtual users accessing the backend API.
  * Simulates realistic user behavior, testing routes like Email Login, Google OAuth Login, Course Catalog, Course Progress Updates, PDF Certificate Generation, Community Forums (posting/replying/liking/deleting), Study Preferences, and Notifications.
  * Handles authentication token injection and cleans up any forum posts created during the session.
* **`monitor.py`**:
  * Connects to and profiles the active Node.js server process once every second.
  * Records server CPU utilization (%), Resident Set Size memory (MB), and network interface throughput (KB/s).
  * Outputs live stats to the console (unless `--silent` is run) and logs all data to `resource_log.csv`.
  * Plots a dual-panel performance metrics timeline to `resource_chart.png` upon exit.
* **`requirements.txt`**:
  * Lists Python package dependencies (`locust`, `psutil`, `requests`, `matplotlib`).

---

# ⚙️ Setup & Installation

## 1. Install Python Dependencies

Install the required packages in your terminal:

```powershell
pip install -r backend/load-tests/requirements.txt
```

## 2. Python 3.12 Compatibility

If using Python 3.12, upgrade the core packages to avoid event loop callback errors:

```powershell
pip install --upgrade gevent greenlet
```

# 🏃 Running a Load Test

## Step 1: Seed the Database

Initialize 100 virtual users in the database:

```powershell
npm run seed:load-users --prefix backend
```

## Step 2: Start the Backend Server

Start the Express application:

```powershell
npm run dev --prefix backend
```

## Step 3: Run the Resource Monitor

In a separate terminal, start the hardware resource logger:

```powershell
python backend/load-tests/monitor.py 
```

## Step 4: Start Locust Traffic Generator

In a third terminal, launch Locust.

### GUI Mode

```powershell
locust -f backend/load-tests/locustfile.py
```

Then configure parameters at `http://localhost:8089`  
(Host: `http://localhost:5000`).

## Step 5: Database & Disk Cleanup

Once the test finishes, purge all load test records and temporary file uploads:

```powershell
npm run cleanup:load-users --prefix backend
```