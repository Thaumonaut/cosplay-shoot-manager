import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InsertShoot, Shoot, Equipment, Location, Prop, CostumeProgress } from "@shared/schema";
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
import { CalendarIcon, Upload, Link as LinkIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface AddShootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddShootDialog({ open, onOpenChange }: AddShootDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>("idea");
  const [date, setDate] = useState<Date>();
  const [locationId, setLocationId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [instagramLinks, setInstagramLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  
  // Resource selections
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [selectedCostumes, setSelectedCostumes] = useState<string[]>([]);

  // Fetch resources
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

  const createShootMutation = useMutation({
    mutationFn: async (data: { shoot: InsertShoot; equipmentIds: string[]; propIds: string[]; costumeIds: string[] }) => {
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
    setStatus("idea");
    setDate(undefined);
    setLocationId("");
    setNotes("");
    setInstagramLinks([]);
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

  const toggleEquipment = (id: string) => {
    setSelectedEquipment(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleProp = (id: string) => {
    setSelectedProps(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleCostume = (id: string) => {
    setSelectedCostumes(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const shoot = {
      title,
      status,
      date: date ? date.toISOString() : null,
      locationId: locationId || null,
      description: notes || null,
      instagramLinks: instagramLinks.length > 0 ? instagramLinks : [],
      calendarEventId: null,
      calendarEventUrl: null,
      docsUrl: null,
    } as any;
    
    createShootMutation.mutate({
      shoot: shoot as InsertShoot,
      equipmentIds: selectedEquipment,
      propIds: selectedProps,
      costumeIds: selectedCostumes,
    });
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
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="Choose a location..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No location selected</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} data-testid={`select-location-${loc.id}`}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          {/* Equipment Selection */}
          {equipment.length > 0 && (
            <div className="space-y-2">
              <Label>Equipment</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {equipment.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equipment-${item.id}`}
                      checked={selectedEquipment.includes(item.id)}
                      onCheckedChange={() => toggleEquipment(item.id)}
                      data-testid={`checkbox-equipment-${item.id}`}
                    />
                    <label
                      htmlFor={`equipment-${item.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {item.name} {item.category && `(${item.category})`}
                    </label>
                  </div>
                ))}
              </div>
              {selectedEquipment.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedEquipment.length} item{selectedEquipment.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Props Selection */}
          {props.length > 0 && (
            <div className="space-y-2">
              <Label>Props</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {props.map((prop) => (
                  <div key={prop.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`prop-${prop.id}`}
                      checked={selectedProps.includes(prop.id)}
                      onCheckedChange={() => toggleProp(prop.id)}
                      data-testid={`checkbox-prop-${prop.id}`}
                    />
                    <label
                      htmlFor={`prop-${prop.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {prop.name}
                    </label>
                  </div>
                ))}
              </div>
              {selectedProps.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedProps.length} prop{selectedProps.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Costumes Selection */}
          {costumes.length > 0 && (
            <div className="space-y-2">
              <Label>Costumes</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {costumes.map((costume) => (
                  <div key={costume.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`costume-${costume.id}`}
                      checked={selectedCostumes.includes(costume.id)}
                      onCheckedChange={() => toggleCostume(costume.id)}
                      data-testid={`checkbox-costume-${costume.id}`}
                    />
                    <label
                      htmlFor={`costume-${costume.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {costume.characterName} {costume.seriesName && `(${costume.seriesName})`}
                    </label>
                  </div>
                ))}
              </div>
              {selectedCostumes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedCostumes.length} costume{selectedCostumes.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

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
