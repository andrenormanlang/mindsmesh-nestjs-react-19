import { useState } from "react";
import { useForm, Controller, FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { useToast } from "./shadcn/ui/use-toast";
import { register } from "../services/MindsMeshAPI";
import { AxiosError } from "axios";

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  imageUrls?: File[];
};

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  imageUrls: z.any().optional(),
});

const RegisterForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      imageUrls: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + selectedFiles.length > 4) {
      alert("You can only upload up to 4 images.");
      return;
    }

    const newFiles = [...selectedFiles, ...Array.from(files)];
    setSelectedFiles(newFiles);

    const filePreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(filePreviews);
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("imageUrls", file);
      });
    }

    try {
      await register(
        formData.get("username") as string,
        formData.get("password") as string,
        formData.get("email") as string,
        selectedFiles,
        []
        // skills
      );

      onClose();
      toast({
        title: "Registration Successful",
        description: "Please test your login.",
        variant: "success",
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000); 
  
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const error = err as AxiosError;
      if (error.response?.status === 400) {
        toast({
          title: "Email Already Registered",
          description:
            "An account with this email already exists. Please use a different email or login.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        setError("Registration failed. Please try again.");

        // Show general error toast
        toast({
          title: "Registration Failed",
          description: "Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  return (
    <>
      <div className="overflow-y-auto">
        {" "}
        {/* Scrollable container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Username" className="w-full" />
              )}
            />
            {errors.username && (
              <p className="text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Email" className="w-full" />
              )}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  className="w-full"
                />
              )}
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="avatars">Images (Max 4)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full"
            />
            {errors.imageUrls && (
              <p className="text-red-500">
                {(errors.imageUrls as FieldError)?.message}
              </p>
            )}
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow"
                  />
                  <Button
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex space-x-4">
            <Button type="submit">Submit</Button> 
          </div>
        </form>       
      </div>
    </>
  );
};

export default RegisterForm;
