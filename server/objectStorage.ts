import { Response } from "express";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const BUCKET_NAME = "shoot-images";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized. SUPABASE_SERVICE_ROLE_KEY is required.");
    }
  }

  getPublicObjectSearchPaths(): Array<string> {
    return ["public"];
  }

  getPrivateObjectDir(): string {
    return ".private";
  }

  async searchPublicObject(filePath: string): Promise<string | null> {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      try {
        const { data, error } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .list(searchPath, {
            search: filePath,
            limit: 1,
          });

        if (!error && data && data.length > 0) {
          return fullPath;
        }
      } catch (error) {
        console.error(`Error searching for file in ${searchPath}:`, error);
      }
    }

    return null;
  }

  async downloadObject(filePath: string, res: Response, cacheTtlSec: number = 3600) {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    try {
      const aclPolicy = await getObjectAclPolicy(filePath);
      const isPublic = aclPolicy?.visibility === "public";

      if (isPublic) {
        const { data } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        
        res.redirect(data.publicUrl);
      } else {
        const { data, error } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .createSignedUrl(filePath, cacheTtlSec);

        if (error || !data) {
          throw new Error(error?.message || "Failed to create signed URL");
        }

        res.redirect(data.signedUrl);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const objectPath = `${privateObjectDir}/uploads/${objectId}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      throw new Error(error?.message || "Failed to create signed upload URL");
    }

    return data.signedUrl;
  }

  async getObjectEntityFile(objectPath: string): Promise<string> {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;

    const pathParts = objectEntityPath.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const folder = pathParts.slice(0, -1).join("/");

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(folder, {
        search: fileName,
        limit: 1,
      });

    if (error || !data || data.length === 0) {
      throw new ObjectNotFoundError();
    }

    return objectEntityPath;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const supabaseUrlPattern = new RegExp(
      `^https://[^/]+/storage/v1/object/public/${BUCKET_NAME}/`
    );
    
    if (!supabaseUrlPattern.test(rawPath)) {
      return rawPath;
    }
  
    const url = new URL(rawPath);
    const pathParts = url.pathname.split('/');
    const objectIndex = pathParts.findIndex(p => p === 'object');
    
    if (objectIndex === -1 || objectIndex + 2 >= pathParts.length) {
      return rawPath;
    }

    const rawObjectPath = '/' + pathParts.slice(objectIndex + 3).join('/');
  
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
  
    if (!rawObjectPath.startsWith('/' + objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length + 1);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: string;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}
