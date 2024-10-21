import { useState, useTransition, useOptimistic } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { Textarea } from "./shadcn/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./shadcn/ui/dialog";
import { User, Skill } from "../types/types";
import {
  addSkillToUser,
  updateUserSkill,
  deleteUserSkill,
} from "../services/MindsMeshAPI";
import { useToast } from "./shadcn/ui/use-toast";
import { Switch } from "./shadcn/ui/switch";

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

  // Use the useOptimistic hook with the correct signature
  const [skills, updateSkills] = useOptimistic<Skill[]>(user.skills || []);
  const [isPending] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);

  const handleFormSubmit = async (data: { skills: Skill[] }) => {
    const previousSkills = [...skills]; // Backup for rollback

    // Optimistically update the skills state
    const optimisticSkills = data.skills.map((skill) => ({
      ...skill,
      price: parseFloat(skill.price.toString()),
    }));

    updateSkills(() => optimisticSkills);

    try {
      const updatedSkills = await Promise.all(
        optimisticSkills.map(async (skill) => {
          if (skill.id) {
            return await updateUserSkill(user.id, skill.id, skill);
          } else {
            return await addSkillToUser(user.id, skill);
          }
        })
      );

      const updatedUser = { ...user, skills: updatedSkills };
      setUser(updatedUser);

      // Show success toast
      toast({
        title: "Skills Updated",
        description: "Your skills have been successfully updated.",
        variant: "success",
        duration: 5000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update skills:", error);

      // Rollback the optimistic update manually
      updateSkills(() => previousSkills);

      // Show error toast
      toast({
        title: "Failed to Update Skills",
        description: "There was an error updating your skills. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      title: "",
      description: "",
      price: 0.0,
      isAvailable: false,
    };
    const updatedSkills = [...skills, newSkill];

    // Optimistically update the skills state
    updateSkills(() => updatedSkills);

    reset({ skills: updatedSkills });
  };

  const handleDeleteSkill = (index: number) => {
    const skillToDeleteItem = skills[index];
    if (!skillToDeleteItem) return;

    // Optimistically remove the skill from the state
    const updatedSkills = skills.filter((_, i) => i !== index);
    updateSkills(() => updatedSkills);

    // Backup for potential rollback
    const previousSkills = [...skills];

    if (skillToDeleteItem.id) {
      deleteUserSkill(user.id, skillToDeleteItem.id)
        .then(() => {
          // Show success toast
          toast({
            title: "Skill Deleted",
            description: `The skill "${skillToDeleteItem.title}" has been deleted.`,
            variant: "destructive",
            duration: 5000,
          });
        })
        .catch((error) => {
          console.error("Failed to delete skill:", error);

          // Rollback the optimistic update
          updateSkills(() => previousSkills);

          // Show error toast
          toast({
            title: "Failed to Delete Skill",
            description: `There was an error deleting the skill "${skillToDeleteItem.title}". Please try again.`,
            variant: "destructive",
            duration: 5000,
          });
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setSkillToDelete(null);
        });
    } else {
      // Skill is only in local state
      setIsDeleteModalOpen(false);
      setSkillToDelete(null);
    }
  };

  return (
    <>
      <DialogContent className="max-h-[90vh] max-w-3xl w-full overflow-y-auto p-4 space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="p-4 bg-white shadow-md rounded-lg space-y-4"
            >
              <div>
                <Label htmlFor={`skills.${index}.title`}>Title</Label>
                <Controller
                  name={`skills.${index}.title`}
                  control={control}
                  defaultValue={skill.title}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Title"
                      className="w-full"
                    />
                  )}
                />
                {errors.skills?.[index]?.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.skills[index].title?.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={`skills.${index}.description`}>Description</Label>
                <Controller
                  name={`skills.${index}.description`}
                  control={control}
                  defaultValue={skill.description}
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
                  defaultValue={skill.price}
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
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
                <Label
                  htmlFor={`skills.${index}.isAvailable`}
                  className="mr-2"
                >
                  Available
                </Label>
                <Controller
                  name={`skills.${index}.isAvailable`}
                  control={control}
                  defaultValue={skill.isAvailable}
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
                onClick={() => {
                  setSkillToDelete(index);
                  setIsDeleteModalOpen(true);
                }}
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
          >
            {isPending ? "Updating..." : "Update Skills"}
          </Button>
        </form>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            {skillToDelete !== null && skills[skillToDelete]
              ? skills[skillToDelete].title
              : "this skill"}
            ?
          </p>
          <div className="flex space-x-4 mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (skillToDelete !== null) {
                  handleDeleteSkill(skillToDelete);
                }
              }}
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