import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [nickName, setNickName] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      // Trim inputs to avoid whitespace issues
      await api.login(username.trim(), password.trim());
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }
    try {
      await api.registerUser({ userName: username.trim(), password: password.trim(), nickName: nickName.trim() });
      await api.login(username.trim(), password.trim());
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Lock size={24} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={registerMode ? handleRegister : handleLogin} className="space-y-4 relative">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="" 
                value={username} 
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="bg-zinc-950 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="bg-zinc-950 border-white/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {registerMode && (
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  placeholder=""
                  value={nickName}
                  onChange={(e) => { setNickName(e.target.value); setError(''); }}
                  className="bg-zinc-950 border-white/10"
                />
              </div>
            )}
            {error && <div className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</div>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Spinner size={16} /> {registerMode ? 'Registering...' : 'Authenticating...'}</span>
              ) : (
                registerMode ? 'Create Account' : 'Sign In'
              )}
            </Button>

            <div className="text-center text-sm mt-2">
              <button type="button" className="text-primary hover:underline" onClick={() => { setRegisterMode(!registerMode); setError(''); }}>
                {registerMode ? 'Already have an account? Sign In' : 'No account? Create one'}
              </button>
            </div>
          </form>

          
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
