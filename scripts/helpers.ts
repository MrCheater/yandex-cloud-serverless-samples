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

const oauthToken = process.env.OAUTH_TOKEN as string;
if (oauthToken == null || oauthToken === "") {
  throw new Error('Empty "process.env.OAUTH_TOKEN"');
}

const folderId = process.env.FOLDER_ID as string;
if (folderId == null || folderId === "") {
  throw new Error('Empty "process.env.FOLDER_ID"');
}

export { oauthToken, folderId };
