import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, signupSchema } from "@/lib/validationSchemas";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[`login_${err.path[0]}`] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        title: "Login gagal",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login berhasil!",
        description: "Selamat datang kembali!",
      });
      onOpenChange(false);
      resetForm();
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({ 
      fullName: signupFullName, 
      email: signupEmail, 
      password: signupPassword 
    });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[`signup_${err.path[0]}`] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName);

    if (error) {
      toast({
        title: "Pendaftaran gagal",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pendaftaran berhasil!",
        description: "Akun Anda telah dibuat.",
      });
      onOpenChange(false);
      resetForm();
    }

    setLoading(false);
  };

  const resetForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupFullName("");
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-heading">Login untuk melanjutkan</DialogTitle>
          <DialogDescription className="text-lightText">
            Anda perlu login untuk melanjutkan copy prompt
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-4">
            {/* Google Login */}
            <Button 
              variant="outline" 
              className="w-full h-11 border-border hover:border-primary hover:text-primary"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">Atau login dengan email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="login-email" className="text-heading">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="nama@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                {errors.login_email && (
                  <p className="text-sm text-destructive">{errors.login_email}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password" className="text-heading">Password</Label>
                <div className="relative">
                  <Input 
                    id="login-password" 
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.login_password && (
                  <p className="text-sm text-destructive">{errors.login_password}</p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="signup-name" className="text-heading">Nama Lengkap</Label>
                <Input 
                  id="signup-name" 
                  type="text" 
                  placeholder="John Doe"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                {errors.signup_fullName && (
                  <p className="text-sm text-destructive">{errors.signup_fullName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-email" className="text-heading">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="nama@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                {errors.signup_email && (
                  <p className="text-sm text-destructive">{errors.signup_email}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-password" className="text-heading">Password</Label>
                <div className="relative">
                  <Input 
                    id="signup-password" 
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.signup_password && (
                  <p className="text-sm text-destructive">{errors.signup_password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min. 8 karakter, huruf kapital, huruf kecil, dan angka
                </p>
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Daftar"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
