const BASE_URL = "https://api.outreach.io/api/v2";

export class OutreachError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
    this.name = "OutreachError";
  }
}

export class OutreachClient {
  constructor(private accessToken: string) {
    if (!accessToken) throw new Error("OUTREACH_ACCESS_TOKEN is required");
  }

  async request<T = unknown>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    opts: { query?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);

    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();
    const parsed = text ? safeJson(text) : null;

    if (!res.ok) {
      throw new OutreachError(res.status, parsed, `Outreach ${method} ${path} → ${res.status}`);
    }
    return parsed as T;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
