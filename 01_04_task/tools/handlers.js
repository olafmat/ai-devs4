import { readdir, readFile, writeFile, unlink, mkdir, stat } from "fs/promises";
import { resolveSandboxPath } from "../utils/sandbox.js";
import { AIDEVS_KEY } from "../../config.js";

export const handlers = {
  async list_files({ path }) {
    const fullPath = resolveSandboxPath(path);
    const entries = await readdir(fullPath, { withFileTypes: true });

    return entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file"
    }));
  },

  async read_file({ path, binary = false }) {
    const fullPath = resolveSandboxPath(path);

    if (binary) {
      const buffer = await readFile(fullPath);
      const content = buffer.toString("base64");
      return { content, encoding: "base64" };
    }

    const content = await readFile(fullPath, "utf-8");
    return { content, encoding: "utf-8" };
  },

  async write_file({ path, content }) {
    const fullPath = resolveSandboxPath(path);

    // Ensure parent directory exists
    const lastSepIndex = fullPath.lastIndexOf("/");
    const altSepIndex = fullPath.lastIndexOf("\\");
    const sepIndex = Math.max(lastSepIndex, altSepIndex);

    if (sepIndex > -1) {
      const dirPath = fullPath.slice(0, sepIndex);
      await mkdir(dirPath, { recursive: true });
    }

    await writeFile(fullPath, content, "utf-8");
    return { success: true, message: `File written: ${path}` };
  },

  async verify_declaration({ path }) {
    const fullPath = resolveSandboxPath(path);
    const declaration = await readFile(fullPath, "utf-8");

    const response = await fetch("${HUB_URL}/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "sendit",
        answer: {
          declaration
        }
      })
    });

    const data = await response.json();
    console.log(data);

    return data;
  },

  async download_file({ url, path }) {
    const fullPath = resolveSandboxPath(path);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file. Status: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure parent directory exists
    const lastSepIndex = fullPath.lastIndexOf("/");
    const altSepIndex = fullPath.lastIndexOf("\\");
    const sepIndex = Math.max(lastSepIndex, altSepIndex);

    if (sepIndex > -1) {
      const dirPath = fullPath.slice(0, sepIndex);
      await mkdir(dirPath, { recursive: true });
    }

    await writeFile(fullPath, buffer);

    return {
      success: true,
      message: `File downloaded to ${path}`,
      bytesWritten: buffer.length
    };
  },

  async file_info({ path }) {
    const fullPath = resolveSandboxPath(path);
    const stats = await stat(fullPath);

    return {
      size: stats.size,
      isDirectory: stats.isDirectory(),
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString()
    };
  }
};
