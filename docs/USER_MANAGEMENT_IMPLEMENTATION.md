# 🚀 User Management Implementation Guide

## **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Phase 1: Database Setup](#phase-1-database-setup)
3. [Phase 2: Authentication Implementation](#phase-2-authentication-implementation)
4. [Phase 3: Profile Management](#phase-3-profile-management)
5. [Phase 4: Component Integration](#phase-4-component-integration)
6. [Phase 5: Testing & Validation](#phase-5-testing--validation)
7. [Troubleshooting](#troubleshooting)

---

## **📋 Prerequisites**

### **Required Tools**
- Supabase project access
- SQL Editor access
- React development environment
- Git for version control

### **Current App State**
- ✅ FUZO app is running
- ✅ Supabase connection is configured
- ✅ Basic components are functional
- ✅ Guest authentication is working

---

## **Phase 1: Database Setup**

### **Step 1.1: Create Profiles Table**

**Location**: Supabase Dashboard → SQL Editor

**Action**: Run the User Management Starter SQL

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  username TEXT UNIQUE CHECK (char_length(username) >= 3),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  bio TEXT,
  location TEXT,
  cuisine_preferences TEXT[]
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **Step 1.2: Create Trigger Function**

```sql
-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### **Step 1.3: Verify Setup**

**Checklist**:
- [ ] Profiles table exists in public schema
- [ ] RLS is enabled
- [ ] Policies are created
- [ ] Trigger function exists
- [ ] Trigger is active

---

## **Phase 2: Authentication Implementation**

### **Step 2.1: Create Authentication Components**

**File**: `src/components/auth/SignUp.tsx`

```tsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username,
          }
        }
      });

      if (error) throw error;
      
      // Profile will be created automatically by trigger
      console.log('User created:', data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="ios-card max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUp;
```

### **Step 2.2: Create Login Component**

**File**: `src/components/auth/Login.tsx`

```tsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('User logged in:', data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="ios-card max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
```

### **Step 2.3: Create Auth Context**

**File**: `src/contexts/AuthContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## **Phase 3: Profile Management**

### **Step 3.1: Update Profile Component**

**File**: `src/pages/Profile.tsx`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Star, MessageCircle, Heart, Settings, LogOut, MapPin, Calendar, User, ArrowLeft, Edit } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', user?.id);

      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleNavigateToChat = () => {
    navigate('/chat');
  };

  const handleNavigateToPlate = () => {
    navigate('/plate');
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full pb-20">
      {/* iOS Header */}
      <div className="ios-header sticky top-0 z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBackToMain} className="text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-foreground">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <Card className="ios-card">
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="avatar-ios h-20 w-20">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {profile.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Username"
                    />
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="Full Name"
                    />
                  </div>
                </div>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Bio"
                  rows={3}
                />
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location"
                />
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <Avatar className="avatar-ios h-20 w-20">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profile.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{profile.full_name || profile.username}</h2>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>@{profile.username}</span>
                      {profile.location && (
                        <>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{profile.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                  
                  {profile.cuisine_preferences && profile.cuisine_preferences.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.cuisine_preferences.map((cuisine: string) => (
                        <Badge key={cuisine} variant="secondary" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleNavigateToChat}
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 ios-card"
          >
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">Chat</span>
          </Button>
          
          <Button 
            onClick={handleNavigateToPlate}
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 ios-card"
          >
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">My Plate</span>
          </Button>
        </div>

        {/* Content Tabs */}
        <div className="space-y-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'posts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('posts')}
              className="flex-1"
            >
              Posts
            </Button>
            <Button
              variant={activeTab === 'liked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('liked')}
              className="flex-1"
            >
              Liked
            </Button>
            <Button
              variant={activeTab === 'saved' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('saved')}
              className="flex-1"
            >
              Saved
            </Button>
          </div>

          {/* Content Grid - Placeholder for now */}
          <div className="text-center py-8 text-muted-foreground">
            <p>No {activeTab} yet</p>
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="profile" onTabChange={handleTabChange} />
    </div>
  );
};

export default Profile;
```

---

## **Phase 4: Component Integration**

### **Step 4.1: Update App.tsx**

**File**: `src/App.tsx`

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ChatList from "./pages/ChatList";
import ChatConversation from "./pages/ChatConversation";
import Plate from "./pages/Plate";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><ChatConversation /></ProtectedRoute>} />
              <Route path="/plate" element={<ProtectedRoute><Plate /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
```

### **Step 4.2: Create Protected Route Component**

**File**: `src/components/auth/ProtectedRoute.tsx`

```tsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

---

## **Phase 5: Testing & Validation**

### **Step 5.1: Test User Flows**

**Test Cases**:

1. **User Registration**
   - [ ] User can create account with email/password
   - [ ] Profile is automatically created
   - [ ] User is redirected to main app

2. **User Login**
   - [ ] User can log in with credentials
   - [ ] Profile data is loaded
   - [ ] User stays logged in on refresh

3. **Profile Management**
   - [ ] User can view their profile
   - [ ] User can edit profile information
   - [ ] Changes are saved to database

4. **Navigation**
   - [ ] All routes are protected
   - [ ] Unauthenticated users are redirected to login
   - [ ] Bottom navigation works correctly

### **Step 5.2: Database Validation**

**SQL Queries to Run**:

```sql
-- Check if profiles table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test user creation
SELECT * FROM auth.users;
SELECT * FROM profiles;
```

### **Step 5.3: Error Handling**

**Common Issues & Solutions**:

1. **Profile not created after signup**
   - Check trigger function syntax
   - Verify trigger is active
   - Check RLS policies

2. **Cannot update profile**
   - Verify user is authenticated
   - Check RLS update policy
   - Ensure profile exists

3. **Authentication state not persisting**
   - Check AuthContext implementation
   - Verify session handling
   - Check localStorage/sessionStorage

---

## **🔧 Troubleshooting**

### **Database Issues**

```sql
-- Reset profiles table (if needed)
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then re-run the setup SQL
```

### **Authentication Issues**

```typescript
// Debug auth state
const { user, profile, loading } = useAuth();
console.log('Auth State:', { user, profile, loading });

// Check Supabase session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### **Profile Issues**

```typescript
// Debug profile fetching
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

console.log('Profile Data:', data);
console.log('Profile Error:', error);
```

---

## **📝 Post-Implementation Checklist**

- [ ] All users can create accounts
- [ ] Profile data is properly stored and retrieved
- [ ] Users can edit their profiles
- [ ] Authentication state persists across sessions
- [ ] All existing features work with real user data
- [ ] Guest mode is properly replaced
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Navigation works correctly
- [ ] Database triggers are working
- [ ] RLS policies are enforced
- [ ] Code is documented
- [ ] Tests are passing

---

## **🎉 Success!**

Once all steps are completed, FUZO will have:

- ✅ Real user authentication
- ✅ Dynamic user profiles
- ✅ Profile editing capabilities
- ✅ Secure data access
- ✅ Scalable user management
- ✅ Foundation for social features

The app is now ready for real users and can be deployed with confidence! 