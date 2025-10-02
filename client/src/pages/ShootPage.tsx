import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InsertShoot, Equipment, Location, Prop, CostumeProgress, Personnel } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { CreatePersonnelDialog } from "@/components/CreatePersonnelDialog";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import { CreateLocationDialog } from "@/components/CreateLocationDialog";
import { CreatePropsDialog } from "@/components/CreatePropsDialog";
import { CreateCostumesDialog } from "@/components/CreateCostumesDialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X, Plus, ArrowLeft, Trash2, Mail, ExternalLink, Share2, Edit2, MapPin, Clock } from "lucide-react";
import { SiGoogledocs, SiGooglecalendar } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function ShootPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isNew = !id || id === "new";

  const [title, setTitle] = useState("");
  const [manualTitle, setManualTitle] = useState(false);
  const [status, setStatus] = useState<string>("idea");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [reminderPreset, setReminderPreset] = useState<string>("");
  const [customReminderDate, setCustomReminderDate] = useState<Date>();
  const [customReminderTime, setCustomReminderTime] = useState("");
  const [locationId, setLocationId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<string>("#3B82F6");
  const [instagramLinks, setInstagramLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [personnelRoles, setPersonnelRoles] = useState<Record<string, string>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [selectedCostumes, setSelectedCostumes] = useState<string[]>([]);

  const [createPersonnelOpen, setCreatePersonnelOpen] = useState(false);
  const [createEquipmentOpen, setCreateEquipmentOpen] = useState(false);
  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const [createPropsOpen, setCreatePropsOpen] = useState(false);
  const [createCostumesOpen, setCreateCostumesOpen] = useState(false);

  // Fetch existing shoot data if editing
  const { data: existingShoot } = useQuery<any>({
    queryKey: ["/api/shoots", id],
    enabled: !isNew && !!id,
  });

  // Fetch resources
  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: props = [] } = useQuery<Prop[]>({
    queryKey: ["/api/props"],
  });

  const { data: costumes = [] } = useQuery<CostumeProgress[]>({
    queryKey: ["/api/costumes"],
  });

  // Populate form when editing
  useEffect(() => {
    if (!isNew && existingShoot) {
      setTitle(existingShoot.title);
      setManualTitle(true);
      setStatus(existingShoot.status);
      setDate(existingShoot.date ? new Date(existingShoot.date) : undefined);
      setTime(existingShoot.time || "");
      setDurationMinutes(existingShoot.durationMinutes || 60);
      
      if (existingShoot.reminderTime && existingShoot.date) {
        const shootDateTime = new Date(existingShoot.date);
        const reminderDateTime = new Date(existingShoot.reminderTime);
        const diffMs = shootDateTime.getTime() - reminderDateTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes === 15) {
          setReminderPreset("15min");
        } else if (diffMinutes === 30) {
          setReminderPreset("30min");
        } else if (diffMinutes === 60) {
          setReminderPreset("1hour");
        } else if (diffMinutes === 1440) {
          setReminderPreset("1day");
        } else {
          setReminderPreset("custom");
          setCustomReminderDate(reminderDateTime);
          setCustomReminderTime(`${String(reminderDateTime.getHours()).padStart(2, '0')}:${String(reminderDateTime.getMinutes()).padStart(2, '0')}`);
        }
      }
      
      setLocationId(existingShoot.locationId || "");
      setNotes(existingShoot.notes || "");
      setColor(existingShoot.color || "#3B82F6");
      setInstagramLinks(existingShoot.instagramLinks || []);
      setIsPublic(existingShoot.isPublic || false);

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
  }, [isNew, existingShoot]);

  // Auto-generate title from selected costumes
  useEffect(() => {
    if (!manualTitle && costumes.length > 0 && isNew) {
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
  }, [selectedCostumes, costumes, manualTitle, title, isNew]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertShoot) => {
      const response = await apiRequest("POST", "/api/shoots", data);
      return await response.json();
    },
    onSuccess: async (newShoot) => {
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
      navigate(`/shoots/${newShoot.id}`);
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
      const response = await apiRequest("PATCH", `/api/shoots/${id}`, data);
      return await response.json();
    },
    onSuccess: async () => {
      if (id) {
        await apiRequest("DELETE", `/api/shoots/${id}/participants`);
        await apiRequest("DELETE", `/api/shoots/${id}/equipment`);
        await apiRequest("DELETE", `/api/shoots/${id}/props`);
        await apiRequest("DELETE", `/api/shoots/${id}/costumes`);

        if (selectedPersonnel.length > 0) {
          await Promise.all(
            selectedPersonnel.map(personnelId =>
              apiRequest("POST", "/api/shoots/participants", {
                shootId: id,
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
                shootId: id,
                equipmentId,
              })
            )
          );
        }

        if (selectedProps.length > 0) {
          await Promise.all(
            selectedProps.map(propId =>
              apiRequest("POST", "/api/shoots/props", {
                shootId: id,
                propId,
              })
            )
          );
        }

        if (selectedCostumes.length > 0) {
          await Promise.all(
            selectedCostumes.map(costumeId =>
              apiRequest("POST", "/api/shoots/costumes", {
                shootId: id,
                costumeId,
              })
            )
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
      }
      toast({
        title: "Success",
        description: "Shoot updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shoot",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/shoots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      toast({
        title: "Success",
        description: "Shoot deleted successfully",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete shoot",
        variant: "destructive",
      });
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async (newIsPublic: boolean) => {
      const response = await apiRequest("PATCH", `/api/shoots/${id}`, { isPublic: newIsPublic });
      return await response.json();
    },
    onSuccess: (data) => {
      setIsPublic(data.isPublic);
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      toast({
        title: "Success",
        description: data.isPublic ? "Shoot is now public" : "Shoot is now private",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update visibility",
        variant: "destructive",
      });
    },
  });

  const handleTogglePublic = (checked: boolean) => {
    if (!isNew) {
      togglePublicMutation.mutate(checked);
    }
  };

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/public/shoots/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Link copied!",
      description: "Public shoot link copied to clipboard",
    });
  };

  const createDocsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/shoots/${id}/docs`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create/update document",
        variant: "destructive",
      });
    },
  });

  const createCalendarEventMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/shoots/${id}/calendar`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create/update calendar event",
        variant: "destructive",
      });
    },
  });

  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/shoots/${id}/send-reminders`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminders",
        variant: "destructive",
      });
    },
  });

  const addInstagramLink = () => {
    if (currentLink.trim()) {
      setInstagramLinks([...instagramLinks, currentLink.trim()]);
      setCurrentLink("");
    }
  };

  const removeInstagramLink = (index: number) => {
    setInstagramLinks(instagramLinks.filter((_, i) => i !== index));
  };

  const calculateReminderTime = (): string | null => {
    if (!date) return null;
    
    if (reminderPreset === "custom") {
      if (customReminderDate && customReminderTime) {
        const [hours, minutes] = customReminderTime.split(':').map(Number);
        const reminderDateTime = new Date(customReminderDate);
        reminderDateTime.setHours(hours, minutes, 0, 0);
        return reminderDateTime.toISOString();
      }
      return null;
    }
    
    if (!reminderPreset || reminderPreset === "none") return null;
    
    const shootDateTime = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      shootDateTime.setHours(hours, minutes, 0, 0);
    }
    
    const reminderDateTime = new Date(shootDateTime);
    
    switch (reminderPreset) {
      case "15min":
        reminderDateTime.setMinutes(reminderDateTime.getMinutes() - 15);
        break;
      case "30min":
        reminderDateTime.setMinutes(reminderDateTime.getMinutes() - 30);
        break;
      case "1hour":
        reminderDateTime.setHours(reminderDateTime.getHours() - 1);
        break;
      case "1day":
        reminderDateTime.setDate(reminderDateTime.getDate() - 1);
        break;
    }
    
    return reminderDateTime.toISOString();
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

    const reminderTimeValue = calculateReminderTime();

    const shootData: any = {
      title: title.trim(),
      status,
      date: date ? date.toISOString() : null,
      time: time.trim() || null,
      durationMinutes: durationMinutes || null,
      reminderTime: reminderTimeValue,
      locationId: locationId || null,
      notes: notes.trim() || null,
      color: color || "#3B82F6",
      instagramLinks: instagramLinks.length > 0 ? instagramLinks : null,
    };

    if (isNew) {
      createMutation.mutate(shootData);
    } else {
      updateMutation.mutate(shootData);
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

  const removePersonnel = (pId: string) => {
    setSelectedPersonnel(selectedPersonnel.filter(id => id !== pId));
    const newRoles = { ...personnelRoles };
    delete newRoles[pId];
    setPersonnelRoles(newRoles);
  };

  const removeEquipment = (eId: string) => {
    setSelectedEquipment(selectedEquipment.filter(id => id !== eId));
  };

  const removeProp = (pId: string) => {
    setSelectedProps(selectedProps.filter(id => id !== pId));
  };

  const removeCostume = (cId: string) => {
    setSelectedCostumes(selectedCostumes.filter(id => id !== cId));
  };

  const availablePersonnel = personnel.filter(p => !selectedPersonnel.includes(p.id));
  const availableEquipment = equipment.filter(e => !selectedEquipment.includes(e.id));
  const availableProps = props.filter(p => !selectedProps.includes(p.id));
  const availableCostumes = costumes.filter(c => !selectedCostumes.includes(c.id));
  const availableLocations = locations.filter(l => l.id !== locationId);

  const selectedLocation = locations.find(l => l.id === locationId);

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {!isNew && (
            <>
              {/* Calendar Button */}
              {existingShoot?.calendarEventUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="button-view-calendar"
                >
                  <a href={existingShoot?.calendarEventUrl} target="_blank" rel="noopener noreferrer">
                    <SiGooglecalendar className="h-4 w-4 mr-2" />
                    View in Calendar
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createCalendarEventMutation.mutate()}
                  disabled={createCalendarEventMutation.isPending}
                  data-testid="button-create-calendar"
                >
                  <SiGooglecalendar className="h-4 w-4 mr-2" />
                  {createCalendarEventMutation.isPending ? "Adding..." : "Add to Calendar"}
                </Button>
              )}

              {/* Docs Button */}
              {existingShoot?.docsUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="button-view-docs"
                >
                  <a href={existingShoot.docsUrl} target="_blank" rel="noopener noreferrer">
                    <SiGoogledocs className="h-4 w-4 mr-2" />
                    View Doc
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createDocsMutation.mutate()}
                  disabled={createDocsMutation.isPending}
                  data-testid="button-create-docs"
                >
                  <SiGoogledocs className="h-4 w-4 mr-2" />
                  {createDocsMutation.isPending ? "Creating..." : "Create Doc"}
                </Button>
              )}

              {selectedPersonnel.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendRemindersMutation.mutate()}
                  disabled={sendRemindersMutation.isPending}
                  data-testid="button-send-reminders"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                className="text-destructive hover:bg-destructive/10"
                data-testid="button-delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>{isNew ? "New Shoot" : "Shoot Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setManualTitle(true);
              }}
              placeholder="Enter shoot title..."
              data-testid="input-shoot-title"
            />
            {!manualTitle && selectedCostumes.length > 0 && isNew && (
              <p className="text-xs text-muted-foreground">
                Auto-generated from selected costumes
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="ready to shoot">Ready to Shoot</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date, Time, Duration - Compact Layout */}
          {status !== "idea" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-select-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
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
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                  min="15"
                  step="15"
                  className="text-sm"
                  data-testid="input-duration"
                />
              </div>
            </div>
          )}

          {/* Reminder */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Shoot Reminder</Label>
            <Select value={reminderPreset} onValueChange={setReminderPreset}>
              <SelectTrigger data-testid="select-reminder">
                <SelectValue placeholder="Set a reminder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No reminder</SelectItem>
                <SelectItem value="15min">15 minutes before</SelectItem>
                <SelectItem value="30min">30 minutes before</SelectItem>
                <SelectItem value="1hour">1 hour before</SelectItem>
                <SelectItem value="1day">1 day before</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>

            {reminderPreset === "custom" && (
              <div className="flex gap-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                      data-testid="button-custom-reminder-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customReminderDate ? format(customReminderDate, "PPP") : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customReminderDate}
                      onSelect={setCustomReminderDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={customReminderTime}
                  onChange={(e) => setCustomReminderTime(e.target.value)}
                  className="flex-1"
                  data-testid="input-custom-reminder-time"
                />
              </div>
            )}
          </div>

          {/* Public Sharing */}
          {!isNew && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone with the link to view this shoot
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                  disabled={togglePublicMutation.isPending}
                  data-testid="switch-public"
                />
              </div>
              {isPublic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPublicLink}
                  className="w-full"
                  data-testid="button-copy-link"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Public Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources Section - Gallery Layout */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          {/* Location with Image and Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Location</Label>
            </div>

            {selectedLocation && (
              <div className="space-y-3">
                <Card className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {selectedLocation.imageUrl && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={selectedLocation.imageUrl} 
                            alt={selectedLocation.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                            {selectedLocation.address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {selectedLocation.address}
                              </p>
                            )}
                            {selectedLocation.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{selectedLocation.notes}</p>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Maps Embed */}
                {selectedLocation.address && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(selectedLocation.address)}`}
                      allowFullScreen
                      data-testid="map-embed"
                    />
                  </div>
                )}
              </div>
            )}

            <Select value={locationId} onValueChange={(value) => {
              if (value === "_create_new") {
                setCreateLocationOpen(true);
                return;
              }
              setLocationId(value);
            }}>
              <SelectTrigger data-testid="select-location">
                <SelectValue placeholder="Select a location..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_create_new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New...</span>
                  </div>
                </SelectItem>
                {availableLocations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
                {availableLocations.length === 0 && selectedLocation && (
                  <SelectItem value="_none" disabled>No other locations available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Costumes - Gallery Grid */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Characters/Costumes</Label>

            {selectedCostumes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCostumes.map((costumeId) => {
                  const costume = costumes.find(c => c.id === costumeId);
                  if (!costume) return null;
                  return (
                    <Card key={costumeId} className="hover-elevate overflow-hidden">
                      <CardContent className="p-0">
                        {costume.imageUrl && (
                          <div className="w-full aspect-square relative">
                            <img 
                              src={costume.imageUrl} 
                              alt={costume.characterName}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => removeCostume(costumeId)}
                              data-testid={`button-remove-costume-${costumeId}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-semibold">{costume.characterName}</p>
                          {costume.seriesName && (
                            <p className="text-sm text-muted-foreground">{costume.seriesName}</p>
                          )}
                          {!costume.imageUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeCostume(costumeId)}
                              data-testid={`button-remove-costume-${costumeId}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => {
              if (value === "_create_new") {
                setCreateCostumesOpen(true);
                return;
              }
              setSelectedCostumes([...selectedCostumes, value]);
            }}>
              <SelectTrigger data-testid="select-costume">
                <SelectValue placeholder="Add a costume..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_create_new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New...</span>
                  </div>
                </SelectItem>
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

          {/* Props - Gallery Grid */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Props</Label>

            {selectedProps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedProps.map((propId) => {
                  const prop = props.find(p => p.id === propId);
                  if (!prop) return null;
                  return (
                    <Card key={propId} className="hover-elevate overflow-hidden">
                      <CardContent className="p-0">
                        {prop.imageUrl && (
                          <div className="w-full aspect-square relative">
                            <img 
                              src={prop.imageUrl} 
                              alt={prop.name}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => removeProp(propId)}
                              data-testid={`button-remove-prop-${propId}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{prop.name}</p>
                            {!prop.imageUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProp(propId)}
                                data-testid={`button-remove-prop-${propId}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {prop.description && (
                            <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
                          )}
                          <Badge variant={prop.available ? "default" : "secondary"} className="mt-2">
                            {prop.available ? "Available" : "In Use"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => {
              if (value === "_create_new") {
                setCreatePropsOpen(true);
                return;
              }
              setSelectedProps([...selectedProps, value]);
            }}>
              <SelectTrigger data-testid="select-prop">
                <SelectValue placeholder="Add prop..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_create_new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New...</span>
                  </div>
                </SelectItem>
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

          {/* Personnel - Prominent Avatars */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Team</Label>

            {selectedPersonnel.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPersonnel.map((personnelId) => {
                  const person = personnel.find(p => p.id === personnelId);
                  if (!person) return null;
                  return (
                    <Card key={personnelId} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={person.avatarUrl || undefined} />
                            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div>
                              <p className="font-semibold">{person.name}</p>
                              {person.email && (
                                <p className="text-sm text-muted-foreground truncate">{person.email}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {personnelRoles[personnelId] === "__CUSTOM__" || (personnelRoles[personnelId] && !['Photographer', 'Videographer', 'Model', 'Makeup Artist', 'Stylist', 'Assistant', 'Coordinator'].includes(personnelRoles[personnelId])) ? (
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    placeholder="Custom role"
                                    value={personnelRoles[personnelId] === "__CUSTOM__" ? "" : personnelRoles[personnelId] || ""}
                                    onChange={(e) => setPersonnelRoles({
                                      ...personnelRoles,
                                      [personnelId]: e.target.value
                                    })}
                                    data-testid={`input-custom-role-${personnelId}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPersonnelRoles({
                                      ...personnelRoles,
                                      [personnelId]: ""
                                    })}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Select
                                  value={personnelRoles[personnelId] || ""}
                                  onValueChange={(value) => {
                                    if (value === "_custom") {
                                      setPersonnelRoles({
                                        ...personnelRoles,
                                        [personnelId]: "__CUSTOM__"
                                      });
                                    } else {
                                      setPersonnelRoles({
                                        ...personnelRoles,
                                        [personnelId]: value
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="flex-1" data-testid={`select-role-${personnelId}`}>
                                    <SelectValue placeholder="Select role..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Photographer">Photographer</SelectItem>
                                    <SelectItem value="Videographer">Videographer</SelectItem>
                                    <SelectItem value="Model">Model</SelectItem>
                                    <SelectItem value="Makeup Artist">Makeup Artist</SelectItem>
                                    <SelectItem value="Stylist">Stylist</SelectItem>
                                    <SelectItem value="Assistant">Assistant</SelectItem>
                                    <SelectItem value="Coordinator">Coordinator</SelectItem>
                                    <SelectItem value="_custom">
                                      <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>Custom Role...</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
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
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => {
              if (value === "_create_new") {
                setCreatePersonnelOpen(true);
                return;
              }
              setSelectedPersonnel([...selectedPersonnel, value]);
            }}>
              <SelectTrigger data-testid="select-personnel">
                <SelectValue placeholder="Add personnel..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_create_new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New...</span>
                  </div>
                </SelectItem>
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

          {/* Equipment - Compact List */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Equipment</Label>

            {selectedEquipment.length > 0 && (
              <div className="space-y-2">
                {selectedEquipment.map((equipmentId) => {
                  const item = equipment.find(e => e.id === equipmentId);
                  if (!item) return null;
                  return (
                    <Card key={equipmentId} className="hover-elevate">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.category && (
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.available ? "default" : "secondary"}>
                              {item.available ? "Available" : "In Use"}
                            </Badge>
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Select value="" onValueChange={(value) => {
              if (value === "_create_new") {
                setCreateEquipmentOpen(true);
                return;
              }
              setSelectedEquipment([...selectedEquipment, value]);
            }}>
              <SelectTrigger data-testid="select-equipment">
                <SelectValue placeholder="Add equipment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_create_new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New...</span>
                  </div>
                </SelectItem>
                {availableEquipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.category}
                  </SelectItem>
                ))}
                {availableEquipment.length === 0 && (
                  <SelectItem value="_none" disabled>No equipment available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Instagram Links Section */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Instagram References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://instagram.com/p/..."
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInstagramLink();
                }
              }}
              data-testid="input-instagram-link"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addInstagramLink}
              data-testid="button-add-link"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section - Bottom of Page */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea
            placeholder="Add any additional details, ideas, or notes about the shoot..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            data-testid="textarea-notes"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-submit"
        >
          {createMutation.isPending || updateMutation.isPending ? "Saving..." : isNew ? "Create Shoot" : "Update Shoot"}
        </Button>
      </div>

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
    </div>
  );
}
