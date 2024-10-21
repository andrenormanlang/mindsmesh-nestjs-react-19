import { useForm, Controller } from "react-hook-form";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { Textarea } from "./shadcn/ui/textarea";
import { Switch } from "./shadcn/ui/switch";
import { useEffect } from "react";

export type SkillData = {
  id?: string;
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
};

interface SkillFormProps {
  onAddSkill: (skill: SkillData) => void;
  onUpdateSkill: (skill: SkillData) => void;
  editingSkill: SkillData | null;
  setEditingSkill: (skill: SkillData | null) => void;
}
export const SkillForm: React.FC<SkillFormProps> = ({
  onAddSkill,
  onUpdateSkill,
  editingSkill,
  setEditingSkill,
}) => {
  const { control, handleSubmit, reset } = useForm<SkillData>({
    defaultValues: editingSkill || {
      title: '',
      description: '',
      price: 0,
      isAvailable: false,
    },
  });

  // Reset form when editingSkill changes
  useEffect(() => {
    reset(editingSkill || {
      title: '',
      description: '',
      price: 0,
      isAvailable: false,
    });
  }, [editingSkill, reset]);

  const onSubmit = (data: SkillData) => {
    if (editingSkill) {
      onUpdateSkill({ ...data, id: editingSkill.id });
    } else {
      onAddSkill(data);
    }
    setEditingSkill(null);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Skill Title" className="w-full" />
          )}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea {...field} placeholder="Description" className="w-full" />
          )}
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Controller
          name="price"
          control={control}
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
      </div>
      <div className="flex items-center space-x-2">
        <Controller
          name="isAvailable"
          control={control}
          render={({ field }) => (
            <label className="flex items-center">
              <Switch
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
              <span className="ml-2">Available</span>
            </label>
          )}
        />
      </div>
      <Button type="submit">
        {editingSkill ? 'Update Skill' : 'Add Skill'}
      </Button>
    </form>
  );
};

export default SkillForm;
