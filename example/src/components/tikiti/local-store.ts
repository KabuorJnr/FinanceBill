import { File, Paths } from 'expo-file-system';

/** Small JSON documents in the app's document directory. */
export async function readJson<T>(name: string): Promise<T | null> {
  const file = new File(Paths.document, `${name}.json`);
  if (!file.exists) return null;
  return JSON.parse(await file.text()) as T;
}

export async function writeJson(name: string, value: unknown): Promise<void> {
  const file = new File(Paths.document, `${name}.json`);
  if (!file.exists) file.create();
  file.write(JSON.stringify(value));
}
