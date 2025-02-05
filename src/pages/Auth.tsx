import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleAuth = async (action: 'login' | 'signup') => {
    try {
      setLoading(true);
      setShowConfirmEmail(false);
      let result;
      
      if (action === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });

        if (result.error) throw result.error;

        toast({
          title: "Check your email",
          description: "Please check your email to confirm your account",
        });
        setShowConfirmEmail(true);
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          if (result.error.message.includes('Email not confirmed')) {
            setShowConfirmEmail(true);
            throw new Error('Please confirm your email before signing in');
          }
          throw result.error;
        }

        toast({
          title: "Success",
          description: "You have been logged in successfully",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-4 px-6 pb-6 bg-background">
      <div className="w-full max-w-[200px] mb-8">
        <img
          src={theme === 'dark' 
            ? "/lovable-uploads/1ea66372-8f22-43ff-9084-7df4e79cfe73.png"  // Green logo for dark mode
            : "/lovable-uploads/be7330c6-df44-4348-b67f-aad8e03e7a32.png"} // Black logo for light mode
          alt="BAPI Logo"
          className="w-full h-auto"
        />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome</CardTitle>
          <CardDescription className="text-lg">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showConfirmEmail && (
            <Alert className="mb-4">
              <AlertDescription>
                Please check your email and click the confirmation link before signing in.
                If you don't see the email, check your spam folder.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('login')}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('signup')}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Create Account'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;