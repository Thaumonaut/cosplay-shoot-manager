import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useOptionalDialog } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { ImageUploadWithCrop } from "@/components/ImageUploadWithCrop";
import { InlineEdit } from "@/components/InlineEdit";
import type { Prop } from "@shared/schema";

interface CreatePropsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (prop: any) => void;
  onSave?: (data: any) => Promise<any> | void;
  editItem?: Prop;
}

export function CreatePropsDialog({
  open,
  onOpenChange,
  onSuccess,
  onSave,
  editItem,
}: CreatePropsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dialog = useOptionalDialog();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setDescription(editItem.description || "");
      setAvailable(editItem.available ?? true);
      setImagePreview(editItem.imageUrl || "");
      setImageFile(null);
    }
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: async (form: FormData | { name: string; description?: string; available?: boolean; imageFile?: File | null }) => {
      let payload: any = {};
      if (form instanceof FormData) {
        for (const [k, v] of Array.from(form.entries())) {
          // map legacy key 'image' -> imageFile
          if (k === 'image') payload.imageFile = v as any;
          else payload[k] = v as any;
        }
      } else {
        payload = { ...form };
      }

      // normalise available
      if (typeof payload.available === 'string') {
        payload.available = payload.available === 'true';
      }

      // If an image file is supplied, upload directly to Supabase
      if (payload.imageFile instanceof File) {
        const file = payload.imageFile as File;
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').slice(0, 64);
        const filePath = `public/props/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('shoot-images')
          .upload(filePath, file, { cacheControl: 'public, max-age=31536000', upsert: false });

        if (uploadError) throw new Error(uploadError.message || 'Failed to upload image');

        const { data: publicUrlData } = supabase.storage.from('shoot-images').getPublicUrl(filePath);
        payload.imageUrl = publicUrlData.publicUrl;
        delete payload.imageFile;
      }

      const res = await apiRequest('POST', '/api/props', payload);
      return await res.json();
    },
    onSuccess: (newProp) => {
      queryClient.invalidateQueries({ queryKey: ["/api/props"] });
      toast({
        title: "Success",
        description: "Prop added successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(newProp);
      if (onSave) {
        try {
          void Promise.resolve(onSave(newProp));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('CreatePropsDialog: onSave handler failed', e);
        }
      }
      if (dialog) {
        dialog.setResult(newProp);
        void dialog.triggerSubmit();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prop",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (form: FormData | { name?: string; description?: string; available?: boolean; imageFile?: File | null }) => {
      let payload: any = {};
      if (form instanceof FormData) {
        for (const [k, v] of Array.from(form.entries())) {
          if (k === 'image') payload.imageFile = v as any;
          else payload[k] = v as any;
        }
      } else {
        payload = { ...form };
      }

      if (typeof payload.available === 'string') {
        payload.available = payload.available === 'true';
      }

      if (payload.imageFile instanceof File) {
        const file = payload.imageFile as File;
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').slice(0, 64);
        const filePath = `public/props/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('shoot-images')
          .upload(filePath, file, { cacheControl: 'public, max-age=31536000', upsert: false });

        if (uploadError) throw new Error(uploadError.message || 'Failed to upload image');

        const { data: publicUrlData } = supabase.storage.from('shoot-images').getPublicUrl(filePath);
        payload.imageUrl = publicUrlData.publicUrl;
        delete payload.imageFile;
      }

      const res = await apiRequest('PATCH', `/api/props/${editItem!.id}`, payload);
      return await res.json();
    },
    onSuccess: (updatedProp) => {
      queryClient.invalidateQueries({ queryKey: ["/api/props"] });
      queryClient.invalidateQueries({ queryKey: ["/api/props", editItem!.id] });
      toast({
        title: "Success",
        description: "Prop updated successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(updatedProp);
      if (onSave) {
        try {
          void Promise.resolve(onSave(updatedProp));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('CreatePropsDialog: onSave handler failed', e);
        }
      }
      if (dialog) {
        dialog.setResult(updatedProp);
        void dialog.triggerSubmit();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update prop",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setAvailable(true);
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    formData.append("available", available.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editItem) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} onSave={onSave}>
      <DialogContent data-testid="dialog-create-props">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Prop" : "Add New Prop"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update prop details" : "Add a new prop to your collection"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploadWithCrop
            value={imagePreview}
            onChange={(file, preview) => {
              setImageFile(file);
              setImagePreview(preview);
            }}
            aspect={1}
          />

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <InlineEdit
              value={name}
              onChange={setName}
              autoFocus={true}
              placeholder="e.g., Sword of Destiny"
              type="text"
              data-testid="input-props-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <InlineEdit
              value={description}
              onChange={setDescription}
              placeholder="Additional details..."
              type="text"
              data-testid="input-props-description"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="available">Available</Label>
            <Switch
              id="available"
              checked={available}
              onCheckedChange={setAvailable}
              data-testid="switch-props-available"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              {editItem
                ? (updateMutation.isPending ? "Updating..." : "Update")
                : (createMutation.isPending ? "Creating..." : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
