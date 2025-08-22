import interactionCreate from "./interactionCreate";
import ready from "./ready";

export const events = [ready, interactionCreate] as const;
export type AnyEvent = (typeof events)[number];
