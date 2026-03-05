import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WhatsNewModal() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const CURRENT_VERSION = "1.2.0";
    const STORAGE_KEY = "ruangai_version_seen";

    useEffect(() => {
        // Check if the user has seen this version
        const seenVersion = localStorage.getItem(STORAGE_KEY);
        if (seenVersion !== CURRENT_VERSION) {
            // Small delay so it doesn't pop up too aggressively on immediate load
            const timer = setTimeout(() => {
                setOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
        setOpen(false);
    };

    const handleSeeDetails = () => {
        handleClose();
        navigate("/changelog");
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) handleClose();
        }}>
            <DialogContent className="sm:max-w-md p-6 overflow-hidden shadow-2xl rounded-2xl">
                <DialogHeader className="mb-4">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl text-center">Pembaruan v1.2.0</DialogTitle>
                    <p className="text-center text-muted-foreground text-sm mt-1">
                        RuangAI Prompt Hub kini makin canggih dan praktis!
                    </p>
                </DialogHeader>

                <div className="space-y-4 my-6">
                    <div className="flex gap-3 items-start">
                        <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Verifikasi AI Otomatis (Gemini 2.5)</h4>
                            <p className="text-xs text-muted-foreground mt-1">Prompt kini difilter cerdas oleh AI dalam hitungan detik.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start">
                        <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Alasan Penolakan Detail</h4>
                            <p className="text-xs text-muted-foreground mt-1">Dapatkan feedback spesifik kenapa prompt Anda ditolak dan bagaimana cara memperbaikinya.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
                        Mengerti
                    </Button>
                    <Button onClick={handleSeeDetails} className="w-full sm:w-auto">
                        Lihat Detail Pembaruan
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
