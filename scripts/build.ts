import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";
import * as archiver from "archiver";
import { execSync } from "child_process";
import { sync as rimraf } from "rimraf";
import minimist from "minimist";

import {
  cloudFunctionsDir,
  bundledCloudFunctionsDir,
  monorepoDir,
  safeName,
} from "./helpers";

const zipAsset = async (assetDir: string, bundledAssetsDir: string) => {
  const assetPath = path.join(
    bundledAssetsDir,
    safeName(path.parse(assetDir).name)
  );

  try {
    await execSync(`zip -r -9 --quiet ${JSON.stringify(assetPath)} .`, {
      cwd: assetDir,
    });
  } catch (error) {
    await new Promise((resolve, reject) => {
      const options = {
        zlib: {
          level: 9,
        },
      };

      const output = fs.createWriteStream(assetPath);

      const archive = archiver.create("zip", options);

      archive.directory(assetDir, false);

      archive.pipe(output);
      archive.on("finish", resolve);
      archive.on("error", reject);

      archive.finalize();
    });
  }
  console.log(
    `* ${assetPath} [ ${chalk.green(
      `${(fs.statSync(assetPath).size / 1024).toFixed(1)} KB `
    )}]`
  );
};

const main = async (params: { name: string; production: string }) => {
  const { name, production } = params;

  const assetsDirectories = fs
    .readdirSync(cloudFunctionsDir)
    .map((pathname) => ({
      assetDir: path.join(cloudFunctionsDir, pathname),
      bundledAssetsDir: bundledCloudFunctionsDir,
    }))
    .filter(({ assetDir }) => fs.lstatSync(assetDir).isDirectory())
    .filter(({ assetDir }) =>
      fs.existsSync(path.join(assetDir, "package.json"))
    );

  rimraf(bundledCloudFunctionsDir);

  fs.mkdirSync(bundledCloudFunctionsDir);

  await Promise.all(
    assetsDirectories.map(async ({ assetDir, bundledAssetsDir }) => {
      const assetName = path.parse(assetDir).name;

      if (name != null && assetName !== name) {
        return;
      }

      console.log(`Start building: ${assetName}`);

      if (production) {
        rimraf(path.join(assetDir, "tsconfig.tsbuildinfo"));
      }

      await execSync(`yarn workspace ${assetName} run prepare`, {
        cwd: monorepoDir,
        stdio: "inherit",
      });

      await zipAsset(assetDir, bundledAssetsDir);

      console.log(`Finished building: ${assetName}`);
    })
  );
};

main(minimist(process.argv.slice(2)) as any).catch(() => {
  process.exit(1);
});
