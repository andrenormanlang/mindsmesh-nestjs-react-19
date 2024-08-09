import { Button } from '../../@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../@/components/ui/card';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Welcome to SkillShare Hub</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            This is your dashboard where you can manage your skills, book lessons, and connect with others.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="mr-2">Explore Skills</Button>
          <Button variant="outline">Book a Lesson</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
