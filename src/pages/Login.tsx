import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const Login = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md p-8 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-6">Welcome to FUZO MVP</h1>
      <button
        className="mt-2 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-lg font-semibold"
        onClick={async () => {
          const { error } = await (supabase.auth as any).signInWithPassword({
            email: 'guest@example.com',
            password: 'guestpassword',
          });
          if (error) {
            toast.error(error.message);
            return;
          }
          window.location.href = '/';
        }}
      >
        ENTER
      </button>
    </div>
  </div>
);

export default Login; 