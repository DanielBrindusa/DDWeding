export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface PhotoUploadMetadata {
  uploadId: string;
  invitationGroupId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  moderationStatus: ModerationStatus;
  publicDisplay: boolean;
  caption?: string;
  storageReference: string;
}

export interface PhotoUploadRequest {
  invitationGroupId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  caption?: string;
}

export interface PhotoUploadTicket {
  uploadId: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}
