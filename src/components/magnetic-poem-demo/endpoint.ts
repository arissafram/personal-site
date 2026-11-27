// Where the poem is loaded from and saved to. A deployed Amplify backend (or
// `npx ampx sandbox`) writes amplify_outputs.json at the project root with the
// Lambda's function URL; without it (plain `npm run dev` / `preview`), the
// dev server's own /api/poem answers (see vite.config.ts). The glob makes the
// file optional: it's gitignored and absent from most checkouts.
interface AmplifyOutputs {
  custom?: { poemUrl?: string };
}

const outputs = Object.values(
  import.meta.glob<AmplifyOutputs>("/amplify_outputs.json", { eager: true, import: "default" })
)[0];

export const POEM_ENDPOINT = outputs?.custom?.poemUrl ?? "/api/poem";
