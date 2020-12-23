import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as minimist from "minimist";
import { config } from "dotenv";
import { Session } from "yandex-cloud";
import {
  FunctionService,
  CreateFunctionRequest,
} from "yandex-cloud/api/serverless/functions/v1";

config({ path: path.join(__dirname, ".env") });

const oauthToken = process.env.OAUTH_TOKEN;
if (oauthToken == null || oauthToken === "") {
  throw new Error('Empty "process.env.OAUTH_TOKEN"');
}

// Magic constant
const folderId = "b1giflf95rd5isa9s97m";

const main = async ({ name }) => {
  const session = new Session({ oauthToken });

  const functions = new FunctionService(session);

  try {
    await functions.create({
      folderId,
      name: "capybara",
    });
  } catch (error) {
    if (!/already exists/.test(`${error}`)) {
      throw error;
    }
  }
};

main(minimist(process.argv.slice(2))).catch((error) => {
  console.error(error);
  process.exit(1);
});
