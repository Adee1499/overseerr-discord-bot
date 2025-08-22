import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { createRequest, search } from "../../api/overseerr";
import {
  MediaStatus,
  MediaType,
  Results,
} from "../../api/overseerr/interfaces";

const QUERY_PARAM = "query";
const PREVIOUS_LABEL = "◀️ Previous page";
const NEXT_LABEL = "Next page ▶️";
const PAGE_SIZE = 5;

export const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search for movies or TV shows")
  .addStringOption((option) =>
    option
      .setName(QUERY_PARAM)
      .setDescription("The search query")
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const query = interaction.options.getString(QUERY_PARAM)!;
  const searchResults = await search(query);

  const relevantResults: Results[] = searchResults.results
    .filter((r) => r.mediaType === "movie" || r.mediaType === "tv")
    .sort((a, b) => b.popularity - a.popularity);

  if (!relevantResults.length)
    return interaction.reply({ content: "No results found", ephemeral: true });

  const allEmbeds = relevantResults.map((result, i) => {
    const isMovie = result.mediaType === "movie";
    const colour = isMovie ? 0x01c7f9 : 0xfdc02e;
    const title = isMovie ? result.title : result.name;
    const description = result.overview || "No description";
    const url = `https://www.themoviedb.org/${isMovie ? "movie" : "tv"}/${result.id}`;
    const thumbnailUrl = `https://image.tmdb.org/t/p/w300_and_h450_face/${result.posterPath}`;
    const releaseDate = isMovie ? result.releaseDate : result.firstAirDate;
    return new EmbedBuilder()
      .setColor(colour)
      .setTitle(title)
      .setDescription(description)
      .setURL(url)
      .setThumbnail(thumbnailUrl)
      .addFields([
        {
          name: "Popularity",
          value: result.popularity.toString(),
          inline: true,
        },
        {
          name: "Release date",
          value: releaseDate ?? "Unknown",
          inline: true,
        },
      ]);
  });

  const pages: EmbedBuilder[][] = [];
  for (let i = 0; i < allEmbeds.length; i += PAGE_SIZE) {
    pages.push(allEmbeds.slice(i, i + PAGE_SIZE));
  }

  let page = 0;
  const nonce = `${Date.now().toString(36)}_${interaction.id}`;

  function pageBounds() {
    return {
      start: page * PAGE_SIZE,
      end: Math.min((page + 1) * PAGE_SIZE, relevantResults.length),
    };
  }

  function renderContent() {
    return `Found ${relevantResults.length} results for "${query}" - showing page ${page + 1}/${pages.length}`;
  }

  function buildPaginationRow() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`prev_${nonce}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel(PREVIOUS_LABEL)
        .setDisabled(page <= 0),
      new ButtonBuilder()
        .setCustomId(`next_${nonce}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel(NEXT_LABEL)
        .setDisabled(page >= pages.length - 1),
    );
  }

  function buildRequestsRow() {
    const { start, end } = pageBounds();
    const buttons = relevantResults.slice(start, end).map((r) =>
      new ButtonBuilder()
        .setCustomId(`request_${r.mediaType}_${r.id}_${nonce}`)
        .setLabel((r.mediaType === "movie" ? r.title : r.name).slice(0, 80))
        .setStyle(ButtonStyle.Success),
    );
    return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
  }

  const message = await interaction.reply({
    content: renderContent(),
    embeds: pages[page],
    components: [buildPaginationRow(), buildRequestsRow()],
    withResponse: true,
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 5 * 60 * 1000,
    filter: (i) =>
      i.user.id === interaction.user.id &&
      (i.customId.startsWith("request") ||
        i.customId === `prev_${nonce}` ||
        i.customId === `next_${nonce}`),
  });

  collector?.on("collect", async (i) => {
    try {
      if (i.customId.startsWith("request")) {
        const [_, mediaType, id] = i.customId.split("_");
        const mediaId = Number.parseInt(id);
        const requestResponse = await createRequest(
          mediaType as MediaType,
          mediaId,
        );

        const requestedResult = relevantResults.find(
          (r) => r.mediaType === mediaType && r.id === mediaId,
        );
        const title =
          requestedResult?.mediaType === "movie"
            ? requestedResult?.title
            : requestedResult?.name;

        if (
          requestResponse.media.status === MediaStatus.AVAILABLE ||
          requestResponse.media.status === MediaStatus.PARTIALLY_AVAILABLE
        ) {
          await i.update({
            content: `${title} is already available on AdeePlex! Watch it here: ${requestResponse.media.plexUrl}`,
            embeds: [],
            components: [],
          });
        } else {
          await i.update({
            content: `Requested ${title}`,
            embeds: [],
            components: [],
          });
        }

        collector.stop();
        return;
      }

      if (i.customId === `prev_${nonce}`) {
        page = Math.max(0, page - 1);
      } else {
        page = Math.min(pages.length - 1, page + 1);
      }

      await i.update({
        content: renderContent(),
        embeds: pages[page],
        components: [buildPaginationRow(), buildRequestsRow()],
      });
    } catch {}
  });

  collector?.on("end", async () => {
    try {
      await message.resource?.message?.edit({ components: [] });
    } catch {}
  });
}
