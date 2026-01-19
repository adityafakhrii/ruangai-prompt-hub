import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface PromptWithProfile {
    id: string;
    title: string;
    full_prompt: string;
    category: string;
    image_url: string | null;
    additional_info: string | null;
    created_at: string;
    status: 'pending' | 'verified' | 'rejected';
    profiles: {
        email: string | null;
    } | null;
}

const AdminVerification = () => {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [prompts, setPrompts] = useState<PromptWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptWithProfile | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isAdmin) {
                navigate('/');
                toast({
                    title: "Akses Ditolak",
                    description: "Anda tidak memiliki izin untuk melihat halaman ini.",
                    variant: "destructive",
                });
            } else {
                fetchPrompts();
            }
        }
    }, [user, isAdmin, authLoading, navigate]);

    const fetchPrompts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('heroic_token');
            const { data, error } = await supabase.functions.invoke('manage-prompts', {
                body: { action: 'admin_list', token }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            
            setPrompts(data.prompts as PromptWithProfile[]);
        } catch (error: unknown) {
            toast({
                title: "Gagal mengambil data prompt",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredPrompts = prompts.filter(p => filterStatus === 'all' || p.status === filterStatus);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig && sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                direction = null;
            }
        }
        
        if (direction === null) {
            setSortConfig(null);
        } else {
            setSortConfig({ key, direction });
        }
    };

    const sortedPrompts = [...filteredPrompts].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        let aValue: any = key === 'profiles.email' ? (a.profiles?.email || '') : a[key as keyof PromptWithProfile];
        let bValue: any = key === 'profiles.email' ? (b.profiles?.email || '') : b[key as keyof PromptWithProfile];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    const counts = {
        all: prompts.length,
        pending: prompts.filter(p => p.status === 'pending').length,
        verified: prompts.filter(p => p.status === 'verified').length,
        rejected: prompts.filter(p => p.status === 'rejected').length
    };

    const handleVerify = async (promptId: string) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('heroic_token');
            const { data, error } = await supabase.functions.invoke('manage-prompts', {
                body: {
                    action: 'update',
                    token,
                    promptId,
                    data: {
                        status: 'verified',
                        verified_at: new Date().toISOString(),
                        verifier_id: user?.id
                    }
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast({
                title: "Prompt Terverifikasi",
                description: "Prompt sekarang sudah publik.",
            });
            fetchPrompts();
            setIsPreviewDialogOpen(false);
        } catch (error: unknown) {
            toast({
                title: "Gagal memverifikasi prompt",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                variant: "destructive",
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPrompt) return;
        if (!rejectionReason.trim()) {
            toast({
                title: "Alasan diperlukan",
                description: "Mohon berikan alasan penolakan.",
                variant: "destructive",
            });
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem('heroic_token');
            const { data, error } = await supabase.functions.invoke('manage-prompts', {
                body: {
                    action: 'update',
                    token,
                    promptId: selectedPrompt.id,
                    data: {
                        status: 'rejected',
                        verified_at: new Date().toISOString(),
                        verifier_id: user?.id,
                        rejection_reason: rejectionReason
                    }
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            toast({
                title: "Prompt Ditolak",
                description: "Prompt telah dikembalikan ke pengguna.",
            });
            setIsRejectDialogOpen(false);
            setRejectionReason("");
            fetchPrompts();
            setIsPreviewDialogOpen(false);
        } catch (error: unknown) {
            toast({
                title: "Gagal menolak prompt",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                variant: "destructive",
            });
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectDialog = (prompt: PromptWithProfile) => {
        setSelectedPrompt(prompt);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const openPreview = (prompt: PromptWithProfile) => {
        setSelectedPrompt(prompt);
        setIsPreviewDialogOpen(true);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Dashboard Verifikasi Admin</h1>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    filterStatus === 'all' 
                                        ? 'bg-white text-gray-900 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Semua ({counts.all})
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    filterStatus === 'pending' 
                                        ? 'bg-white text-yellow-700 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Pending ({counts.pending})
                            </button>
                            <button
                                onClick={() => setFilterStatus('verified')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    filterStatus === 'verified' 
                                        ? 'bg-white text-green-700 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Verified ({counts.verified})
                            </button>
                            <button
                                onClick={() => setFilterStatus('rejected')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    filterStatus === 'rejected' 
                                        ? 'bg-white text-red-700 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Rejected ({counts.rejected})
                            </button>
                        </div>

                        <Button onClick={fetchPrompts} variant="outline" size="sm">
                            Refresh Data
                        </Button>
                    </div>

                    {filteredPrompts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Tidak ada prompt dengan status ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('created_at')}>
                                            <div className="flex items-center gap-2">
                                                Tanggal
                                                {sortConfig?.key === 'created_at' ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('title')}>
                                            <div className="flex items-center gap-2">
                                                Judul
                                                {sortConfig?.key === 'title' ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('category')}>
                                            <div className="flex items-center gap-2">
                                                Kategori
                                                {sortConfig?.key === 'category' ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">
                                                Status
                                                {sortConfig?.key === 'status' ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('profiles.email')}>
                                            <div className="flex items-center gap-2">
                                                Penulis
                                                {sortConfig?.key === 'profiles.email' ? (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedPrompts.map((prompt) => (
                                        <TableRow key={prompt.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(prompt.created_at), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate" title={prompt.title}>
                                                {prompt.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{prompt.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {prompt.status === 'verified' && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Verified
                                                    </Badge>
                                                )}
                                                {prompt.status === 'pending' && (
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        Pending
                                                    </Badge>
                                                )}
                                                {prompt.status === 'rejected' && (
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        Rejected
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {prompt.profiles?.email || 'Pengguna Tidak Dikenal'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openPreview(prompt)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Lihat
                                                    </Button>
                                                    {prompt.status !== 'verified' && (
                                                        <Button 
                                                            variant="default" 
                                                            size="sm" 
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleVerify(prompt.id)}
                                                            title="Verifikasi"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {prompt.status !== 'rejected' && (
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => openRejectDialog(prompt)}
                                                            title="Tolak"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </main>

            {/* Preview Dialog */}
            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tinjau Prompt</DialogTitle>
                    </DialogHeader>
                    
                    {selectedPrompt && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Judul</h3>
                                    <p className="text-lg font-semibold">{selectedPrompt.title}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Kategori</h3>
                                    <Badge>{selectedPrompt.category}</Badge>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Penulis</h3>
                                    <p className="text-sm font-medium">{selectedPrompt.profiles?.email || 'Pengguna Tidak Dikenal'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Prompt Lengkap</h3>
                                <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-sm">
                                    {selectedPrompt.full_prompt}
                                </div>
                            </div>

                            {selectedPrompt.additional_info && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Info Tambahan</h3>
                                    <p className="text-sm">{selectedPrompt.additional_info}</p>
                                </div>
                            )}

                            {selectedPrompt.image_url && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Gambar</h3>
                                    <img 
                                        src={selectedPrompt.image_url} 
                                        alt="Pratinjau Prompt" 
                                        className="rounded-lg max-h-[300px] object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                                    Batal
                                </Button>
                                {selectedPrompt.status === 'pending' && (
                                    <>
                                        <Button 
                                            variant="destructive" 
                                            onClick={() => {
                                                setIsPreviewDialogOpen(false);
                                                openRejectDialog(selectedPrompt);
                                            }}
                                        >
                                            Tolak
                                        </Button>
                                        <Button 
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleVerify(selectedPrompt.id)}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Setujui & Verifikasi
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Prompt</DialogTitle>
                        <DialogDescription>
                            Mohon berikan alasan penolakan prompt ini. Alasan akan dikirimkan ke pengguna.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea 
                            placeholder="Alasan penolakan..." 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleReject}
                            disabled={actionLoading || !rejectionReason.trim()}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tolak Prompt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default AdminVerification;
