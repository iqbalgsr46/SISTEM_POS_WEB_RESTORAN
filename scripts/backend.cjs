const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const php = process.env.PHP_BINARY || "php";
const check = spawnSync(php, ["-m"], { encoding: "utf8", windowsHide: true });

if (check.status !== 0) {
  console.error("PHP tidak tersedia. Install PHP 8.4+ dan tambahkan ke PATH.");
  process.exit(1);
}

// Keep optional extension settings local to this project, including child PHP processes.
const modules = new Set(check.stdout.toLowerCase().split(/\r?\n/));
const missing = ["fileinfo", "pdo_sqlite", "sqlite3"].filter((name) => !modules.has(name));
const env = { ...process.env };
if (missing.length) {
  const iniDirectory = path.join(root, ".local", "php");
  fs.mkdirSync(iniDirectory, { recursive: true });
  fs.writeFileSync(path.join(iniDirectory, "extensions.ini"), missing.map((name) => `extension=${name}`).join("\n"));
  env.PHP_INI_SCAN_DIR = [env.PHP_INI_SCAN_DIR, iniDirectory].filter(Boolean).join(path.delimiter);
}

const args = process.argv.slice(2);
const child = spawn(php, ["artisan", ...args], {
  cwd: path.join(root, "backend"), env, stdio: "inherit", windowsHide: true,
});
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
