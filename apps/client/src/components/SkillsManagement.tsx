// SkillsManagement.tsx
import  { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { addSkillToUser, updateUserSkill, deleteUserSkill } from '../services/MindsMeshAPI';
import { useNavigate } from 'react-router-dom';
import { useToast } from './shadcn/ui/use-toast';
import SkillForm from './SkillForm';
import { Button } from './shadcn/ui/button';

const SkillsManagement = () => {
  const { user, refreshUser } = useContext(UserContext);
  const [skills, setSkills] = useState([]);
  const [editingSkill, setEditingSkill] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to home if not logged in
    } else if (!user.isEmailVerified) {
      toast({
        title: 'Email Not Verified',
        description: 'Please verify your email to manage your skills.',
        variant: 'destructive',
        duration: 5000,
      });
      navigate('/'); // Redirect to home
    } else {
      setSkills(user.skills || []);
    }
  }, [user, navigate, toast]);

  const handleAddSkill = async (skillData) => {
    try {
      const newSkill = await addSkillToUser(user.id, skillData);
      toast({
        title: 'Skill Added',
        description: `Skill ${newSkill.title} added successfully.`,
        variant: 'success',
        duration: 5000,
      });
      refreshUser(); // Refresh user data
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to add skill.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const handleUpdateSkill = async (skillData) => {
    try {
      await updateUserSkill(user.id, skillData.id, skillData);
      toast({
        title: 'Skill Updated',
        description: `Skill ${skillData.title} updated successfully.`,
        variant: 'success',
        duration: 5000,
      });
      refreshUser();
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to update skill.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteUserSkill(user.id, skillId);
      toast({
        title: 'Skill Deleted',
        description: 'Skill deleted successfully.',
        variant: 'success',
        duration: 5000,
      });
      refreshUser();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete skill.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Your Skills</h1>
      {/* Skill Form */}
      <SkillForm
        onAddSkill={handleAddSkill}
        onUpdateSkill={handleUpdateSkill}
        editingSkill={editingSkill}
        setEditingSkill={setEditingSkill}
      />

      {/* Skills List */}
      <div className="mt-8">
        {skills.map((skill) => (
          <div key={skill.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{skill.title}</h2>
            <p>{skill.description}</p>
            <p>Price: ${skill.price.toFixed(2)}</p>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" onClick={() => setEditingSkill(skill)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteSkill(skill.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsManagement;
