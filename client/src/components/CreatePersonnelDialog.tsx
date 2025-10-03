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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useOptionalDialog } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { ImageUploadWithCrop } from "@/components/ImageUploadWithCrop";
import { InlineEdit } from "@/components/InlineEdit";
import type { Personnel } from "@shared/schema";

interface CreatePersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (personnel: any) => void;
  onSave?: (data: any) => Promise<any> | void;
  editItem?: Personnel;
}

export function CreatePersonnelDialog({
  open,
  onOpenChange,
  onSuccess,
  onSave,
  editItem,
}: CreatePersonnelDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setEmail(editItem.email || "");
      setPhone(editItem.phone || "");
      setNotes(editItem.notes || "");
      setImagePreview(editItem.avatarUrl || "");
      setImageFile(null);
    }
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/personnel", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create personnel");
      }
      return await response.json();
    },
    onSuccess: (newPersonnel) => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      toast({
        title: "Success",
        description: "Personnel added successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(newPersonnel);
      const dialog = useOptionalDialog();
      if (dialog) {
        dialog.setResult(newPersonnel);
        void dialog.triggerSubmit();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create personnel",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/personnel/${editItem!.id}`, {
        method: "PATCH",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update personnel");
      }
      return await response.json();
    },
    onSuccess: (updatedPersonnel) => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel", editItem!.id] });
      toast({
        title: "Success",
        description: "Personnel updated successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(updatedPersonnel);
      const dialog = useOptionalDialog();
      if (dialog) {
        dialog.setResult(updatedPersonnel);
        void dialog.triggerSubmit();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update personnel",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
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
    if (email.trim()) {
      formData.append("email", email.trim());
    }
    if (phone.trim()) {
      formData.append("phone", phone.trim());
    }
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }
    if (imageFile) {
      formData.append("avatar", imageFile);
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
      <DialogContent data-testid="dialog-create-personnel">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Person" : "Add New Person"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update person details" : "Create a new person to add to your team"}
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
              placeholder="e.g., John Doe"
              type="text"
              data-testid="input-personnel-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <InlineEdit
              value={email}
              onChange={setEmail}
              placeholder="e.g., john@example.com"
              type="email"
              data-testid="input-personnel-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <InlineEdit
              value={phone}
              onChange={setPhone}
              placeholder="e.g., +1 (555) 123-4567"
              type="text"
              data-testid="input-personnel-phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              data-testid="input-personnel-notes"
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
