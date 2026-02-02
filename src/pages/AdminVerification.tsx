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
import { Checkbox } from "@/components/ui/checkbox";
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
    verifier?: {
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
    const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
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
        
        let aValue: string | PromptWithProfile[keyof PromptWithProfile] = key === 'profiles.email' ? (a.profiles?.email || '') :
                          key === 'verifier.email' ? (a.verifier?.email || '') :
                          a[key as keyof PromptWithProfile];
        let bValue: string | PromptWithProfile[keyof PromptWithProfile] = key === 'profiles.email' ? (b.profiles?.email || '') :
                          key === 'verifier.email' ? (b.verifier?.email || '') :
                          b[key as keyof PromptWithProfile];

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

    const toggleSelectAll = () => {
        if (selectedPromptIds.length === filteredPrompts.length) {
            setSelectedPromptIds([]);
        } else {
            setSelectedPromptIds(filteredPrompts.map(p => p.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        if (selectedPromptIds.includes(id)) {
            setSelectedPromptIds(selectedPromptIds.filter(pid => pid !== id));
        } else {
            setSelectedPromptIds([...selectedPromptIds, id]);
        }
    };

    const handleBulkVerify = async () => {
        if (selectedPromptIds.length === 0) return;
        
        setActionLoading(true);
        try {
            const token = localStorage.getItem('heroic_token');
            const { data, error } = await supabase.functions.invoke('manage-prompts', {
                body: {
                    action: 'bulk_update',
                    token,
                    promptIds: selectedPromptIds,
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
                title: "Berhasil Verifikasi Massal",
                description: `${selectedPromptIds.length} prompt berhasil diverifikasi.`,
            });
            
            // Optimistic update
            setPrompts(prev => prev.map(p => 
                selectedPromptIds.includes(p.id) 
                    ? { ...p, status: 'verified', verifier: { email: user?.email || 'Anda' } } 
                    : p
            ));

            setSelectedPromptIds([]);
        } catch (error: unknown) {
            toast({
                title: "Gagal verifikasi massal",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: "destructive",
            });
            // Revert or fetch on error if needed, but for now just show error
            fetchPrompts(); 
        } finally {
            setActionLoading(false);
        }
    };

    const openBulkRejectDialog = () => {
        setSelectedPrompt(null);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
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
            
            // Optimistic update
            setPrompts(prev => prev.map(p => 
                p.id === promptId 
                    ? { ...p, status: 'verified', verifier: { email: user?.email || 'Anda' } } 
                    : p
            ));
            
            setIsPreviewDialogOpen(false);
        } catch (error: unknown) {
            toast({
                title: "Gagal memverifikasi prompt",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                variant: "destructive",
            });
            fetchPrompts();
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPrompt && selectedPromptIds.length === 0) return;
        
        // Removed mandatory check for rejectionReason

        setActionLoading(true);
        try {
            const token = localStorage.getItem('heroic_token');
            
            if (selectedPrompt) {
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

                // Optimistic update single
                setPrompts(prev => prev.map(p => 
                    p.id === selectedPrompt.id 
                        ? { ...p, status: 'rejected', verifier: { email: user?.email || 'Anda' } } 
                        : p
                ));
            } else {
                const { data, error } = await supabase.functions.invoke('manage-prompts', {
                    body: {
                        action: 'bulk_update',
                        token,
                        promptIds: selectedPromptIds,
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
                    title: "Berhasil Menolak Massal",
                    description: `${selectedPromptIds.length} prompt berhasil ditolak.`,
                });

                // Optimistic update bulk
                setPrompts(prev => prev.map(p => 
                    selectedPromptIds.includes(p.id) 
                        ? { ...p, status: 'rejected', verifier: { email: user?.email || 'Anda' } } 
                        : p
                ));

                setSelectedPromptIds([]);
            }

            setIsRejectDialogOpen(false);
            setRejectionReason("");
            setIsPreviewDialogOpen(false);
        } catch (error: unknown) {
            toast({
                title: "Gagal menolak prompt",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                variant: "destructive",
            });
            fetchPrompts();
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
        <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col transition-colors duration-200">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Dashboard Verifikasi Admin</h1>
                
                <div className="bg-white dark:bg-card rounded-lg shadow p-6 border dark:border-border">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex bg-gray-100 dark:bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => { setFilterStatus('all'); setSelectedPromptIds([]); }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        filterStatus === 'all' 
                                            ? 'bg-white dark:bg-background text-gray-900 dark:text-foreground shadow-sm' 
                                            : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground'
                                    }`}
                                >
                                    Semua ({counts.all})
                                </button>
                                <button
                                    onClick={() => { setFilterStatus('pending'); setSelectedPromptIds([]); }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        filterStatus === 'pending' 
                                            ? 'bg-white dark:bg-background text-yellow-700 dark:text-yellow-500 shadow-sm' 
                                            : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground'
                                    }`}
                                >
                                    Pending ({counts.pending})
                                </button>
                                <button
                                    onClick={() => { setFilterStatus('verified'); setSelectedPromptIds([]); }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        filterStatus === 'verified' 
                                            ? 'bg-white dark:bg-background text-green-700 dark:text-green-500 shadow-sm' 
                                            : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground'
                                    }`}
                                >
                                    Verified ({counts.verified})
                                </button>
                                <button
                                    onClick={() => { setFilterStatus('rejected'); setSelectedPromptIds([]); }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        filterStatus === 'rejected' 
                                            ? 'bg-white dark:bg-background text-red-700 dark:text-red-500 shadow-sm' 
                                            : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground'
                                    }`}
                                >
                                    Rejected ({counts.rejected})
                                </button>
                            </div>

                            {selectedPromptIds.length > 0 && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5">
                                    <Button size="sm" onClick={handleBulkVerify} className="bg-green-600 hover:bg-green-700">
                                        <Check className="w-4 h-4 mr-1" />
                                        Verifikasi ({selectedPromptIds.length})
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={openBulkRejectDialog}>
                                        <X className="w-4 h-4 mr-1" />
                                        Tolak ({selectedPromptIds.length})
                                    </Button>
                                </div>
                            )}
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
                                        <TableHead className="w-[50px]">
                                            <Checkbox 
                                                checked={filteredPrompts.length > 0 && selectedPromptIds.length === filteredPrompts.length}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
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
                                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('verifier.email')}>
                                            <div className="flex items-center gap-2">
                                                Verifier
                                                {sortConfig?.key === 'verifier.email' ? (
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
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedPromptIds.includes(prompt.id)}
                                                    onCheckedChange={() => toggleSelectOne(prompt.id)}
                                                    aria-label={`Select ${prompt.title}`}
                                                />
                                            </TableCell>
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
                                            <TableCell>
                                                <span className="text-sm text-gray-500">
                                                    {prompt.verifier?.email || '-'}
                                                </span>
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
                                    <h3 className="text-sm font-medium text-muted-foreground">Judul</h3>
                                    <p className="text-lg font-semibold">{selectedPrompt.title}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Kategori</h3>
                                    <Badge>{selectedPrompt.category}</Badge>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Penulis</h3>
                                    <p className="text-sm font-medium">{selectedPrompt.profiles?.email || 'Pengguna Tidak Dikenal'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Prompt Lengkap</h3>
                                <div className="bg-gray-100 dark:bg-muted p-4 rounded-md whitespace-pre-wrap text-sm text-foreground">
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
                <DialogContent className="sm:max-w-[425px] w-[90vw] max-h-[85vh] overflow-y-auto p-6 gap-6">
                    <DialogHeader className="space-y-3 text-left">
                        <DialogTitle className="text-xl">
                            {selectedPrompt ? 'Tolak Prompt' : `Tolak Massal (${selectedPromptIds.length} Prompt)`}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Mohon berikan alasan penolakan prompt ini (opsional). Alasan akan dikirimkan ke pengguna.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Textarea 
                            placeholder="Alasan penolakan (opsional)..." 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-[120px] resize-none text-base"
                        />
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsRejectDialogOpen(false)}
                                className="w-full sm:w-auto h-11 sm:h-10"
                            >
                                Batal
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="w-full sm:w-auto h-11 sm:h-10"
                            >
                                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {selectedPrompt ? 'Tolak Prompt' : 'Tolak Massal'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default AdminVerification;
