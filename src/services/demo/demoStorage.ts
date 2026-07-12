import type { AttendanceQuestionnaireResponse } from '../../models/questionnaire';
import type { RsvpResponse } from '../../models/rsvp';
import type { GuestSessionWarning } from '../contracts/GuestSessionService';

export const DEMO_STORAGE_KEY = 'ddweding.demo-session.v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DemoStoredGroupState {
  rsvpResponse?: RsvpResponse;
  questionnaireResponse?: AttendanceQuestionnaireResponse;
}

export interface DemoStoredSession {
  schemaVersion: 1;
  activeGroupId?: string;
  groups: Record<string, DemoStoredGroupState>;
  updatedAt: string;
}

export type DemoStorageReadResult =
  | {
      kind: 'valid';
      session: DemoStoredSession;
    }
  | {
      kind: 'missing';
      session: DemoStoredSession;
    }
  | {
      kind: 'reset';
      session: DemoStoredSession;
      warning: GuestSessionWarning;
    };

const emptySession = (): DemoStoredSession => ({
  schemaVersion: 1,
  groups: {},
  updatedAt: new Date().toISOString(),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRsvpResponse = (value: unknown): value is RsvpResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaVersion === 1 &&
    typeof value.invitationGroupId === 'string' &&
    typeof value.submittedAt === 'string' &&
    (value.decision === 'accept' || value.decision === 'decline')
  );
};

const isQuestionnaireResponse = (value: unknown): value is AttendanceQuestionnaireResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaVersion === 1 &&
    typeof value.invitationGroupId === 'string' &&
    typeof value.completedAt === 'string' &&
    Array.isArray(value.attendingInvitedPersonIds) &&
    Array.isArray(value.additionalGuests) &&
    Array.isArray(value.attendeeDetails) &&
    typeof value.adultCount === 'number' &&
    typeof value.childCount === 'number' &&
    typeof value.vegetarianCount === 'number' &&
    typeof value.veganCount === 'number' &&
    isRecord(value.transportation) &&
    typeof value.transportation.required === 'boolean' &&
    typeof value.transportation.seatsRequired === 'number' &&
    isRecord(value.babyChairs) &&
    typeof value.babyChairs.required === 'boolean' &&
    typeof value.babyChairs.count === 'number'
  );
};

const isStoredGroupState = (value: unknown): value is DemoStoredGroupState => {
  if (!isRecord(value)) {
    return false;
  }

  const rsvp = value.rsvpResponse;
  const questionnaire = value.questionnaireResponse;

  if (rsvp !== undefined && !isRsvpResponse(rsvp)) {
    return false;
  }

  if (questionnaire !== undefined && !isQuestionnaireResponse(questionnaire)) {
    return false;
  }

  return true;
};

const isDemoStoredSession = (value: unknown): value is DemoStoredSession => {
  if (!isRecord(value)) {
    return false;
  }

  if (value.schemaVersion !== 1) {
    return false;
  }

  if (value.activeGroupId !== undefined && typeof value.activeGroupId !== 'string') {
    return false;
  }

  if (!isRecord(value.groups)) {
    return false;
  }

  if (typeof value.updatedAt !== 'string') {
    return false;
  }

  return Object.values(value.groups).every(isStoredGroupState);
};

export class DemoStorage {
  constructor(
    private readonly storage: StorageLike,
    private readonly key = DEMO_STORAGE_KEY,
  ) {}

  read(): DemoStorageReadResult {
    const raw = this.storage.getItem(this.key);

    if (!raw) {
      return { kind: 'missing', session: emptySession() };
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isRecord(parsed)) {
        this.clear();
        return {
          kind: 'reset',
          session: emptySession(),
          warning: 'demo-storage-corrupted',
        };
      }

      if (parsed.schemaVersion !== 1) {
        this.clear();
        return {
          kind: 'reset',
          session: emptySession(),
          warning: 'demo-storage-outdated',
        };
      }

      if (!isDemoStoredSession(parsed)) {
        this.clear();
        return {
          kind: 'reset',
          session: emptySession(),
          warning: 'demo-storage-corrupted',
        };
      }

      return { kind: 'valid', session: parsed };
    } catch {
      this.clear();
      return {
        kind: 'reset',
        session: emptySession(),
        warning: 'demo-storage-corrupted',
      };
    }
  }

  write(session: DemoStoredSession): void {
    this.storage.setItem(
      this.key,
      JSON.stringify({
        ...session,
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  update(updater: (session: DemoStoredSession) => DemoStoredSession): void {
    const current = this.read().session;
    this.write(updater(current));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
