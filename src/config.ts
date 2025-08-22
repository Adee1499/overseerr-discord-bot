import "dotenv/config";

const REQUIRED_ENV = [
  "DISCORD_TOKEN",
  "APP_ID",
  "PUBLIC_KEY",
  "OVERSEERR_API_KEY",
  "OVERSEERR_API_ROOT",
] as const;

REQUIRED_ENV.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

export const config = {
  DISCORD_TOKEN: process.env["DISCORD_TOKEN"]!,
  APP_ID: process.env["APP_ID"]!,
  PUBLIC_KEY: process.env["PUBLIC_KEY"]!,
  OVERSEERR_API_KEY: process.env["OVERSEERR_API_KEY"]!,
  OVERSEERR_API_ROOT: process.env["OVERSEERR_API_ROOT"]!,
} as const;
