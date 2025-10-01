import { useState } from 'react';
import { AddShootDialog } from '../AddShootDialog';
import { Button } from '@/components/ui/button';

export default function AddShootDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Add Shoot Dialog</Button>
      <AddShootDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
