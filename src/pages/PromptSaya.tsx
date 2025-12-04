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
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
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
    "Image", "Video", "Persona", "Vibe Coding"
];

interface Prompt {
    id: string;
    title: string;
    category: string;
    prompt_text: string;
    full_prompt: string;
    image_url: string | null;
    is_viral: boolean;
    created_at: string;
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
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
        } else if (user) {
            fetchPrompts();
        }
    }, [user, authLoading, navigate]);

    const fetchPrompts = async () => {
        try {
            const { data, error } = await supabase
                .from("prompts")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPrompts(data || []);
        } catch (error) {
            toast({
                title: "Error fetching prompts",
                description: error.message,
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
        setImageMode('url');
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
        setImageMode('url');
        setImageFile(null);
        setEditingId(prompt.id);
        setErrors({});
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("prompts")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setPrompts(prompts.filter(p => p.id !== id));
            toast({
                title: "Berhasil dihapus",
                description: "Prompt telah dihapus.",
            });
        } catch (error) {
            toast({
                title: "Gagal menghapus",
                description: error.message,
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
            imageUrl: imageMode === 'url' ? imageUrl : '',
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
            // Auto-generate prompt_text from full_prompt (first 200 characters)
            const promptText = fullPrompt.length > 200
                ? fullPrompt.substring(0, 200) + '...'
                : fullPrompt;

            // Handle image upload to storage
            let finalImageUrl = imageUrl;
            if (imageMode === 'upload' && imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('prompt-images')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (uploadError) throw uploadError;
                
                const { data: urlData } = supabase.storage
                    .from('prompt-images')
                    .getPublicUrl(fileName);
                
                finalImageUrl = urlData.publicUrl;
            }

            const promptData = {
                user_id: user.id,
                title,
                category,
                prompt_text: promptText,
                full_prompt: fullPrompt,
                image_url: finalImageUrl || null,
                additional_info: additionalInfo || null,
            };

            if (view === 'edit' && editingId) {
                const { error } = await supabase
                    .from("prompts")
                    .update(promptData)
                    .eq("id", editingId);
                if (error) throw error;
                toast({ title: "Berhasil diperbarui", description: "Prompt Anda telah diperbarui." });
            } else {
                const { error } = await supabase
                    .from("prompts")
                    .insert(promptData);
                if (error) throw error;
                toast({ title: "Berhasil ditambahkan", description: "Prompt baru telah dibuat." });
            }

            await fetchPrompts();
            setView('list');
            resetForm();
        } catch (error) {
            toast({
                title: "Gagal menyimpan",
                description: error.message,
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

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-heading">
                            {view === 'list' ? 'Prompt Saya' : view === 'create' ? 'Buat Prompt Baru' : 'Edit Prompt'}
                        </h1>
                        {view === 'list' && (
                            <Button onClick={() => { resetForm(); setView('create'); }}>
                                <Plus className="mr-2 h-4 w-4" /> Buat Prompt
                            </Button>
                        )}
                        {view !== 'list' && (
                            <Button variant="outline" onClick={() => { resetForm(); setView('list'); }}>
                                <X className="mr-2 h-4 w-4" /> Batal
                            </Button>
                        )}
                    </div>

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
                                        <div>
                                            <h3 className="font-semibold text-lg text-heading mb-1">{prompt.title}</h3>
                                            <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                                                {prompt.category}
                                            </span>
                                            <p className="text-muted-foreground text-sm line-clamp-2">{prompt.prompt_text}</p>
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
                                        imageMode={imageMode}
                                        imageUrl={imageUrl}
                                        imageFile={imageFile}
                                        imagePreview={imagePreview}
                                        onModeChange={(mode) => {
                                            setImageMode(mode);
                                            if (mode === 'url') {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            } else {
                                                setImageUrl('');
                                            }
                                        }}
                                        onUrlChange={setImageUrl}
                                        onFileChange={(file, preview) => {
                                            setImageFile(file);
                                            setImagePreview(preview);
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
