import { defineBackend } from "@aws-amplify/backend";
import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { CfnBudget } from "aws-cdk-lib/aws-budgets";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { FunctionUrlAuthType, HttpMethod } from "aws-cdk-lib/aws-lambda";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

import { poemKillSwitch } from "./functions/poem-kill-switch/resource";
import { poem } from "./functions/poem/resource";

// The site's only backend: the magnetic poem's save endpoint. One Lambda with
// a public function URL, and one DynamoDB table holding the last saved poem
// (plus short-lived rate-limit items). The slide finds the URL in
// amplify_outputs.json (custom.poemUrl), which `ampx pipeline-deploy` /
// `ampx sandbox` write.
//
// Spend is capped at about $1/month:
// - the handler allows one save per visitor every second (429 otherwise);
// - optionally, at most POEM_CONCURRENCY copies of the function run at once;
// - the table is provisioned at 1 read / 1 write unit, so a flood is
//   throttled instead of billed (and stays in the always-free tier);
// - a $1 budget on Lambda + DynamoDB turns the function off (kill switch).
const backend = defineBackend({ poem, poemKillSwitch });

/**
 * Reserved concurrency for the poem function, or undefined for none (the
 * default). AWS keeps at least 10 unreserved per account, and new accounts
 * often have a total of only 10, where any reservation fails the deploy. So
 * the first deploy relies on the rate limit and the kill switch. Once
 * `aws lambda get-account-settings` shows a ConcurrentExecutions limit of
 * 1000, set this to 2.
 */
const POEM_CONCURRENCY: number | undefined = undefined;
/** Monthly budget, in USD, for Lambda + DynamoDB before the kill switch fires. */
const BUDGET_USD = 1;

const lambda = backend.poem.resources.lambda;
const isSandbox = backend.stack.node.tryGetContext("amplify-backend-type") === "sandbox";
// Everything lives in the functions' stack, so nothing references across
// stacks.
const stack = Stack.of(lambda);

const table = new Table(stack, "PoemTable", {
  partitionKey: { name: "pk", type: AttributeType.STRING },
  billingMode: BillingMode.PROVISIONED,
  readCapacity: 1,
  writeCapacity: 1,
  // Rate-limit items delete themselves an hour after they're written.
  timeToLiveAttribute: "expiresAt",
  // Roll a vandalized poem back to any second in the last 35 days.
  pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
  // The live table (and its poem) is kept even if the stack is deleted; a
  // sandbox's test table goes away with `ampx sandbox delete`.
  removalPolicy: isSandbox ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
});
table.grantReadWriteData(lambda);
backend.poem.addEnvironment("POEM_TABLE", table.tableName);

if (POEM_CONCURRENCY !== undefined) {
  backend.poem.resources.cfnResources.cfnFunction.reservedConcurrentExecutions = POEM_CONCURRENCY;
}

// Anyone can load and save the poem; the handler checks every save against
// the word list, size limits and the rate limit. CORS lets the live site call
// it from the browser; only a sandbox also allows `npm run dev` on localhost,
// so the live endpoint doesn't accept browser calls from a local dev server.
const allowedOrigins = ["https://www.arissafram.com", "https://arissafram.com"];
if (isSandbox) allowedOrigins.push("http://localhost:3000");

const url = lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins,
    allowedMethods: [HttpMethod.GET, HttpMethod.PUT],
    allowedHeaders: ["content-type"],
    maxAge: Duration.hours(1),
  },
});

// Kill switch: budget → SNS → poem-kill-switch, which sets the poem
// function's reserved concurrency to 0. Budgets update a few times a day, so
// the cap is approximate. (Reserving 0 is allowed even on a 10-execution
// account.) To turn the poem back on, see the kill switch's handler.
const killSwitch = backend.poemKillSwitch.resources.lambda;
backend.poemKillSwitch.addEnvironment("POEM_FUNCTION_NAME", lambda.functionName);
killSwitch.addToRolePolicy(
  new PolicyStatement({ actions: ["lambda:PutFunctionConcurrency"], resources: [lambda.functionArn] })
);

const budgetTopic = new Topic(stack, "PoemBudgetTopic");
budgetTopic.addToResourcePolicy(
  new PolicyStatement({
    principals: [new ServicePrincipal("budgets.amazonaws.com")],
    actions: ["SNS:Publish"],
    resources: [budgetTopic.topicArn],
  })
);
budgetTopic.addSubscription(new LambdaSubscription(killSwitch));

new CfnBudget(stack, "PoemBudget", {
  budget: {
    budgetType: "COST",
    timeUnit: "MONTHLY",
    budgetLimit: { amount: BUDGET_USD, unit: "USD" },
    costFilters: { Service: ["AWS Lambda", "Amazon DynamoDB"] },
  },
  notificationsWithSubscribers: [
    {
      notification: {
        notificationType: "ACTUAL",
        comparisonOperator: "GREATER_THAN",
        threshold: 100,
        thresholdType: "PERCENTAGE",
      },
      subscribers: [{ subscriptionType: "SNS", address: budgetTopic.topicArn }],
    },
  ],
});

backend.addOutput({
  custom: { poemUrl: url.url, poemFunctionName: lambda.functionName },
});
