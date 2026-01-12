# Spark Project – Cloud-Based Distributed Data Processing

## Overview
This repository contains a cloud-based distributed data processing system built using Apache Spark / PySpark, Node.js (Express), and Jupyter Notebook.  
The system enables users to upload datasets, run distributed analytics and machine learning jobs, and retrieve processed results from cloud storage.

---

## Repository Structure
```
spark-project/
|
├── expressBackend/        # Node.js Express API
├── spark-microservice/    # PySpark processing service
├── Spark_Analyser.ipynb   # Jupyter / Colab notebook
└── README.md
```

## Express Backend
**Purpose:** API Gateway and Orchestrator

### Responsibilities
- Handle dataset uploads (CSV, JSON, TXT, PDF)
- Validate file type and size
- Store datasets in cloud object storage (S3-compatible)
- Trigger Spark jobs through REST APIs
- Track job execution status
- Return results and metadata to clients

### Technologies
- Node.js
- Express.js
- REST APIs
- S3-compatible cloud storage

---

## Spark Microservice
**Purpose:** Distributed Processing Engine

### Responsibilities
- Load datasets from cloud storage
- Perform descriptive statistics:
  - Row and column counts
  - Data types
  - Min / Max / Mean values
  - Missing and null value percentages
- Execute machine learning jobs using Spark MLlib:
  - Regression models
  - KMeans clustering
  - FP-Growth (frequent itemsets)
  - Aggregation and analytical tasks
- Execute jobs on multiple cluster sizes (1, 2, 4, 8 nodes)
- Measure execution time, speedup, and efficiency
- Persist results back to cloud storage

### Technologies
- Python
- PySpark
- Apache Spark MLlib

---

## Jupyter Notebook (Spark_Analyser.ipynb)
**Purpose:** Interactive Analysis and Experimentation

### Features
- Dataset exploration and validation
- Spark job prototyping
- Visualization of statistics and ML outputs
- Performance benchmarking and comparison
- Reference implementation for production Spark jobs

### Compatible With
- Google Colab
- Local or cloud Jupyter environments

---

## System Workflow
1. User uploads dataset through Express API
2. Backend validates and stores dataset in cloud storage
3. Backend triggers Spark Microservice
4. Spark loads data and executes analytics / ML jobs
5. Results are saved to cloud storage
6. Backend returns results and performance metrics

---

## Key Features
- Distributed and parallel data processing
- Cloud-native storage integration
- REST-based Spark job execution
- Scalability and performance analysis
- Modular microservice architecture

---

## Use Cases
- Big data analytics
- Distributed machine learning
- Spark performance benchmarking
- Academic cloud computing projects

---

## Technologies Used
- Apache Spark / PySpark
- Node.js & Express
- Jupyter Notebook / Google Colab
- Cloud Object Storage (S3-compatible)
- REST APIs

---

## Notes
- Designed for cloud deployment
- Easily extendable with new Spark jobs
- Clear separation between API, processing, and analysis layers
