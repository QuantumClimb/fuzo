
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Lock, Chrome } from 'lucide-react';
import { secureStorage, validateEmail, validatePassword, csrfManager, sessionManager, securityLogger } from '@/utils/security';
import { validateAndSanitize, loginSchema } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    // Validate input with CSRF protection
    const formData = {
      email,
      password,
      csrfToken: csrfManager.getToken()
    };

    const validation = validateAndSanitize(loginSchema, formData, 'login_form');
    
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.errors?.join(', ') || "Invalid input",
        variant: "destructive"
      });
      securityLogger.logEvent('login_attempt', { email, success: false, reason: 'validation_failed' }, 'medium');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate login with enhanced security
      setTimeout(() => {
        // Use secure storage instead of regular localStorage
        secureStorage.setItem('userEmail', email);
        secureStorage.setItem('onboardingComplete', 'true');
        
        // Create secure session
        const userId = email; // In real app, this would come from backend
        sessionManager.createSession(userId);
        
        // Set a basic user profile using secure storage
        const userProfile = {
          name: email.split('@')[0],
          email: email,
          location: 'San Francisco',
          profilePic: '',
          cuisinePreferences: ['Italian', 'Japanese'],
          diet: 'omnivore',
          radius: 5,
          mealTypes: ['lunch', 'dinner'],
          notifications: true,
          darkMode: false
        };
        secureStorage.setItem('userProfile', userProfile);
        
        securityLogger.logEvent('login_attempt', { email, success: true }, 'low');
        
        toast({
          title: "Login Successful",
          description: "Welcome to FUZO!",
        });
        
        navigate('/');
      }, 1500);
    } catch (error) {
      securityLogger.logEvent('login_attempt', { email, success: false, error: error.message }, 'high');
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/onboarding/register');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time email validation feedback
    if (value && !validateEmail(value)) {
      // Could show inline validation here
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-8">
        <button 
          onClick={() => navigate('/onboarding/loading')}
          className="mb-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FUZO</h1>
            <p className="text-gray-600">Sign in to discover amazing food</p>
          </div>

          {/* Demo Credentials Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Demo Credentials (Testing)</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> demo@fuzo.com</p>
              <p><strong>Password:</strong> demo123</p>
              <p className="text-xs text-blue-600 mt-2">Or use: john.doe@example.com / password123</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                className="pl-12 h-12 rounded-xl"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="pl-12 h-12 rounded-xl"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <Button 
              onClick={handleSignIn}
              disabled={!email || !password || isLoading}
              className="w-full h-12 bg-fuzo-coral hover:bg-fuzo-coral/90 rounded-xl text-lg font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button 
              onClick={handleCreateAccount}
              variant="outline"
              className="w-full h-12 rounded-xl text-lg font-semibold border-2"
            >
              Create Account
            </Button>

            <Button 
              variant="outline"
              className="w-full h-12 rounded-xl text-lg font-semibold border-2 flex items-center gap-3"
            >
              <Chrome size={20} />
              Continue with Google
            </Button>
          </div>

          <div className="text-center">
            <button className="text-fuzo-coral hover:underline">
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
