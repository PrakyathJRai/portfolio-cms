import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/generated", { recursive: true });

cpSync("generated/prisma", "dist/generated/prisma", {
  recursive: true,
});

console.log("Prisma Client copied into dist/generated successfully.");