const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");

const logger = getLogger({ level: "debug" });
const entryPoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const dbName = "/ru-central1/b1gbmac0tb83f84q50gj/etn03mo8f2qepmdek91e";
const authService = getCredentialsFromEnv(entryPoint, dbName, logger);
const driver = new Driver(entryPoint, dbName, authService);

export async function handler(event: any, context: any) {
  // return {
  //   statusCode: 200,
  //   body: "QQQ",
  // };

  // return {
  //   statusCode: 302,
  //   multiValueHeaders: {
  //     Location: [
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Capybara_%28Hydrochoerus_hydrochaeris%29.JPG/1280px-Capybara_%28Hydrochoerus_hydrochaeris%29.JPG",
  //     ],
  //   },
  //   body: "",
  // };

  if (!(await driver.ready(10000))) {
    logger.fatal(`Driver has not become ready in 10 seconds!`);
    process.exit(1);
  }

  await driver.tableClient.withSession(async (session: any) => {
    const qqq = await session.executeQuery("SELECT 0");

    console.log(qqq);
    // executing requests in a specific session
  });

  return {
    statusCode: 200,
    body: "QQQ",
  };
}
