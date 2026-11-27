import type { PoemState, SaveRequest, SaveResult } from "magnetic-poem";

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

// The endpoint's GET/PUT as the package's load/save props, so the slide can
// put up a layout of its own (the Knicks button) without saving it.
export const fetchPoem = async (): Promise<PoemState> => {
  const res = await fetch(POEM_ENDPOINT, { cache: "no-store", headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${POEM_ENDPOINT} failed: ${res.status}`);
  return res.json();
};

export const savePoem = async (next: SaveRequest): Promise<SaveResult> => {
  const res = await fetch(POEM_ENDPOINT, {
    method: "PUT",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(next),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 200) return { ok: true, state: data };
  if (res.status === 409) return { ok: false, current: data.current };
  throw new Error(data.error || `PUT ${POEM_ENDPOINT} failed: ${res.status}`);
};
