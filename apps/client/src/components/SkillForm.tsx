import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Textarea } from "../../@/components/ui/textarea";
import { Switch } from "../../@/components/ui/switch";

export type SkillData = {
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
};

interface SkillFormProps {
  onAddSkill: (skill: SkillData) => void;
  initialSkill?: SkillData;
}

const SkillForm: React.FC<SkillFormProps> = ({ onAddSkill, initialSkill }) => {
  const { control, handleSubmit } = useForm<SkillData>({
    defaultValues: initialSkill || {
      title: "",
      description: "",
      price: 0,
      isAvailable: false,
    },
  });

  const onSubmit = (data: SkillData) => {
    onAddSkill(data);
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
            <Input {...field} type="number" step="0.01" placeholder="Price" className="w-full" />
          )}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Controller
          name="isAvailable"
          control={control}
          render={({ field }) => (
            <label className="flex items-center">
              <Switch checked={field.value || false} onCheckedChange={field.onChange} />
              <span className="ml-2">Available</span>
            </label>
          )}
        />
      </div>
      <Button type="submit">{initialSkill ? "Update Skill" : "Add Skill"}</Button>
    </form>
  );
};

export default SkillForm;
