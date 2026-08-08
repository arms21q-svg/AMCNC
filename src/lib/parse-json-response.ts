export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: (T & { error?: string }) | null = null;

  if (text.trim()) {
    try {
      data = JSON.parse(text) as T & { error?: string };
    } catch {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      throw new Error("Invalid JSON response");
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  if (!data) {
    throw new Error("Empty response body");
  }

  return data;
}
