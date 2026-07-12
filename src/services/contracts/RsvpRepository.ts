import type { RsvpResponse } from '../../models/rsvp';

export interface RsvpRepository {
  submitResponse(response: RsvpResponse): Promise<void>;
}
