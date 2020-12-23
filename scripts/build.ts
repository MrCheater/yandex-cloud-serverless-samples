import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { sync as rimraf } from "rimraf";
import * as minimist from "minimist";
import * as archiver from "archiver";

const chalk = require("chalk");

const monorepoDir = path.join(__dirname, "..");
const assetsRootDir = path.join(monorepoDir, "cloud-functions");
const bundledAssetsRootDir = path.join(monorepoDir, ".cloud-functions");

const assetsDirectories = fs
  .readdirSync(assetsRootDir)
  .map((pathname) => ({
    assetDir: path.join(assetsRootDir, pathname),
    bundledAssetsDir: bundledAssetsRootDir,
  }))
  .filter(({ assetDir }) => fs.lstatSync(assetDir).isDirectory())
  .filter(({ assetDir }) => fs.existsSync(path.join(assetDir, "package.json")));

const safeName = (name) =>
  `${name.replace(/@/, "").replace(/[/|\\]/g, "-")}.zip`;

rimraf(bundledAssetsRootDir);

fs.mkdirSync(bundledAssetsRootDir);

const zipAsset = async (assetDir, bundledAssetsDir) => {
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

      const archive = archiver("zip", options);

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

const main = async ({ name, production }) => {
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

main(minimist(process.argv.slice(2))).catch(() => {
  process.exit(1);
});
