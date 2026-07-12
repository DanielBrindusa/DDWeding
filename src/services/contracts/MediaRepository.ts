import type { PhotoUploadMetadata, PhotoUploadRequest, PhotoUploadTicket } from '../../models/media';

export interface MediaRepository {
  requestPhotoUpload(request: PhotoUploadRequest): Promise<PhotoUploadTicket>;
  listApprovedPhotos(invitationGroupId: string): Promise<PhotoUploadMetadata[]>;
}
