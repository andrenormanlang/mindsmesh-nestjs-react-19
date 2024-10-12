// EmailVerificationPage.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { verifyEmail } from '../services/MindsMeshAPI';
import { useToast } from '../components/shadcn/ui/use-toast';

const EmailVerificationPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      verifyEmail(token)
        .then(() => {
          setMessage('Email verified successfully!');
          toast({
            title: "Email Verified",
            description: "Your email has been verified. You can now log in.",
            variant: "success",
            duration: 5000,
          });
          // Optionally redirect to login page
        })
        .catch((error) => {
          console.error('Email verification error:', error);
          setMessage('Verification failed. The token may be invalid or expired.');
          toast({
            title: "Verification Failed",
            description: "The verification link is invalid or has expired.",
            variant: "destructive",
            duration: 5000,
          });
        });
    } else {
      setMessage('No verification token provided.');
    }
  }, [location.search, toast]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>{message}</p>
    </div>
  );
};

export default EmailVerificationPage;
