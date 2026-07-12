export const supportedThemeVariants = ['classic', 'garden', 'city-evening'] as const;
export type ThemeVariant = (typeof supportedThemeVariants)[number];

export const supportedEffectIds = ['soft-section-reveal', 'quiet-glow'] as const;
export type SupportedEffectId = (typeof supportedEffectIds)[number];

export type InvitationLanguage = 'en' | 'ro';

export interface PersonalizationProfile {
  id: string;
  greeting: string;
  welcomeMessage: string;
  selectedHomepageContentIds: string[];
  themeVariant: ThemeVariant;
  approvedEffectIds: SupportedEffectId[];
  language: InvitationLanguage;
  travelInfoTags: string[];
  invitationGroupNotes: string[];
}
