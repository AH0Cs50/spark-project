# Spark Job Microservice

A microservice to execute Spark jobs on datasets stored in S3, supporting descriptive statistics and ML tasks, with performance metrics for multiple node counts.

---

## Project Overview

This microservice provides:

- Execution of Spark jobs for **descriptive analytics** and **machine learning**.
- Integration with **S3** for downloading datasets and uploading results.
- Support for multiple node counts: `1, 2, 4, 8`.
- Measurement of **execution time**, **speedup**, and **efficiency**.
- A **FastAPI** endpoint for submitting jobs.

---

## Project Structure
park_microservice/
├── storage.py        # S3Storage: handles file upload/download
├── service.py        # PipelineService: validates, executes Spark jobs
├── controller.py     # Validates requests and invokes service
├── app.py            # FastAPI app with /submit-job endpoint
├── models.py         # Optional Pydantic models for request validation
└── README.md         # Documentation

---

## Requirements

- Python 3.9+
- Packages:
  - fastapi
  - uvicorn
  - pandas
  - pyspark
  - boto3

---

## Setup

1. **Install dependencies**

```bash
pip install fastapi uvicorn pandas pyspark boto3
```
2. Configure S3 credentials in controller.py:
3.	Run the FastAPI app

## API Endpoint

POST /submit-job
	•	Accepts a JSON payload.
	•	Validates the request, creates S3Storage, and invokes PipelineService.
	•	Returns job outputs and performance metrics.

## Response JSON Structure

```
{
  "job_id": "job_001",
  "s3_path": "user123/datasets/sales.csv",
  "job_config": {
    "type": "descriptive",
    "tasks": ["row_count", "min_max_mean", "null_percentage"]
  },
  "node_list": [1, 2, 4, 8]
}
```

## Response JSON Structure

```
{
  "status": "SUCCESS",
  "data": {
    "job_id": "job_001",
    "result_path": "user123/result/job_001/output",
    "performance_metrics": [
      {"nodes": 1, "time_sec": 3.21, "speedup": 1.0, "efficiency": 1.0},
      {"nodes": 2, "time_sec": 1.78, "speedup": 1.80, "efficiency": 0.90},
      {"nodes": 4, "time_sec": 0.95, "speedup": 3.38, "efficiency": 0.84},
      {"nodes": 8, "time_sec": 0.60, "speedup": 5.35, "efficiency": 0.67}
    ],
    "performance_metrics_s3": "s3://spark-data/user123/result/job_001/output/performance.csv",
    "outputs": {
      "1_nodes": "s3://spark-data/user123/result/job_001/output/1_nodes.json",
      "2_nodes": "s3://spark-data/user123/result/job_001/output/2_nodes.json",
      "4_nodes": "s3://spark-data/user123/result/job_001/output/4_nodes.json",
      "8_nodes": "s3://spark-data/user123/result/job_001/output/8_nodes.json"
    }
  }
}
```