import type { InvitationGroup } from '../../models/guest';
import { deriveGuestState } from '../../models/guest';
import type { PhotoUploadMetadata, PhotoUploadTicket } from '../../models/media';
import type { AttendanceQuestionnaireResponse } from '../../models/questionnaire';
import type { RsvpResponse } from '../../models/rsvp';
import type { GuestAccessService } from '../contracts/GuestAccessService';
import type { GuestServices } from '../contracts/GuestServices';
import type { GuestSessionService } from '../contracts/GuestSessionService';
import type { MediaRepository } from '../contracts/MediaRepository';
import type { PersonalizationRepository } from '../contracts/PersonalizationRepository';
import type { QuestionnaireRepository } from '../contracts/QuestionnaireRepository';
import type { RsvpRepository } from '../contracts/RsvpRepository';
import type { WeddingContentRepository } from '../contracts/WeddingContentRepository';
import {
  demoAccessOptions,
  demoContentPages,
  demoHomeJourneyEntries,
  demoInvitationGroups,
  demoPersonalizationProfiles,
  demoTokenToGroupId,
} from './demoFixtures';
import { DemoStorage, type StorageLike } from './demoStorage';

const cloneGroup = (group: InvitationGroup): InvitationGroup => ({
  ...group,
  invitedPeople: group.invitedPeople.map((person) => ({ ...person })),
  progress: { ...group.progress },
});

const normalizeAccessToken = (accessToken: string) => accessToken.trim().toUpperCase();

const getGroupFromSession = (storage: DemoStorage, groupId: string | undefined): InvitationGroup | undefined => {
  if (!groupId) {
    return undefined;
  }

  const fixture = demoInvitationGroups[groupId];

  if (!fixture) {
    return undefined;
  }

  const group = cloneGroup(fixture);
  const storedGroup = storage.read().session.groups[groupId];

  if (!storedGroup?.rsvpResponse) {
    return group;
  }

  if (storedGroup.rsvpResponse.decision === 'decline') {
    return {
      ...group,
      progress: {
        rsvp: 'declined',
        questionnaire: 'not-applicable',
      },
    };
  }

  return {
    ...group,
    progress: {
      rsvp: 'accepted',
      questionnaire: storedGroup.questionnaireResponse ? 'completed' : 'incomplete',
    },
  };
};

class DemoGuestAccessService implements GuestAccessService {
  constructor(private readonly storage: DemoStorage) {}

  async identifyByAccessToken(accessToken: string) {
    const groupId = demoTokenToGroupId[normalizeAccessToken(accessToken)];

    if (!groupId) {
      throw new Error('invalid-demo-access');
    }

    this.storage.update((session) => ({
      ...session,
      activeGroupId: groupId,
      groups: {
        ...session.groups,
        [groupId]: session.groups[groupId] ?? {},
      },
    }));

    const group = getGroupFromSession(this.storage, groupId);
    const profile = group
      ? demoPersonalizationProfiles[group.personalizationProfileId]
      : undefined;

    return deriveGuestState(group, profile);
  }

  async listDemoAccessOptions() {
    return demoAccessOptions.map((option) => ({ ...option }));
  }
}

class DemoGuestSessionService implements GuestSessionService {
  constructor(private readonly storage: DemoStorage) {}

  async getCurrentGuestSession() {
    const result = this.storage.read();
    const group = getGroupFromSession(this.storage, result.session.activeGroupId);
    const profile = group
      ? demoPersonalizationProfiles[group.personalizationProfileId]
      : undefined;

    return {
      guestState: deriveGuestState(group, profile),
      warning: result.kind === 'reset' ? result.warning : undefined,
    };
  }

  async clearCurrentGuestSession() {
    this.storage.clear();
  }
}

class DemoRsvpRepository implements RsvpRepository {
  constructor(private readonly storage: DemoStorage) {}

  async submitResponse(response: RsvpResponse) {
    this.storage.update((session) => {
      const previousGroup = session.groups[response.invitationGroupId] ?? {};
      const nextGroup =
        response.decision === 'decline'
          ? { rsvpResponse: response }
          : {
              ...previousGroup,
              rsvpResponse: response,
              questionnaireResponse: undefined,
            };

      return {
        ...session,
        activeGroupId: response.invitationGroupId,
        groups: {
          ...session.groups,
          [response.invitationGroupId]: nextGroup,
        },
      };
    });
  }
}

class DemoQuestionnaireRepository implements QuestionnaireRepository {
  constructor(private readonly storage: DemoStorage) {}

  async submitQuestionnaire(response: AttendanceQuestionnaireResponse) {
    this.storage.update((session) => ({
      ...session,
      activeGroupId: response.invitationGroupId,
      groups: {
        ...session.groups,
        [response.invitationGroupId]: {
          ...(session.groups[response.invitationGroupId] ?? {}),
          questionnaireResponse: response,
        },
      },
    }));
  }
}

class DemoPersonalizationRepository implements PersonalizationRepository {
  async getProfile(profileId: string) {
    const profile = demoPersonalizationProfiles[profileId];
    return profile ? { ...profile } : undefined;
  }
}

class DemoWeddingContentRepository implements WeddingContentRepository {
  async getHomeJourneyEntries() {
    return demoHomeJourneyEntries.map((entry) => ({ ...entry }));
  }

  async getContentPage(id: string) {
    const page = demoContentPages[id];
    return page ? { ...page } : undefined;
  }
}

class DemoMediaRepository implements MediaRepository {
  async requestPhotoUpload(): Promise<PhotoUploadTicket> {
    throw new Error('photo-upload-not-configured');
  }

  async listApprovedPhotos(): Promise<PhotoUploadMetadata[]> {
    return [];
  }
}

export function createDemoServices(storageLike?: StorageLike): GuestServices {
  const resolvedStorage =
    storageLike ??
    (typeof window !== 'undefined'
      ? window.localStorage
      : {
          getItem: () => null,
          setItem: () => undefined,
          removeItem: () => undefined,
        });

  const storage = new DemoStorage(resolvedStorage);

  return {
    guestAccess: new DemoGuestAccessService(storage),
    guestSession: new DemoGuestSessionService(storage),
    rsvpRepository: new DemoRsvpRepository(storage),
    questionnaireRepository: new DemoQuestionnaireRepository(storage),
    personalizationRepository: new DemoPersonalizationRepository(),
    weddingContentRepository: new DemoWeddingContentRepository(),
    mediaRepository: new DemoMediaRepository(),
  };
}
