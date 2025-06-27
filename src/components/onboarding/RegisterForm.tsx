
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Mail, Lock, MapPin, Camera } from 'lucide-react';
import { secureStorage, validateEmail, validatePassword, validateFileUpload, csrfManager, securityLogger } from '@/utils/security';
import { validateAndSanitize, registrationSchema } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: 'Kuala Lumpur',
    profilePic: '/placeholder.svg'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>('');

  const locations = [
    'Kuala Lumpur',
    'Singapore',
    'Bangkok',
    'Jakarta',
    'Manila',
    'Ho Chi Minh City'
  ];

  const handleContinue = async () => {
    // Validate input with CSRF protection
    const formDataWithCSRF = {
      ...formData,
      csrfToken: csrfManager.getToken()
    };

    const validation = validateAndSanitize(registrationSchema, formDataWithCSRF, 'registration_form');
    
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.errors?.join(', ') || "Invalid input",
        variant: "destructive"
      });
      securityLogger.logEvent('login_attempt', { email: formData.email, success: false, reason: 'validation_failed' }, 'medium');
      return;
    }

    setIsLoading(true);
    
    try {
      // Store registration data using secure storage
      const userProfile = {
        ...formData,
        cuisinePreferences: [],
        diet: '',
        radius: 25,
        mealTypes: [],
        notifications: true,
        darkMode: false
      };
      
      secureStorage.setItem('userProfile', userProfile);
      securityLogger.logEvent('login_attempt', { email: formData.email, success: true, action: 'registration' }, 'low');
      
      setTimeout(() => {
        navigate('/onboarding/preferences');
      }, 1000);
    } catch (error) {
      securityLogger.logEvent('login_attempt', { email: formData.email, success: false, error: error.message }, 'high');
      toast({
        title: "Registration Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time password strength feedback
    if (field === 'password') {
      const strength = validatePassword(value);
      setPasswordStrength(strength.message);
    }
  };

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        toast({
          title: "Invalid File",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }
      
      // In a real app, you would upload the file to a secure server
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, profilePic: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-8">
        <button 
          onClick={() => navigate('/onboarding/login')}
          className="mb-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join the FUZO community</p>
          </div>

          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {formData.profilePic === '/placeholder.svg' ? (
                  <Camera size={32} className="text-gray-400" />
                ) : (
                  <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-fuzo-coral rounded-full flex items-center justify-center cursor-pointer">
                <Camera size={16} className="text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="pl-12 h-12 rounded-xl"
                autoComplete="name"
                required
              />
            </div>

            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="pl-12 h-12 rounded-xl"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="pl-12 h-12 rounded-xl"
                autoComplete="new-password"
                required
              />
              {passwordStrength && (
                <p className={`text-xs mt-1 ${passwordStrength.includes('strong') ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordStrength}
                </p>
              )}
            </div>

            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full pl-12 h-12 rounded-xl border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          <Button 
            onClick={handleContinue}
            disabled={!formData.name || !formData.email || !formData.password || isLoading}
            className="w-full h-12 bg-fuzo-coral hover:bg-fuzo-coral/90 rounded-xl text-lg font-semibold"
          >
            {isLoading ? 'Creating account...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
