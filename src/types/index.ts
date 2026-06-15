export type SocialProvider = "google" | "github";

export type EnabledProviders = Record<SocialProvider, boolean>;

export interface HistoryEntry {
  expr: string;
  value: string;
}
