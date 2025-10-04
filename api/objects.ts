
import { getUserIdFromRequest } from '../lib/auth';
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
        objectStorageService.downloadObject(objectFile, res);
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
