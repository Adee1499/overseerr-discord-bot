import { REST, Routes } from "discord.js";
import { config } from "../config";
import { commands } from "./utility";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    console.log(
      `Started refreshing ${commandsData.length} application (/) commands for server: ${guildId}.`,
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(config.APP_ID, guildId),
      {
        body: commandsData,
      },
    )) as any[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands for server: ${guildId}.`,
    );
  } catch (error: any) {
    console.error(error);
  }
}
