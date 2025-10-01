import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Camera, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ShootCard } from "@/components/ShootCard";
import { UpcomingShootsSection } from "@/components/UpcomingShootsSection";
import { AddShootDialog } from "@/components/AddShootDialog";
import { ShootDetailView } from "@/components/ShootDetailView";
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';
import studioImage from '@assets/generated_images/Studio_cosplay_shoot_reference_a9b46c37.png';
import forestImage from '@assets/generated_images/Forest_cosplay_shoot_reference_c64c29f5.png';
import cyberpunkImage from '@assets/generated_images/Cyberpunk_cosplay_shoot_reference_34e2553e.png';

export default function Dashboard() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);

  const upcomingShoots = [
    {
      id: '1',
      title: 'Cyberpunk 2077 - V Character Shoot',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Downtown Industrial District',
      image: heroImage,
      hasCalendar: true,
      hasDocs: true,
      countdown: '5 days',
    },
    {
      id: '2',
      title: 'Genshin Impact - Raiden Shogun',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Cherry Blossom Park',
      image: studioImage,
      hasCalendar: true,
      hasDocs: true,
      countdown: '2 weeks',
    },
  ];

  const allShoots = [
    {
      id: '1',
      title: 'Cyberpunk 2077 - V Character',
      image: heroImage,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Downtown Industrial District',
      participants: 3,
      status: 'scheduled' as const,
      hasCalendar: true,
      hasDocs: true,
      referenceCount: 8,
    },
    {
      id: '2',
      title: 'Genshin Impact - Raiden Shogun',
      image: studioImage,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Cherry Blossom Park',
      participants: 2,
      status: 'planning' as const,
      hasDocs: true,
      referenceCount: 5,
    },
    {
      id: '3',
      title: 'Final Fantasy VII Remake',
      image: forestImage,
      status: 'idea' as const,
      referenceCount: 3,
    },
    {
      id: '4',
      title: 'Demon Slayer - Nezuko',
      image: cyberpunkImage,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      location: 'Japanese Garden',
      participants: 4,
      status: 'scheduled' as const,
      hasCalendar: true,
      hasDocs: true,
      referenceCount: 6,
    },
  ];

  const detailedShoot = {
    id: '1',
    title: 'Cyberpunk 2077 - V Character Shoot',
    status: 'scheduled' as const,
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Downtown Industrial District',
    description: 'Full character cosplay shoot for V from Cyberpunk 2077. Planning to capture both action poses and atmospheric shots with neon lighting. Bringing multiple costume pieces and props including iconic jacket and weapons.\n\nLocation scouting completed - found perfect alley with great neon signage. Need to shoot during evening for best lighting conditions.',
    participants: [
      { name: 'Alex Chen', role: 'Cosplayer' },
      { name: 'Jordan Smith', role: 'Photographer' },
      { name: 'Sam Taylor', role: 'Assistant' },
    ],
    references: [heroImage, studioImage, forestImage, cyberpunkImage],
    instagramLinks: [
      'https://instagram.com/p/example1',
      'https://instagram.com/p/example2',
    ],
    calendarEventUrl: 'https://calendar.google.com/example',
    docsUrl: 'https://docs.google.com/example',
  };

  if (selectedShootId) {
    return (
      <ShootDetailView
        shoot={detailedShoot}
        onBack={() => setSelectedShootId(null)}
        onEdit={() => console.log('Edit shoot')}
        onDelete={() => {
          console.log('Delete shoot');
          setSelectedShootId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage your cosplay photo shoots
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setAddDialogOpen(true)}
          data-testid="button-add-shoot"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Shoot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shoots"
          value={21}
          icon={Camera}
          description="All time"
          trend={{ value: '+3 this month', isPositive: true }}
        />
        <StatCard
          title="Scheduled"
          value={4}
          icon={Calendar}
          description="Upcoming shoots"
        />
        <StatCard
          title="In Planning"
          value={2}
          icon={Clock}
          description="Being organized"
        />
        <StatCard
          title="Completed"
          value={12}
          icon={CheckCircle2}
          description="This year"
          trend={{ value: '+2 this month', isPositive: true }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Upcoming Shoots</h2>
        </div>
        <UpcomingShootsSection
          shoots={upcomingShoots}
          onShootClick={(id) => setSelectedShootId(id)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Shoots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allShoots.map((shoot) => (
            <ShootCard
              key={shoot.id}
              {...shoot}
              onClick={() => setSelectedShootId(shoot.id)}
            />
          ))}
        </div>
      </div>

      <AddShootDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
