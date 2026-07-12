import type { GuestState } from '../../models/guest';

export interface DemoAccessOption {
  label: string;
  description: string;
  accessToken: string;
}

export interface GuestAccessService {
  identifyByAccessToken(accessToken: string): Promise<GuestState>;
  listDemoAccessOptions(): Promise<DemoAccessOption[]>;
}
