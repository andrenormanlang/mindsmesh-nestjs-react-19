// Example: AvatarUpload.tsx
import React from "react";
import { Label } from "./shadcn/ui/label";
import { Input } from "./shadcn/ui/input";
import ImagePreview from "./ImagePreview";

type AvatarUploadProps = {
  avatarPreview: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatarPreview, onUpload, onRemove }) => (
  <div className="flex flex-col items-center">
    <Label htmlFor="avatar" className="mb-2">Avatar Image</Label>
    <Input type="file" name="avatarFile" accept="image/*" onChange={onUpload} />
    {avatarPreview && (
      <div className="mt-4 relative">
        <ImagePreview src={avatarPreview} alt="Avatar Preview" onDelete={onRemove} />
      </div>
    )}
  </div>
);

export default AvatarUpload;
