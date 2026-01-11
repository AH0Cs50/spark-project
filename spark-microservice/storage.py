import os
import boto3
import shutil

class S3Storage:
    def __init__(self, bucket_name, aws_access_key, aws_secret_key, endpoint_url=None, region="global-1", temp_dir=None):
        """
        S3 helper for uploading/downloading files.
        - bucket_name: your bucket
        - aws_access_key / aws_secret_key: credentials
        - endpoint_url: custom S3 endpoint (e.g., Storj gateway)
        - region: bucket region
        - temp_dir: local temp folder for downloads/uploads
        """
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region,
            endpoint_url=endpoint_url
        )

        # Use a writable folder inside app Documents if not provided
        if temp_dir is None:
            temp_dir = os.path.expanduser("~/Documents/tmp_s3_files")
        self.temp_dir = temp_dir
        os.makedirs(self.temp_dir, exist_ok=True)

    def upload_file(self, local_path, s3_folder):
        """
        Upload a local file to S3 under s3_folder.
        Returns the S3 URI.
        """
        file_name = os.path.basename(local_path)
        s3_key = f"{s3_folder}/{file_name}"
        self.s3_client.upload_file(local_path, self.bucket_name, s3_key)
        return f"s3://{self.bucket_name}/{s3_key}"

    def download_file(self, s3_path):
        """
        Download a file from S3 to local temp directory.
        Returns local path.
        Accepts either full S3 URI (s3://bucket/key) or just key path.
        """
        os.makedirs(self.temp_dir, exist_ok=True)

        if s3_path.startswith(f"s3://{self.bucket_name}/"):
            _, key = s3_path.split(f"s3://{self.bucket_name}/")
        else:
            key = s3_path

        local_path = os.path.join(self.temp_dir, os.path.basename(key))
        self.s3_client.download_file(self.bucket_name, key, local_path)
        return local_path

