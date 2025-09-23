import { readFileSync } from "fs";

export const SYSTEM_PROMPT = readFileSync(
    "./prompts/SYSTEM_PROMPT.md",
    "utf-8",
);
