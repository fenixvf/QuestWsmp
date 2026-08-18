const postgresUrlPattern = /^(postgres(?:ql)?:\/\/)(.+)@(.+)$/;

export function getDatabaseUrl(): string {
  const rawUrl =
    process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error(
      "SUPABASE_DATABASE_URL or DATABASE_URL must be set. Ensure the database is configured.",
    );
  }

  try {
    new URL(rawUrl);
    return rawUrl;
  } catch {
    const match = rawUrl.match(postgresUrlPattern);
    if (!match) {
      throw new Error(
        "SUPABASE_DATABASE_URL or DATABASE_URL must be a valid PostgreSQL URI.",
      );
    }

    const [, protocol, userInfo, hostAndPath] = match;
    const separatorIndex = userInfo.indexOf(":");
    if (separatorIndex < 1) {
      throw new Error(
        "The PostgreSQL URI must include a username and password.",
      );
    }

    const username = userInfo.slice(0, separatorIndex);
    const password = userInfo.slice(separatorIndex + 1);
    const normalizedUrl = `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostAndPath}`;

    try {
      new URL(normalizedUrl);
      return normalizedUrl;
    } catch {
      throw new Error(
        "SUPABASE_DATABASE_URL or DATABASE_URL must be a valid PostgreSQL URI.",
      );
    }
  }
}