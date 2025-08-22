import { config } from "../../config";
import {
  MediaRequestResponse,
  MediaType,
  SearchPaginatedResponse,
} from "./interfaces";

const searchEndpoint = config.OVERSEERR_API_ROOT + "/search";
const requestEndpoint = config.OVERSEERR_API_ROOT + "/request";

export async function search(query: string): Promise<SearchPaginatedResponse> {
  const response = await fetchWithApiKey(
    `${searchEndpoint}?query=${encodeURIComponent(query)}`,
  );
  return await response.json();
}

export async function createRequest(
  mediaType: MediaType,
  mediaId: number,
): Promise<MediaRequestResponse> {
  const response = await fetchWithApiKey(requestEndpoint, {
    method: "POST",
    body: JSON.stringify({ mediaType, mediaId }),
  });
  return await response.json();
}

async function fetchWithApiKey(
  url: string,
  options?: RequestInit,
): Promise<any> {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
      "X-Api-Key": config.OVERSEERR_API_KEY,
    },
  });
}
