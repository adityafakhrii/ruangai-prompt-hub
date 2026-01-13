import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { compressImage, formatBytes } from "@/lib/imageUtils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  imageUrl: string;
  imageFile: File | null;
  imagePreview: string | null;
  onFileChange: (file: File | null, preview: string | null) => void;
  error?: string;
}

const ImageUpload = ({
  imageUrl,
  imageFile,
  imagePreview,
  onFileChange,
  error,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setIsCompressing(true);

    try {
      // Compress image to WebP format
      const result = await compressImage(file);

      // Show compression result to user
      toast({
        title: "Gambar berhasil dikompresi!",
        description: `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (hemat ${result.compressionRatio}%)`,
      });

      // Create preview from compressed file
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileChange(result.file, e.target?.result as string);
      };
      reader.readAsDataURL(result.file);
    } catch (err) {
      console.error('Compression failed:', err);
      // Fallback to original file if compression fails
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileChange(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Peringatan",
        description: "Kompresi gagal, menggunakan gambar asli.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  }, [onFileChange, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveImage = () => {
    onFileChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayImage = imagePreview || imageUrl;

  return (
    <div className="space-y-3">
      {displayImage ? (
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt="Preview"
            className="w-full h-48 object-contain"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
          {imageFile && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {imageFile.name} ({formatBytes(imageFile.size)})
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isCompressing && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
            ${isCompressing ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {isCompressing ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground mb-1">
                Mengkompresi gambar...
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag & drop gambar di sini, atau <span className="text-primary font-medium">klik untuk pilih</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF (akan dikompresi ke WebP)</p>
            </>
          )}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isCompressing}
      />
    </div>
  );
};

export default ImageUpload;