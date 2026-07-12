import type { GuestState } from '../../models/guest';

export type GuestSessionWarning =
  | 'demo-storage-corrupted'
  | 'demo-storage-outdated'
  | 'demo-session-missing';

export interface GuestSessionSnapshot {
  guestState: GuestState;
  warning?: GuestSessionWarning;
}

export interface GuestSessionService {
  getCurrentGuestSession(): Promise<GuestSessionSnapshot>;
  clearCurrentGuestSession(): Promise<void>;
}
