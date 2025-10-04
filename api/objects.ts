
import { getUserIdFromRequest } from '../lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectStorageService, ObjectPermission, ObjectNotFoundError } from '../server/objectStorage';
// ...existing code...

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (req.method === 'GET') {
      // Serve uploaded images with authentication and ACL
      const objectStorageService = new ObjectStorageService();
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(req.url || '');
        const canAccess = await objectStorageService.canAccessObjectEntity({
          objectFile,
          userId,
          requestedPermission: ObjectPermission.READ,
        });
        if (!canAccess) {
          res.status(401).end();
          return;
        }
        // Get ACL policy and redirect using signed/public URL
        const aclPolicy = await import('../server/objectAcl').then(m => m.getObjectAclPolicy(objectFile));
        const isPublic = aclPolicy?.visibility === 'public';
        let redirectUrl: string | undefined;
        if (isPublic) {
          const { data } = (await import('../server/supabase')).supabaseAdmin.storage.from('shoot-images').getPublicUrl(objectFile);
          redirectUrl = data.publicUrl;
        } else {
          const { data, error } = (await import('../server/supabase')).supabaseAdmin.storage.from('shoot-images').createSignedUrl(objectFile, 3600);
          if (error || !data) {
            throw new Error(error?.message || 'Failed to create signed URL');
          }
          redirectUrl = data.signedUrl;
        }
        if (redirectUrl) {
          res.redirect(redirectUrl);
        } else {
          res.status(500).json({ error: 'Failed to generate redirect URL' });
        }
      } catch (error) {
        if (error instanceof ObjectNotFoundError) {
          res.status(404).end();
        } else {
          res.status(500).end();
        }
      }
      return;
    }
    if (req.method === 'POST' && req.url?.endsWith('/upload')) {
      // Get presigned URL for image upload
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.status(200).json({ uploadURL });
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
    res.status(500).json({ error: errMsg });
  }
}
