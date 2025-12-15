import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { ExternalLink } from "lucide-react";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <SEO
        title="Login / Register"
        description="Masuk atau daftar akun RuangAI Prompt Hub."
      />
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src="/iconbiru.png" alt="RuangAI Logo" className="h-14 w-13" />
          <h1 className="text-3xl font-bold text-foreground">RuangAI Prompt</h1>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-center">Login Diperlukan</CardTitle>
            <CardDescription className="text-lightText text-center">
              Untuk mengakses aplikasi ini, silakan login terlebih dahulu melalui RuangAI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary/10"
                onClick={() => window.location.href = 'https://www.ruangai.id/signin'}
              >
                Login di RuangAI <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                onClick={() => window.location.href = 'https://ruangai.id/cmref/Mentor-Adit'}
              >
                Daftar Akun Baru <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Setelah login, klik menu "Prompt" di RuangAI untuk kembali ke sini.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-lightText hover:text-foreground"
          >
            Kembali ke beranda
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
