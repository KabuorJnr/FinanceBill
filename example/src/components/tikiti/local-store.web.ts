/** Small JSON documents in the browser's localStorage. */
export async function readJson<T>(name: string): Promise<T | null> {
  const stored = window.localStorage.getItem(`tikiti:${name}`);
  return stored ? (JSON.parse(stored) as T) : null;
}

export async function writeJson(name: string, value: unknown): Promise<void> {
  window.localStorage.setItem(`tikiti:${name}`, JSON.stringify(value));
}
