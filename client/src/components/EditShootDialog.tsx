import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Shoot, Equipment, Location, Prop, CostumeProgress, Personnel, ShootParticipant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreatePersonnelDialog } from "@/components/CreatePersonnelDialog";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import { CreateLocationDialog } from "@/components/CreateLocationDialog";
import { CreatePropsDialog } from "@/components/CreatePropsDialog";
import { CreateCostumesDialog } from "@/components/CreateCostumesDialog";
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
import { CalendarIcon, Trash2, Plus, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapboxLocationSearch } from "@/components/MapboxLocationSearch";
import { Separator } from "@/components/ui/separator";
import { SiGooglecalendar, SiGoogledocs } from "react-icons/si";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditShootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoot: Shoot;
  onDelete?: () => void;
  onExportDocs?: () => void;
  isExporting?: boolean;
  onCreateCalendar?: () => void;
  isCreatingCalendar?: boolean;
  onSendReminders?: () => void;
  isSendingReminders?: boolean;
}

export function EditShootDialog({
  open,
  onOpenChange,
  shoot,
  onDelete,
  onExportDocs,
  isExporting,
  onCreateCalendar,
  isCreatingCalendar,
  onSendReminders,
  isSendingReminders,
}: EditShootDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(shoot.title);
  const [status, setStatus] = useState<string>(shoot.status);
  const [date, setDate] = useState<Date | undefined>(shoot.date ? new Date(shoot.date) : undefined);
  const [locationId, setLocationId] = useState<string>(shoot.locationId || "");
  const [locationNotes, setLocationNotes] = useState<string>(shoot.locationNotes || "");
  const [notes, setNotes] = useState(shoot.description || "");
  const [instagramLinks, setInstagramLinks] = useState<string[]>(shoot.instagramLinks || []);
  const [currentLink, setCurrentLink] = useState("");
  
  // Resource selections
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [selectedCostumes, setSelectedCostumes] = useState<string[]>([]);

  // Create resource dialog states
  const [createPersonnelOpen, setCreatePersonnelOpen] = useState(false);
  const [createEquipmentOpen, setCreateEquipmentOpen] = useState(false);
  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const [createPropsOpen, setCreatePropsOpen] = useState(false);
  const [createCostumesOpen, setCreateCostumesOpen] = useState(false);

  // Fetch participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery<ShootParticipant[]>({
    queryKey: ["/api/shoots", shoot.id, "participants"],
    enabled: open,
  });

  // Fetch associated resources
  const { data: shootEquipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/shoots", shoot.id, "equipment"],
    enabled: open,
  });

  const { data: shootProps = [] } = useQuery<Prop[]>({
    queryKey: ["/api/shoots", shoot.id, "props"],
    enabled: open,
  });

  const { data: shootCostumes = [] } = useQuery<CostumeProgress[]>({
    queryKey: ["/api/shoots", shoot.id, "costumes"],
    enabled: open,
  });

  // Fetch all available resources
  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
    enabled: open,
  });

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
    enabled: open,
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    enabled: open,
  });

  const { data: props = [] } = useQuery<Prop[]>({
    queryKey: ["/api/props"],
    enabled: open,
  });

  const { data: costumes = [] } = useQuery<CostumeProgress[]>({
    queryKey: ["/api/costumes"],
    enabled: open,
  });

  // Initialize selected resources when data loads
  useEffect(() => {
    if (shootEquipment.length > 0) {
      setSelectedEquipment(shootEquipment.map(e => e.id));
    }
    if (shootProps.length > 0) {
      setSelectedProps(shootProps.map(p => p.id));
    }
    if (shootCostumes.length > 0) {
      setSelectedCostumes(shootCostumes.map(c => c.id));
    }
    if (participants.length > 0) {
      const personnelIds = participants
        .map(p => p.personnelId)
        .filter((id): id is string => id !== null);
      setSelectedPersonnel(personnelIds);
    }
  }, [shootEquipment, shootProps, shootCostumes, participants]);

  const updateShootMutation = useMutation({
    mutationFn: async (data: Partial<Shoot>) => {
      const response = await apiRequest("PATCH", `/api/shoots/${shoot.id}`, data);
      return await response.json() as Shoot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update shoot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateResourcesMutation = useMutation({
    mutationFn: async () => {
      // Preserve all existing participants (both personnel-linked and manual)
      const allParticipants = participants.map(p => ({
        personnelId: p.personnelId,
        name: p.name,
        role: p.role,
        email: p.email,
      }));

      const response = await apiRequest("PATCH", `/api/shoots/${shoot.id}/resources`, {
        equipmentIds: selectedEquipment,
        propIds: selectedProps,
        costumeIds: selectedCostumes,
        personnelIds: selectedPersonnel,
        participants: allParticipants,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id, "props"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id, "costumes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id, "participants"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if participants are still loading to prevent data loss
    if (participantsLoading) {
      toast({
        title: "Please wait",
        description: "Loading participant data...",
      });
      return;
    }

    try {
      // Update shoot details
      await updateShootMutation.mutateAsync({
        title: title.trim() || "Untitled Shoot",
        status,
        date: date || null,
        locationId: locationId || null,
        locationNotes: locationNotes.trim() || null,
        description: notes.trim() || null,
        instagramLinks: instagramLinks.length > 0 ? instagramLinks : null,
      });

      // Update resources
      await updateResourcesMutation.mutateAsync();

      // Only close dialog and show success after BOTH mutations succeed
      toast({
        title: "Shoot updated",
        description: "Your shoot has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      // Show error toast if resources update fails
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update all shoot details",
        variant: "destructive",
      });
    }
  };

  const handleAddLink = () => {
    if (currentLink.trim()) {
      setInstagramLinks([...instagramLinks, currentLink.trim()]);
      setCurrentLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setInstagramLinks(instagramLinks.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (location: { name?: string; address: string; latitude: number; longitude: number }) => {
    setLocationNotes(location.address);
  };

  const statusConfig = {
    idea: { label: "Idea", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    planning: { label: "Planning", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    scheduled: { label: "Scheduled", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    completed: { label: "Completed", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]" data-testid="dialog-edit-shoot">
        <DialogHeader>
          <DialogTitle>Edit Shoot</DialogTitle>
          <DialogDescription>
            Update the details for your photo shoot
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Photo shoot title"
                  data-testid="input-edit-title"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label>Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-edit-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                {locations.length > 0 ? (
                  <Select value={locationId} onValueChange={(value) => {
                    setLocationId(value);
                    const selectedLocation = locations.find(loc => loc.id === value);
                    if (selectedLocation) {
                      // Use address if available, otherwise fall back to notes, then name
                      const locationDetails = selectedLocation.address || selectedLocation.notes || selectedLocation.name;
                      setLocationNotes(locationDetails);
                    }
                  }}>
                    <SelectTrigger data-testid="select-edit-location">
                      <SelectValue placeholder="Select a saved location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {locationId ? "Or search for a new location" : "Search for a location"}
                  </Label>
                  <MapboxLocationSearch
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for a location..."
                    initialValue={locationNotes}
                  />
                </div>
                {locationNotes && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Selected Address</Label>
                    <div className="p-3 bg-muted rounded-md text-sm" data-testid="text-edit-location-address">
                      {locationNotes}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateLocationOpen(true)}
                    data-testid="button-create-location"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Location
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="notes">Description</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the shoot..."
                  rows={4}
                  data-testid="textarea-edit-notes"
                />
              </div>

              {/* Instagram Links */}
              <div className="space-y-2">
                <Label>Instagram Reference Links</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentLink}
                    onChange={(e) => setCurrentLink(e.target.value)}
                    placeholder="https://instagram.com/p/..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    data-testid="input-edit-instagram-link"
                  />
                  <Button type="button" variant="outline" onClick={handleAddLink} data-testid="button-add-link">
                    Add
                  </Button>
                </div>
                {instagramLinks.length > 0 && (
                  <div className="space-y-2">
                    {instagramLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex-1 truncate"
                        >
                          {link}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLink(index)}
                          data-testid={`button-remove-link-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Personnel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Personnel</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreatePersonnelOpen(true)}
                    data-testid="button-create-personnel"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
                {personnel.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No personnel available. Create one to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {personnel.map((person) => (
                      <div key={person.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`person-${person.id}`}
                          checked={selectedPersonnel.includes(person.id)}
                          onCheckedChange={(checked) => {
                            setSelectedPersonnel(
                              checked
                                ? [...selectedPersonnel, person.id]
                                : selectedPersonnel.filter((id) => id !== person.id)
                            );
                          }}
                          data-testid={`checkbox-personnel-${person.id}`}
                        />
                        <label
                          htmlFor={`person-${person.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {person.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Equipment</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateEquipmentOpen(true)}
                    data-testid="button-create-equipment"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
                {equipment.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No equipment available. Create some to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {equipment.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${item.id}`}
                          checked={selectedEquipment.includes(item.id)}
                          onCheckedChange={(checked) => {
                            setSelectedEquipment(
                              checked
                                ? [...selectedEquipment, item.id]
                                : selectedEquipment.filter((id) => id !== item.id)
                            );
                          }}
                          data-testid={`checkbox-equipment-${item.id}`}
                        />
                        <label
                          htmlFor={`equipment-${item.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.category} - {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Props */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Props</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreatePropsOpen(true)}
                    data-testid="button-create-prop"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
                {props.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No props available. Create some to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {props.map((prop) => (
                      <div key={prop.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`prop-${prop.id}`}
                          checked={selectedProps.includes(prop.id)}
                          onCheckedChange={(checked) => {
                            setSelectedProps(
                              checked
                                ? [...selectedProps, prop.id]
                                : selectedProps.filter((id) => id !== prop.id)
                            );
                          }}
                          data-testid={`checkbox-prop-${prop.id}`}
                        />
                        <label
                          htmlFor={`prop-${prop.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {prop.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Costumes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Costumes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateCostumesOpen(true)}
                    data-testid="button-create-costume"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
                {costumes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No costumes available. Create some to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {costumes.map((costume) => (
                      <div key={costume.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`costume-${costume.id}`}
                          checked={selectedCostumes.includes(costume.id)}
                          onCheckedChange={(checked) => {
                            setSelectedCostumes(
                              checked
                                ? [...selectedCostumes, costume.id]
                                : selectedCostumes.filter((id) => id !== costume.id)
                            );
                          }}
                          data-testid={`checkbox-costume-${costume.id}`}
                        />
                        <label
                          htmlFor={`costume-${costume.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {costume.characterName} ({costume.seriesName})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Integration Buttons */}
              <div className="flex flex-wrap gap-2">
                {!shoot.calendarEventUrl && date && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCreateCalendar}
                    disabled={isCreatingCalendar}
                    data-testid="button-create-calendar"
                  >
                    <SiGooglecalendar className="h-4 w-4 mr-2" />
                    {isCreatingCalendar ? "Adding..." : "Add to Calendar"}
                  </Button>
                )}
                {shoot.calendarEventUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shoot.calendarEventUrl!, "_blank")}
                    data-testid="button-view-calendar"
                  >
                    <SiGooglecalendar className="h-4 w-4 mr-2" />
                    View in Calendar
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}
                {!shoot.docsUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onExportDocs}
                    disabled={isExporting}
                    data-testid="button-export-docs"
                  >
                    <SiGoogledocs className="h-4 w-4 mr-2" />
                    {isExporting ? "Saving..." : "Save as Google Doc"}
                  </Button>
                )}
                {shoot.docsUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shoot.docsUrl!, "_blank")}
                    data-testid="button-view-docs"
                  >
                    <SiGoogledocs className="h-4 w-4 mr-2" />
                    Open Planning Doc
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive/10 mr-auto"
            data-testid="button-delete-shoot"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateShootMutation.isPending || participantsLoading}
            data-testid="button-save-shoot"
          >
            {participantsLoading ? "Loading..." : updateShootMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Create Resource Dialogs */}
      <CreatePersonnelDialog
        open={createPersonnelOpen}
        onOpenChange={setCreatePersonnelOpen}
        onSuccess={(newPersonnel) => {
          setSelectedPersonnel([...selectedPersonnel, newPersonnel.id]);
        }}
      />
      <CreateEquipmentDialog
        open={createEquipmentOpen}
        onOpenChange={setCreateEquipmentOpen}
        onSuccess={(newEquipment) => {
          setSelectedEquipment([...selectedEquipment, newEquipment.id]);
        }}
      />
      <CreateLocationDialog
        open={createLocationOpen}
        onOpenChange={setCreateLocationOpen}
        onSuccess={(newLocation) => {
          setLocationId(newLocation.id);
        }}
      />
      <CreatePropsDialog
        open={createPropsOpen}
        onOpenChange={setCreatePropsOpen}
        onSuccess={(newProp) => {
          setSelectedProps([...selectedProps, newProp.id]);
        }}
      />
      <CreateCostumesDialog
        open={createCostumesOpen}
        onOpenChange={setCreateCostumesOpen}
        onSuccess={(newCostume) => {
          setSelectedCostumes([...selectedCostumes, newCostume.id]);
        }}
      />
    </Dialog>
  );
}
