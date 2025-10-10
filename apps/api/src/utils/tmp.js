import fs from "fs";
import path from "path";

export function ensureTmpDir() {
  const tmpDir = path.join(process.cwd(), "apps/api/tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}
