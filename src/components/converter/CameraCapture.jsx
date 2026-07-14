/**
 * @fileoverview Kamera yakalama bileşeni.
 * WebRTC getUserMedia API kullanarak canlı kamera önizleme ve fotoğraf çekme sağlar.
 * Masaüstünde webcam, mobilde arka kamera kullanır.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdCameraAlt, MdClose, MdSwitchCamera, MdCheck } from 'react-icons/md';

/**
 * Kamera yakalama bileşeni.
 * @param {Object} props
 * @param {boolean} props.isOpen - Kamera modalı açık mı
 * @param {Function} props.onClose - Modal kapatma callback'i
 * @param {Function} props.onCapture - Çekilen fotoğrafı döndürme callback'i (File, previewUrl)
 */
export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = ön, 'environment' = arka
  const [cameraError, setCameraError] = useState(null);

  /**
   * Kamera akışını başlatır.
   */
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCameraReady(false);

    try {
      // Önceki akışı durdur
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('Kamera erişim hatası:', error);
      if (error.name === 'NotAllowedError') {
        setCameraError('Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('Kamera bulunamadı. Lütfen bir kamera bağlayın.');
      } else {
        setCameraError('Kamera başlatılamadı: ' + error.message);
      }
    }
  }, [facingMode]);

  /**
   * Kamera akışını durdurur.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  // Modal açıldığında kamerayı başlat, kapandığında durdur
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  /**
   * Fotoğraf çeker.
   */
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    // Ön kamerada ayna efekti
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  /**
   * Çekilen fotoğrafı onaylar ve üst bileşene gönderir.
   */
  const handleConfirm = () => {
    if (!capturedImage) return;

    // Data URL'den File oluştur
    const byteString = atob(capturedImage.split(',')[1]);
    const mimeType = 'image/jpeg';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: mimeType });

    onCapture(file, capturedImage);
    onClose();
  };

  /**
   * Yeniden çekim.
   */
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  /**
   * Kamera yönünü değiştirir (ön/arka).
   */
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[20px] bg-white shadow-2xl dark:bg-navy-800">
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            📸 Fotoğraf Çek
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        {/* Kamera/Fotoğraf Alanı */}
        <div className="relative aspect-[4/3] w-full bg-black">
          {/* Hata durumu */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <MdCameraAlt className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-sm text-red-300">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* Canlı video */}
          {!capturedImage && !cameraError && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                </div>
              )}
            </>
          )}

          {/* Çekilen fotoğraf önizleme */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Çekilen fotoğraf"
              className="h-full w-full object-cover"
            />
          )}

          {/* Gizli canvas (fotoğraf çekimi için) */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Kontrol Butonları */}
        <div className="flex items-center justify-center gap-4 p-5">
          {!capturedImage ? (
            <>
              {/* Kamera Değiştir */}
              <button
                type="button"
                onClick={toggleCamera}
                disabled={!isCameraReady}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 transition-all duration-200 hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                title="Kamera değiştir"
              >
                <MdSwitchCamera className="h-5 w-5" />
              </button>

              {/* Çekim Butonu */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isCameraReady}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-all duration-200 hover:bg-brand-600 hover:shadow-xl active:scale-95 disabled:opacity-40"
                title="Fotoğraf çek"
              >
                <MdCameraAlt className="h-7 w-7" />
              </button>

              {/* İptal */}
              <button
                type="button"
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                title="İptal"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              {/* Yeniden Çek */}
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-medium text-navy-700 transition-all duration-200 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                <MdCameraAlt className="h-5 w-5" />
                Yeniden Çek
              </button>

              {/* Onayla */}
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600"
              >
                <MdCheck className="h-5 w-5" />
                Bu Fotoğrafı Kullan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

CameraCapture.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
};
