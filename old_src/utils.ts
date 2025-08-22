import type { APIApplicationCommand } from "discord-api-types/v10";
import "dotenv/config";

export async function DiscordRequest(
  endpoint: string,
  options: RequestInit,
): Promise<Response> {
  const url = "https://discord.com/api/v10/" + endpoint;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "OverseerrDiscordBot (https://github.com/adee1499/overseerr-discord-bot, 1.0.0)",
    },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }

  return res;
}

export async function InstallGlobalCommands(
  appId: string,
  commands: APIApplicationCommand[],
): Promise<void> {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(commands),
    });
  } catch (err) {
    console.error(err);
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
