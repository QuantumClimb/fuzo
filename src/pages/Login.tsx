import { useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to FUZO MVP</h1>
        <input
          type="email"
          placeholder="Email"
          className="mb-2 px-4 py-2 border rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 px-4 py-2 border rounded w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="mb-2 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-lg font-semibold w-full"
          onClick={async () => {
            const { error } = await (supabase.auth as any).signInWithPassword({
              email,
              password,
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
        <div className="mt-4 text-sm text-gray-500">
          <p>Or use guest login:</p>
          <button
            className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
            Sign in as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 