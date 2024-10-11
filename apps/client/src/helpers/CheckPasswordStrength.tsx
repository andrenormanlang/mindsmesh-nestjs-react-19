import { passwordStrength } from '../utils/passwordUtils';

type PasswordStrengthProps = {
  password: string;
};

export const CheckPasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const strength = passwordStrength(password);
  const strengthClass =
    strength === 'Weak' ? 'text-red-600' : strength === 'Medium' ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="mt-1 text-sm font-medium">
      Password Strength: <span className={strengthClass}>{strength}</span>
    </div>
  );
};