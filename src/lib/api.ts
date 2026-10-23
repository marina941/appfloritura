import type { GenerateRequest, Idea, Script } from "../types";

interface GenerateResponse<T> {
  result: T;
  error?: string;
}

async function callGenerate<T>(req: GenerateRequest): Promise<T> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  const data: GenerateResponse<T> = await res.json();
  if (!res.ok || !data.result) {
    throw new Error(data.error ?? "Falha ao gerar conteúdo.");
  }
  return data.result;
}

export function generateIdea(req: Extract<GenerateRequest, { kind: "idea" }>) {
  return callGenerate<Idea>(req);
}

export function generateScript(
  req: Extract<GenerateRequest, { kind: "script" }>,
) {
  return callGenerate<Omit<Script, "format">>(req).then(
    (result) => ({ ...result, format: req.format }) as Script,
  );
}

export function generateCaption(
  req: Extract<GenerateRequest, { kind: "caption" }>,
) {
  return callGenerate<{ caption: string }>(req).then((r) => r.caption);
}
