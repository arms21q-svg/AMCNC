import "server-only";

export async function safeDbQuery<T>(
  query: () => Promise<T>,
  fallback: T,
  label = "db"
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[${label}]`, error);
    return fallback;
  }
}
