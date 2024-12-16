// RegistrationSkillImagesUpload.tsx
import React from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "./shadcn/ui/use-toast";

type RegistrationSkillImagesUploadProps = {
  onUpload: (files: File[]) => void; // Updated prop type
};

const RegistrationSkillImagesUpload: React.FC<RegistrationSkillImagesUploadProps> = ({ onUpload }) => {
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast({
          title: "Invalid Files",
          description: "Some files were rejected. Please upload valid image files.",
          variant: "destructive",
          duration: 5000,
        });
      }

      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles); // Pass files directly
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`p-4 border-2 border-dashed rounded-md cursor-pointer ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-center text-blue-500">Drop the files here...</p>
      ) : (
        <p className="text-center text-gray-500">
          Drag & drop skill images here, or click to select files
        </p>
      )}
    </div>
  );
};

export default RegistrationSkillImagesUpload;
