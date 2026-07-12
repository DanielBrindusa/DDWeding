export type AttendanceDecision = 'accept' | 'decline';

export interface RsvpResponse {
  invitationGroupId: string;
  decision: AttendanceDecision;
  submittedAt: string;
  schemaVersion: 1;
}
