// EditSkillsForm.tsx

import { useState } from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  useFormState,  
} from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { Textarea } from "./shadcn/ui/textarea";
import { Switch } from "./shadcn/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./shadcn/ui/dialog";
import { User, Skill } from "../types/types";
import {
  addSkillToUser,
  updateUserSkill,
  deleteUserSkill,
} from "../services/MindsMeshAPI";
import { useToast } from "./shadcn/ui/use-toast";

type EditSkillsFormProps = {
  user: User;
  setUser: (user: User) => void;
  onClose: () => void;
};

const EditSkillsForm = ({ user, setUser, onClose }: EditSkillsFormProps) => {
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ skills: Skill[] }>({
    defaultValues: {
      skills: user.skills || [],
    },
  });


  const { isSubmitting, isValid } = useFormState({ control });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDeleteIndex, setSkillToDeleteIndex] = useState<number | null>(
    null
  );

  const handleFormSubmit = async (data: { skills: Skill[] }) => {
    // Convert price to number
    const skillsWithNumberPrice = data.skills.map((skill) => ({
      ...skill,
      price: Number(skill.price),
    }));
    try {
      const updatedSkills = await Promise.all(
        skillsWithNumberPrice.map(async (skill) => {
          if (skill.id && user.skills.find((s) => s.id === skill.id)) {
            return await updateUserSkill(user.id, skill.id, skill);
          } else {
            const addedSkill = await addSkillToUser(user.id, skill);
            return addedSkill;
          }
        })
      );

      reset({ skills: updatedSkills });
      const updatedUser = { ...user, skills: updatedSkills };
      setUser(updatedUser);

      toast({
        title: "Skills Updated",
        description: "Your skills have been successfully updated.",
        variant: "success",
        duration: 5000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update skills:", error);

      toast({
        title: "Failed to Update Skills",
        description:
          "There was an error updating your skills. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleAddSkill = () => {
    const tempId = uuidv4(); // Generate a temporary ID
    const newSkill: Skill = {
      id: tempId,
      title: "",
      description: "",
      price: 0.0,
      isAvailable: false,
    };
    append(newSkill);
  };

  const handleDeleteSkill = (index: number) => {
    setSkillToDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSkill = async () => {
    if (skillToDeleteIndex === null) return;
    const skillToDelete = fields[skillToDeleteIndex];

    remove(skillToDeleteIndex);

    if (
      skillToDelete.id &&
      user.skills.find((s) => s.id === skillToDelete.id)
    ) {
      try {
        await deleteUserSkill(user.id, skillToDelete.id);

        // Update user state
        const updatedUser = {
          ...user,
          skills: user.skills.filter((s) => s.id !== skillToDelete.id),
        };
        setUser(updatedUser);

        toast({
          title: "Skill Deleted",
          description: `The skill "${skillToDelete.title}" has been deleted.`,
          variant: "destructive",
          duration: 5000,
        });
      } catch (error) {
        console.error("Failed to delete skill:", error);

        // Rollback the optimistic removal
        append(skillToDelete);

        toast({
          title: "Failed to Delete Skill",
          description: `There was an error deleting the skill "${skillToDelete.title}". Please try again.`,
          variant: "destructive",
          duration: 5000,
        });
      }
    }

    setIsDeleteModalOpen(false);
    setSkillToDeleteIndex(null);
  };

  return (
    <>
      <DialogContent className="max-h-[90vh] max-w-3xl w-full overflow-y-auto p-4 space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
          <DialogDescription>
            Update your skills below. You can add new skills, edit existing
            ones, or delete them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id || index}
              className="p-4 bg-white shadow-md rounded-lg space-y-4"
            >
              <div>
                <Label htmlFor={`skills.${index}.title`}>Title</Label>
                <Controller
                  name={`skills.${index}.title`}
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Title" className="w-full" />
                  )}
                />
                {errors.skills?.[index]?.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.skills[index].title?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={`skills.${index}.description`}>
                  Description
                </Label>
                <Controller
                  name={`skills.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Description"
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor={`skills.${index}.price`}>Price</Label>
                <Controller
                  name={`skills.${index}.price`}
                  control={control}
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      className="w-full"
                    />
                  )}
                />
                {errors.skills?.[index]?.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.skills[index].price?.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor={`skills.${index}.isAvailable`} className="mr-2">
                  Available
                </Label>
                <Controller
                  name={`skills.${index}.isAvailable`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <Button
                variant="destructive"
                type="button"
                onClick={() => handleDeleteSkill(index)}
                className="w-full mt-2"
              >
                Delete Skill
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={handleAddSkill}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add Skill
          </Button>
          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitting || !isValid}
          >
            Update Skills
          </Button>
          <div>
          </div>
        </form>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {skillToDeleteIndex !== null && fields[skillToDeleteIndex]
                ? fields[skillToDeleteIndex].title || "this skill"
                : "this skill"}
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-4 mt-4">
            <Button
              variant="destructive"
              onClick={confirmDeleteSkill}
              className="w-full"
            >
              Yes, Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditSkillsForm;

// ganesha77#
