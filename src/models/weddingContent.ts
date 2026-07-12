export type WeddingContentStatus = 'available' | 'foundation';

export interface HomeJourneyEntry {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  route: string;
  status: WeddingContentStatus;
  accent: 'rose' | 'sage' | 'gold' | 'ink';
}

export interface WeddingContentPage {
  id: string;
  title: string;
  summary: string;
  status: WeddingContentStatus;
}
