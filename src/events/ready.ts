import { Client, Events } from "discord.js";
import { EventModule } from "./types";

const readyEvent: EventModule<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  },
};

export default readyEvent;
