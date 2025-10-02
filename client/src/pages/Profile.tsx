import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Camera, LogOut, UserPlus, UserMinus, Save, Upload, Copy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  createdAt: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showLeaveTeamDialog, setShowLeaveTeamDialog] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
    refetchOnMount: true,
  });

  // Update form fields when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
    }
  }, [profile]);

  // Fetch team membership
  const { data: teamMember } = useQuery<TeamMember>({
    queryKey: ["/api/user/team-member"],
    enabled: !!user,
  });

  // Fetch team details
  const { data: team } = useQuery<Team>({
    queryKey: ["/api/team", teamMember?.teamId],
    enabled: !!teamMember?.teamId,
    queryFn: async () => {
      if (!teamMember?.teamId) throw new Error("No team ID");
      const response = await fetch(`/api/team/${teamMember.teamId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
  });

  // Fetch team invite code
  const { data: teamInvite } = useQuery<{ code: string; inviteUrl: string }>({
    queryKey: ["/api/team", teamMember?.teamId, "invite"],
    enabled: !!teamMember?.teamId && teamMember?.role === "owner",
    queryFn: async () => {
      if (!teamMember?.teamId) throw new Error("No team ID");
      const response = await fetch(`/api/team/${teamMember.teamId}/invite`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch invite");
      return response.json();
    },
  });

  // Update team name when team loads
  useEffect(() => {
    if (team) {
      setTeamName(team.name || "");
    }
  }, [team]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/user/profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/team/${team?.id}`, {
        name: teamName,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team", team?.id] });
      toast({
        title: "Team updated",
        description: "Team name has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/team/join", {
        inviteCode,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/team-member"] });
      toast({
        title: "Team joined",
        description: "You have successfully joined the team.",
      });
      setInviteCode("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join team. Please check the invite code and try again.",
        variant: "destructive",
      });
    },
  });

  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/team/leave");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/team-member"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Team left",
        description: "You have left the team.",
      });
      setShowLeaveTeamDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to leave team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send email invite mutation
  const sendEmailInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!team?.id) throw new Error("No team ID");
      const response = await apiRequest("POST", `/api/team/${team.id}/invite/send`, {
        email,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "Team invitation has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isTeamOwner = teamMember?.role === "owner";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-profile-title">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and team preferences
        </p>
      </div>

      {/* User Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || profile?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(profile?.firstName || null, profile?.lastName || null)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover-elevate"
              >
                <Upload className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  data-testid="input-avatar"
                />
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed at this time
                </p>
              </div>
              <Button
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending || !firstName || !lastName}
                data-testid="button-save-profile"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Settings</CardTitle>
          <CardDescription>
            Manage your team membership and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {team && teamMember ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={!isTeamOwner}
                      placeholder="Team name"
                      data-testid="input-team-name"
                    />
                    {isTeamOwner && (
                      <Button
                        onClick={() => updateTeamMutation.mutate()}
                        disabled={updateTeamMutation.isPending || !teamName}
                        data-testid="button-save-team"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    )}
                  </div>
                  {!isTeamOwner && (
                    <p className="text-xs text-muted-foreground">
                      Only team owners can change the team name
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="font-medium">Your Role</h4>
                    <p className="text-sm text-muted-foreground capitalize">{teamMember.role}</p>
                  </div>
                </div>

                <Separator />

                {isTeamOwner && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Team Invitations</h4>
                      <p className="text-sm text-muted-foreground">
                        Share your team's invite code or send invitations via email
                      </p>
                    </div>
                    {teamInvite && (
                      <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Invite Link</span>
                            <p className="text-xs text-muted-foreground font-mono">{teamInvite.code}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(teamInvite.inviteUrl);
                              toast({
                                title: "Link copied",
                                description: "Invite link copied to clipboard",
                              });
                            }}
                            data-testid="button-copy-invite-link"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Share this link with people you want to invite to your team
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="emailInvite">Send Email Invitation</Label>
                      <div className="flex gap-2">
                        <Input
                          id="emailInvite"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          data-testid="input-email-invite"
                        />
                        <Button
                          onClick={() => {
                            if (inviteCode) {
                              sendEmailInviteMutation.mutate(inviteCode);
                              setInviteCode("");
                            }
                          }}
                          disabled={sendEmailInviteMutation.isPending || !inviteCode}
                          data-testid="button-send-email-invite"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Leave Team</h4>
                  <p className="text-sm text-muted-foreground">
                    {isTeamOwner
                      ? "As the team owner, leaving will create a new personal team for you."
                      : "You will be removed from this team and a new personal team will be created for you."}
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowLeaveTeamDialog(true)}
                    data-testid="button-leave-team"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave Team
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              You are not currently part of a team.
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Join a Team</h4>
            <p className="text-sm text-muted-foreground">
              Enter an invite code to join an existing team
            </p>
            <div className="flex gap-2">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                data-testid="input-invite-code"
              />
              <Button
                onClick={() => joinTeamMutation.mutate()}
                disabled={joinTeamMutation.isPending || !inviteCode}
                data-testid="button-join-team"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Team
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Info & Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
          <CardDescription>
            Manage your application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Camera className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">CosPlay Tracker</h4>
              <p className="text-sm text-muted-foreground">Photo Shoot Manager</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Account Actions</h4>
            <Button
              variant="destructive"
              onClick={() => signOut()}
              data-testid="button-signout"
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Team Confirmation Dialog */}
      <AlertDialog open={showLeaveTeamDialog} onOpenChange={setShowLeaveTeamDialog}>
        <AlertDialogContent data-testid="dialog-leave-team">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this team? A new personal team will be created for you.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-leave-team">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leaveTeamMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-leave-team"
            >
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
