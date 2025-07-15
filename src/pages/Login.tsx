import { useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const Login = () => {
  useEffect(() => {
    (async () => {
      const { error } = await (supabase.auth as any).signInWithPassword({
        email: 'guest@example.com',
        password: 'guestpassword',
      });
      if (error) {
        toast.error(error.message);
      } else {
        window.location.href = '/';
      }
    })();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-6">Logging in as Guest...</h1>
      </div>
    </div>
  );
};

export default Login; 