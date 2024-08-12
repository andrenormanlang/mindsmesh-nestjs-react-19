import { Button } from '../../@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../@/components/ui/card';
import { Input } from '../../@/components/ui/input';
import Navbar from '../components/NavBar';
import HipsterChubbyCat from '../assets/Hipster-Chubby-Cat.png';

const HomePage = () => {
  return (
    <div>
      {/* NavBar */}
      <Navbar />

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-b from-blue-700 to-green-900 text-white">
        <div className="flex flex-col items-center py-12">
          <h1 className="text-4xl font-bold mb-4">Find the right pro, right away</h1>
          <Input
            type="text"
            placeholder="Search for any service..."
            className="w-1/2 p-4 text-lg rounded-lg mb-8"
          />

          {/* Responsive Image */}
          <div className="flex justify-center w-full">
            <img
              src={HipsterChubbyCat}
              alt="A description of the image"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-sm h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Category Cards Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
          <Card className="bg-white text-gray-900 p-4">
            <CardHeader>
              <h2 className="text-lg font-semibold">Programming & Tech</h2>
            </CardHeader>
            <CardContent>
              <p>Find the best developers for your project.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Explore</Button>
            </CardFooter>
          </Card>

          <Card className="bg-white text-gray-900 p-4">
            <CardHeader>
              <h2 className="text-lg font-semibold">Graphics & Design</h2>
            </CardHeader>
            <CardContent className=''>
              <p className=''>Get creative designs for your business.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Explore</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-gray-300 p-4 text-center">
          Trusted by: Meta, Google, Netflix, P&G, PayPal, Payoneer
        </div>
      </div>
    </div>
  );
};

export default HomePage;
