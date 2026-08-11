import os from "node:os";
import path from "node:path";

export default async function globalSetup() {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(
      os.homedir(),
      "AppData",
      "Local",
      "ms-playwright",
    );
  }
}
