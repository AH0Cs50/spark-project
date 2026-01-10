import { S3Client } from '@aws-sdk/client-s3';
import {config} from 'dotenv';

config({path:'./config.env'});

const { S3_REGION, S3_ENDPOINT, S3_SECRET_KEY, S3_ACCESS_KEY } = process.env;


if(!S3_REGION||!S3_ENDPOINT||!S3_SECRET_KEY||!S3_ACCESS_KEY)
  throw new Error("missing cloud config data");

const client=  new S3Client({
  region:S3_REGION,
  endpoint:S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY
  }
});


export default client;
