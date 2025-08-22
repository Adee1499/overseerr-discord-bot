export interface SearchPaginatedResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Results[];
}

export type MediaType = "tv" | "movie" | "person" | "collection";

export interface Media {
  tmdbId: number;
}

interface SearchResult {
  id: number;
  mediaType: MediaType;
  popularity: number;
  posterPath?: string;
  overview: string;
}

export interface MovieResult extends SearchResult {
  mediaType: "movie";
  title: string;
  originalTitle: string;
  releaseDate: string;
  mediaInfo?: Media;
}

export interface TvResult extends SearchResult {
  mediaType: "tv";
  name: string;
  originalName: string;
  firstAirDate: string;
}

export type Results = MovieResult | TvResult;

export interface MediaRequestBody {
  mediaType: MediaType;
  mediaId: number;
}

export enum MediaStatus {
  UNKNOWN = 1,
  PENDING,
  PROCESSING,
  PARTIALLY_AVAILABLE,
  AVAILABLE,
  DELETED,
}

export interface MediaRequestMedia {
  status: MediaStatus;
  mediaAddedAt: Date;
  plexUrl: string;
}

export interface MediaRequestResponse {
  media: MediaRequestMedia;
}
