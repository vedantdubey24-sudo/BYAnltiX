# BYAnltiX
### Where Data Reveals Its Insights.

**A Universal Data Analytics & Report Generation Platform**

BYAnltiX is a data analytics platform under development that aims to simplify the process of exploring, understanding and analysing datasets. It is being designed to transform raw data into structured information, meaningful visualizations and actionable insights through an intuitive interface.

The goal is to make data analytics accessible without requiring users to write complex analysis code.

---

## Project Vision

Working with raw datasets often involves multiple tools, manual preprocessing and repetitive analysis.

BYAnltiX aims to bring these processes together into one platform where users can upload their datasets, automatically understand their structure, explore patterns and generate analytical reports.

## Planned Platform Capabilities

- **Universal Dataset Support:** Work with different datasets through CSV and Excel uploads.
- **Automated Data Profiling:** Identify columns, data types, missing values and duplicate records.
- **Statistical Analysis:** Generate descriptive statistics and explore numerical and categorical data.
- **Dynamic Visualizations:** Create charts based on the structure and characteristics of the uploaded dataset.
- **Data Insights:** Identify trends, patterns, relationships and unusual observations.
- **Report Generation:** Export analytical results into downloadable reports.

## Development Approach

BYAnltiX is being developed in multiple stages.

| Development stage | Current progress |
|---|---|
| Backend architecture | Initial setup completed |
| API development | Initial endpoints implemented |
| Dataset upload | Implemented, testing pending |
| Data profiling engine | Upcoming |
| Analytics engine | Upcoming |
| Visualization APIs | Upcoming |
| Insights generation | Upcoming |
| Report generation | Upcoming |
| Frontend development | Upcoming |
| Deployment | Upcoming |

## Technology Stack

**Backend**
- Python
- FastAPI
- Pandas
- NumPy
- SciPy
- Scikit-learn

**Frontend (Planned)**
- React
- TypeScript
- Tailwind CSS
- Recharts

**Data Formats**
- CSV
- XLSX
- XLS

## Current Backend Structure

```text
BYAnltiX/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── datasets.py
│   │   ├── main.py
│   │   ├── analytics/
│   │   ├── services/
│   │   ├── models/
│   │   └── schemas/
│   │
│   └── requirements.txt
│
├── data/
├── assets/
├── pages/
├── src/
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or above
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd BYAnltiX
```

### 2. Create a Virtual Environment

```bash
python -m venv backend/.venv
```

### 3. Activate the Environment

Windows PowerShell:

```powershell
.\backend\.venv\Scripts\Activate.ps1
```

### 4. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 5. Run the Backend

```bash
python -m uvicorn backend.app.main:app --reload
```

### 6. Explore the API Documentation

Open the following URL in your browser:

```text
http://127.0.0.1:8000/docs
```

## Currently Implemented API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome endpoint |
| GET | `/health` | Backend health check |
| POST | `/api/datasets/upload` | CSV and Excel upload and basic dataset inspection |

*Dataset upload functionality is implemented but has not yet been verified with the selected real-world dataset.*

## Project Objective

The long-term objective of BYAnltiX is to build a unified analytics environment that can adapt to different types of datasets instead of depending on a single predefined data structure.

The platform will progressively combine data processing, statistical methods, visualization and reporting into a single workflow.

---

**BYAnltiX — Where Data Reveals Its Insights.**

*An ongoing software development project.*