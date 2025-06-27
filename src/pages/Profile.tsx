
import { useState } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Edit, Map, Star } from 'lucide-react';
import usersData from '@/data/users.json';

// Sample saved locations data
const savedLocations = [
  {
    id: '1',
    name: 'Downtown Taco Bar',
    cuisine: 'Mexican',
    rating: 4.5,
    address: '123 Main St, Downtown',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'
  },
  {
    id: '2',
    name: 'Artisan Coffee House',
    cuisine: 'Cafe',
    rating: 4.3,
    address: '456 Oak Ave, Midtown',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'
  }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  
  // Using the first user from our synthetic data as the current user
  const currentUser = usersData[0];
  const { name, username, avatar, bio, posts, preferences, location } = currentUser;
  
  return (
    <div>
      <Header 
        title="Profile" 
        showBackButton={false}
      />
      
      <div className="fuzo-page pb-24">
        <div className="fuzo-container">
          <div className="flex items-center mb-6">
            <img 
              src={avatar} 
              alt={name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="ml-4">
              <h2 className="font-bold text-xl">{name}</h2>
              <p className="text-gray-500">@{username}</p>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin size={12} className="mr-1" />
                {location}
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{bio}</p>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Favorite Cuisines</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.map((cuisine) => (
                <span key={cuisine} className="px-3 py-1 bg-fuzo-yellow/20 text-fuzo-dark rounded-full text-sm">
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-6 flex">
            <button className="fuzo-btn fuzo-btn-primary py-2 px-6 flex-1">
              Edit Profile
            </button>
            <button className="ml-3 border border-gray-300 rounded-full p-2">
              <Edit size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="mb-4">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="posts" className="data-[state=active]:bg-fuzo-yellow data-[state=active]:text-fuzo-dark">
                  My Posts
                </TabsTrigger>
                <TabsTrigger value="locations" className="data-[state=active]:bg-fuzo-yellow data-[state=active]:text-fuzo-dark">
                  Saved Places
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-fuzo-yellow data-[state=active]:text-fuzo-dark">
                  Recipes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts">
                <div className="grid grid-cols-2 gap-3">
                  {posts.map((post) => (
                    <div key={post.id} className="fuzo-card overflow-hidden">
                      <div className="relative">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-36 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                          <p className="text-white text-sm font-medium truncate">
                            {post.title}
                          </p>
                          <div className="flex items-center text-white text-xs mt-1">
                            <MapPin size={10} className="mr-1" />
                            <span className="truncate">{post.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="locations">
                <div className="space-y-3">
                  {savedLocations.map((location) => (
                    <div key={location.id} className="fuzo-card">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={location.image} 
                          alt={location.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <p className="text-sm text-gray-500">{location.cuisine}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                              <Star size={14} className="text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{location.rating}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin size={12} className="mr-1" />
                              <span className="truncate max-w-24">{location.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {savedLocations.length === 0 && (
                    <div className="text-center py-8">
                      <Map size={48} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No saved locations yet</p>
                      <p className="text-gray-400 text-sm">Save places from the map to see them here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="videos">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Recipe Videos Coming Soon</h3>
                  <p className="text-gray-500">Save and share your favorite cooking videos</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
