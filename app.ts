import "dotenv/config";
import express from "express";
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from "discord-interactions";
import { DiscordRequest } from "./utils.ts";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY!),
  async function (req, res) {
    // Interaction id, type and data
    const { id, type, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name, options } = data;

      // "test" command
      if (name === "test") {
        const query = options[0].value;
        const searchEndpoint = process.env.OVERSSERR_API_ROOT + "/search";
        const headers = {
          "X-Api-Key": process.env.OVERSEERR_API_KEY,
        };
        const response = await fetch(`${searchEndpoint}?query=${query}`, {
          headers,
        });
        const searchResults = await response.json();
        const firstResult = searchResults.results[0];
        const firstResultString = `${firstResult.title} (${firstResult.releaseDate.substring(0, 4)}) - https://www.themoviedb.org/movie/${firstResult.id}`;
        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: firstResultString,
            embeds: [
              {
                title: firstResult.title,
                description: firstResult.overview,
                url: `https://www.themoviedb.org/movie/${firstResult.id}`,
                thumbnail: {
                  url: `https://image.tmdb.org/t/p/w300_and_h450_face/${firstResult.posterPath}`,
                  height: 450,
                  width: 300,
                },
                fields: [
                  {
                    name: "Release date",
                    value: firstResult.releaseDate,
                    inline: true,
                  },
                ],
              },
            ],
            components: [
              {
                type: 1, // Action Row
                components: [
                  {
                    type: 2, // Button
                    style: 1, // Primary
                    label: "Request this",
                    custom_id: `request_${firstResult.id}`,
                  },
                ],
              },
            ],
          },
        });
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: "unknown command" });
    }

    console.error("unknown interaction type", type);
    return res.status(400).json({ error: "unknown interaction type" });
  },
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
