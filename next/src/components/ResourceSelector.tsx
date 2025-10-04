import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X } from "lucide-react";

interface BaseResource {
  id: string;
  name?: string;
  characterName?: string;
}

interface PersonnelResource extends BaseResource {
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface EquipmentResource extends BaseResource {
  name: string;
  category?: string | null;
  quantity?: number;
  available?: boolean;
}

interface PropResource extends BaseResource {
  name: string;
  description?: string | null;
  available?: boolean;
  imageUrl?: string | null;
}

interface CostumeResource extends BaseResource {
  characterName: string;
  seriesName?: string | null;
  status?: string;
  completionPercentage?: number | null;
  imageUrl?: string | null;
}

interface LocationResource extends BaseResource {
  name: string;
  address?: string | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

type Resource = PersonnelResource | EquipmentResource | PropResource | CostumeResource | LocationResource;

interface ResourceSelectorProps<T extends Resource> {
  title: string;
  resources: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  roles?: Record<string, string>;
  onRoleChange?: (personnelId: string, role: string) => void;
  showRoles?: boolean;
  onCreateNew: () => void;
  emptyMessage: string;
  type: 'personnel' | 'equipment' | 'props' | 'costumes' | 'locations';
  singleSelect?: boolean;
}

export function ResourceSelector<T extends Resource>({
  title,
  resources,
  selectedIds,
  onSelectionChange,
  roles = {},
  onRoleChange,
  showRoles = false,
  onCreateNew,
  emptyMessage,
  type,
  singleSelect = false,
}: ResourceSelectorProps<T>) {
  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleSelection = (id: string) => {
    if (singleSelect) {
      // For single select (like locations), toggle or replace selection
      if (isSelected(id)) {
        onSelectionChange([]);
      } else {
        onSelectionChange([id]);
      }
    } else {
      // For multi-select
      if (isSelected(id)) {
        onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  const getResourceName = (resource: T): string => {
    if ('characterName' in resource) {
      return resource.characterName || '';
    }
    return resource.name || '';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderPersonnelDetails = (resource: PersonnelResource) => (
    <>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={resource.avatarUrl || undefined} />
          <AvatarFallback>{getInitials(resource.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{resource.name}</p>
          {resource.email && (
            <p className="text-xs text-muted-foreground truncate">{resource.email}</p>
          )}
        </div>
      </div>
      {showRoles && isSelected(resource.id) && onRoleChange && (
        <div className="w-full mt-2">
          <Input
            placeholder="Role (e.g., Photographer, Model)"
            value={roles[resource.id] || ''}
            onChange={(e) => onRoleChange(resource.id, e.target.value)}
            className="text-sm"
            data-testid={`input-role-${resource.id}`}
          />
        </div>
      )}
    </>
  );

  const renderEquipmentDetails = (resource: EquipmentResource) => (
    <div className="flex items-center justify-between flex-1">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{resource.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {resource.category && (
            <Badge variant="secondary" className="text-xs">{resource.category}</Badge>
          )}
          {resource.quantity && resource.quantity > 1 && (
            <span className="text-xs text-muted-foreground">Qty: {resource.quantity}</span>
          )}
          {resource.available !== undefined && !resource.available && (
            <Badge variant="destructive" className="text-xs">Unavailable</Badge>
          )}
        </div>
      </div>
    </div>
  );

  const renderPropDetails = (resource: PropResource) => (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {resource.imageUrl && (
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
          <img src={resource.imageUrl} alt={resource.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{resource.name}</p>
        {resource.description && (
          <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
        )}
        {resource.available !== undefined && !resource.available && (
          <Badge variant="destructive" className="text-xs mt-1">Unavailable</Badge>
        )}
      </div>
    </div>
  );

  const renderCostumeDetails = (resource: CostumeResource) => (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {resource.imageUrl && (
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
          <img src={resource.imageUrl} alt={resource.characterName} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{resource.characterName}</p>
        {resource.seriesName && (
          <p className="text-xs text-muted-foreground truncate">{resource.seriesName}</p>
        )}
        {resource.completionPercentage !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">{resource.status}</Badge>
            <span className="text-xs text-muted-foreground">{resource.completionPercentage}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderLocationDetails = (resource: LocationResource) => (
    <div className="flex-1 min-w-0">
      <p className="font-medium truncate">{resource.name}</p>
      {resource.address && (
        <p className="text-xs text-muted-foreground truncate">{resource.address}</p>
      )}
      {!resource.address && resource.notes && (
        <p className="text-xs text-muted-foreground truncate">{resource.notes}</p>
      )}
    </div>
  );

  const renderResourceDetails = (resource: T) => {
    switch (type) {
      case 'personnel':
        return renderPersonnelDetails(resource as PersonnelResource);
      case 'equipment':
        return renderEquipmentDetails(resource as EquipmentResource);
      case 'props':
        return renderPropDetails(resource as PropResource);
      case 'costumes':
        return renderCostumeDetails(resource as CostumeResource);
      case 'locations':
        return renderLocationDetails(resource as LocationResource);
      default:
        return <p className="font-medium">{getResourceName(resource)}</p>;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCreateNew}
          data-testid={`button-create-${type}`}
        >
          <Plus className="h-3 w-3 mr-1" />
          Create new
        </Button>
      </div>

      {resources.length > 0 ? (
        <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className={`p-3 cursor-pointer hover-elevate ${
                isSelected(resource.id) ? 'bg-accent/50' : ''
              }`}
              onClick={() => toggleSelection(resource.id)}
              data-testid={`resource-item-${resource.id}`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-1 h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${
                  isSelected(resource.id) ? 'bg-primary border-primary' : 'border-input'
                }`}>
                  {isSelected(resource.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  {renderResourceDetails(resource)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {selectedIds.length > 0 && !singleSelect && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} {type === 'personnel' ? 'person' : type === 'equipment' ? 'item' : type}{selectedIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
