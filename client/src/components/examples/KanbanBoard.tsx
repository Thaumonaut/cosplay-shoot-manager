import { KanbanBoard } from '../KanbanBoard';
import { Lightbulb, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';
import studioImage from '@assets/generated_images/Studio_cosplay_shoot_reference_a9b46c37.png';

export default function KanbanBoardExample() {
  const columns = [
    {
      id: 'ideas',
      title: 'Ideas',
      icon: Lightbulb,
      shoots: [
        {
          id: '1',
          title: 'Final Fantasy VII Remake',
          referenceCount: 3,
        },
      ],
    },
    {
      id: 'planning',
      title: 'Planning',
      icon: Clock,
      shoots: [
        {
          id: '2',
          title: 'Genshin Impact - Raiden Shogun',
          image: studioImage,
          location: 'Cherry Blossom Park',
          participants: 2,
          hasDocs: true,
          referenceCount: 5,
        },
      ],
    },
    {
      id: 'scheduled',
      title: 'Scheduled',
      icon: Calendar,
      shoots: [
        {
          id: '3',
          title: 'Cyberpunk 2077 - V Character',
          image: heroImage,
          location: 'Downtown Industrial',
          participants: 3,
          hasCalendar: true,
          hasDocs: true,
          referenceCount: 8,
        },
      ],
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      shoots: [],
    },
  ];

  return (
    <div className="p-6">
      <KanbanBoard
        columns={columns}
        onShootClick={(id) => console.log('Shoot clicked:', id)}
      />
    </div>
  );
}
