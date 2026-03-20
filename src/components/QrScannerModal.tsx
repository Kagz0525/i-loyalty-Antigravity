import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, ZapOff, Camera, AlertTriangle } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (e) {
      console.warn('Scanner cleanup error:', e);
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (isStarting || scannerRef.current) return;
    setIsStarting(true);
    setPermissionDenied(false);

    // Small delay to ensure the DOM element is rendered
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!mountedRef.current) { setIsStarting(false); return; }

    const readerElement = document.getElementById('qr-reader');
    if (!readerElement) { setIsStarting(false); return; }

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Success: show green flash feedback
          setScanSuccess(true);
          
          // Play a subtle beep sound as haptic feedback
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 1800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.15;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.12);
          } catch (_) { /* audio not required */ }

          // Vibrate if available
          if (navigator.vibrate) navigator.vibrate(100);

          setTimeout(() => {
            stopScanner();
            onScanSuccess(decodedText);
          }, 400);
        },
        () => { /* ignore scan failures – they happen every frame */ }
      );

      // Check if flash/torch is available
      try {
        const capabilities = scanner.getRunningTrackCameraCapabilities();
        const torchFeature = capabilities.torchFeature();
        setHasFlash(torchFeature.isSupported());
      } catch {
        setHasFlash(false);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err?.toString()?.includes('Permission') || err?.toString()?.includes('NotAllowed')) {
        setPermissionDenied(true);
      }
      scannerRef.current = null;
    } finally {
      if (mountedRef.current) setIsStarting(false);
    }
  }, [isStarting, onScanSuccess, stopScanner]);

  const toggleFlash = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const capabilities = scannerRef.current.getRunningTrackCameraCapabilities();
      const torchFeature = capabilities.torchFeature();
      if (torchFeature.isSupported()) {
        await torchFeature.apply(!isFlashOn);
        setIsFlashOn(!isFlashOn);
      }
    } catch (e) {
      console.warn('Flash toggle error:', e);
    }
  }, [isFlashOn]);

  useEffect(() => {
    mountedRef.current = true;
    if (isOpen) {
      setScanSuccess(false);
      setIsFlashOn(false);
      startScanner();
    }
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [isOpen]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Green flash overlay on successful scan */}
          <AnimatePresence>
            {scanSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-green-400 z-[51] pointer-events-none"
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-[52]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-white">Scan QR Code</h2>
              </div>
              <div className="flex items-center gap-2">
                {hasFlash && (
                  <button
                    onClick={toggleFlash}
                    className={`p-2 rounded-full transition-all ${
                      isFlashOn
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-700 text-gray-400 hover:text-gray-200'
                    }`}
                    title={isFlashOn ? 'Disable Flash' : 'Enable Flash'}
                  >
                    {isFlashOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scanner viewport */}
            <div className="relative">
              <div id="qr-reader" className="w-full" style={{ minHeight: 320 }} />

              {/* Loading / Starting state */}
              {isStarting && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Starting camera…</p>
                  </div>
                </div>
              )}

              {/* Permission denied */}
              {permissionDenied && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">Camera Access Required</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Please allow camera access in your browser settings to scan QR codes.
                    </p>
                    <button
                      onClick={() => startScanner()}
                      className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer instructions */}
            <div className="p-4 border-t border-gray-700 text-center">
              <p className="text-gray-400 text-sm">
                Point camera at customer's QR code
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
