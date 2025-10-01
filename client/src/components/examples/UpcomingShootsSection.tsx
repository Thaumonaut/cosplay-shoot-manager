import { UpcomingShootsSection } from '../UpcomingShootsSection';
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';
import studioImage from '@assets/generated_images/Studio_cosplay_shoot_reference_a9b46c37.png';

export default function UpcomingShootsSectionExample() {
  const shoots = [
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

  return (
    <div className="p-6">
      <UpcomingShootsSection
        shoots={shoots}
        onShootClick={(id) => console.log('Shoot clicked:', id)}
      />
    </div>
  );
}
