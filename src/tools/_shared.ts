export function asResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function wrapBody(type: string, attributes: Record<string, unknown>) {
  return { data: { type, attributes } };
}
