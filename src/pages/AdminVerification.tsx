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
import { Loader2, Check, X, Eye } from "lucide-react";
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

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isAdmin) {
                navigate('/');
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to view this page.",
                    variant: "destructive",
                });
            } else {
                fetchPendingPrompts();
            }
        }
    }, [user, isAdmin, authLoading, navigate]);

    const fetchPendingPrompts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('heroic_token');
            const { data, error } = await supabase.functions.invoke('manage-prompts', {
                body: { action: 'list_pending', token }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            
            setPrompts(data.prompts as PromptWithProfile[]);
        } catch (error: unknown) {
            toast({
                title: "Error fetching prompts",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
                title: "Prompt Verified",
                description: "The prompt is now public.",
            });
            fetchPendingPrompts();
            setIsPreviewDialogOpen(false);
        } catch (error: unknown) {
            toast({
                title: "Error verifying prompt",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
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
                title: "Reason required",
                description: "Please provide a reason for rejection.",
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
                title: "Prompt Rejected",
                description: "The prompt has been returned to the user.",
            });
            setIsRejectDialogOpen(false);
            setRejectionReason("");
            fetchPendingPrompts();
            setIsPreviewDialogOpen(false);
        } catch (error: unknown) {
            toast({
                title: "Error rejecting prompt",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
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
                <h1 className="text-3xl font-bold mb-6">Admin Verification Dashboard</h1>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Pending Prompts ({prompts.length})</h2>
                        <Button onClick={fetchPendingPrompts} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>

                    {prompts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No pending prompts to verify.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prompts.map((prompt) => (
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
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {prompt.profiles?.email || 'Unknown User'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openPreview(prompt)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button 
                                                        variant="default" 
                                                        size="sm" 
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleVerify(prompt.id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => openRejectDialog(prompt)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
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
                        <DialogTitle>Review Prompt</DialogTitle>
                    </DialogHeader>
                    
                    {selectedPrompt && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Title</h3>
                                    <p className="text-lg font-semibold">{selectedPrompt.title}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                    <Badge>{selectedPrompt.category}</Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Full Prompt</h3>
                                <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-sm">
                                    {selectedPrompt.full_prompt}
                                </div>
                            </div>

                            {selectedPrompt.additional_info && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Info</h3>
                                    <p className="text-sm">{selectedPrompt.additional_info}</p>
                                </div>
                            )}

                            {selectedPrompt.image_url && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Image</h3>
                                    <img 
                                        src={selectedPrompt.image_url} 
                                        alt="Prompt Preview" 
                                        className="rounded-lg max-h-[300px] object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                        setIsPreviewDialogOpen(false);
                                        openRejectDialog(selectedPrompt);
                                    }}
                                >
                                    Reject
                                </Button>
                                <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleVerify(selectedPrompt.id)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Approve & Verify
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Prompt</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this prompt. This will be sent to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea 
                            placeholder="Reason for rejection..." 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleReject}
                            disabled={actionLoading || !rejectionReason.trim()}
                        >
                            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject Prompt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default AdminVerification;
