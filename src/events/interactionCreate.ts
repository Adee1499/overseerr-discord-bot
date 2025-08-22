import { Events, Interaction } from "discord.js";
import { commands } from "../commands/utility";
import { EventModule } from "./types";

const interactionCreateEvent: EventModule<typeof Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) {
      return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(
        interaction as any,
      );
    }
  },
};

export default interactionCreateEvent;
