import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../@/shadcn/ui/button";
import { Input } from "../../@/shadcn/ui/input";
import { Label } from "../../@/shadcn/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "../../@/shadcn/ui/dialog";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "../../@/shadcn/ui/toast";
import { register } from "../services/MindsMeshAPI";
import { SkillData } from "../types/types";
import SkillForm from "./SkillForm";

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  imageUrls?: File[];
};

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  imageUrls: z.any().optional(),
});

const RegisterForm = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null
  );
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

    const showSuccessToast = () => {
      return (
        <Toast>
          <ToastTitle>Registration Successful</ToastTitle>
          <ToastDescription>Please test your login.</ToastDescription>
          <ToastClose />
        </Toast>
      );
    };

    try {
      await register(
        formData.get("username") as string,
        formData.get("password") as string,
        formData.get("email") as string,
        selectedFiles,
        skills
      );

      onClose();

      // Show success toast
      showSuccessToast();

      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  const handleAddSkill = (newSkill: SkillData) => {
    const updatedSkills = [...skills];

    if (editingSkillIndex !== null) {
      updatedSkills[editingSkillIndex] = newSkill;
      setEditingSkillIndex(null);
    } else {
      updatedSkills.push(newSkill);
    }

    setSkills(updatedSkills);
    setIsSkillDialogOpen(false);
  };

  const handleEditSkill = (index: number) => {
    setEditingSkillIndex(index);
    setIsSkillDialogOpen(true);
  };

  const handleDeleteSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSkillDialogOpen(true)}
            >
              Add Skill
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
        {/* Displaying the list of skills */}
        <div className="mt-4">
          <h3 className="font-semibold text-lg">Skills</h3>
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-gray-100 rounded mb-2"
            >
              <span className="truncate max-w-xs">{skill.title}</span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditSkill(index)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteSkill(index)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Addition Dialog */}
      <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSkillIndex !== null ? "Edit Skill" : "Add Skill"}
            </DialogTitle>
          </DialogHeader>
          <SkillForm
            onAddSkill={handleAddSkill}
            initialSkill={
              editingSkillIndex !== null ? skills[editingSkillIndex] : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegisterForm;
