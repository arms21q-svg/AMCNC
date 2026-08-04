export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text.trim()) {
    throw new Error("Empty response body");
  }

  return JSON.parse(text) as T;
}
