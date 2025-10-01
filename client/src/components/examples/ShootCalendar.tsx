import { ShootCalendar } from '../ShootCalendar';

export default function ShootCalendarExample() {
  const shoots = [
    {
      id: '1',
      title: 'Cyberpunk 2077 - V',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'scheduled' as const,
    },
    {
      id: '2',
      title: 'Genshin Impact',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'planning' as const,
    },
    {
      id: '3',
      title: 'Demon Slayer',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'scheduled' as const,
    },
  ];

  return (
    <div className="p-6">
      <ShootCalendar
        shoots={shoots}
        onShootClick={(id) => console.log('Shoot clicked:', id)}
      />
    </div>
  );
}
