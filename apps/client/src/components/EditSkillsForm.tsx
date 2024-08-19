import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Textarea } from "../../@/components/ui/textarea";
import { Switch } from "../../@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../@/components/ui/dialog";
import { User, Skill } from "../types/types";
import { updateUserWithSkills } from "../services/SkillShareAPI";

type EditSkillsFormProps = {
  user: User;
  setUser: (user: User) => void;
  onClose: () => void;
};

const EditSkillsForm = ({ user, setUser, onClose }: EditSkillsFormProps) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<{ skills: Skill[] }>({
    defaultValues: {
      skills: user.skills || [],
    },
  });

  const [skills, setSkills] = useState<Skill[]>(user.skills || []);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);

  const handleFormSubmit = async (data: { skills: Skill[] }) => {
    try {
      // Check for valid UUIDs before submission
      const validSkills = data.skills.filter(skill => skill.id && skill.id.length > 0);
  
      const updatedUser = await updateUserWithSkills({
        id: user.id,
        username: user.username,
        avatarUrls: user.avatarUrls,
        skills: validSkills,  // Only send valid skills
      });
      setUser(updatedUser);
      onClose();
    } catch (error) {
      console.error("Failed to update skills:", error);
    }
  };
  

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: uuidv4(),  // Ensure each new skill has a unique ID
      title: "",
      description: "",
      price: 0,
      isAvailable: false,
    };
    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    reset({ skills: updatedSkills });
  };
  

  const handleDeleteSkill = (index: number) => {
    setSkillToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSkill = () => {
    if (skillToDelete !== null) {
      const updatedSkills = skills.filter((_, i) => i !== skillToDelete);
      setSkills(updatedSkills);
      reset({ skills: updatedSkills });
      setSkillToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <DialogContent className="max-h-[90vh] max-w-3xl w-full overflow-y-auto p-4 space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {skills.map((_, index) => (
            <div key={index} className="p-4 bg-white shadow-md rounded-lg space-y-4">
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
                <Label htmlFor={`skills.${index}.description`}>Description</Label>
                <Controller
                  name={`skills.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <Textarea {...field} placeholder="Description" className="w-full" />
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
                    <Input {...field} type="number" placeholder="Price" className="w-full" />
                  )}
                />
                {errors.skills?.[index]?.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.skills[index].price?.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor={`skills.${index}.isAvailable`} className="mr-2">Available</Label>
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
                onClick={() => handleDeleteSkill(index)}
                className="w-full mt-2"
              >
                Delete Skill
              </Button>
            </div>
          ))}

          <Button type="button" onClick={handleAddSkill} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            Add Skill
          </Button>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
            Update Skills
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
            {skillToDelete !== null ? skills[skillToDelete].title : "this skill"}
            ?
          </p>
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
