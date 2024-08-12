import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../@/components/ui/dialog";
import { register } from "../services/SkillShareAPI";
import { SkillData } from "../types/types";
import SkillForm from "./SkillForm";

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  avatar?: FileList;
};

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.any().optional(),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null
  );

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
      avatar: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.avatar && data.avatar.length > 0) {
      formData.append("avatar", data.avatar[0]);
    }

    try {
      // Register user with skills
      await register(
        formData.get("username") as string,
        formData.get("password") as string,
        formData.get("email") as string,
        formData.get("avatar") ? (formData.get("avatar") as File) : null,
        skills
      );

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  const handleAddSkill = (newSkill: SkillData) => {
    if (editingSkillIndex !== null) {
      const updatedSkills = [...skills];
      updatedSkills[editingSkillIndex] = newSkill;
      setSkills(updatedSkills);
      setEditingSkillIndex(null);
    } else {
      setSkills([...skills, newSkill]);
    }
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Username"
                className="w-full"
              />
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
              <Input
                {...field}
                type="email"
                placeholder="Email"
                className="w-full"
              />
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
          <Label htmlFor="avatar">Avatar</Label>
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="file"
                accept="image/*"
                value={undefined}
                onChange={(e) => field.onChange(e.target.files)}
                className="w-full"
              />
            )}
          />
          {errors.avatar && (
            <p className="text-red-500">
              {(errors.avatar as FieldError)?.message}
            </p>
          )}
        </div>

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

      {/* List of added skills */}
      <div className="mt-4">
        <h3 className="font-semibold text-lg">Skills</h3>
        {skills.map((skill, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 bg-gray-100 rounded mb-2"
          >
            <span>{skill.title}</span>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditSkill(index)}
                className="mr-2"
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
