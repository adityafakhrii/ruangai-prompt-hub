import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  imageMode: 'url' | 'upload';
  imageUrl: string;
  imageFile: File | null;
  imagePreview: string | null;
  onModeChange: (mode: 'url' | 'upload') => void;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null, preview: string | null) => void;
  error?: string;
}

const ImageUpload = ({
  imageMode,
  imageUrl,
  imageFile,
  imagePreview,
  onModeChange,
  onUrlChange,
  onFileChange,
  error,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      onFileChange(file, e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onFileChange]);

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

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={imageMode === 'url' ? 'default' : 'outline'}
          onClick={() => { onModeChange('url'); onFileChange(null, null); }}
        >
          URL
        </Button>
        <Button
          type="button"
          size="sm"
          variant={imageMode === 'upload' ? 'default' : 'outline'}
          onClick={() => { onModeChange('upload'); onUrlChange(''); }}
        >
          Upload
        </Button>
      </div>

      {imageMode === 'url' ? (
        <div className="space-y-2">
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="bg-input border-border"
          />
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-40 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Drag & Drop Area */}
          {!imagePreview && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag & drop gambar di sini, atau <span className="text-primary font-medium">klik untuk pilih</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF hingga 2MB</p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={imagePreview}
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
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {imageFile?.name}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;