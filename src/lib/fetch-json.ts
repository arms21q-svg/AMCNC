import { parseJsonResponse } from "@/lib/parse-json-response";

const defaultInit: RequestInit = {
  credentials: "same-origin",
};

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...defaultInit, ...init });
  return parseJsonResponse<T>(res);
}

export async function mutateJson<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  return fetchJson<T>(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}
