import { parseJsonResponse } from "@/lib/parse-json-response";

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  return parseJsonResponse<T>(res);
}
