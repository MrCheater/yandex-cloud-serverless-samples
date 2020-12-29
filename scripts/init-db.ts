import {
  Driver,
  getCredentialsFromEnv,
  getLogger,
  TypedData,
  Ydb,
  TableDescription,
  TableIndex,
  Column,
  withRetries,
} from "ydb-sdk";

import { databaseEntryPoint, databaseName } from "./helpers";
import PrimitiveTypeId = Ydb.Type.PrimitiveTypeId;

const logger = getLogger({ level: "debug" });

const authService = getCredentialsFromEnv(
  databaseEntryPoint,
  databaseName,
  logger
);
const driver = new Driver(databaseEntryPoint, databaseName, authService);

async function run() {
  if (!(await driver.ready(10000))) {
    logger.fatal(`Driver has not become ready in 10 seconds!`);
    process.exit(1);
  }

  await driver.tableClient.withSession(async (session) => {
    // executing requests in a specific session

    // const { resultSets } = await session.executeQuery('SELECT CAST(2147483647 as Int32) as qqq')
    //
    // console.log(TypedData.createNativeObjects(resultSets[0]))
    // const transaction = await session.beginTransaction({
    // serializableReadWrite: {}
    // })

    await session.dropTable("events");
    await session.dropTable("events-documents");
    await session.dropTable("events-meta");

    await session.createTable(
      "events",
      new TableDescription()
        .withColumn(
          new Column(
            "eventId",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "type",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "payload",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.JSON } },
            })
          )
        )
        .withColumn(
          new Column(
            "timestamp",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.TIMESTAMP } },
            })
          )
        )
        .withPrimaryKey("eventId")
    );

    await session.createTable(
      "events-documents",
      new TableDescription()
        .withColumn(
          new Column(
            "eventId",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "entityName",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "documentId",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "documentVersion",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.INT32 } },
            })
          )
        )
        .withPrimaryKeys("documentId", "documentVersion")
        .withIndexes(
          new TableIndex("eventId-index").withIndexColumns("eventId")
        )
    );

    await session.createTable(
      "events-meta",
      new TableDescription()
        .withColumn(
          new Column(
            "entityName",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "documentId",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.STRING } },
            })
          )
        )
        .withColumn(
          new Column(
            "documentVersion",
            Ydb.Type.create({
              optionalType: { item: { typeId: PrimitiveTypeId.INT32 } },
            })
          )
        )
        .withPrimaryKey("documentId")
    );

    // console.log(
    //   (await session.describeTable("events"))
    // );

    //  const preparedQuery = await session.prepareQuery(`
    //      INSERT INTO events (eventId, type, payload, qqq)
    //      VALUES ('id1','qqq-type', AsStruct($payload), CurrentUtcTimestamp());
    //    `);
    //
    // const { resultSets } =
    //    await session.executeQuery(preparedQuery, {
    //      '$payload': {}
    //    });
    //
    // await session.executeQuery(`
    //   INSERT INTO events (
    //     \`eventId\`,
    //     \`type\`,
    //     \`payload\`,
    //     \`timestamp\`
    //   )
    //   VALUES (
    //     'id1',
    //     'qqq-type',
    //     CAST(@@{"title":"qqqqq"}@@ as JSON),
    //     CurrentUtcTimestamp(1)
    //   );
    // `);

    //////////////

    await session.executeQuery(
      `
      INSERT INTO \`events-meta\` (
        \`entityName\`,
        \`documentId\`,
        \`documentVersion\`
      )
      VALUES (
        'item',
        'd1',
        1
      ),
      (
        'item',
        'd2',
        1
      );
    `
    );
    /////////

    const { id: txId } = await session.beginTransaction({
      serializableReadWrite: {},
    });

    if (txId == null) {
      throw new Error();
    }

    await session.executeQuery(
      `
      INSERT INTO \`events\` (
        \`eventId\`, 
        \`type\`, 
        \`payload\`, 
        \`timestamp\`
      )
      VALUES (
        'id1',
        'CREATE_ITEM', 
        CAST(@@{"name":"item-1"}@@ as JSON), 
        CurrentUtcTimestamp(1)
      );
    `,
      undefined,
      { txId }
    );

    const { resultSets: qqqqq1 } = await session.executeQuery(
      `
        SELECT \`documentVersion\` FROM \`events-meta\`
        WHERE \`documentId\` IN ["d1", "d2"]
        AND \`entityName\` = "item"
      `,
      undefined,
      { txId }
    );

    const [d1Version = 0, d2Version = 0] = (qqqqq1 ?? [])
      .map((item) => TypedData.createNativeObjects(item))[0]
      .map((item) => item["documentVersion"]);
    // console.log('documentVersions', documentVersions)
    //

    await session.executeQuery(
      `
      INSERT INTO \`events-documents\` (
        \`eventId\`, 
        \`entityName\`, 
        \`documentId\`, 
        \`documentVersion\`
      )
      VALUES (
        'id1',
        'item', 
       'd1', 
        ${d1Version + 1}
      ),  (
        'id1',
        'item', 
         'd2', 
          ${d2Version + 1}
      );
    `,
      undefined,
      { txId }
    );

    await session.commitTransaction({ txId });
    /*

    const { resultSets } =
      await session.executeQuery(`
       $qqq = SELECT payload from events
       LIMIT 1; 
       
      SELECT JSON_EXISTS($qqq, "$.title");
      `)
*/

    const { resultSets } = await session.executeQuery(`
       SELECT * from events

      `);

    console.log(TypedData.createNativeObjects(resultSets[0]));

    // const txId = transaction.id

    // if(txId == null) {
    //   throw new Error()
    // }

    // const { resultSets } = await session.executeQuery(`
    //   CREATE TABLE qqq (
    //     eventId String,
    //     type String,
    //     payload Json,
    //
    //     PRIMARY KEY (eventId)
    //   )
    // `, undefined, { txId})

    // await session.commitTransaction({ txId })

    //console.log(TypedData.createNativeObjects(resultSets[0]))

    process.exit(0);
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
