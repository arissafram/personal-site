import { defineFunction } from "@aws-amplify/backend";

// The magnetic poem's save endpoint: GET the poem, PUT a new one. Its table,
// function URL and CORS are set up in amplify/backend.ts.
export const poem = defineFunction({
  name: "poem",
  entry: "./handler.ts",
  runtime: 20,
  memoryMB: 256,
  timeoutSeconds: 10,
});
