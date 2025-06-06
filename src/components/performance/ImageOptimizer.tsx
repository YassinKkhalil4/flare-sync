
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Download, Zap, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageOptimizerProps {
  images: File[];
  onOptimized: (optimizedImages: File[]) => void;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({ images, onOptimized }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizedImages, setOptimizedImages] = useState<File[]>([]);
  const { toast } = useToast();

  const optimizeImage = useCallback(async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate optimal dimensions
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleOptimize = async () => {
    if (images.length === 0) return;

    setIsOptimizing(true);
    setProgress(0);
    const optimized: File[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        
        if (file.type.startsWith('image/')) {
          const optimizedFile = await optimizeImage(file);
          optimized.push(optimizedFile);
        } else {
          optimized.push(file); // Keep non-image files as is
        }

        setProgress(((i + 1) / images.length) * 100);
      }

      setOptimizedImages(optimized);
      onOptimized(optimized);
      
      const totalOriginalSize = images.reduce((sum, file) => sum + file.size, 0);
      const totalOptimizedSize = optimized.reduce((sum, file) => sum + file.size, 0);
      const savedBytes = totalOriginalSize - totalOptimizedSize;
      const savedPercentage = ((savedBytes / totalOriginalSize) * 100).toFixed(1);

      toast({
        title: 'Images Optimized',
        description: `Reduced file size by ${savedPercentage}% (${(savedBytes / 1024 / 1024).toFixed(2)} MB saved)`
      });
    } catch (error) {
      toast({
        title: 'Optimization Failed',
        description: 'Failed to optimize some images',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image Optimization
        </CardTitle>
        <CardDescription>
          Optimize your images for better performance and faster loading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Original files:</span>
            <div className="font-medium">{images.length} images</div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(images.reduce((sum, file) => sum + file.size, 0))}
            </div>
          </div>
          
          {optimizedImages.length > 0 && (
            <div>
              <span className="text-muted-foreground">Optimized files:</span>
              <div className="font-medium">{optimizedImages.length} images</div>
              <div className="text-xs text-green-600">
                {formatFileSize(optimizedImages.reduce((sum, file) => sum + file.size, 0))}
              </div>
            </div>
          )}
        </div>

        {isOptimizing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Optimizing images...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Images'}
          </Button>
          
          {optimizedImages.length > 0 && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>

        {optimizedImages.length > 0 && (
          <div className="grid gap-2">
            {optimizedImages.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                  {images[index] && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      -{((1 - file.size / images[index].size) * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageOptimizer;
