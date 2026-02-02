import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Plus, Pencil, Trash2, X, Check, Clock, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { promptSchema } from "@/lib/validationSchemas";
import SEO from "@/components/SEO";
import ImageUpload from "@/components/ImageUpload";

const categories = [
    "Image", "Video", "Persona", "Vibe Coding", "Produktivitas"
];

interface Prompt {
    id: string;
    title: string;
    category: string;
    full_prompt: string;
    image_url: string | null;
    created_at: string;
    status: 'pending' | 'verified' | 'rejected';
    rejection_reason?: string;
}

const PromptSaya = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form states
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [fullPrompt, setFullPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    // imageMode removed
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const verifiedCount = prompts.filter(p => p.status === 'verified').length;

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        } else if (user) {
            fetchPrompts();
        }
    }, [user, authLoading, navigate]);

    const getHeroicToken = () => localStorage.getItem('heroic_token');

    const fetchPrompts = async () => {
        try {
            const token = getHeroicToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await supabase.functions.invoke('manage-prompts', {
                body: { action: 'list', token },
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                }
            });

            if (response.error) throw response.error;
            setPrompts(response.data?.prompts || []);
        } catch (error: unknown) {
            toast({
                title: "Error fetching prompts",
                description: error instanceof Error ? error.message : String(error),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setCategory("");
        setFullPrompt("");
        setImageUrl("");
        // imageMode removed
        setImageFile(null);
        setImagePreview(null);
        setAdditionalInfo("");
        setEditingId(null);
        setErrors({});
    };

    const handleEdit = (prompt: Prompt) => {
        setTitle(prompt.title);
        setCategory(prompt.category);
        setFullPrompt(prompt.full_prompt);
        setImageUrl(prompt.image_url || "");
        // imageMode removed
        setImageFile(null);
        setEditingId(prompt.id);
        setErrors({});
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        try {
            const token = getHeroicToken();
            if (!token) throw new Error('Not authenticated');

            const response = await supabase.functions.invoke('manage-prompts', {
                body: { action: 'delete', promptId: id, token },
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                }
            });

            if (response.error) throw response.error;
            if (response.data?.error) throw new Error(response.data.error);

            setPrompts(prompts.filter(p => p.id !== id));
            toast({
                title: "Berhasil dihapus",
                description: "Prompt telah dihapus.",
            });
        } catch (error: unknown) {
            toast({
                title: "Gagal menghapus",
                description: error instanceof Error ? error.message : String(error),
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setErrors({});

        // Validate form data
        const result = promptSchema.safeParse({
            title,
            category,
            fullPrompt,
            imageUrl,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setSubmitting(true);

        try {
            const token = getHeroicToken();
            if (!token) throw new Error('Not authenticated');

            // Auto-generate prompt_text from full_prompt (first 200 characters) - REMOVED logic
            // const promptText = fullPrompt.length > 200
            //     ? fullPrompt.substring(0, 200) + '...'
            //     : fullPrompt;

            // Handle image upload to storage
            let finalImageUrl = imageUrl;
            if (imageFile) {
                // Check current file size
                if (imageFile.size > 2 * 1024 * 1024) { // 2MB
                    toast({
                        title: "File terlalu besar",
                        description: "Maksimal 2MB, silakan compress dulu.",
                        variant: "destructive",
                    });
                    setSubmitting(false);
                    return;
                }

                // 1. Request Signed Upload URL from Edge Function
                const uploadUrlResponse = await supabase.functions.invoke('manage-prompts', {
                    body: {
                        action: 'upload-url',
                        token,
                        data: { fileName: imageFile.name }
                    },
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    }
                });

                if (uploadUrlResponse.error) throw uploadUrlResponse.error;
                if (uploadUrlResponse.data?.error) throw new Error(uploadUrlResponse.data.error);

                const { path, token: uploadToken, signedUrl } = uploadUrlResponse.data;

                // 2. Upload to Signed URL
                const { error: uploadError } = await supabase.storage
                    .from('prompt-images')
                    .uploadToSignedUrl(path, uploadToken, imageFile, {
                        cacheControl: '31536000', // 1 year cache for better browser caching
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                // 3. Get Public URL (The signed URL is for upload, we need a public one for viewing if the bucket is public)
                // Since the bucket is public, we can just use getPublicUrl on the path
                const { data: urlData } = supabase.storage
                    .from('prompt-images')
                    .getPublicUrl(path);

                finalImageUrl = urlData.publicUrl;
            }

            const promptData = {
                title,
                category,
                // prompt_text: promptText, // Removed
                full_prompt: fullPrompt,
                image_url: finalImageUrl || null,
                additional_info: additionalInfo || null,
                status: 'pending', // Reset status to pending on update or create
            };

            if (view === 'edit' && editingId) {
                const response = await supabase.functions.invoke('manage-prompts', {
                    body: { action: 'update', promptId: editingId, data: promptData, token },
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    }
                });
                if (response.error) throw response.error;
                if (response.data?.error) throw new Error(response.data.error);
                toast({ title: "Berhasil diperbarui", description: "Prompt Anda telah diperbarui." });
            } else {
                const response = await supabase.functions.invoke('manage-prompts', {
                    body: { action: 'create', data: promptData, token },
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    }
                });
                if (response.error) throw response.error;
                if (response.data?.error) throw new Error(response.data.error);
                toast({ title: "Berhasil ditambahkan", description: "Prompt baru telah dibuat." });
            }

            await fetchPrompts();
            setView('list');
            resetForm();
        } catch (error: unknown) {
            toast({
                title: "Gagal menyimpan",
                description: error instanceof Error ? error.message : String(error),
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Prompt Saya"
                description="Kelola koleksi prompt AI pribadi Anda di RuangAI Prompt Hub."
            />
            <Navbar />

            <div className="container mx-auto px-4 pt-12 pb-32 md:py-12">
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-heading">
                            {view === 'list' ? 'Prompt Saya' : view === 'create' ? 'Buat Prompt Baru' : 'Edit Prompt'}
                        </h1>
                        {view === 'list' && (
                            <Button className="hidden md:flex" onClick={() => { resetForm(); setView('create'); }}>
                                <Plus className="mr-2 h-4 w-4" /> Buat Prompt
                            </Button>
                        )}
                        {view !== 'list' && (
                            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground" variant="outline" onClick={() => { resetForm(); setView('list'); }}>
                                <X className="mr-2 h-4 w-4" /> Batal
                            </Button>
                        )}
                    </div>

                    {/* Mobile Floating Action Button */}
                    {view === 'list' && (
                        <Button
                            size="icon"
                            className="md:hidden fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => { resetForm(); setView('create'); }}
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    )}

                    {view === 'list' && verifiedCount >= 10 && (
                        <div className="mb-6">
                             <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertTitle className="text-green-800 dark:text-green-300 font-semibold">Selamat! Anda memiliki {verifiedCount} prompt terverifikasi</AlertTitle>
                                <AlertDescription className="text-green-700 dark:text-green-400 mt-1">
                                    Anda berhak mendapatkan hadiah spesial. Silakan klaim dengan mengirimkan DM ke Instagram <a href="https://instagram.com/ruangi.id" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-green-900 dark:hover:text-green-200">@ruangi.id</a>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    
                    {view === 'list' && verifiedCount > 0 && verifiedCount < 10 && (
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground">
                                Anda memiliki <span className="font-semibold text-primary">{verifiedCount}</span> prompt terverifikasi. Kumpulkan 10 prompt terverifikasi untuk mendapatkan hadiah!
                            </p>
                        </div>
                    )}

                    {view === 'list' ? (
                        loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : prompts.length === 0 ? (
                            <div className="text-center py-12 bg-card rounded-lg border border-border shadow-sm">
                                <p className="text-muted-foreground mb-4">Anda belum memiliki prompt.</p>
                                <Button onClick={() => setView('create')}>Buat Prompt Pertama</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {prompts.map((prompt) => (
                                    <div key={prompt.id} className="bg-card p-6 rounded-lg border border-border shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="font-semibold text-lg text-heading mb-1">{prompt.title}</h3>
                                            <div className="flex flex-wrap gap-2 mb-2 items-center">
                                                <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                    {prompt.category}
                                                </span>
                                                {prompt.status === 'verified' && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1 border-blue-200">
                                                        <Check className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase">Verified</span>
                                                    </Badge>
                                                )}
                                                {prompt.status === 'pending' && (
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase">Pending</span>
                                                    </Badge>
                                                )}
                                                {prompt.status === 'rejected' && (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase">Rejected</span>
                                                    </Badge>
                                                )}
                                            </div>
                                            {prompt.status === 'rejected' && prompt.rejection_reason && (
                                                <p className="text-destructive text-xs mb-2 bg-destructive/10 p-2 rounded">
                                                    <span className="font-semibold">Alasan Penolakan:</span> {prompt.rejection_reason}
                                                </p>
                                            )}
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {prompt.full_prompt.substring(0, 150) + (prompt.full_prompt.length > 150 ? "..." : "")}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(prompt)}>
                                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Hapus Prompt?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Prompt ini akan dihapus permanen dari database.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(prompt.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
                            <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
                                <Info className="h-4 w-4 text-blue-800" />
                                <AlertTitle className="mb-2 font-semibold">Penting: Panduan & Proses Verifikasi</AlertTitle>
                                <AlertDescription className="text-sm leading-relaxed">
                                    <div className="md:hidden space-y-2">
                                        <p>
                                            Prompt harus positif, bermanfaat, dan <strong>bebas SARA</strong>.
                                        </p>
                                        <p>
                                            Prompt akan <strong>diverifikasi Admin</strong> sebelum terbit (status <em>Pending</em>).
                                        </p>
                                    </div>
                                    <div className="hidden md:block space-y-2">
                                        <p>
                                            Pastikan prompt yang Anda buat positif, bermanfaat, dan <strong>tidak mengandung unsur SARA atau konten negatif</strong>.
                                        </p>
                                        <p>
                                            Demi menjaga kualitas komunitas, setiap prompt baru akan melalui proses <strong>verifikasi oleh Admin</strong> terlebih dahulu. Prompt Anda akan berstatus <em>Pending</em> hingga disetujui. Mohon kesabarannya menunggu verifikasi admin sebelum prompt terpublish.
                                        </p>
                                    </div>
                                </AlertDescription>
                            </Alert>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Prompt</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Cinematic Portrait Photography"
                                        className="bg-input border-border"
                                        maxLength={200}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="bg-input border-border">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-destructive">{errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additional-info">Keterangan Tambahan (Opsional)</Label>
                                    <Input
                                        id="additional-info"
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                        placeholder="Deskripsi singkat atau catatan tambahan..."
                                        className="bg-input border-border"
                                        maxLength={500}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="full-prompt">Full Prompt</Label>
                                    <Textarea
                                        id="full-prompt"
                                        value={fullPrompt}
                                        onChange={(e) => setFullPrompt(e.target.value)}
                                        placeholder="Tulis full prompt lengkap di sini..."
                                        rows={8}
                                        className="bg-input border-border"
                                        maxLength={50000}
                                    />
                                    {errors.fullPrompt && (
                                        <p className="text-sm text-destructive">{errors.fullPrompt}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Preview otomatis akan dibuat dari 200 karakter pertama. Min. 10 karakter, max. 50.000 karakter.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Gambar (opsional)</Label>
                                    <ImageUpload
                                        imageUrl={imageUrl}
                                        imageFile={imageFile}
                                        imagePreview={imagePreview}
                                        onFileChange={(file, preview) => {
                                            setImageFile(file);
                                            setImagePreview(preview);
                                            // Clear existing URL if user removes the image
                                            if (!file && !preview) {
                                                setImageUrl("");
                                            }
                                        }}
                                        error={errors.imageUrl}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                                            </>
                                        ) : (
                                            view === 'create' ? "Publikasikan Prompt" : "Simpan Perubahan"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PromptSaya;
