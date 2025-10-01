import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { InsertShootParticipant, ShootParticipant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shootId: string;
}

export function AddParticipantDialog({ open, onOpenChange, shootId }: AddParticipantDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const addParticipantMutation = useMutation({
    mutationFn: async (participant: Omit<InsertShootParticipant, 'shootId'>) => {
      const response = await apiRequest("POST", `/api/shoots/${shootId}/participants`, participant);
      return await response.json() as ShootParticipant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shootId, "participants"] });
      toast({
        title: "Participant added",
        description: "The participant has been added successfully.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add participant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setRole("");
    setEmail("");
  };

  const handleSubmit = () => {
    addParticipantMutation.mutate({
      name,
      role,
      email: email || null,
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-add-participant">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Add a model, photographer, or crew member to this shoot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-participant-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              placeholder="e.g., Cosplayer, Photographer, Makeup Artist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              data-testid="input-participant-role"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-participant-email"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !role || addParticipantMutation.isPending}
            data-testid="button-add-participant"
          >
            {addParticipantMutation.isPending ? "Adding..." : "Add Participant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
