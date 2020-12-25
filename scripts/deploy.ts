import * as fs from "fs";
import * as path from "path";
import { Session } from "yandex-cloud";
import { FunctionService } from "yandex-cloud/api/serverless/functions/v1";
import { AccessBindingAction } from "yandex-cloud/api/access";
import minimist from "minimist";

import {
  folderId,
  oauthToken,
  bundledCloudFunctionsDir,
  safeName,
} from "./helpers";

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

  await functions.createVersion({
    entrypoint: "lib/index.handler",
    runtime: "nodejs12",
    environment: {},
    // Bad type
    executionTimeout: {
      seconds: 15,
      nanos: 0,
    } as any,
    functionId,
    // Bad type
    resources: { memory: 128 * 1024 * 1024 } as any,
    content: fs.readFileSync(
      path.join(bundledCloudFunctionsDir, safeName(name))
    ),
  });
};

main(minimist(process.argv.slice(2)) as any).catch((error) => {
  console.error(error);
  process.exit(1);
});
