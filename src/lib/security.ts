const DEV_JWT_FALLBACK = "dev-secret-change-me";

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return new TextEncoder().encode(DEV_JWT_FALLBACK);
  }

  if (
    process.env.NODE_ENV === "production" &&
    (secret === DEV_JWT_FALLBACK || secret.length < 32)
  ) {
    throw new Error("JWT_SECRET must be a strong secret (32+ chars) in production");
  }

  return new TextEncoder().encode(secret);
}
