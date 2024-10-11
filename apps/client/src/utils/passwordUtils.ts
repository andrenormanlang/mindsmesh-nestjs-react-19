
export const passwordStrength = (password: string) => {
    if (password.length < 8) {
      return 'Weak';
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~]/.test(password)
    ) {
      return 'Strong';
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return 'Medium';
    }
    return 'Weak';
  };
  