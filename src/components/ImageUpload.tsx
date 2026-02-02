import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, FileDown, RefreshCw } from "lucide-react";
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
  const [remoteSize, setRemoteSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (imageUrl && !imageFile && !imagePreview) {
      fetch(imageUrl, { method: 'HEAD' })
        .then(res => {
          const length = res.headers.get('content-length');
          if (length) setRemoteSize(parseInt(length, 10));
        })
        .catch(err => {
          console.error('Error fetching image size:', err);
          setRemoteSize(null);
        });
    } else {
      setRemoteSize(null);
    }
  }, [imageUrl, imageFile, imagePreview]);

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

  const handleCompressRemote = async () => {
    if (!imageUrl) return;
    setIsCompressing(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileName = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      await handleFile(file);
    } catch (error) {
      console.error('Failed to process remote image:', error);
      toast({
        title: "Gagal memproses gambar",
        description: "Tidak dapat mengunduh gambar untuk dikompresi.",
        variant: "destructive",
      });
      setIsCompressing(false);
    }
  };

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

          {!imageFile && imageUrl && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                Ukuran: {remoteSize ? formatBytes(remoteSize) : 'Mengecek...'}
              </div>
              
              {(!remoteSize || remoteSize > 1 * 1024 * 1024) && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="secondary" 
                  className="h-7 text-xs gap-1 shadow-lg"
                  onClick={handleCompressRemote}
                  disabled={isCompressing}
                >
                  {isCompressing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Compress & Convert
                </Button>
              )}
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