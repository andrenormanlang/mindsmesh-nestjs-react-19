import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useForm,
  Controller,
  useFieldArray,
  FieldError,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register } from "../services/SkillShareAPI";
import { Card, CardHeader, CardContent } from "../../@/components/ui/card";
import { Textarea } from "../../@/components/ui/textarea";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Switch } from "../../@/components/ui/switch";

const skillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be a positive number"),
  isAvailable: z.boolean(),
});

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.any().optional(),
  skills: z.array(skillSchema),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

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
      avatar: "",
      skills: [{ title: "", description: "", price: 0, isAvailable: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.avatar && data.avatar.length > 0) {
      formData.append("avatar", data.avatar[0]); // avatar[0] because it’s an array of files
    }
    // Append skills to FormData
    data.skills.forEach((skill, index) => {
      formData.append(`skills[${index}][title]`, skill.title);
      formData.append(`skills[${index}][description]`, skill.description);
      formData.append(`skills[${index}][price]`, skill.price.toString());
      formData.append(
        `skills[${index}][isAvailable]`,
        skill.isAvailable.toString()
      );
    });

    try {
      await register(
        data.username,
        data.password,
        data.email,
        data.avatar ? data.avatar[0] : null,
        data.skills
      );

      if (data.avatar) {
        console.log("Image uploaded successfully:", data.avatar);
      } else {
        console.log("Image was not uploaded.");
      }

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm p-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Register</h2>
        </CardHeader>
        <CardContent>
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
                    value={field.value || ""}
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
                    value={field.value || ""}
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
                    value={field.value || ""}
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
                    value={undefined} // Ensure value is not set programmatically
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

            <div>
              <Label htmlFor="skills">Skills</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 border-b pb-4 mb-4">
                  <div>
                    <Label htmlFor={`skills.${index}.title`}>Title</Label>
                    <Controller
                      name={`skills.${index}.title`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={`Skill #${index + 1} Title`}
                          className="w-full"
                        />
                      )}
                    />
                    {errors.skills?.[index]?.title && (
                      <p className="text-red-500">
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
                    {errors.skills?.[index]?.description && (
                      <p className="text-red-500">
                        {errors.skills[index].description?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`skills.${index}.price`}>Price</Label>
                    <Controller
                      name={`skills.${index}.price`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          className="w-full"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      )}
                    />
                    {errors.skills?.[index]?.price && (
                      <p className="text-red-500">
                        {errors.skills[index].price?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name={`skills.${index}.isAvailable`}
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-center">
                          <Switch
                            checked={field.value || false} // Toggle switch based on boolean value
                            onCheckedChange={field.onChange} // Update form state on toggle
                            id={`skills.${index}.isAvailable`}
                          />
                          <span className="ml-2">Available</span>
                        </label>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove Skill
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    title: "",
                    description: "",
                    price: 0,
                    isAvailable: true,
                  })
                }
              >
                Add Skill
              </Button>
              {errors.skills && (
                <p className="text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
