import { InteractionResponseType, InteractionType } from "discord-interactions";

type AnyInteraction = {
  id: string;
  type: InteractionType;
  data?: any;
};

export async function handleInteraction(body: AnyInteraction) {
  const { id, type, data } = body;

  if (type === InteractionType.PING) {
    return { type: InteractionResponseType.PONG };
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    if (name === "test") {
      const query = options?.find((o: any) => o.name === "query")?.value;
      if (!query) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "Missing required option: query" },
        };
      }

      const searchEndpoint = `${process.env.OVERSEERR_API_ROOT}/search`;
      const headers = { "X-Api-Key": process.env.OVERSEERR_API_KEY || "" };

      const response = await fetch(
        `${searchEndpoint}?query=${encodeURIComponent(query)}`,
        { headers },
      );
      const searchResults = await response.json();

      if (!searchResults?.results?.length) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `No results for "${query}"` },
        };
      }

      const firstResult = searchResults.results[0];
      const year = firstResult.releaseDate?.substring(0, 4) ?? "-";
      const tmdbUrl = `https://www.themoviedb.org/movie/${firstResult.id}`;
      const firstResultString = `${firstResult.title} (${year}) - ${tmdbUrl}`;

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: firstResultString,
          embeds: [
            {
              title: firstResult.title,
              description: firstResult.overview,
              url: tmdbUrl,
              thumbnail: {
                url: `https://image.tmdb.org/t/p/w300_and_h450_face/${firstResult.posterPath}`,
                height: 450,
                width: 300,
              },
              fields: [
                {
                  name: "Release date",
                  value: firstResult.releaseDate ?? "Unknown",
                  inline: true,
                },
              ],
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "Request this",
                  custom_id: `request_${firstResult.id}`,
                },
              ],
            },
          ],
        },
      };
    }

    return { error: `unknown command: ${name}` };
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const customId = data?.custom_id as string;
    if (customId?.startsWith("request_")) {
      const id = customId.split("_")[1];
      // TODO: Call Overseerr API here to make a Request
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Requested item ${id} on Overseerr.` },
      };
    }
  }

  return { error: `unknown interaction type ${type}` };
}
