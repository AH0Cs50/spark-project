import os
import time
import datetime
import pandas as pd
#for spark init and spark descriptive function
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, countDistinct, isnan, when,
    min, max, mean, sum as spark_sum, to_date
)
#for ml algorithm
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.clustering import KMeans
from pyspark.ml.regression import LinearRegression
from pyspark.ml.fpm import FPGrowth


class PipelineService:
    def __init__(self, storage):
        """
        storage: S3StorageHelper instance
        """
        self.storage = storage

    # --------------------------------------------------
    # Spark Session
    # --------------------------------------------------
    def create_spark_session(self, nodes: int):
        return (
            SparkSession.builder
            .appName(f"SparkJob_{nodes}_nodes")
            .master(f"local[{nodes}]")
            .getOrCreate()
        )

    # --------------------------------------------------
    # Dataset Validation
    # --------------------------------------------------
    def validate_dataset(self, local_path: str):
        if not os.path.exists(local_path):
            raise FileNotFoundError(f"Dataset not found: {local_path}")

        file_name = os.path.basename(local_path)
        ext = file_name.split(".")[-1].lower()

        if ext not in {"csv", "json", "txt"}:
            raise ValueError(f"Unsupported dataset type: {ext}")

        spark_read = {"format": ext, "options": {}}

        if ext == "csv":
            spark_read["options"] = {"header": "true", "inferSchema": "true"}

        return {
            "file_name": file_name,
            "extension": ext,
            "spark_read": spark_read
        }

    # --------------------------------------------------
    # Job Config Validation
    # --------------------------------------------------
    def validate_job_config(self, job_config: dict):
        job_type = job_config.get("type")
        tasks = job_config.get("tasks")

        allowed = {
            "descriptive": {
                "row_count", "column_count", "data_types",
                "min_max_mean", "null_percentage", "unique_counts"
            },
            "ml": {
                "regression", "kmeans", "fpgrowth", "timeseries"
            }
        }

        if job_type not in allowed:
            raise ValueError("Invalid job type")

        if not isinstance(tasks, list) or not tasks:
            raise ValueError("Tasks must be a non-empty list")

        invalid = [t for t in tasks if t not in allowed[job_type]]
        if invalid:
            raise ValueError(f"Invalid tasks: {invalid}")

        return {"type": job_type, "tasks": tasks}

    # --------------------------------------------------
    # Descriptive Analytics
    # --------------------------------------------------
    def run_descriptive_tasks(self, df, tasks):
        results = {}

        if df.count() == 0:
            return {"error": "Empty dataset"}

        numeric_cols = [
            f.name for f in df.schema.fields
            if f.dataType.simpleString() in {"int", "double", "float", "long"}
        ]

        if "row_count" in tasks:
            results["row_count"] = df.count()

        if "column_count" in tasks:
            results["column_count"] = len(df.columns)

        if "data_types" in tasks:
            results["data_types"] = {
                f.name: str(f.dataType) for f in df.schema.fields
            }

        if "min_max_mean" in tasks and numeric_cols:
            agg = []
            for c in numeric_cols:
                agg.extend([
                    min(col(c)).alias(f"{c}_min"),
                    max(col(c)).alias(f"{c}_max"),
                    mean(col(c)).alias(f"{c}_mean")
                ])
            row = df.agg(*agg).collect()[0].asDict()
            results["min_max_mean"] = {
                c: {
                    "min": row[f"{c}_min"],
                    "max": row[f"{c}_max"],
                    "mean": row[f"{c}_mean"]
                } for c in numeric_cols
            }

        if "null_percentage" in tasks:
            total = df.count()
            nulls = []
            for c in df.columns:
                expr = when(col(c).isNull(), 1)
                if c in numeric_cols:
                    expr = when(col(c).isNull() | isnan(col(c)), 1)
                nulls.append(spark_sum(expr.otherwise(0)).alias(c))
            counts = df.agg(*nulls).collect()[0].asDict()
            results["null_percentage"] = {
                c: round((counts[c] / total) * 100, 2) for c in df.columns
            }

        if "unique_counts" in tasks:
            exprs = [countDistinct(col(c)).alias(c) for c in df.columns]
            results["unique_counts"] = df.agg(*exprs).collect()[0].asDict()

        return results

    # --------------------------------------------------
    # Machine Learning Tasks
    # --------------------------------------------------
    def run_ml_tasks(self, df, tasks):
        if df.count() == 0:
            return {"error": "Empty dataset"}

        results = {}
        numeric_cols = [
            f.name for f in df.schema.fields
            if f.dataType.simpleString() in {"int", "double", "float"}
        ]

        for task in tasks:
            if task == "kmeans":
                if not numeric_cols:
                    results["kmeans"] = "Skipped: no numeric columns"
                else:
                    vec = VectorAssembler(inputCols=numeric_cols, outputCol="features")
                    data = vec.transform(df)
                    model = KMeans(k=3, seed=1).fit(data)
                    results["kmeans"] = [c.tolist() for c in model.clusterCenters()]

            elif task == "regression":
                if len(numeric_cols) < 2:
                    results["regression"] = "Skipped: insufficient columns"
                else:
                    vec = VectorAssembler(
                        inputCols=numeric_cols[:-1], outputCol="features"
                    )
                    data = vec.transform(df).withColumnRenamed(
                        numeric_cols[-1], "label"
                    )
                    model = LinearRegression().fit(data)
                    results["regression"] = model.coefficients.tolist()

            elif task == "fpgrowth":
                if "items" not in df.columns:
                    results["fpgrowth"] = "Skipped: items column required"
                else:
                    model = FPGrowth(
                        itemsCol="items", minSupport=0.5, minConfidence=0.6
                    ).fit(df)
                    results["fpgrowth"] = [
                        {"items": r["items"], "freq": r["freq"]}
                        for r in model.freqItemsets.collect()
                    ]

            elif task == "timeseries":
                if "timestamp" not in df.columns:
                    results["timeseries"] = "Skipped: timestamp column required"
                else:
                    ts = df.withColumn("date", to_date(col("timestamp")))
                    results["timeseries"] = [
                        {"date": str(r["date"]), "count": r["count"]}
                        for r in ts.groupBy("date").count().collect()
                    ]

        return results

    # --------------------------------------------------
    # Result Path Builder
    # --------------------------------------------------
    def build_result_path(self, s3_path: str, job_id: str):
        # userId/datasets/file.csv → userId/result/job_id/output
        parts = s3_path.strip("/").split("/")
        user_id = parts[0]
        return f"{user_id}/result/{job_id}/output"

    # --------------------------------------------------
    # Execute Pipeline
    # --------------------------------------------------
    def execute_pipeline(self, job_id, s3_path, job_config, node_list=(1, 2, 4, 8)):
        local_file = self.storage.download_file(s3_path)
        dataset = self.validate_dataset(local_file)
        job = self.validate_job_config(job_config)

        job_outputs = {}
        perf = []

        for nodes in node_list:
            spark = None
            try:
                spark = self.create_spark_session(nodes)
                reader = spark.read.format(dataset["spark_read"]["format"])
                for k, v in dataset["spark_read"]["options"].items():
                    reader = reader.option(k, v)

                df = reader.load(local_file).cache()
                df.count()

                start = time.time()
                if job["type"] == "descriptive":
                    output = self.run_descriptive_tasks(df, job["tasks"])
                else:
                    output = self.run_ml_tasks(df, job["tasks"])
                duration = time.time() - start

                job_outputs[f"{nodes}_nodes"] = output
                perf.append({"nodes": nodes, "time_sec": round(duration, 4)})

            finally:
                if spark:
                    spark.stop()

        base = perf[0]["time_sec"]
        for r in perf:
            r["speedup"] = round(base / r["time_sec"], 2)
            r["efficiency"] = round(r["speedup"] / r["nodes"], 2)

        result_path = self.build_result_path(s3_path, job_id)
        local_dir = os.path.join(self.storage.temp_dir, job_id)
        os.makedirs(local_dir, exist_ok=True)

        perf_df = pd.DataFrame(perf)
        perf_file = os.path.join(local_dir, "performance.csv")
        perf_df.to_csv(perf_file, index=False)

        perf_s3 = self.storage.upload_file(perf_file, result_path)

        node_files = {}
        for node, data in job_outputs.items():
            fpath = os.path.join(local_dir, f"{node}.json")
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(str(data))
            node_files[node] = self.storage.upload_file(fpath, result_path)

        return {
            "job_id": job_id,
            "result_path": result_path,
            "performance_metrics": perf,
            "performance_metrics_s3": perf_s3,
            "outputs": node_files
        }