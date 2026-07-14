/**
 * @fileoverview Fotoğraf yükleme bileşeni.
 * react-dropzone ile sürükle-bırak destekli fotoğraf yükleme alanı sağlar.
 * Dosya boyutu ve format validasyonu, önizleme gösterimi içerir.
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdClose, MdImage, MdCameraAlt } from 'react-icons/md';
import { UPLOAD_LIMITS, MESSAGES } from 'lib/constants';
import CameraCapture from './CameraCapture';

/**
 * Dosya boyutunu okunabilir formata çevirir.
 * @param {number} bytes - Dosya boyutu (byte)
 * @returns {string} Okunabilir dosya boyutu
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Fotoğraf yükleme bileşeni.
 * @param {Object} props
 * @param {File|null} props.file - Yüklenen dosya objesi
 * @param {string|null} props.preview - Önizleme URL'i
 * @param {Function} props.onFileSelect - Dosya seçim callback'i
 * @param {Function} props.onFileClear - Dosya temizleme callback'i
 * @param {string|null} props.error - Hata mesajı
 * @param {Function} props.onError - Hata callback'i
 * @param {boolean} props.disabled - Yükleme devre dışı mı
 */
export default function ImageUploader({
  file,
  preview,
  onFileSelect,
  onFileClear,
  error,
  onError,
  disabled,
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  /**
   * Dosya bırakma/seçme işleyicisi.
   */
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorCode = rejection.errors[0]?.code;
        if (errorCode === 'file-too-large') {
          onError(MESSAGES.FILE_TOO_LARGE);
        } else if (errorCode === 'file-invalid-type') {
          onError(MESSAGES.INVALID_FILE_TYPE);
        } else {
          onError('Dosya yüklenirken bir hata oluştu.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(selectedFile);
        onFileSelect(selectedFile, previewUrl);
      }
    },
    [onFileSelect, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOAD_LIMITS.ACCEPTED_TYPES,
    maxSize: UPLOAD_LIMITS.MAX_FILE_SIZE,
    multiple: false,
    disabled,
  });

  // Dosya yüklendiyse önizleme göster
  if (file && preview) {
    return (
      <div className="relative overflow-hidden rounded-[20px] border-2 border-gray-200 bg-white dark:border-white/10 dark:bg-navy-800">
        {/* Önizleme Görseli */}
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            src={preview}
            alt="Yüklenen fotoğraf önizlemesi"
            className="h-full w-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Dosya bilgisi */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <MdImage className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-white">
                  {file.name}
                </p>
                <p className="text-xs text-white/70">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kaldır butonu */}
        {!disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileClear();
            }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-110"
          >
            <MdClose className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Dropzone Alanı */}
      <div
        {...getRootProps()}
        className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-8 transition-all duration-300 ${
          isDragActive
            ? 'border-brand-500 bg-brand-500/5 dark:border-brand-400 dark:bg-brand-400/5'
            : disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-white/10 dark:bg-navy-800/50'
            : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-brand-500/5 dark:border-white/10 dark:bg-navy-800 dark:hover:border-brand-400/50'
        }`}
      >
        <input {...getInputProps()} />

        {/* Upload İkonu */}
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            isDragActive
              ? 'bg-brand-500/20 text-brand-500'
              : 'bg-lightPrimary text-brand-500 group-hover:scale-110 group-hover:bg-brand-500/10 dark:bg-navy-700 dark:text-brand-400'
          }`}
        >
          <MdCloudUpload className="h-8 w-8" />
        </div>

        {/* Metin */}
        {isDragActive ? (
          <p className="text-lg font-semibold text-brand-500 dark:text-brand-400">
            Fotoğrafı buraya bırakın...
          </p>
        ) : (
          <>
            <p className="mb-1 text-center text-base font-semibold text-navy-700 dark:text-white">
              Fotoğrafınızı sürükleyip bırakın
            </p>
            <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
              veya
            </p>
            <div className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 group-hover:bg-brand-600">
              Dosya Seçin
            </div>
            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
              JPEG, PNG veya WebP • Maks. 5MB
            </p>
          </>
        )}
      </div>

      {/* Kamera Butonu */}
      {!disabled && (
        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-gray-200 bg-white py-3 text-sm font-medium text-navy-700 transition-all duration-200 hover:border-brand-400 hover:bg-brand-500/5 dark:border-white/10 dark:bg-navy-800 dark:text-white dark:hover:border-brand-400/50"
        >
          <MdCameraAlt className="h-5 w-5 text-brand-500" />
          Kamera ile Çek
        </button>
      )}

      {/* Hata mesajı */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
          <svg
            className="h-4 w-4 flex-shrink-0 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Kamera Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={onFileSelect}
      />
    </div>
  );
}

ImageUploader.propTypes = {
  file: PropTypes.object,
  preview: PropTypes.string,
  onFileSelect: PropTypes.func.isRequired,
  onFileClear: PropTypes.func.isRequired,
  error: PropTypes.string,
  onError: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ImageUploader.defaultProps = {
  file: null,
  preview: null,
  error: null,
  disabled: false,
};
