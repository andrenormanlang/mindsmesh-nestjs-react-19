import React from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "./shadcn/ui/use-toast";

type SkillImagesUploadProps = {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SkillImagesUpload: React.FC<SkillImagesUploadProps> = ({ onUpload }) => {
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
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
        // Create a mock event to pass to the onUpload handler
        const event = {
          target: {
            files: acceptedFiles,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onUpload(event);
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

export default SkillImagesUpload;
