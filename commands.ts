import "dotenv/config";
import { InstallGlobalCommands } from "./utils.ts";
import type { APIApplicationCommand } from "discord-api-types/v10";

const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  options: [
    {
      type: 3,
      name: "query",
      description: "What are you looking for?",
      required: true,
    },
  ],
};

const ALL_COMMANDS = [TEST_COMMAND];

InstallGlobalCommands(
  process.env.APP_ID!,
  ALL_COMMANDS as APIApplicationCommand[],
);
