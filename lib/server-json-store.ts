import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

type JsonStoreOptions<T> = {
  exampleFile: string
  fallbackData: T[]
  parse: (rawData: string | null) => T[] | null
  runtimeFile: string
}

const dataDirectory = path.join(process.cwd(), "data")
const runtimeDirectory = path.join(dataDirectory, "runtime")

async function readJsonArray<T>(
  filePath: string,
  parse: (rawData: string | null) => T[] | null
) {
  try {
    return parse(await readFile(filePath, "utf8"))
  } catch {
    return null
  }
}

async function writeJsonArray<T>(filePath: string, data: T[]) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

export async function readServerJsonStore<T>({
  exampleFile,
  fallbackData,
  parse,
  runtimeFile,
}: JsonStoreOptions<T>) {
  const runtimePath = path.join(runtimeDirectory, runtimeFile)
  const runtimeData = await readJsonArray(runtimePath, parse)

  if (runtimeData) {
    return runtimeData
  }

  const examplePath = path.join(dataDirectory, exampleFile)
  const exampleData = await readJsonArray(examplePath, parse)
  const initialData = exampleData ?? fallbackData

  await writeJsonArray(runtimePath, initialData)

  return initialData
}
