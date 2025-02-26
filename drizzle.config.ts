// drizzle.config.ts (CommonJS version)
const { defineConfig } = require("drizzle-kit");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

module.exports = defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./data/database.sqlite",
  },
});