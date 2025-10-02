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
import { CalendarIcon, Upload, Link as LinkIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResourceSelector } from "@/components/ResourceSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShootDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shootId?: string;
  mode: 'create' | 'edit';
}

export function ShootDialog({ open, onOpenChange, shootId, mode }: ShootDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [manualTitle, setManualTitle] = useState(false);
  const [status, setStatus] = useState<string>("idea");
  const [date, setDate] = useState<Date>();
  const [locationId, setLocationId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<string>("#3B82F6");
  const [instagramLinks, setInstagramLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  const [calendarEventUrl, setCalendarEventUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  
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

  // Fetch existing shoot data if editing
  const { data: existingShoot } = useQuery<any>({
    queryKey: ["/api/shoots", shootId],
    enabled: open && mode === 'edit' && !!shootId,
  });

  // Fetch resources
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

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && existingShoot) {
      setTitle(existingShoot.title);
      setManualTitle(true);
      setStatus(existingShoot.status);
      setDate(existingShoot.date ? new Date(existingShoot.date) : undefined);
      setLocationId(existingShoot.locationId || "");
      setNotes(existingShoot.notes || "");
      setColor(existingShoot.color || "#3B82F6");
      setInstagramLinks(existingShoot.instagramLinks || []);
      setCalendarEventUrl(existingShoot.calendarEventUrl || "");
      setDocsUrl(existingShoot.docsUrl || "");

      // Load associated resources
      if (existingShoot.participants) {
        setSelectedPersonnel(existingShoot.participants.map((p: any) => p.personnelId));
        const roles: Record<string, string> = {};
        existingShoot.participants.forEach((p: any) => {
          if (p.role) roles[p.personnelId] = p.role;
        });
        setPersonnelRoles(roles);
      }
      if (existingShoot.equipment) {
        setSelectedEquipment(existingShoot.equipment.map((e: any) => e.equipmentId));
      }
      if (existingShoot.props) {
        setSelectedProps(existingShoot.props.map((p: any) => p.propId));
      }
      if (existingShoot.costumes) {
        setSelectedCostumes(existingShoot.costumes.map((c: any) => c.costumeId));
      }
    }
  }, [mode, existingShoot]);

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
        setTitle("");
      }
    }
  }, [selectedCostumes, costumes, manualTitle, title]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertShoot) => {
      const response = await apiRequest("POST", "/api/shoots", data);
      return await response.json();
    },
    onSuccess: async (newShoot) => {
      // Create associations
      if (selectedPersonnel.length > 0) {
        await Promise.all(
          selectedPersonnel.map(personnelId =>
            apiRequest("POST", "/api/shoots/participants", {
              shootId: newShoot.id,
              personnelId,
              role: personnelRoles[personnelId] || null,
            })
          )
        );
      }

      if (selectedEquipment.length > 0) {
        await Promise.all(
          selectedEquipment.map(equipmentId =>
            apiRequest("POST", "/api/shoots/equipment", {
              shootId: newShoot.id,
              equipmentId,
            })
          )
        );
      }

      if (selectedProps.length > 0) {
        await Promise.all(
          selectedProps.map(propId =>
            apiRequest("POST", "/api/shoots/props", {
              shootId: newShoot.id,
              propId,
            })
          )
        );
      }

      if (selectedCostumes.length > 0) {
        await Promise.all(
          selectedCostumes.map(costumeId =>
            apiRequest("POST", "/api/shoots/costumes", {
              shootId: newShoot.id,
              costumeId,
            })
          )
        );
      }

      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      toast({
        title: "Success",
        description: "Shoot created successfully",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shoot",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertShoot>) => {
      const response = await apiRequest("PATCH", `/api/shoots/${shootId}`, data);
      return await response.json();
    },
    onSuccess: async () => {
      // Update associations (delete old ones and create new ones)
      if (shootId) {
        // Delete existing associations
        await apiRequest("DELETE", `/api/shoots/${shootId}/participants`);
        await apiRequest("DELETE", `/api/shoots/${shootId}/equipment`);
        await apiRequest("DELETE", `/api/shoots/${shootId}/props`);
        await apiRequest("DELETE", `/api/shoots/${shootId}/costumes`);

        // Create new associations
        if (selectedPersonnel.length > 0) {
          await Promise.all(
            selectedPersonnel.map(personnelId =>
              apiRequest("POST", "/api/shoots/participants", {
                shootId,
                personnelId,
                role: personnelRoles[personnelId] || null,
              })
            )
          );
        }

        if (selectedEquipment.length > 0) {
          await Promise.all(
            selectedEquipment.map(equipmentId =>
              apiRequest("POST", "/api/shoots/equipment", {
                shootId,
                equipmentId,
              })
            )
          );
        }

        if (selectedProps.length > 0) {
          await Promise.all(
            selectedProps.map(propId =>
              apiRequest("POST", "/api/shoots/props", {
                shootId,
                propId,
              })
            )
          );
        }

        if (selectedCostumes.length > 0) {
          await Promise.all(
            selectedCostumes.map(costumeId =>
              apiRequest("POST", "/api/shoots/costumes", {
                shootId,
                costumeId,
              })
            )
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shootId] });
      toast({
        title: "Success",
        description: "Shoot updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shoot",
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
    setNotes("");
    setColor("#3B82F6");
    setInstagramLinks([]);
    setCurrentLink("");
    setCalendarEventUrl("");
    setDocsUrl("");
    setSelectedPersonnel([]);
    setPersonnelRoles({});
    setSelectedEquipment([]);
    setSelectedProps([]);
    setSelectedCostumes([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const shootData: any = {
      title: title.trim(),
      status,
      date: date ? date.toISOString() : null,
      locationId: locationId || null,
      notes: notes.trim() || null,
      color: color || "#3B82F6",
      instagramLinks: instagramLinks.length > 0 ? instagramLinks : null,
      calendarEventUrl: calendarEventUrl.trim() || null,
      docsUrl: docsUrl.trim() || null,
    };

    if (mode === 'edit') {
      updateMutation.mutate(shootData);
    } else {
      createMutation.mutate(shootData);
    }
  };

  const addInstagramLink = () => {
    if (currentLink.trim()) {
      setInstagramLinks([...instagramLinks, currentLink.trim()]);
      setCurrentLink("");
    }
  };

  const removeInstagramLink = (index: number) => {
    setInstagramLinks(instagramLinks.filter((_, i) => i !== index));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-shoot">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {mode === 'edit' ? 'Edit Shoot' : 'Create New Shoot'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'edit' ? 'Update shoot details and resources' : 'Add a new photo shoot to your collection'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="links">Links & References</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter shoot title..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setManualTitle(true);
                    }}
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
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
                      <Label>Event Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-20 h-10"
                          data-testid="input-color"
                        />
                        <Input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
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
              </TabsContent>

              <TabsContent value="resources" className="space-y-4 mt-4">
                <ResourceSelector
                  title="Location"
                  resources={locations}
                  selectedIds={locationId ? [locationId] : []}
                  onSelectionChange={(ids) => setLocationId(ids[0] || "")}
                  onCreateNew={() => setCreateLocationOpen(true)}
                  emptyMessage="No locations yet. Create your first location!"
                  type="locations"
                  singleSelect={true}
                />

                <Separator />

                <ResourceSelector
                  title="Characters/Costumes"
                  resources={costumes}
                  selectedIds={selectedCostumes}
                  onSelectionChange={setSelectedCostumes}
                  onCreateNew={() => setCreateCostumesOpen(true)}
                  emptyMessage="No costumes yet. Create your first costume!"
                  type="costumes"
                />

                <Separator />

                <ResourceSelector
                  title="Personnel"
                  resources={personnel}
                  selectedIds={selectedPersonnel}
                  onSelectionChange={setSelectedPersonnel}
                  roles={personnelRoles}
                  onRoleChange={(id, role) => setPersonnelRoles({ ...personnelRoles, [id]: role })}
                  showRoles={true}
                  onCreateNew={() => setCreatePersonnelOpen(true)}
                  emptyMessage="No personnel yet. Create your first person!"
                  type="personnel"
                />

                <Separator />

                <ResourceSelector
                  title="Equipment"
                  resources={equipment}
                  selectedIds={selectedEquipment}
                  onSelectionChange={setSelectedEquipment}
                  onCreateNew={() => setCreateEquipmentOpen(true)}
                  emptyMessage="No equipment yet. Create your first item!"
                  type="equipment"
                />

                <Separator />

                <ResourceSelector
                  title="Props"
                  resources={props}
                  selectedIds={selectedProps}
                  onSelectionChange={setSelectedProps}
                  onCreateNew={() => setCreatePropsOpen(true)}
                  emptyMessage="No props yet. Create your first prop!"
                  type="props"
                />
              </TabsContent>

              <TabsContent value="links" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Instagram Reference Links</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste Instagram link..."
                      value={currentLink}
                      onChange={(e) => setCurrentLink(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInstagramLink();
                        }
                      }}
                      data-testid="input-instagram-link"
                    />
                    <Button
                      type="button"
                      onClick={addInstagramLink}
                      variant="outline"
                      data-testid="button-add-link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {instagramLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {instagramLinks.map((link, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Instagram #{index + 1}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeInstagramLink(index)}
                            className="ml-1 hover:bg-destructive/20 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendar-event">Google Calendar Event URL</Label>
                  <Input
                    id="calendar-event"
                    placeholder="https://calendar.google.com/..."
                    value={calendarEventUrl}
                    onChange={(e) => setCalendarEventUrl(e.target.value)}
                    data-testid="input-calendar-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docs-url">Google Docs Planning URL</Label>
                  <Input
                    id="docs-url"
                    placeholder="https://docs.google.com/..."
                    value={docsUrl}
                    onChange={(e) => setDocsUrl(e.target.value)}
                    data-testid="input-docs-url"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {mode === 'edit' ? 'Update Shoot' : 'Create Shoot'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resource creation dialogs */}
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
    </>
  );
}
