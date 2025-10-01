import { ShootDetailView } from '../ShootDetailView';
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';
import studioImage from '@assets/generated_images/Studio_cosplay_shoot_reference_a9b46c37.png';
import forestImage from '@assets/generated_images/Forest_cosplay_shoot_reference_c64c29f5.png';
import cyberpunkImage from '@assets/generated_images/Cyberpunk_cosplay_shoot_reference_34e2553e.png';

export default function ShootDetailViewExample() {
  const shoot = {
    id: '1',
    title: 'Cyberpunk 2077 - V Character Shoot',
    status: 'scheduled' as const,
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Downtown Industrial District',
    description: 'Full character cosplay shoot for V from Cyberpunk 2077. Planning to capture both action poses and atmospheric shots with neon lighting. Bringing multiple costume pieces and props including iconic jacket and weapons.\n\nLocation scouting completed - found perfect alley with great neon signage. Need to shoot during evening for best lighting conditions.',
    participants: [
      { name: 'Alex Chen', role: 'Cosplayer', avatar: '' },
      { name: 'Jordan Smith', role: 'Photographer', avatar: '' },
      { name: 'Sam Taylor', role: 'Assistant', avatar: '' },
    ],
    references: [heroImage, studioImage, forestImage, cyberpunkImage],
    instagramLinks: [
      'https://instagram.com/p/example1',
      'https://instagram.com/p/example2',
    ],
    calendarEventUrl: 'https://calendar.google.com/example',
    docsUrl: 'https://docs.google.com/example',
  };

  return (
    <ShootDetailView
      shoot={shoot}
      onBack={() => console.log('Back clicked')}
      onEdit={() => console.log('Edit clicked')}
      onDelete={() => console.log('Delete clicked')}
    />
  );
}
