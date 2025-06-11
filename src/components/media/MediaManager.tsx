
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image, 
  Video, 
  File, 
  Trash2, 
  Download, 
  Edit3, 
  Search,
  Filter,
  Grid,
  List,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/storageService';
import { format } from 'date-fns';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  mimeType: string;
}

interface MediaManagerProps {
  onSelectMedia?: (files: MediaFile[]) => void;
  maxSelection?: number;
  allowedTypes?: string[];
  mode?: 'select' | 'manage';
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  onSelectMedia,
  maxSelection = 5,
  allowedTypes = ['image/*', 'video/*'],
  mode = 'manage'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const fileKey = `${file.name}_${index}`;
        setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
        
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: Math.min((prev[fileKey] || 0) + 10, 90)
          }));
        }, 200);

        try {
          const result = await StorageService.uploadContentMedia(file, user.id);
          clearInterval(progressInterval);
          
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          
          if (result.error) {
            toast({
              title: 'Upload failed',
              description: result.error,
              variant: 'destructive',
            });
            return null;
          }
          
          const mediaFile: MediaFile = {
            id: `${Date.now()}_${index}`,
            name: file.name,
            url: result.url!,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'document',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            mimeType: file.type
          };
          
          return mediaFile;
        } catch (error) {
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
          throw error;
        }
      });
      
      const results = await Promise.all(uploadPromises);
      const newFiles = results.filter((file): file is MediaFile => file !== null);
      
      setMediaFiles(prev => [...newFiles, ...prev]);
      
      if (newFiles.length > 0) {
        toast({
          title: 'Upload successful',
          description: `${newFiles.length} file(s) uploaded successfully`,
        });
      }
      
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: 50 * 1024 * 1024,
    disabled: uploading
  });

  const handleSelectFile = (file: MediaFile) => {
    if (mode === 'select') {
      setSelectedFiles(prev => {
        const isSelected = prev.find(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        } else if (prev.length < maxSelection) {
          return [...prev, file];
        } else {
          toast({
            title: 'Selection limit reached',
            description: `You can only select up to ${maxSelection} files`,
            variant: 'destructive',
          });
          return prev;
        }
      });
    }
  };

  const handleDeleteFile = async (file: MediaFile) => {
    try {
      await StorageService.deleteFile(file.url);
      setMediaFiles(prev => prev.filter(f => f.id !== file.id));
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id));
      
      toast({
        title: 'File deleted',
        description: 'File has been successfully deleted',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images and videos up to 50MB
            </p>
          </div>
        )}
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading files...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(uploadProgress).map(([fileKey, progress]) => (
              <div key={fileKey} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fileKey.split('_')[0]}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="image">Images</TabsTrigger>
                  <TabsTrigger value="video">Videos</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {mode === 'select' && selectedFiles.length > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                {selectedFiles.length} file(s) selected
              </p>
              <Button
                onClick={() => onSelectMedia?.(selectedFiles)}
                className="mt-2"
                size="sm"
              >
                Use Selected Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
        {filteredFiles.map((file) => {
          const isSelected = selectedFiles.find(f => f.id === file.id);
          
          return (
            <Card 
              key={file.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${viewMode === 'list' ? 'flex items-center p-3' : ''}`}
              onClick={() => handleSelectFile(file)}
            >
              {viewMode === 'grid' ? (
                <div>
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : file.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <File className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(file);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-96 overflow-auto">
                            {file.type === 'image' ? (
                              <img src={file.url} alt={file.name} className="w-full" />
                            ) : file.type === 'video' ? (
                              <video src={file.url} controls className="w-full" />
                            ) : (
                              <p>Preview not available for this file type</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getFileIcon(file.type)}
                        <span className="ml-1">{file.type}</span>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">{file.type}</Badge>
                    {isSelected && <Badge>Selected</Badge>}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No media files</h3>
            <p className="text-gray-500">Upload some files to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
