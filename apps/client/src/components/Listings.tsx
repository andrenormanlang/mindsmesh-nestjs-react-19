import { Card, CardHeader, CardContent, CardFooter } from '../../@/components/ui/card';
import { Button } from '../../@/components/ui/button';
import { Listing } from '../types/types';



const Listings = ({ listings }: { listings: Listing[] }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <h2 className="text-lg font-semibold">{listing.title}</h2>
            </CardHeader>
            <CardContent>
              <p>{listing.description}</p>
              <p className="text-blue-500 mt-2">${listing.price}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  export default Listings;