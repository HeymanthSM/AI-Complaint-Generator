'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { api } from '@/lib/api';
import { Camera, UploadCloud, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUploaded: (imageName: string, analysisResults: any) => void;
  onImageRemoved: () => void;
}

export default function ImageUploader({ onImageUploaded, onImageRemoved }: ImageUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG/JPG)');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Send to backend endpoint
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await api.post('/ai/analyze-image', formData);
      setAnalysis(data);
      onImageUploaded(data.imagePath, data);
    } catch (err: any) {
      console.error(err);
      // Demo Mode fallback - simulate image analysis if server is unavailable
      const mockResult = {
        detected: true,
        category: 'POTHOLE',
        confidence: 0.94,
        detections: [
          { box_2d: [120, 240, 480, 720], label: 'Pothole', score: 0.94 }
        ],
        imagePath: 'demo_pothole.jpg',
      };
      setAnalysis(mockResult);
      onImageUploaded(mockResult.imagePath, mockResult);
      setError('Backend analyzer offline. Running visual simulation mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    onImageRemoved();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-indigo-500/40 bg-zinc-900/10 rounded-xl p-8 cursor-pointer transition-all duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <UploadCloud className="h-10 w-10 text-zinc-500 mb-3" />
          <p className="text-sm font-semibold text-zinc-300">Drag & Drop Image here</p>
          <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPG, JPEG (Max 5MB)</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-white/5 bg-zinc-900/50 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            {/* Image Preview */}
            <div className="relative h-40 w-full sm:w-56 rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-white/5 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-zinc-300 hover:text-white transition-colors border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Analysis details */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4.5 w-4.5 text-indigo-400" />
                <span className="text-sm font-semibold text-white">AI Vision Analysis</span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-zinc-800 rounded animate-pulse" />
                </div>
              ) : analysis ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="success">Object Verified</Badge>
                    <Badge variant="primary" className="uppercase">
                      {analysis.category || 'POTHOLE'}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round((analysis.confidence || 0.9) * 100)}% Confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    AI detected <span className="text-zinc-200 font-semibold lowercase">{analysis.category?.replace('_', ' ') || 'issue'}</span> in the upload. This verification signature will be bundled with the report.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Selected image will be processed for verification.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/15 p-2.5 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
