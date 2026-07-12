import type { GuestAccessService } from './GuestAccessService';
import type { GuestSessionService } from './GuestSessionService';
import type { MediaRepository } from './MediaRepository';
import type { PersonalizationRepository } from './PersonalizationRepository';
import type { QuestionnaireRepository } from './QuestionnaireRepository';
import type { RsvpRepository } from './RsvpRepository';
import type { WeddingContentRepository } from './WeddingContentRepository';

export interface GuestServices {
  guestAccess: GuestAccessService;
  guestSession: GuestSessionService;
  rsvpRepository: RsvpRepository;
  questionnaireRepository: QuestionnaireRepository;
  personalizationRepository: PersonalizationRepository;
  weddingContentRepository: WeddingContentRepository;
  mediaRepository: MediaRepository;
}
