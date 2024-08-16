import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Textarea } from "../../@/components/ui/textarea";
import { Switch } from "../../@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../@/components/ui/dialog";
import { User } from "../types/types";

type SkillsModalProps = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

const EditSkills = ({ user, isOpen, onClose, onSubmit }: SkillsModalProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      skills: user.skills || [],
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {user.skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <Controller
                name={`skills[${index}].title`}
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Title" className="w-full" />
                )}
              />
              <Controller
                name={`skills[${index}].description`}
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Description" className="w-full" />
                )}
              />
              <Controller
                name={`skills[${index}].price`}
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="Price" className="w-full" />
                )}
              />
              <Controller
                name={`skills[${index}].isAvailable`}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`skills[${index}].isAvailable`} className="mr-2">Available</Label>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
          ))}
          <Button type="submit" className="w-full">
            Update Skills
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSkills;