const assert = require("node:assert/strict");

const baseUrl = process.env.APP_URL || "http://localhost:3000";
const pages = ["/", "/dine-in?meja=7", "/dine-in?meja=07", "/takeaway", "/kios", "/pos", "/kitchen", "/admin", "/alur", "/checkout", "/cart", "/login", "/tables"];

async function run() {
  for (const path of pages) {
    const response = await fetch(baseUrl + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/);
    console.log("PASS", path);
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
