import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { InsertShoot, Equipment, Location, Prop, CostumeProgress, Personnel } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
  import { createCalendarEvent, createCalendarWithProvider, createDocs, createDocsWithProvider, sendReminders, deleteShoot } from "@/lib/shootActions";
import { extractIds, extractId } from "@/lib/resourceUtils";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge, type ShootStatus } from "@/components/StatusBadge";
import { CreatePersonnelDialog } from "@/components/CreatePersonnelDialog";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import { CreateLocationDialog } from "@/components/CreateLocationDialog";
import { CreatePropsDialog } from "@/components/CreatePropsDialog";
import { CreateCostumesDialog } from "@/components/CreateCostumesDialog";
import { EditableField } from "@/components/EditableField";
import { GoogleMap } from "@/components/GoogleMap";
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
import { CalendarIcon, X, Plus, ArrowLeft, Trash2, Mail, ExternalLink, Share2, Edit2, MapPin, Clock, Upload, ImagePlus, ChevronLeft, ChevronRight } from "lucide-react";
import { SiGoogledocs, SiGooglecalendar } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>("#3B82F6");
  const [instagramLinks, setInstagramLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [personnelRoles, setPersonnelRoles] = useState<Record<string, string>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [selectedCostumes, setSelectedCostumes] = useState<string[]>([]);

  // Refs to keep latest values accessible synchronously when persisting
  const personnelRef = useRef(selectedPersonnel);
  const equipmentRef = useRef(selectedEquipment);
  const propsRef = useRef(selectedProps);
  const costumesRef = useRef(selectedCostumes);

  const [createPersonnelOpen, setCreatePersonnelOpen] = useState(false);
  const [createEquipmentOpen, setCreateEquipmentOpen] = useState(false);
  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const [createPropsOpen, setCreatePropsOpen] = useState(false);
  const [createCostumesOpen, setCreateCostumesOpen] = useState(false);

  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingCostume, setEditingCostume] = useState<CostumeProgress | null>(null);
  const [editingProp, setEditingProp] = useState<Prop | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const [pendingReferenceFiles, setPendingReferenceFiles] = useState<File[]>([]);
  const [isDraggingRef, setIsDraggingRef] = useState(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: existingShoot } = useQuery<any>({
    queryKey: ["/api/shoots", id],
    enabled: !isNew && !!id,
  });

  const { data: shootParticipants = [] } = useQuery<any[]>({
    queryKey: ["/api/shoots", id, "participants"],
    enabled: !isNew && !!id,
  });

  const { data: shootEquipment = [] } = useQuery<any[]>({
    queryKey: ["/api/shoots", id, "equipment"],
    enabled: !isNew && !!id,
  });

  const { data: shootProps = [] } = useQuery<any[]>({
    queryKey: ["/api/shoots", id, "props"],
    enabled: !isNew && !!id,
  });

  const { data: shootCostumes = [] } = useQuery<any[]>({
    queryKey: ["/api/shoots", id, "costumes"],
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
      setDescription(existingShoot.description || "");
      setColor(existingShoot.color || "#3B82F6");
      setInstagramLinks(existingShoot.instagramLinks || []);
      setIsPublic(existingShoot.isPublic || false);

    }
  }, [isNew, existingShoot]);

  useEffect(() => {
    if (!isNew && shootParticipants.length > 0) {
      setSelectedPersonnel(extractIds(shootParticipants, ['personnelId', 'personnel_id', 'id']));
      const roles: Record<string, string> = {};
      shootParticipants.forEach((p: any) => {
        const personnelId = extractId(p, ['personnelId', 'personnel_id', 'id']);
        if (p.role && personnelId) roles[personnelId] = p.role;
      });
      setPersonnelRoles(roles);
    }
  }, [isNew, shootParticipants]);

  // keep refs in sync
  useEffect(() => { personnelRef.current = selectedPersonnel; }, [selectedPersonnel]);
  useEffect(() => { equipmentRef.current = selectedEquipment; }, [selectedEquipment]);
  useEffect(() => { propsRef.current = selectedProps; }, [selectedProps]);
  useEffect(() => { costumesRef.current = selectedCostumes; }, [selectedCostumes]);

  useEffect(() => {
    if (!isNew && shootEquipment.length > 0) {
      // API may return either association objects ({ equipmentId }) or full equipment objects ({ id })
      setSelectedEquipment(extractIds(shootEquipment, ['equipmentId', 'equipment_id', 'id']));
    }
  }, [isNew, shootEquipment]);

  useEffect(() => {
    if (!isNew && shootProps.length > 0) {
      // Support both association shape ({ propId }) and full prop object ({ id })
      setSelectedProps(extractIds(shootProps, ['propId', 'prop_id', 'id']));
    }
  }, [isNew, shootProps]);

  useEffect(() => {
    if (!isNew && shootCostumes.length > 0) {
      // Support both association shape ({ costumeId }) and full costume object ({ id })
      setSelectedCostumes(extractIds(shootCostumes, ['costumeId', 'costume_id', 'id']));
    }
  }, [isNew, shootCostumes]);

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
      // Build participants array
      const participants = selectedPersonnel.map(personnelId => {
        const person = personnel.find(p => p.id === personnelId);
        return {
          personnelId,
          name: person?.name || "Unknown",
          role: personnelRoles[personnelId] || "Participant",
        };
      });

      // Use PATCH /api/shoots/:id/resources to set all associations at once
      if (selectedPersonnel.length > 0 || selectedEquipment.length > 0 || selectedProps.length > 0 || selectedCostumes.length > 0) {
        await apiRequest("PATCH", `/api/shoots/${newShoot.id}/resources`, {
          equipmentIds: selectedEquipment,
          propIds: selectedProps,
          costumeIds: selectedCostumes,
          participants: participants,
        });
      }

      if (pendingReferenceFiles.length > 0) {
        for (const file of pendingReferenceFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('shootId', newShoot.id);
          
          try {
            await fetch('/api/shoot-references', {
              method: 'POST',
              body: formData,
            });
          } catch (error) {
            console.error('Failed to upload reference:', error);
          }
        }
        setPendingReferenceFiles([]);
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

  // Helper to append a new resource id to local state and persist to the server for existing shoots
  const appendAndPersist = async (type: "personnel" | "equipment" | "prop" | "costume", newId: string) => {
    if (!newId) return;

    if (type === "personnel") {
      setSelectedPersonnel((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
    } else if (type === "equipment") {
      setSelectedEquipment((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
    } else if (type === "prop") {
      setSelectedProps((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
    } else if (type === "costume") {
      setSelectedCostumes((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
    }

    // If editing an existing shoot, persist associations. Build payload from refs,
    // adding newId to the affected array if it's not already present.
    if (!isNew && id) {
      const equipmentIds = equipmentRef.current.includes(newId) || type !== "equipment"
        ? equipmentRef.current
        : [...equipmentRef.current, newId];
      const propIds = propsRef.current.includes(newId) || type !== "prop"
        ? propsRef.current
        : [...propsRef.current, newId];
      const costumeIds = costumesRef.current.includes(newId) || type !== "costume"
        ? costumesRef.current
        : [...costumesRef.current, newId];
      const personnelIds = personnelRef.current.includes(newId) || type !== "personnel"
        ? personnelRef.current
        : [...personnelRef.current, newId];

      await apiRequest("PATCH", `/api/shoots/${id}/resources`, {
        equipmentIds,
        propIds,
        costumeIds,
        personnelIds,
      }).catch(() => {});

      queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertShoot>) => {
      const response = await apiRequest("PATCH", `/api/shoots/${id}`, data);
      return await response.json();
    },
    onSuccess: async () => {
      if (id) {
        const participants = selectedPersonnel.map(personnelId => {
          const person = personnel.find(p => p.id === personnelId);
          return {
            personnelId,
            name: person?.name || "Unknown",
            role: personnelRoles[personnelId] || "Participant",
          };
        });

        // Send camelCase keys to match server's expected body shape
        await apiRequest("PATCH", `/api/shoots/${id}/resources`, {
          equipmentIds: selectedEquipment,
          propIds: selectedProps,
          costumeIds: selectedCostumes,
          personnelIds: selectedPersonnel,
          participants: participants,
        });
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
      await deleteShoot(id as string);
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
      // Build a snapshot of the current page state so the server can
      // generate a document that reflects unsaved local changes.
      const participantsSnapshot = [
        // include manual participants (those without personnelId)
        ...(shootParticipants || []).filter((p: any) => !p.personnelId).map((p: any) => ({
          name: p.name,
          role: p.role,
          email: p.email || null,
        })),
        // include selected personnel
        ...selectedPersonnel.map(pid => {
          const person = personnel.find(p => p.id === pid);
          return {
            personnelId: pid,
            name: person?.name || 'Unknown',
            role: personnelRoles[pid] || 'Participant',
            email: person?.email || null,
          };
        }),
      ];

      const equipmentSnapshot = selectedEquipment.map(eid => equipment.find(e => e.id === eid)).filter(Boolean);
      const propsSnapshot = selectedProps.map(pid => props.find(p => p.id === pid)).filter(Boolean);
      const costumesSnapshot = selectedCostumes.map(cid => costumes.find(c => c.id === cid)).filter(Boolean);

      const locationSnapshot = selectedLocation || (existingShoot?.location || null);

      const shootSnapshot: any = {
        id: existingShoot?.id || id,
        title,
        status,
        date: date ? date.toISOString() : null,
        time: time || null,
        durationMinutes: durationMinutes || null,
        locationId: locationId || null,
        location: locationSnapshot,
        description: description || null,
        color,
        instagramLinks: instagramLinks.length > 0 ? instagramLinks : [],
        participants: participantsSnapshot,
        references: existingShoot?.references || [],
        equipment: equipmentSnapshot,
        props: propsSnapshot,
        costumes: costumesSnapshot,
      };

      const response = await createDocs(id as string, shootSnapshot);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
      // Open the created/updated doc in a new tab if provided
      if (data?.docUrl) {
        try {
          window.open(data.docUrl, '_blank', 'noopener');
        } catch (e) {
          // ignore popup blockers
        }
        setLastResourceLink({ type: 'docs', url: data.docUrl });
      }

      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      const msg = error?.message || '';
      // If the server indicates the service-account isn't configured, offer OAuth
      if (msg.includes('503') && msg.toLowerCase().includes('google docs')) {
        setSaveModalOpen(true);
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Failed to create/update document",
        variant: "destructive",
      });
    },
  });

  // UI state for Save options modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  // Small persistent hint for last created resource (doc or calendar event)
  const [lastResourceLink, setLastResourceLink] = useState<{ type: 'docs' | 'calendar'; url: string } | null>(null);

  const handleDocsButton = () => {
    // Auto-detect available integrations and pick best flow
    (async () => {
      try {
        const res = await fetch('/api/integrations/check', { credentials: 'include' });
        if (!res.ok) {
          setSaveModalOpen(true);
          return;
        }
        const json = await res.json();
        const { serviceAccountConfigured, oauthClientConfigured, userHasGoogleProvider } = json;

        if (serviceAccountConfigured) {
          // Prefer service account if available
          setSaveModalOpen(true);
          return;
        }

        if (userHasGoogleProvider) {
          // Try to create document using the user's provider token (no re-consent)
          try {
            const resp = await createDocsWithProvider(id as string);
            const data = await resp.json();
            if (data?.docUrl) {
              try { window.open(data.docUrl, '_blank', 'noopener'); } catch (e) {}
            }
            return;
          } catch (e) {
            // If provider-based call fails, fall back to OAuth if available
              if (oauthClientConfigured) {
              startGoogleOAuth('docs');
              return;
            }
          }
        }

        if (oauthClientConfigured) {
          startGoogleOAuth('docs');
          return;
        }

        // Fallback - show modal so user can pick
        setSaveModalOpen(true);
      } catch (e) {
        setSaveModalOpen(true);
      }
    })();
  };

  const handleCalendarButton = () => {
    (async () => {
      try {
        const res = await fetch('/api/integrations/check', { credentials: 'include' });
        if (!res.ok) {
          // fallback to standard create
          createCalendarEventMutation.mutate();
          return;
        }
        const json = await res.json();
        const { serviceAccountConfigured, oauthClientConfigured, userHasGoogleProvider } = json;

        // Prefer provider token if the user signed in with Google
        if (userHasGoogleProvider) {
          try {
            const resp = await createCalendarWithProvider(id as string);
            const data = await resp.json();
            if (data?.eventUrl) {
              try { window.open(data.eventUrl, '_blank', 'noopener'); } catch (e) {}
            }
            return;
          } catch (e) {
            // If provider-based call fails, fall back to OAuth if available
            if (oauthClientConfigured) {
              startGoogleOAuth('calendar');
              return;
            }
          }
        }

        // If user isn't signed in with Google but OAuth client is configured, prompt for consent
        if (oauthClientConfigured) {
          startGoogleOAuth('calendar');
          return;
        }

        // Otherwise fall back to service account (server-side) if present
        if (serviceAccountConfigured) {
          createCalendarEventMutation.mutate();
          return;
        }

        // Final fallback
        createCalendarEventMutation.mutate();
      } catch (e) {
        createCalendarEventMutation.mutate();
      }
    })();
  };

  const startGoogleOAuth = (action: 'docs' | 'calendar') => {
    // Open popup to server oauth-start route which will redirect to Google
    const popup = window.open(`/api/google/oauth-start?action=${action}&shootId=${id}`, '_blank', 'noopener');
    if (!popup) {
      toast({ title: 'Popup blocked', description: 'Please allow popups to authorize Google', variant: 'destructive' });
      return;
    }
    setSaveModalOpen(false);

    // Listen for messages from the popup: both oauth-not-configured and oauth-success
    const onMessage = (ev: MessageEvent) => {
      try {
        const data = ev.data;
        if (!data || typeof data !== 'object') return;

        // Fallback when server says OAuth isn't configured
        if (data.type === 'oauth-not-configured' && data.action === action) {
          if (action === 'docs') {
            createDocsMutation.mutate();
          } else if (action === 'calendar') {
            createCalendarEventMutation.mutate();
          }
          window.removeEventListener('message', onMessage);
          try { if (popup && !popup.closed) popup.close(); } catch (e) {}
          return;
        }

        // Success message: server created the doc or calendar event and posts the URL
        if (data.type === 'oauth-success' && data.action === action) {
              if (action === 'docs' && data.docUrl) {
                try { window.open(data.docUrl, '_blank', 'noopener'); } catch (e) {}
                toast({ title: 'Document created', description: 'Opened in a new tab' });
                setLastResourceLink({ type: 'docs', url: data.docUrl });
              }
              if (action === 'calendar' && data.eventUrl) {
                try { window.open(data.eventUrl, '_blank', 'noopener'); } catch (e) {}
                toast({ title: 'Calendar Event created', description: 'Opened in a new tab' });
                setLastResourceLink({ type: 'calendar', url: data.eventUrl });
              }

          window.removeEventListener('message', onMessage);
          try { if (popup && !popup.closed) popup.close(); } catch (e) {}
          return;
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('message', onMessage, { once: true });
  };

  const createCalendarEventMutation = useMutation({
    mutationFn: async () => {
      const response = await createCalendarEvent(id as string);
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
      const response = await sendReminders(id as string);
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
      description: description.trim() || null,
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

  const generateTitle = (): string => {
    const selectedCostumeData = costumes.filter(c => selectedCostumes.includes(c.id));
    if (selectedCostumeData.length === 0) return "";
    
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
    
    return generatedTitle ? generatedTitle + " Shoot" : "";
  };

  const allImages = [
    ...pendingReferenceFiles.map((file, index) => ({
      id: `pending-${index}`,
      imageUrl: URL.createObjectURL(file),
      isPending: true,
      file,
      index
    })),
    ...(existingShoot?.references || []).map((ref: any) => ({
      ...ref,
      isPending: false
    }))
  ];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Save options dialog markup will be rendered near the end of component

  const handleAddImages = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      
      const fileArray = Array.from(files);
      
      if (isNew) {
        setPendingReferenceFiles([...pendingReferenceFiles, ...fileArray]);
      } else {
        for (const file of fileArray) {
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
      }
    };
    input.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {lastResourceLink && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-between">
          <div className="text-sm">
            {lastResourceLink.type === 'docs' ? (
              <span>Document created. </span>
            ) : (
              <span>Calendar event created. </span>
            )}
            <a href={lastResourceLink.url} target="_blank" rel="noopener noreferrer" className="underline ml-1">Open</a>
          </div>
          <div>
            <button className="text-sm text-muted-foreground" onClick={() => setLastResourceLink(null)}>Dismiss</button>
          </div>
        </div>
      )}
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
                onClick={handleCalendarButton}
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
                onClick={handleDocsButton}
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

        <div className="space-y-2">
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

          {selectedCostumes.length > 0 && costumes.length > 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>Auto title: "{generateTitle()}"</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-primary hover:underline"
                onClick={() => {
                  setTitle(generateTitle());
                  setManualTitle(false);
                }}
                data-testid="button-use-auto-title"
              >
                Use this title
              </Button>
            </div>
          )}
        </div>

        {status !== "idea" && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-transparent p-0">
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

              {/* Clear date button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDate(undefined);
                  setTime("");
                  setReminderPreset("");
                  setCustomReminderDate(undefined);
                  setCustomReminderTime("");
                }}
                data-testid="button-clear-date"
                title="Clear date"
              >
                <X className="h-4 w-4" />
              </Button>

              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-auto border-0 p-0"
                data-testid="input-time"
              />

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select value={String(durationMinutes)} onValueChange={(v) => setDurationMinutes(parseInt(v, 10))}>
                  <SelectTrigger data-testid="select-duration" className="w-28">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 32 }).map((_, i) => {
                      const minutes = (i + 1) * 15; // 15..480 (8 hours)
                      let label = "";
                      if (minutes < 60) {
                        label = `${minutes} min`;
                      } else if (minutes % 60 === 0) {
                        label = `${minutes / 60}h`;
                      } else {
                        const hrs = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        label = `${hrs}h ${mins}m`;
                      }
                      return (
                        <SelectItem key={minutes} value={String(minutes)}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Inline reminders */}
              {date && (
                <div className="flex items-center gap-2">
                  <Label className="sr-only">Reminder</Label>
                  <Select value={reminderPreset} onValueChange={setReminderPreset}>
                    <SelectTrigger data-testid="select-reminder-inline">
                      <SelectValue placeholder="Reminder" />
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
                    <div className="flex gap-2 items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-start text-left font-normal"
                            data-testid="button-custom-reminder-date-inline"
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
                        className="w-32"
                        data-testid="input-custom-reminder-time-inline"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Details Section */}
      <Card>
        <CardContent className="space-y-4 p-3">
          {date && time && (
            <div className="space-y-2">
              {/* Reminders are now shown inline with date/time; keep this block for compatibility */}
              <Label>Reminder</Label>
              <div className="text-sm text-muted-foreground">Reminder settings are shown inline in the date/time row above.</div>
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
            <Label>Description</Label>
            <Textarea
              placeholder="Add shoot description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              data-testid="textarea-description"
            />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: color }} />
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-9 p-1 cursor-pointer"
                  data-testid="input-color"
                />
              </div>
              <div className="text-sm text-muted-foreground">Color used in lists</div>
            </div>
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
          <Card 
            className="cursor-pointer hover-elevate" 
            onClick={() => setEditingLocation(selectedLocation)}
            data-testid={`card-location-${selectedLocation.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {selectedLocation.imageUrl && (
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocationId("");
                      }}
                      data-testid="button-remove-location"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedLocation && selectedLocation.placeId && selectedLocation.latitude !== null && selectedLocation.latitude !== undefined && selectedLocation.longitude !== null && selectedLocation.longitude !== undefined && (
          <div className="mt-4">
            <GoogleMap
              center={{ 
                lat: selectedLocation.latitude, 
                lng: selectedLocation.longitude 
              }}
              zoom={15}
              markers={[{
                position: { 
                  lat: selectedLocation.latitude, 
                  lng: selectedLocation.longitude 
                },
                title: selectedLocation.name
              }]}
              className="h-[300px]"
            />
          </div>
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
                <Card 
                  key={costumeId} 
                  className="overflow-hidden cursor-pointer hover-elevate"
                  onClick={() => setEditingCostume(costume)}
                  data-testid={`card-costume-${costumeId}`}
                >
                  <CardContent className="p-0 relative">
                    <div className="flex items-start gap-4 p-4">
                      {costume.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCostume(costumeId);
                        }}
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
                <Card 
                  key={propId} 
                  className="overflow-hidden cursor-pointer hover-elevate"
                  onClick={() => setEditingProp(prop)}
                  data-testid={`card-prop-${propId}`}
                >
                  <CardContent className="p-0 relative">
                    <div className="flex items-start gap-4 p-4">
                      {prop.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProp(propId);
                        }}
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
                <Card 
                  key={personnelId} 
                  className="cursor-pointer hover-elevate"
                  onClick={() => setEditingPersonnel(person)}
                  data-testid={`card-personnel-${personnelId}`}
                >
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
                            onChange={(e) => {
                              e.stopPropagation();
                              setPersonnelRoles({
                                ...personnelRoles,
                                [`${personnelId}_custom`]: e.target.value
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
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
                            <SelectTrigger 
                              className="mt-1 h-8 text-sm" 
                              data-testid={`select-role-${personnelId}`}
                              onClick={(e) => e.stopPropagation()}
                            >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removePersonnel(personnelId);
                        }}
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
                <Card 
                  key={equipmentId} 
                  className="cursor-pointer hover-elevate"
                  onClick={() => setEditingEquipment(item)}
                  data-testid={`card-equipment-${equipmentId}`}
                >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEquipment(equipmentId);
                        }}
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
        <h2 className="text-lg font-semibold">Reference Images</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allImages.map((image, index) => (
            <Card 
              key={image.id} 
              className="overflow-hidden hover-elevate cursor-pointer group"
              data-testid={`card-reference-image-${index}`}
            >
              <CardContent 
                className="p-0 relative aspect-square"
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={image.imageUrl} 
                  alt={image.isPending ? "Pending reference" : "Reference"}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (image.isPending) {
                      setPendingReferenceFiles(pendingReferenceFiles.filter((_, i) => i !== image.index));
                    } else {
                      try {
                        await fetch(`/api/shoot-references/${image.id}`, {
                          method: 'DELETE',
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/shoots', existingShoot?.id] });
                      } catch (error) {
                        console.error('Failed to delete reference:', error);
                      }
                    }
                  }}
                  data-testid={`button-remove-reference-${image.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            className="border-dashed cursor-pointer hover-elevate"
            onClick={handleAddImages}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingRef(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingRef(false);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDraggingRef(false);
              
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              if (files.length === 0) return;

              if (isNew) {
                setPendingReferenceFiles([...pendingReferenceFiles, ...files]);
              } else {
                for (const file of files) {
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
              }
            }}
            data-testid="card-add-reference-images"
          >
            <CardContent className="aspect-square flex flex-col items-center justify-center p-4">
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center">Add Reference Images</span>
            </CardContent>
          </Card>
        </div>
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
        open={createPersonnelOpen || !!editingPersonnel}
        onOpenChange={(open) => {
          setCreatePersonnelOpen(open);
          if (!open) setEditingPersonnel(null);
        }}
        editItem={editingPersonnel || undefined}
        onSave={async (newPersonnel) => {
          const newId = extractId(newPersonnel, ['id', 'personnelId', 'personnel_id']);
          if (!newId) return;
          setSelectedPersonnel((prev) => {
            if (prev.includes(newId)) return prev;
            return [...prev, newId];
          });
          if (!isNew && id) {
            await apiRequest("PATCH", `/api/shoots/${id}/resources`, {
              equipmentIds: selectedEquipment,
              propIds: selectedProps,
              costumeIds: selectedCostumes,
              personnelIds: [...selectedPersonnel, newId],
            }).catch(() => {});
            queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
          }
          queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
        }}
      />
      <CreateEquipmentDialog
        open={createEquipmentOpen || !!editingEquipment}
        onOpenChange={(open) => {
          setCreateEquipmentOpen(open);
          if (!open) setEditingEquipment(null);
        }}
        editItem={editingEquipment || undefined}
        onSave={async (newEquipment) => {
          const newId = extractId(newEquipment, ['id', 'equipmentId', 'equipment_id']);
          if (!newId) return;
          setSelectedEquipment((prev) => {
            if (prev.includes(newId)) return prev;
            return [...prev, newId];
          });
          if (!isNew && id) {
            await apiRequest("PATCH", `/api/shoots/${id}/resources`, {
              equipmentIds: [...selectedEquipment, newId],
              propIds: selectedProps,
              costumeIds: selectedCostumes,
              personnelIds: selectedPersonnel,
            }).catch(() => {});
            queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
          }
          queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
        }}
      />
      <CreateLocationDialog
        open={createLocationOpen || !!editingLocation}
        onOpenChange={(open) => {
          setCreateLocationOpen(open);
          if (!open) setEditingLocation(null);
        }}
        editItem={editingLocation || undefined}
        onSave={async (newLocation) => {
          const newId = extractId(newLocation, ['id', 'locationId', 'location_id']);
          if (!newId) return;
          setLocationId(newId);
          if (!isNew && id) {
            await apiRequest("PATCH", `/api/shoots/${id}`, { locationId: newId }).catch(() => {});
            queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
          }
          queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
        }}
      />
      <CreatePropsDialog
        open={createPropsOpen || !!editingProp}
        onOpenChange={(open) => {
          setCreatePropsOpen(open);
          if (!open) setEditingProp(null);
        }}
        editItem={editingProp || undefined}
        onSave={async (newProp) => {
          const newId = extractId(newProp, ['id', 'propId', 'prop_id']);
          if (!newId) return;
          setSelectedProps((prev) => {
            if (prev.includes(newId)) return prev;
            return [...prev, newId];
          });
          if (!isNew && id) {
            await apiRequest("PATCH", `/api/shoots/${id}/resources`, {
              equipmentIds: selectedEquipment,
              propIds: [...selectedProps, newId],
              costumeIds: selectedCostumes,
              personnelIds: selectedPersonnel,
            }).catch(() => {});
            queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
          }
          queryClient.invalidateQueries({ queryKey: ["/api/props"] });
        }}
      />
      <CreateCostumesDialog
        open={createCostumesOpen || !!editingCostume}
        onOpenChange={(open) => {
          setCreateCostumesOpen(open);
          if (!open) setEditingCostume(null);
        }}
        editItem={editingCostume || undefined}
        onSave={async (newCostume) => {
          const newId = extractId(newCostume, ['id', 'costumeId', 'costume_id']);
          if (!newId) return;
          setSelectedCostumes((prev) => {
            if (prev.includes(newId)) return prev;
            return [...prev, newId];
          });
          if (!isNew && id) {
            await apiRequest("PATCH", `/api/shoots/${id}/resources`, {
              equipmentIds: selectedEquipment,
              propIds: selectedProps,
              costumeIds: [...selectedCostumes, newId],
              personnelIds: selectedPersonnel,
            }).catch(() => {});
            queryClient.invalidateQueries({ queryKey: ["/api/shoots", id] });
          }
          queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
        }}
      />

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0" aria-describedby="lightbox-description">
          <DialogTitle className="sr-only">Reference Image Viewer</DialogTitle>
          <div className="relative bg-black" id="lightbox-description">
            {allImages.length > 0 && allImages[currentImageIndex] && (
              <img 
                src={allImages[currentImageIndex].imageUrl} 
                alt="Reference image"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            
            {allImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={prevImage}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={nextImage}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
          
          {allImages.length > 0 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Save options</DialogTitle>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">Choose how you'd like to save this shoot.</p>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 border rounded-md"
                onClick={() => { createDocsMutation.mutate(); setSaveModalOpen(false); }}
                data-testid="save-with-service-account"
              >
                Save with service account
              </button>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => startGoogleOAuth('docs')}
                data-testid="save-to-google"
              >
                Save to your Google
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
