import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InsertShootParticipant, ShootParticipant, Personnel } from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shootId: string;
}

export function AddParticipantDialog({ open, onOpenChange, shootId }: AddParticipantDialogProps) {
  const { toast } = useToast();
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>("");
  const [role, setRole] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Fields for creating new personnel
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
    enabled: open,
  });

  const createPersonnelMutation = useMutation({
    mutationFn: async (data: { name: string; email?: string; phone?: string; notes?: string }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.notes) formData.append("notes", data.notes);

      const res = await fetch("/api/personnel", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return await res.json() as Personnel;
    },
  });

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
    setSelectedPersonnelId("");
    setRole("");
    setIsCreatingNew(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewNotes("");
  };

  const handleSubmit = async () => {
    if (isCreatingNew) {
      // Create new personnel first, then add as participant
      try {
        const newPersonnel = await createPersonnelMutation.mutateAsync({
          name: newName,
          email: newEmail || undefined,
          phone: newPhone || undefined,
          notes: newNotes || undefined,
        });

        // Invalidate personnel list to show new person
        queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });

        // Add as participant with the new personnelId
        addParticipantMutation.mutate({
          personnelId: newPersonnel.id,
          name: newPersonnel.name,
          role,
          email: newPersonnel.email || null,
        } as any);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create personnel. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Use selected personnel
      const selected = personnel.find(p => p.id === selectedPersonnelId);
      if (!selected) return;

      addParticipantMutation.mutate({
        personnelId: selected.id,
        name: selected.name,
        role,
        email: selected.email || null,
      } as any);
    }
  };

  const isFormValid = isCreatingNew 
    ? newName && role 
    : selectedPersonnelId && role;

  const isLoading = addParticipantMutation.isPending || createPersonnelMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-add-participant" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Select an existing contact or create a new one, then assign their role for this shoot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isCreatingNew ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="personnel">Select Person *</Label>
                <Select value={selectedPersonnelId} onValueChange={(value) => {
                  if (value === "CREATE_NEW") {
                    setIsCreatingNew(true);
                    setSelectedPersonnelId("");
                  } else {
                    setSelectedPersonnelId(value);
                  }
                }}>
                  <SelectTrigger data-testid="select-personnel">
                    <SelectValue placeholder="Choose a person..." />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={person.id} data-testid={`select-personnel-${person.id}`}>
                        {person.name} {person.email && `(${person.email})`}
                      </SelectItem>
                    ))}
                    <SelectItem value="CREATE_NEW" data-testid="select-create-new-personnel">
                      + Create New Person
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role for this Shoot *</Label>
                <Input
                  id="role"
                  placeholder="e.g., Cosplayer, Photographer, Makeup Artist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  data-testid="input-participant-role"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Create New Person</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewName("");
                    setNewEmail("");
                    setNewPhone("");
                    setNewNotes("");
                  }}
                  data-testid="button-back-to-select"
                >
                  Back to Select
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-name">Name *</Label>
                <Input
                  id="new-name"
                  placeholder="e.g., John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-testid="input-new-personnel-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">Email (Optional)</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="e.g., john@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  data-testid="input-new-personnel-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-phone">Phone (Optional)</Label>
                <Input
                  id="new-phone"
                  type="tel"
                  placeholder="e.g., +1 (555) 123-4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  data-testid="input-new-personnel-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-notes">Notes (Optional)</Label>
                <Textarea
                  id="new-notes"
                  placeholder="Additional information..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  data-testid="input-new-personnel-notes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role for this Shoot *</Label>
                <Input
                  id="role"
                  placeholder="e.g., Cosplayer, Photographer, Makeup Artist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  data-testid="input-participant-role"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            data-testid="button-add-participant"
          >
            {isLoading ? "Adding..." : isCreatingNew ? "Create & Add" : "Add Participant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
