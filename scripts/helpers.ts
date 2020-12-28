import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(__dirname, ".env") });

export const monorepoDir = path.join(__dirname, "..");
export const cloudFunctionsDir = path.join(monorepoDir, "cloud-functions");
export const bundledCloudFunctionsDir = path.join(
  monorepoDir,
  ".cloud-functions"
);

export const safeName = (name: string) =>
  `${name.replace(/@/, "").replace(/[/|\\]/g, "-")}.zip`;

export const oauthToken = process.env.OAUTH_TOKEN as string;
if (oauthToken == null || oauthToken === "") {
  throw new Error('Empty "process.env.OAUTH_TOKEN"');
}

export const folderId = process.env.FOLDER_ID as string;
if (folderId == null || folderId === "") {
  throw new Error('Empty "process.env.FOLDER_ID"');
}

export const databaseEntryPoint = process.env.DATABASE_ENTRY_POINT as string;
if (databaseEntryPoint == null || databaseEntryPoint === "") {
  throw new Error('Empty "process.env.DATABASE_ENTRY_POINT"');
}
export const databaseName = process.env.DATABASE_NAME as string;
if (databaseName == null || databaseName === "") {
  throw new Error('Empty "process.env.DATABASE_NAME"');
}
export const accessKeyId = process.env.ACCESS_KEY_ID as string;
if (accessKeyId == null || accessKeyId === "") {
  throw new Error('Empty "process.env.ACCESS_KEY_ID"');
}
export const secretAccessKey = process.env.SECRET_ACCESS_KEY as string;
if (secretAccessKey == null || secretAccessKey === "") {
  throw new Error('Empty "process.env.SECRET_ACCESS_KEY"');
}
export const assetsBucketName = process.env.ASSETS_BUCKET_NAME as string;
if (assetsBucketName == null || assetsBucketName === "") {
  throw new Error('Empty "process.env.ASSETS_BUCKET_NAME"');
}
export const s3Endpoint = process.env.S3_ENDPOINT as string;
if (s3Endpoint == null || s3Endpoint === "") {
  throw new Error('Empty "process.env.S3_ENDPOINT"');
}
export const s3Region = process.env.S3_REGION as string;
if (s3Region == null || s3Region === "") {
  throw new Error('Empty "process.env.S3_REGION"');
}
