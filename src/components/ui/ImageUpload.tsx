import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import { Text } from './Text';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // en MB
}

export function ImageUpload({
  value = '',
  onChange,
  placeholder = 'URL de l\'image ou uploadez un fichier',
  className = '',
  accept = 'image/*',
  maxSize = 5
}: ImageUploadProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Le fichier est trop volumineux. Taille maximale: ${maxSize}MB`);
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);

      // Appeler l'API d'upload
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const data = await response.json();
      onChange(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
    setError(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mode selector */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('url')}
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('file')}
        >
          Upload
        </Button>
      </div>

      {/* URL Input */}
      {uploadMode === 'url' && (
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
        />
      )}

      {/* File Upload */}
      {uploadMode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileSelect}
              disabled={uploading}
            >
              {uploading ? 'Upload en cours...' : 'Sélectionner une image'}
            </Button>
            <Text variant="small" className="text-gray-500 mt-2">
              Formats acceptés: JPG, PNG, GIF (max {maxSize}MB)
            </Text>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Text variant="small" className="text-red-600">
          {error}
        </Text>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-3">
          <Text variant="small" className="font-medium text-gray-700 mb-2">
            Aperçu:
          </Text>
          <div className="relative inline-block">
            <Image
              src={value}
              alt="Aperçu"
              width={80}
              height={80}
              className="h-20 w-20 object-cover rounded-md border border-gray-300"
              onError={() => setError('Impossible de charger l\'image')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 text-white hover:bg-red-600"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}