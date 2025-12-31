import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getSessionFromRequest } from '@/lib/auth/session';

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getSessionFromRequest(req);

      if (!session) throw new Error('Unauthorized');

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Profile image upload complete for userId:', metadata.userId);
      console.log('File URL:', file.ufsUrl);

      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;