import type { HomeJourneyEntry, WeddingContentPage } from '../../models/weddingContent';

export interface WeddingContentRepository {
  getHomeJourneyEntries(): Promise<HomeJourneyEntry[]>;
  getContentPage(id: string): Promise<WeddingContentPage | undefined>;
}
