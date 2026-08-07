export type AdminListQuery = {
  page: number;
  limit: number;
  skip: number;
  q: string;
};

export type AdminListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function parseAdminListQuery(
  searchParams: URLSearchParams,
  defaultLimit = 20
): AdminListQuery {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("limit") || String(defaultLimit), 10) || defaultLimit)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    q: (searchParams.get("q") || "").trim(),
  };
}

export function buildListMeta(
  total: number,
  page: number,
  limit: number
): AdminListMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
