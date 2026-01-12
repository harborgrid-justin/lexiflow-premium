const fs = require("fs");
const path = require("path");

const BASE_PATH = "/workspaces/lexiflow-premium/frontend/src";

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== "node_modules" && f !== "stories" && f !== "__tests__") {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

function main() {
  let count = 0;
  walkDir(BASE_PATH, (filePath) => {
    if (filePath.endsWith(".stories.tsx") || filePath.endsWith(".stories.ts")) {
      let content = fs.readFileSync(filePath, "utf8");
      let changed = false;

      // Fix import
      if (content.includes("from '@storybook/react';")) {
        content = content.replace(
          "from '@storybook/react';",
          "from '@storybook/react-vite';"
        );
        changed = true;
      }

      // Ensure autodocs tag is present
      if (
        !content.includes("tags: ['autodocs']") &&
        !content.includes('tags: ["autodocs"]')
      ) {
        // Try to insert it into the meta object
        // This is a simple regex replacement, might be brittle
        if (content.includes("const meta: Meta<typeof")) {
          // Look for component: ..., and add tags after it
          const regex = /(component:\s*[a-zA-Z0-9_]+,)/;
          if (regex.test(content)) {
            content = content.replace(regex, "$1\n  tags: ['autodocs'],");
            changed = true;
          }
        } else if (content.includes("const meta = {")) {
          const regex = /(component:\s*[a-zA-Z0-9_]+,)/;
          if (regex.test(content)) {
            content = content.replace(regex, "$1\n  tags: ['autodocs'],");
            changed = true;
          }
        }
      }

      if (changed) {
        console.log(`Updating ${filePath}`);
        fs.writeFileSync(filePath, content, "utf8");
        count++;
      }
    }
  });
  console.log(`Updated ${count} files.`);
}

main();
