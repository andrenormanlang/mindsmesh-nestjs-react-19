import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Textarea } from "../../@/components/ui/textarea";
import { Switch } from "../../@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../@/components/ui/dialog";
import { User, Skill } from "../types/types";
import { updateUserWithSkills } from "../services/SkillShareAPI"; // Import your API function

type EditProfileFormProps = {
  user: User;
  setUser: (user: User) => void; 
  onClose: () => void;
};

const EditProfileForm = ({ user, setUser, onClose }: EditProfileFormProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm<{ skills: Skill[] }>({
    defaultValues: {
      skills: user.skills || [],
    },
  });



  const handleFormSubmit = async (formData: { skills: Skill[] }) => {
    try {
      const updatedUser = await updateUserWithSkills({ id: user.id, skills: formData.skills }); 
      setUser(updatedUser); 
      onClose();
    } catch (error) {
      console.error("Failed to update skills:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl w-full overflow-y-auto p-4 space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {user.skills.map((_, index) => (
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
                    {errors.skills[index].title.message}
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
                    {errors.skills[index].price.message}
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
            </div>
          ))}
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
            Update Skills
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;
