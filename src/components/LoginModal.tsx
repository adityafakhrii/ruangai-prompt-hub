import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-heading text-center">Login untuk melanjutkan</DialogTitle>
          <DialogDescription className="text-lightText text-center">
            Anda perlu login untuk melanjutkan copy prompt
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="w-full gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={() => window.open('https://www.ruangai.id/signin', '_blank', 'noopener noreferrer')}
          >
            Login di RuangAI <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            className="w-full bg-primary hover:bg-primary/90 gap-2"
            onClick={() => window.open('https://ruangai.id/cmref/Mentor-Adit', '_blank', 'noopener noreferrer')}
          >
            Daftar Akun Baru <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-2">
          Setelah login, klik menu "Prompt" untuk kembali ke sini.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
