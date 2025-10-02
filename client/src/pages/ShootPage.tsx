import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InsertShoot, Equipment, Location, Prop, CostumeProgress, Personnel } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge, type ShootStatus } from "@/components/StatusBadge";
import { CreatePersonnelDialog } from "@/components/CreatePersonnelDialog";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import { CreateLocationDialog } from "@/components/CreateLocationDialog";
import { CreatePropsDialog } from "@/components/CreatePropsDialog";
import { CreateCostumesDialog } from "@/components/CreateCostumesDialog";
import { EditableField } from "@/components/EditableField";
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
  const [status, setStatus] = useState<ShootStatus>("idea");
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

  const { data: existingShoot } = useQuery<any>({
    queryKey: ["/api/shoots", id],
    enabled: !isNew && !!id,
  });

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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Compact Header */}
      <div className="space-y-4">
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
            {existingShoot?.calendarEventUrl ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="button-view-calendar"
              >
                <a href={existingShoot?.calendarEventUrl} target="_blank" rel="noopener noreferrer">
                  <SiGooglecalendar className="h-4 w-4 mr-2" />
                  Calendar
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => createCalendarEventMutation.mutate()}
                disabled={isNew || createCalendarEventMutation.isPending}
                data-testid="button-create-calendar"
              >
                <SiGooglecalendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            )}

            {existingShoot?.docsUrl ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="button-view-docs"
              >
                <a href={existingShoot.docsUrl} target="_blank" rel="noopener noreferrer">
                  <SiGoogledocs className="h-4 w-4 mr-2" />
                  Docs
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => createDocsMutation.mutate()}
                disabled={isNew || createDocsMutation.isPending}
                data-testid="button-create-docs"
              >
                <SiGoogledocs className="h-4 w-4 mr-2" />
                Docs
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => sendRemindersMutation.mutate()}
              disabled={isNew || selectedPersonnel.length === 0 || sendRemindersMutation.isPending}
              data-testid="button-send-reminders"
            >
              <Mail className="h-4 w-4 mr-2" />
              Reminders
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={isNew}
              className="text-destructive"
              data-testid="button-delete"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-3xl">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setManualTitle(true);
            }}
            placeholder="Enter shoot title..."
            className="text-3xl md:text-3xl font-bold h-auto py-2 border-0 px-0 focus-visible:ring-0"
            data-testid="input-shoot-title"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer" data-testid="button-edit-status">
                <StatusBadge status={status} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatus("idea" as any)} data-testid="status-option-idea">
                Idea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("planning" as any)} data-testid="status-option-planning">
                Planning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("ready to shoot" as any)} data-testid="status-option-ready">
                Ready to Shoot
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus("completed" as any)} data-testid="status-option-completed">
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {status !== "idea" && (
          <div className="flex items-center gap-3 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
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

            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-auto"
              data-testid="input-time"
            />

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                min="15"
                step="15"
                className="w-20"
                data-testid="input-duration"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Details Section */}
      <Card>
        <CardContent className="space-y-4 p-3">
          {date && time && (
            <div className="space-y-2">
              <Label>Reminder</Label>
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
          )}

          <div className="flex items-center justify-between">
            <Label>Public Sharing</Label>
            <Switch
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isNew || togglePublicMutation.isPending}
              data-testid="switch-public"
            />
          </div>

          {isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPublicLink}
              disabled={isNew}
              className="w-full"
              data-testid="button-copy-link"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add shoot notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              data-testid="textarea-notes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Location</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-location">
                <Plus className="h-4 w-4 mr-2" />
                {selectedLocation ? "Change" : "Add"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuItem onSelect={() => setCreateLocationOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New...
              </DropdownMenuItem>
              {availableLocations.map((loc) => (
                <DropdownMenuItem key={loc.id} onSelect={() => setLocationId(loc.id)}>
                  {loc.name}
                </DropdownMenuItem>
              ))}
              {availableLocations.length === 0 && !selectedLocation && (
                <DropdownMenuItem disabled>No locations available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedLocation && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
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
                
                {selectedLocation.placeId && (
                  <div className="w-full h-64 rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=place_id:${selectedLocation?.placeId}`}
                    />
                  </div>
                )}
                
                {selectedLocation.imageUrl && (
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img 
                      src={selectedLocation.imageUrl} 
                      alt={selectedLocation.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Costumes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Characters & Costumes</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-costume">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuItem onSelect={() => setCreateCostumesOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New...
              </DropdownMenuItem>
              {availableCostumes.map((costume) => (
                <DropdownMenuItem 
                  key={costume.id} 
                  onSelect={() => setSelectedCostumes([...selectedCostumes, costume.id])}
                >
                  {costume.characterName} {costume.seriesName ? `- ${costume.seriesName}` : ''}
                </DropdownMenuItem>
              ))}
              {availableCostumes.length === 0 && (
                <DropdownMenuItem disabled>No costumes available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedCostumes.length > 0 && (
          <div className="space-y-3">
            {selectedCostumes.map((costumeId) => {
              const costume = costumes.find(c => c.id === costumeId);
              if (!costume) return null;
              return (
                <Card key={costumeId} className="overflow-hidden hover-elevate">
                  <CardContent className="p-0 relative">
                    <div className="flex items-start gap-4 p-4">
                      {costume.imageUrl && (
                        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                          <img 
                            src={costume.imageUrl} 
                            alt={costume.characterName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{costume.characterName}</h3>
                        {costume.seriesName && (
                          <p className="text-sm text-muted-foreground mt-1">{costume.seriesName}</p>
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
      </div>

      {/* Props Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Props</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-prop">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuItem onSelect={() => setCreatePropsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New...
              </DropdownMenuItem>
              {availableProps.map((prop) => (
                <DropdownMenuItem 
                  key={prop.id} 
                  onSelect={() => setSelectedProps([...selectedProps, prop.id])}
                >
                  {prop.name}
                </DropdownMenuItem>
              ))}
              {availableProps.length === 0 && (
                <DropdownMenuItem disabled>No props available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedProps.length > 0 && (
          <div className="space-y-3">
            {selectedProps.map((propId) => {
              const prop = props.find(p => p.id === propId);
              if (!prop) return null;
              return (
                <Card key={propId} className="overflow-hidden hover-elevate">
                  <CardContent className="p-0 relative">
                    <div className="flex items-start gap-4 p-4">
                      {prop.imageUrl && (
                        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                          <img 
                            src={prop.imageUrl} 
                            alt={prop.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{prop.name}</h3>
                        <Badge variant={prop.available ? "default" : "secondary"} className="mt-2">
                          {prop.available ? "Available" : "In Use"}
                        </Badge>
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
      </div>

      {/* Team Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Team</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-personnel">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuItem onSelect={() => setCreatePersonnelOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New...
              </DropdownMenuItem>
              {availablePersonnel.map((person) => (
                <DropdownMenuItem 
                  key={person.id} 
                  onSelect={() => setSelectedPersonnel([...selectedPersonnel, person.id])}
                >
                  {person.name}
                </DropdownMenuItem>
              ))}
              {availablePersonnel.length === 0 && (
                <DropdownMenuItem disabled>No personnel available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedPersonnel.length > 0 && (
          <div className="space-y-3">
            {selectedPersonnel.map((personnelId) => {
              const person = personnel.find(p => p.id === personnelId);
              if (!person) return null;
              return (
                <Card key={personnelId} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={person.avatarUrl || undefined} alt={person.name} />
                        <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg">{person.name}</p>
                        {personnelRoles[personnelId] === "__CUSTOM__" ? (
                          <Input
                            value={personnelRoles[`${personnelId}_custom`] || ""}
                            onChange={(e) => setPersonnelRoles({
                              ...personnelRoles,
                              [`${personnelId}_custom`]: e.target.value
                            })}
                            placeholder="Enter custom role..."
                            className="mt-1 text-sm h-8"
                            data-testid={`input-custom-role-${personnelId}`}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                const newRoles = {...personnelRoles};
                                delete newRoles[personnelId];
                                delete newRoles[`${personnelId}_custom`];
                                setPersonnelRoles(newRoles);
                              }
                            }}
                          />
                        ) : (
                          <Select
                            value={personnelRoles[personnelId] || ""}
                            onValueChange={(value) => {
                              if (value === "__CUSTOM__") {
                                setPersonnelRoles({...personnelRoles, [personnelId]: "__CUSTOM__"});
                              } else {
                                const newRoles = {...personnelRoles, [personnelId]: value};
                                delete newRoles[`${personnelId}_custom`];
                                setPersonnelRoles(newRoles);
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1 h-8 text-sm" data-testid={`select-role-${personnelId}`}>
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
                              <SelectItem value="__CUSTOM__">Custom Role...</SelectItem>
                            </SelectContent>
                          </Select>
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Equipment Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Equipment</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-equipment">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuItem onSelect={() => setCreateEquipmentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New...
              </DropdownMenuItem>
              {availableEquipment.map((item) => (
                <DropdownMenuItem 
                  key={item.id} 
                  onSelect={() => setSelectedEquipment([...selectedEquipment, item.id])}
                >
                  {item.name} - {item.category}
                </DropdownMenuItem>
              ))}
              {availableEquipment.length === 0 && (
                <DropdownMenuItem disabled>No equipment available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selectedEquipment.length > 0 && (
          <div className="space-y-3">
            {selectedEquipment.map((equipmentId) => {
              const item = equipment.find(e => e.id === equipmentId);
              if (!item) return null;
              return (
                <Card key={equipmentId} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                        <Badge variant={item.available ? "default" : "secondary"} className="mt-2">
                          {item.available ? "Available" : "In Use"}
                        </Badge>
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
      </div>

      {/* Reference Images Gallery Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reference Images</h2>
          <Button
            variant="outline"
            size="sm"
            disabled={isNew}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = true;
              input.onchange = async (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (!files) return;
                
                for (const file of Array.from(files)) {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('shootId', existingShoot?.id || '');
                  
                  try {
                    await fetch('/api/shoot-references', {
                      method: 'POST',
                      body: formData,
                    });
                  } catch (error) {
                    console.error('Failed to upload reference:', error);
                  }
                }
                
                queryClient.invalidateQueries({ queryKey: ['/api/shoots', existingShoot?.id] });
              };
              input.click();
            }}
            data-testid="button-add-reference"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Images
          </Button>
        </div>

        {existingShoot?.references && existingShoot.references.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingShoot.references.map((ref: any) => (
              <Card key={ref.id} className="overflow-hidden hover-elevate group relative">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img 
                      src={ref.imageUrl} 
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={async () => {
                        try {
                          await fetch(`/api/shoot-references/${ref.id}`, {
                            method: 'DELETE',
                          });
                          queryClient.invalidateQueries({ queryKey: ['/api/shoots', existingShoot?.id] });
                        } catch (error) {
                          console.error('Failed to delete reference:', error);
                        }
                      }}
                      data-testid={`button-remove-reference-${ref.id}`}
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

      {/* Instagram References Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Instagram References</h2>
        
        <div className="flex gap-2">
          <Input
            placeholder="https://instagram.com/p/... or https://instagram.com/reel/..."
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

        {instagramLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instagramLinks.map((link, index) => {
              // Convert Instagram URL to embed URL
              const getEmbedUrl = (url: string) => {
                try {
                  // Match Instagram post/reel URLs
                  const match = url.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
                  if (match) {
                    return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;
                  }
                  return null;
                } catch {
                  return null;
                }
              };

              const embedUrl = getEmbedUrl(link);

              return (
                <Card key={index} className="hover-elevate relative overflow-hidden">
                  <CardContent className="p-0">
                    {embedUrl ? (
                      <div className="relative">
                        <iframe
                          src={embedUrl}
                          className="w-full h-[400px] border-0"
                          frameBorder="0"
                          scrolling="no"
                          allowTransparency={true}
                          data-testid={`embed-instagram-${index}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          onClick={() => removeInstagramLink(index)}
                          data-testid={`button-remove-link-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center justify-between gap-2">
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm truncate flex-1 hover:underline"
                          data-testid={`link-instagram-${index}`}
                        >
                          {link}
                        </a>
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
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
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
