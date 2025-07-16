import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const GUEST_EMAIL = 'guest@example.com';
const GUEST_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face';
const GUEST_NAME = 'Guest';

const Profile = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('feed')
        .select('*')
        .eq('user_email', GUEST_EMAIL)
        .order('timestamp', { ascending: false });
      if (!error && data) setPhotos(data);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex flex-col items-center mb-8">
        <img src={GUEST_AVATAR} alt="Guest Avatar" className="w-24 h-24 rounded-full border-4 border-blue-400 mb-2" />
        <h2 className="text-2xl font-bold">{GUEST_NAME}</h2>
        <p className="text-gray-500">@guest</p>
      </div>
      <h3 className="text-xl font-semibold mb-4">Photos</h3>
      {loading ? (
        <div>Loading...</div>
      ) : photos.length === 0 ? (
        <div className="text-gray-500">No photos uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <img
              key={photo.id}
              src={photo.image_url}
              alt={photo.caption || 'Guest photo'}
              className="w-full aspect-square object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile; 