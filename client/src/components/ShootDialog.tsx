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
import { CalendarIcon, X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
      if (shootId) {
        queryClient.invalidateQueries({ queryKey: ["/api/shoots", shootId] });
      }
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

  const addInstagramLink = () => {
    if (currentLink.trim()) {
      setInstagramLinks([...instagramLinks, currentLink.trim()]);
      setCurrentLink("");
    }
  };

  const removeInstagramLink = (index: number) => {
    setInstagramLinks(instagramLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a shoot title",
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to remove resource
  const removePersonnel = (id: string) => {
    setSelectedPersonnel(selectedPersonnel.filter(pId => pId !== id));
    const newRoles = { ...personnelRoles };
    delete newRoles[id];
    setPersonnelRoles(newRoles);
  };

  const removeEquipment = (id: string) => {
    setSelectedEquipment(selectedEquipment.filter(eId => eId !== id));
  };

  const removeProp = (id: string) => {
    setSelectedProps(selectedProps.filter(pId => pId !== id));
  };

  const removeCostume = (id: string) => {
    setSelectedCostumes(selectedCostumes.filter(cId => cId !== id));
  };

  // Get available (unselected) resources
  const availablePersonnel = personnel.filter(p => !selectedPersonnel.includes(p.id));
  const availableEquipment = equipment.filter(e => !selectedEquipment.includes(e.id));
  const availableProps = props.filter(p => !selectedProps.includes(p.id));
  const availableCostumes = costumes.filter(c => !selectedCostumes.includes(c.id));
  const availableLocations = locations.filter(l => l.id !== locationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-shoot">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Shoot' : 'Add New Shoot'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update your photo shoot details' : 'Create a new photo shoot idea or schedule an upcoming shoot'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Shoot Title *</Label>
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
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Location</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateLocationOpen(true)}
                data-testid="button-create-location"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Location
              </Button>
            </div>

            {locationId && locations.find(l => l.id === locationId) ? (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{locations.find(l => l.id === locationId)?.name}</p>
                      {locations.find(l => l.id === locationId)?.address && (
                        <p className="text-sm text-muted-foreground">{locations.find(l => l.id === locationId)?.address}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setLocationId("")}
                      data-testid="button-remove-location"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder="Select a location..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                  {availableLocations.length === 0 && (
                    <SelectItem value="_none" disabled>No locations available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator />

          {/* Characters/Costumes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Characters/Costumes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateCostumesOpen(true)}
                data-testid="button-create-costume"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Costume
              </Button>
            </div>

            {selectedCostumes.length > 0 && (
              <div className="space-y-2">
                {selectedCostumes.map((costumeId) => {
                  const costume = costumes.find(c => c.id === costumeId);
                  if (!costume) return null;
                  return (
                    <Card key={costumeId}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {costume.imageUrl && (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={costume.imageUrl} />
                              <AvatarFallback>{getInitials(costume.characterName)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{costume.characterName}</p>
                            {costume.seriesName && (
                              <p className="text-sm text-muted-foreground truncate">{costume.seriesName}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCostume(costumeId)}
                            data-testid={`button-remove-costume-${costumeId}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => setSelectedCostumes([...selectedCostumes, value])}>
              <SelectTrigger data-testid="select-costume">
                <SelectValue placeholder="Add a costume..." />
              </SelectTrigger>
              <SelectContent>
                {availableCostumes.map((costume) => (
                  <SelectItem key={costume.id} value={costume.id}>
                    {costume.characterName} {costume.seriesName ? `- ${costume.seriesName}` : ''}
                  </SelectItem>
                ))}
                {availableCostumes.length === 0 && (
                  <SelectItem value="_none" disabled>No costumes available</SelectItem>
                )}
              </SelectContent>
            </Select>
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
                <Plus className="h-4 w-4 mr-1" />
                New Person
              </Button>
            </div>

            {selectedPersonnel.length > 0 && (
              <div className="space-y-2">
                {selectedPersonnel.map((personnelId) => {
                  const person = personnel.find(p => p.id === personnelId);
                  if (!person) return null;
                  return (
                    <Card key={personnelId}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={person.avatarUrl || undefined} />
                            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{person.name}</p>
                            {person.email && (
                              <p className="text-sm text-muted-foreground truncate">{person.email}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePersonnel(personnelId)}
                            data-testid={`button-remove-personnel-${personnelId}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Role (e.g., Photographer, Model)"
                          value={personnelRoles[personnelId] || ''}
                          onChange={(e) => setPersonnelRoles({ ...personnelRoles, [personnelId]: e.target.value })}
                          className="text-sm"
                          data-testid={`input-role-${personnelId}`}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => setSelectedPersonnel([...selectedPersonnel, value])}>
              <SelectTrigger data-testid="select-personnel">
                <SelectValue placeholder="Add a person..." />
              </SelectTrigger>
              <SelectContent>
                {availablePersonnel.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
                {availablePersonnel.length === 0 && (
                  <SelectItem value="_none" disabled>No personnel available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

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
                <Plus className="h-4 w-4 mr-1" />
                New Equipment
              </Button>
            </div>

            {selectedEquipment.length > 0 && (
              <div className="space-y-2">
                {selectedEquipment.map((equipmentId) => {
                  const item = equipment.find(e => e.id === equipmentId);
                  if (!item) return null;
                  return (
                    <Card key={equipmentId}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.category && (
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEquipment(equipmentId)}
                            data-testid={`button-remove-equipment-${equipmentId}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => setSelectedEquipment([...selectedEquipment, value])}>
              <SelectTrigger data-testid="select-equipment">
                <SelectValue placeholder="Add equipment..." />
              </SelectTrigger>
              <SelectContent>
                {availableEquipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} {item.category ? `(${item.category})` : ''}
                  </SelectItem>
                ))}
                {availableEquipment.length === 0 && (
                  <SelectItem value="_none" disabled>No equipment available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

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
                <Plus className="h-4 w-4 mr-1" />
                New Prop
              </Button>
            </div>

            {selectedProps.length > 0 && (
              <div className="space-y-2">
                {selectedProps.map((propId) => {
                  const prop = props.find(p => p.id === propId);
                  if (!prop) return null;
                  return (
                    <Card key={propId}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{prop.name}</p>
                            {prop.description && (
                              <p className="text-sm text-muted-foreground truncate">{prop.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProp(propId)}
                            data-testid={`button-remove-prop-${propId}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => setSelectedProps([...selectedProps, value])}>
              <SelectTrigger data-testid="select-prop">
                <SelectValue placeholder="Add a prop..." />
              </SelectTrigger>
              <SelectContent>
                {availableProps.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.name}
                  </SelectItem>
                ))}
                {availableProps.length === 0 && (
                  <SelectItem value="_none" disabled>No props available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Links */}
          <div className="space-y-3">
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
              <Button type="button" onClick={addInstagramLink} variant="outline" data-testid="button-add-link">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {instagramLinks.length > 0 && (
              <div className="space-y-2">
                {instagramLinks.map((link, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm truncate flex-1">{link}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInstagramLink(index)}
                          data-testid={`button-remove-link-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="calendar-url">Google Calendar Event URL</Label>
              <Input
                id="calendar-url"
                placeholder="https://calendar.google.com/..."
                value={calendarEventUrl}
                onChange={(e) => setCalendarEventUrl(e.target.value)}
                data-testid="input-calendar-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="docs-url">Google Docs URL</Label>
              <Input
                id="docs-url"
                placeholder="https://docs.google.com/..."
                value={docsUrl}
                onChange={(e) => setDocsUrl(e.target.value)}
                data-testid="input-docs-url"
              />
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
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-save"
          >
            {mode === 'edit' ? 'Update' : 'Create'} Shoot
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Create Resource Dialogs */}
      <CreatePersonnelDialog
        open={createPersonnelOpen}
        onOpenChange={setCreatePersonnelOpen}
      />
      <CreateEquipmentDialog
        open={createEquipmentOpen}
        onOpenChange={setCreateEquipmentOpen}
      />
      <CreateLocationDialog
        open={createLocationOpen}
        onOpenChange={setCreateLocationOpen}
      />
      <CreatePropsDialog
        open={createPropsOpen}
        onOpenChange={setCreatePropsOpen}
      />
      <CreateCostumesDialog
        open={createCostumesOpen}
        onOpenChange={setCreateCostumesOpen}
      />
    </Dialog>
  );
}
