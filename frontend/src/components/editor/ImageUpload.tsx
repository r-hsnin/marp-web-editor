import { ImagePlus, Loader2, Upload } from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_BASE } from '@/lib/config';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

interface ImageUploadProps {
  open: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ open, onClose, onInsert }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('対応形式: PNG, JPEG, GIF, WebP');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('ファイルサイズは 5MB 以下にしてください');
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/api/images`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'アップロードに失敗しました');
        }

        const { url } = await response.json();
        const altText = file.name.replace(/\.[^/.]+$/, '');
        // url が絶対パスか相対パスかで分岐
        const imageUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
        onInsert(`![${altText}](${imageUrl})`);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
      } finally {
        setIsUploading(false);
      }
    },
    [onInsert, onClose],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile],
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            画像をアップロード
          </DialogTitle>
          <DialogDescription>PNG, JPEG, GIF, WebP（最大 5MB）</DialogDescription>
        </DialogHeader>

        <button
          type="button"
          className={`
            w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">アップロード中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ドラッグ&ドロップ または クリックして選択
              </p>
            </div>
          )}
        </button>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
