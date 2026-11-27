import { createHash } from "node:crypto";

import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { handlePoemRequest, toLambdaHandler, type PoemStorage } from "magnetic-poem/server";

import { addFillers, knicksWords } from "../../../src/poem-words";

// The whole poem is one item, pk = "poem": { version, magnets }. Saves are
// optimistic: a PUT names the version it started from, and the write only
// happens if that's still the stored version, so two visitors saving at once
// can't overwrite each other (the second gets a 409 and "Load latest").
const TableName = process.env.POEM_TABLE;
const Key = { pk: "poem" };
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const storage: PoemStorage = {
  async get() {
    const { Item } = await db.send(new GetCommand({ TableName, Key, ConsistentRead: true }));
    return Item ? { version: Item.version, magnets: Item.magnets } : null;
  },
  async put(state, expectedVersion) {
    try {
      await db.send(
        new PutCommand({
          TableName,
          Item: { ...Key, version: state.version, magnets: state.magnets },
          // expectedVersion 0 means nothing has been saved yet.
          ...(expectedVersion === 0
            ? { ConditionExpression: "attribute_not_exists(pk)" }
            : {
                ConditionExpression: "#version = :expected",
                ExpressionAttributeNames: { "#version": "version" },
                ExpressionAttributeValues: { ":expected": expectedVersion },
              }),
        })
      );
      return true;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return false;
      throw error;
    }
  },
};

// Spam guard: one save per visitor (IP address) every SAVE_INTERVAL seconds.
// Each saver gets a small item in the same table, pk = "ip#<hash>", holding
// when they may save next. The IP is stored only as a hash, and DynamoDB's
// TTL deletes the item an hour later. Loading the poem isn't limited.
const SAVE_INTERVAL = 5;
const FORGET_AFTER = 60 * 60;

/** True if this IP may save now (and starts its wait), false if it saved too recently. */
const takeSaveTurn = async (ip: string) => {
  const now = Math.floor(Date.now() / 1000);
  const hash = createHash("sha256").update(ip).digest("hex").slice(0, 32);
  try {
    await db.send(
      new PutCommand({
        TableName,
        Item: { pk: `ip#${hash}`, nextSave: now + SAVE_INTERVAL, expiresAt: now + FORGET_AFTER },
        ConditionExpression: "attribute_not_exists(pk) OR nextSave <= :now",
        ExpressionAttributeValues: { ":now": now },
      })
    );
    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return false;
    throw error;
  }
};

const tooMany = () =>
  new Response(JSON.stringify({ error: "Too many saves. Try again in a few seconds." }), {
    status: 429,
    headers: { "content-type": "application/json", "retry-after": String(SAVE_INTERVAL) },
  });

// CORS is handled by the function URL (amplify/backend.ts), so no
// allowedOrigins here: setting both would send the header twice.
export const handler = (event: LambdaFunctionURLEvent, context?: unknown) => {
  const ip = event.requestContext?.http?.sourceIp;
  return toLambdaHandler(async (request) => {
    if (request.method === "PUT" && ip && !(await takeSaveTurn(ip))) return tooMany();
    return handlePoemRequest(request, { words: knicksWords, addFillers, storage });
  })(event, context);
};
