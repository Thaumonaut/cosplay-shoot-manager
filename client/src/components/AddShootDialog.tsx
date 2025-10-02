import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InsertShoot, Shoot, Equipment, Location, Prop, CostumeProgress, Personnel } from "@shared/schema";
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
import { CalendarIcon, Upload, Link as LinkIcon, X, Edit, Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MapboxLocationSearch } from "@/components/MapboxLocationSearch";
import { Separator } from "@/components/ui/separator";
import { ResourceSelector } from "@/components/ResourceSelector";

interface AddShootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddShootDialog({ open, onOpenChange }: AddShootDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [manualTitle, setManualTitle] = useState(false);
  const [status, setStatus] = useState<string>("idea");
  const [date, setDate] = useState<Date>();
  const [locationId, setLocationId] = useState<string>("");
  const [locationNotes, setLocationNotes] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<string>("#3B82F6");
  const [instagramLinks, setInstagramLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  
  // Resource selections
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [personnelRoles, setPersonnelRoles] = useState<Record<string, string>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [selectedCostumes, setSelectedCostumes] = useState<string[]>([]);

  // Create resource dialog states
  const [createPersonnelOpen, setCreatePersonnelOpen] = useState(false);
  const [createEquipmentOpen, setCreateEquipmentOpen] = useState(false);
  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const [createPropsOpen, setCreatePropsOpen] = useState(false);
  const [createCostumesOpen, setCreateCostumesOpen] = useState(false);

  // Fetch resources - always fetch, show empty states if needed
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

  // Auto-generate title from selected costumes
  useEffect(() => {
    if (!manualTitle && costumes.length > 0) {
      const selectedCostumeData = costumes.filter(c => selectedCostumes.includes(c.id));
      if (selectedCostumeData.length > 0) {
        const characters = selectedCostumeData.map(c => c.characterName);
        const seriesSet = new Set(selectedCostumeData.map(c => c.seriesName).filter(Boolean));
        const series = Array.from(seriesSet);
        
        let generatedTitle = "";
        if (characters.length === 1) {
          generatedTitle = characters[0];
          if (series.length > 0 && series[0]) {
            generatedTitle += ` - ${series[0]}`;
          }
        } else if (characters.length > 1) {
          generatedTitle = characters.slice(0, 2).join(" & ");
          if (characters.length > 2) {
            generatedTitle += ` +${characters.length - 2}`;
          }
          if (series.length > 0 && series[0]) {
            generatedTitle += ` - ${series[0]}`;
          }
        }
        
        if (generatedTitle) {
          setTitle(generatedTitle + " Shoot");
        }
      } else if (title.endsWith(" Shoot")) {
        // Clear auto-generated title if no costumes selected
        setTitle("");
      }
    }
  }, [selectedCostumes, costumes, manualTitle]);

  const createShootMutation = useMutation({
    mutationFn: async (data: { 
      shoot: InsertShoot; 
      participants?: { personnelId: string; role: string }[];
      personnelIds: string[]; 
      equipmentIds: string[]; 
      propIds: string[]; 
      costumeIds: string[] 
    }) => {
      const response = await apiRequest("POST", "/api/shoots", data);
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
    setManualTitle(false);
    setStatus("idea");
    setDate(undefined);
    setLocationId("");
    setLocationNotes("");
    setNotes("");
    setColor("#3B82F6");
    setInstagramLinks([]);
    setSelectedPersonnel([]);
    setPersonnelRoles({});
    setSelectedEquipment([]);
    setSelectedProps([]);
    setSelectedCostumes([]);
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
      locationId: locationId && locationId !== "" ? locationId : null,
      locationNotes: locationNotes || null,
      description: notes || null,
      color: color || null,
      instagramLinks: instagramLinks.length > 0 ? instagramLinks : [],
      calendarEventId: null,
      calendarEventUrl: null,
      docsUrl: null,
    } as any;
    
    // Build participants array with roles
    const participants = selectedPersonnel.map(personnelId => ({
      personnelId,
      role: personnelRoles[personnelId] || 'Participant'
    }));
    
    createShootMutation.mutate({
      shoot: shoot as InsertShoot,
      participants,
      personnelIds: selectedPersonnel,
      equipmentIds: selectedEquipment,
      propIds: selectedProps,
      costumeIds: selectedCostumes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-shoot">
        <DialogHeader>
          <DialogTitle>Add New Shoot</DialogTitle>
          <DialogDescription>
            Create a new photo shoot idea or schedule an upcoming shoot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title with manual override */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Shoot Title *</Label>
              {!manualTitle && selectedCostumes.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualTitle(true)}
                  data-testid="button-manual-title"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit manually
                </Button>
              )}
            </div>
            <Input
              id="title"
              placeholder="e.g., Cyberpunk 2077 - V Character"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setManualTitle(true);
              }}
              data-testid="input-shoot-title"
            />
            {!manualTitle && selectedCostumes.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Auto-generated from selected characters
              </p>
            )}
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search for Location</Label>
                  <MapboxLocationSearch
                    onLocationSelect={(location) => {
                      setLocationNotes(location.address);
                    }}
                    placeholder="Search for a location near you..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location">Or select from saved locations</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreateLocationOpen(true)}
                      data-testid="button-create-location"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create new
                    </Button>
                  </div>
                  <Select value={locationId} onValueChange={(value) => {
                    setLocationId(value);
                    const selectedLocation = locations.find(loc => loc.id === value);
                    if (selectedLocation) {
                      // Use address if available, otherwise fall back to notes, then name
                      const locationDetails = selectedLocation.address || selectedLocation.notes || selectedLocation.name;
                      setLocationNotes(locationDetails);
                    }
                  }}>
                    <SelectTrigger data-testid="select-location">
                      <SelectValue placeholder={locations.length > 0 ? "Choose a saved location..." : "No locations yet - create one"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id} data-testid={`select-location-${loc.id}`}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {locationNotes && (
                  <div className="space-y-2">
                    <Label>Selected Address</Label>
                    <div className="p-3 bg-muted rounded-md text-sm" data-testid="text-location-address">
                      {locationNotes}
                    </div>
                  </div>
                )}
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
            <Label htmlFor="color">Event Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
                data-testid="input-color"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          <Separator />

          {/* Personnel Selection */}
          <ResourceSelector
            title="Personnel"
            resources={personnel}
            selectedIds={selectedPersonnel}
            onSelectionChange={(newSelection) => {
              setSelectedPersonnel(newSelection);
              // Clean up roles for deselected personnel
              setPersonnelRoles(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(personnelId => {
                  if (!newSelection.includes(personnelId)) {
                    delete updated[personnelId];
                  }
                });
                return updated;
              });
            }}
            roles={personnelRoles}
            onRoleChange={(personnelId, role) => setPersonnelRoles(prev => ({ ...prev, [personnelId]: role }))}
            showRoles={true}
            onCreateNew={() => setCreatePersonnelOpen(true)}
            emptyMessage="No personnel yet. Create your first team member to select them for shoots."
            type="personnel"
          />

          {/* Costumes Selection */}
          <ResourceSelector
            title="Costumes & Characters"
            resources={costumes}
            selectedIds={selectedCostumes}
            onSelectionChange={setSelectedCostumes}
            onCreateNew={() => setCreateCostumesOpen(true)}
            emptyMessage="No costumes yet. Create your first costume to select it for shoots."
            type="costumes"
          />

          {/* Equipment Selection */}
          <ResourceSelector
            title="Equipment"
            resources={equipment}
            selectedIds={selectedEquipment}
            onSelectionChange={setSelectedEquipment}
            onCreateNew={() => setCreateEquipmentOpen(true)}
            emptyMessage="No equipment yet. Create your first equipment item to select it for shoots."
            type="equipment"
          />

          {/* Props Selection */}
          <ResourceSelector
            title="Props"
            resources={props}
            selectedIds={selectedProps}
            onSelectionChange={setSelectedProps}
            onCreateNew={() => setCreatePropsOpen(true)}
            emptyMessage="No props yet. Create your first prop to select it for shoots."
            type="props"
          />

          <Separator />

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
