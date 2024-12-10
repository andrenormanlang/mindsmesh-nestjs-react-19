// ImagePreview.tsx
import React from "react";
import { Button } from "./shadcn/ui/button";
import { X } from "lucide-react";

type ImagePreviewProps = {
  src: string;
  alt: string;
  onDelete: () => void;
};

const ImagePreview: React.FC<ImagePreviewProps> = React.memo(({ src, alt, onDelete }) => {
  return (
    <div className="relative group">
      <img src={src} alt={alt} className="h-20 w-full object-cover rounded-md border" />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onDelete}
        aria-label={`Delete ${alt}`}
      >
        <X className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  );
});

export default ImagePreview;
