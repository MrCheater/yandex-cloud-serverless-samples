import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { Session } from "yandex-cloud";
import { FunctionService } from "yandex-cloud/api/serverless/functions/v1";
import { AccessBindingAction } from "yandex-cloud/api/access";
import minimist from "minimist";
import chalk from "chalk";

//--token string   //               Set the OAuth token to use.

import {
  folderId,
  oauthToken,
  bundledCloudFunctionsDir,
  safeName,
} from "./helpers";

const dropApiGatewaySpecificationFile = () => {
  const filename = path.join(__dirname, "api-gateway.temp.txt");
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
};

const createApiGatewaySpecificationFile = (params: {
  name: string;
  functionId: string;
}) => {
  const { functionId, name } = params;
  dropApiGatewaySpecificationFile();
  const filename = path.join(__dirname, "api-gateway.temp.txt");
  fs.writeFileSync(
    filename,
    [
      `openapi: 3.0.0`,
      `info:`,
      `  title: ${name} API Gateway`,
      `  version: 1.0.0`,
      `paths:`,
      `  /:`,
      `    get:`,
      `      x-yc-apigateway-integration:`,
      `        type: cloud_functions`,
      `        function_id: ${functionId}`,
      `  /{*}:`,
      `    get:`,
      `      x-yc-apigateway-integration:`,
      `        type: cloud_functions`,
      `        function_id: ${functionId}`,
      `      parameters:`,
      `      - description: wildcard`,
      `        explode: false`,
      `        in: path`,
      `        name: '*'`,
      `        required: false`,
      `        style: simple`,
    ].join("\n")
  );
};

const findFunctionIdByName = async (params: {
  functions: FunctionService;
  name: string;
}): Promise<string> => {
  const { functions, name } = params;

  const [fn] =
    (await functions.list({ folderId, filter: `name="${name}"` }))?.functions ??
    [];

  const functionId = fn?.id;

  if (functionId == null) {
    throw new Error(`Function "${name}" was not found`);
  }

  return functionId;
};

const ensureFunction = async (params: {
  functions: FunctionService;
  folderId: string;
  name: string;
  description?: string;
}): Promise<string> => {
  const { functions, folderId, name, description } = params;

  try {
    const { id: functionId } = await functions.create({
      folderId,
      name,
      description,
    });

    if (functionId == null) {
      throw new Error("Fatal error");
    }

    return functionId;
  } catch (error) {
    if (/already exists/.test(`${error}`)) {
      const functionId = await findFunctionIdByName({
        functions,
        name,
      });

      await functions.update({
        name,
        description,
        functionId,
      });

      return functionId;
    } else {
      throw error;
    }
  }
};

const main = async (params: { name: string; description?: string }) => {
  const { name, description } = params;

  const session = new Session({ oauthToken });

  const functions = new FunctionService(session);

  console.log("Creating Function...");
  let functionId = await ensureFunction({
    functions,
    name,
    description,
    folderId,
  });

  await functions.updateAccessBindings({
    resourceId: functionId,
    accessBindingDeltas: [
      {
        action: AccessBindingAction.ADD,
        accessBinding: {
          roleId: "serverless.functions.invoker",
          subject: {
            id: "allUsers",
            type: "system",
          },
        },
      },
    ],
  });

  console.log("Deploying version...");
  await functions.createVersion({
    entrypoint: "lib/index.handler",
    runtime: "nodejs12",
    environment: {},
    // Bad type
    executionTimeout: {
      seconds: 30,
      nanos: 0,
    } as any,
    functionId,
    // Bad type
    resources: { memory: 128 * 1024 * 1024 } as any,
    content: fs.readFileSync(
      path.join(bundledCloudFunctionsDir, safeName(name))
    ),
  });

  createApiGatewaySpecificationFile({ name, functionId });

  try {
    console.log("Creating API Gateway...");
    const { domain } = JSON.parse(
      execSync(
        `yc serverless api-gateway create ${name} --spec=api-gateway.temp.txt --token=${oauthToken} --folder-id=${folderId} --format=json`,
        {
          cwd: __dirname,
        }
      ).toString("utf8")
    );

    console.log(chalk.green(`https://${domain}`));
  } catch (error) {
    if (/Duplicate name/.test(`${error}`)) {
      const { domain } = JSON.parse(
        execSync(
          `yc serverless api-gateway update ${name} --spec=api-gateway.temp.txt --token=${oauthToken} --format=json`,
          {
            cwd: __dirname,
          }
        ).toString("utf8")
      );

      console.log(chalk.green(`https://${domain}`));
    } else {
      throw error;
    }
  }
};

main(minimist(process.argv.slice(2)) as any)
  .then(() => {
    dropApiGatewaySpecificationFile();
  })
  .catch((error) => {
    dropApiGatewaySpecificationFile();
    console.error(error);
    process.exit(1);
  });
