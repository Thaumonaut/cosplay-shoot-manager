import { ShootCard } from '../ShootCard';
import heroImage from '@assets/generated_images/Cosplay_photo_shoot_hero_image_70beec03.png';

export default function ShootCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <ShootCard
        id="1"
        title="Cyberpunk 2077 - V Character"
        image={heroImage}
        date={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
        location="Downtown Industrial District"
        participants={3}
        status="scheduled"
        hasCalendar={true}
        hasDocs={true}
        referenceCount={8}
        onClick={() => console.log('Shoot card clicked')}
      />
      <ShootCard
        id="2"
        title="Genshin Impact - Raiden Shogun"
        date={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
        location="Cherry Blossom Park"
        participants={2}
        status="planning"
        hasCalendar={false}
        hasDocs={true}
        referenceCount={5}
        onClick={() => console.log('Shoot card clicked')}
      />
      <ShootCard
        id="3"
        title="Final Fantasy VII Remake Ideas"
        status="idea"
        referenceCount={3}
        onClick={() => console.log('Shoot card clicked')}
      />
    </div>
  );
}
