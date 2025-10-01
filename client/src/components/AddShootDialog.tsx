import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { InsertShoot, Shoot } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddShootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddShootDialog({ open, onOpenChange }: AddShootDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>("idea");
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [instagramLinks, setInstagramLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");

  const createShootMutation = useMutation({
    mutationFn: async (shoot: InsertShoot) => {
      const response = await apiRequest("POST", "/api/shoots", shoot);
      return await response.json() as Shoot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      toast({
        title: "Shoot created",
        description: "Your photo shoot has been added successfully.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create shoot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setStatus("idea");
    setDate(undefined);
    setLocation("");
    setNotes("");
    setInstagramLinks([]);
  };

  const handleAddLink = () => {
    if (currentLink && currentLink.includes('instagram.com')) {
      setInstagramLinks([...instagramLinks, currentLink]);
      setCurrentLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setInstagramLinks(instagramLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const shoot = {
      title,
      status,
      date: date ? date.toISOString() : null,
      location: location || null,
      description: notes || null,
      instagramLinks: instagramLinks.length > 0 ? instagramLinks : [],
      calendarEventId: null,
      calendarEventUrl: null,
      docsUrl: null,
    } as any;
    createShootMutation.mutate(shoot as InsertShoot);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-shoot">
        <DialogHeader>
          <DialogTitle>Add New Shoot</DialogTitle>
          <DialogDescription>
            Create a new photo shoot idea or schedule an upcoming shoot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Shoot Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Cyberpunk 2077 - V Character"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-shoot-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea - Plan Later</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status !== "idea" && (
            <>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Downtown Industrial District"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any details about the shoot..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <div className="space-y-2">
            <Label>Instagram References</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste Instagram post URL"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                data-testid="input-instagram-link"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLink}
                data-testid="button-add-link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            {instagramLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {instagramLinks.map((link, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveLink(index)}
                    data-testid={`badge-instagram-${index}`}
                  >
                    Reference {index + 1} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reference Images</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
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
            disabled={!title || createShootMutation.isPending}
            data-testid="button-create-shoot"
          >
            {createShootMutation.isPending ? "Creating..." : "Create Shoot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
