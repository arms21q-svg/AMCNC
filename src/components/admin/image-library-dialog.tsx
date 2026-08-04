"use client";

import { MediaLibrary } from "@/components/admin/media-library";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function ImageLibraryDialog({ open, onClose, onSelect }: ImageLibraryDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <div className="relative w-full max-w-5xl rounded-xl border border-border bg-background p-4 shadow-2xl">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-3 end-3 z-10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <MediaLibrary
          selectMode
          onSelect={(url) => {
            onSelect(url);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
