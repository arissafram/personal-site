import { LambdaClient, PutFunctionConcurrencyCommand } from "@aws-sdk/client-lambda";

// Runs when the poem's budget alert fires (SNS). Setting the poem function's
// reserved concurrency to 0 stops it from running at all (the function URL
// refuses requests as throttled), so nothing more is spent. Turn it back on by
// hand with `aws lambda delete-function-concurrency --function-name <poem
// function>` (or, if POEM_CONCURRENCY is set in amplify/backend.ts,
// `put-function-concurrency ... --reserved-concurrent-executions <it>`); the
// name is custom.poemFunctionName in amplify_outputs.json.
const lambda = new LambdaClient({});

export const handler = async () => {
  const FunctionName = process.env.POEM_FUNCTION_NAME;
  if (!FunctionName) throw new Error("POEM_FUNCTION_NAME is not set");
  await lambda.send(new PutFunctionConcurrencyCommand({ FunctionName, ReservedConcurrentExecutions: 0 }));
  console.log(`Budget crossed: turned off ${FunctionName} (reserved concurrency 0).`);
};
