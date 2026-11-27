import { defineFunction } from "@aws-amplify/backend";

// Turns the poem endpoint off when the poem's $1 monthly budget is crossed.
// Wired to the budget (via SNS) in amplify/backend.ts.
export const poemKillSwitch = defineFunction({
  name: "poem-kill-switch",
  entry: "./handler.ts",
  runtime: 20,
  memoryMB: 128,
  timeoutSeconds: 10,
});
