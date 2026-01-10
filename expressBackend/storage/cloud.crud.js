import client from './cloud.client.js';
import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { pipeline } from 'stream/promises';
import fs from 'fs';


export async function uploadToS3({
  bucket = process.env.S3_BUCKET_NAME,
  key,
  body,
  contentType
}) {
  if (!bucket) throw new Error('S3 bucket not configured');
  if (!key) throw new Error('S3 key is required');

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType
  });

  await client.send(command);

  return {
    bucket,
    location:key
  };
}


export async function downloadFile(fileName) {

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName
  });

  const response = await client.send(command);

  // await pipeline(
  //   //syntax error here
  //   response.Body as NodeJS.ReadableStream,
  //   fs.createWriteStream('./downloaded.txt')
  // );
}


export async function listFiles() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME
  });

  const response = await client.send(command);
  return response.Contents;
}