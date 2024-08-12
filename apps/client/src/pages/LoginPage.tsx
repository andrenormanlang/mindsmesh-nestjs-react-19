import  { useState } from 'react';
import { Button } from '../../@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../@/components/ui/card';
import { Input } from '../../@/components/ui/input';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Handle login logic here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm p-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Login</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;