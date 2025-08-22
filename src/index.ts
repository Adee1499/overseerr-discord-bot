import { Client, Events, GatewayIntentBits, Guild, Partials } from "discord.js";
import { deployCommands } from "./commands/deploy";
import { config } from "./config";
import { AnyEvent, events } from "./events";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

function bindEvent<E extends AnyEvent>(event: E) {
  if (event.once) {
    client.once(event.name, (...args: any[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any[]) => event.execute(...args));
  }
}

events.forEach(bindEvent);

client.on(Events.GuildCreate, async (guild: Guild) => {
  await deployCommands({ guildId: guild.id });
});

client.login(config.DISCORD_TOKEN);
