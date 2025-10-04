import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type ReferenceImage = {
  id?: string;
  imageUrl: string;
  notes?: string | null;
  isPending?: boolean;
};

type Props = {
  open: boolean;
  initialIndex: number;
  images: ReferenceImage[];
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
  onSaveNotes?: (id: string, notes: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  // Called when the user requests deletion (used to show a confirmation dialog in the parent)
  onRequestDelete?: (id: string, data?: any) => void;
};

export default function ReferenceLightbox({
  open,
  initialIndex,
  images,
  onOpenChange,
  onIndexChange,
  onSaveNotes,
  onDelete,
  onRequestDelete,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    const current = images[index];
    setNotes(current?.notes || '');
  }, [index, images]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images]);

  const prev = () => {
    setIndex((i) => (images.length === 0 ? 0 : (i - 1 + images.length) % images.length));
    onIndexChange?.((index - 1 + images.length) % images.length);
  };
  const next = () => {
    setIndex((i) => (images.length === 0 ? 0 : (i + 1) % images.length));
    onIndexChange?.((index + 1) % images.length);
  };

  const handleSave = async () => {
    const img = images[index];
    if (!img || !img.id || !onSaveNotes) return;
    setSaving(true);
    try {
      await onSaveNotes(img.id, notes);
      // close the lightbox after successful save
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const img = images[index];
    if (!img || !img.id || !onDelete) return;
    // Prefer a request-delete callback so parent can show confirmation + undo
    if (onRequestDelete) {
      onRequestDelete(img.id, img);
      return;
    }

    await onDelete(img.id);
  };

  if (!images) return null;

  const current = images[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 max-h-[90vh]">
        <DialogTitle className="sr-only">Reference Image Viewer</DialogTitle>

        <div className="w-full flex flex-col bg-black text-white">
          <div className="relative flex items-center justify-center w-full max-h-[60vh]">
            <img className="max-h-full w-auto object-contain" src={current?.imageUrl} alt="Reference" />

            {/* Delete overlay in top-right of image */}
            {current && !current.isPending && (
              <button
                aria-label="Delete reference"
                className="absolute right-4 top-4 z-40 bg-black/50 hover:bg-black/60 p-2 rounded-md"
                onClick={() => handleDelete()}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/60 p-2 rounded-full shadow-md"
                  onClick={prev}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/60 p-2 rounded-full shadow-md"
                  onClick={next}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>

          <div className="p-4 bg-background text-foreground border border-border">
            <div className="text-sm text-muted-foreground text-center mb-2">
              {index + 1} / {images.length}
            </div>

            {current && !current.isPending && (
              <div className="flex flex-col gap-2">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                <div className="flex justify-between">
                  <div>
                    <Button variant="ghost" onClick={handleDelete} className="ml-2">Delete</Button>
                  </div>
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
