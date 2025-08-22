import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(config.DISCORD_TOKEN);
