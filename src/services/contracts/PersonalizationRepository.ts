import type { InvitationLanguage, PersonalizationProfile } from '../../models/personalization';

export interface PersonalizationRepository {
  getProfile(profileId: string, language: InvitationLanguage): Promise<PersonalizationProfile | undefined>;
}
