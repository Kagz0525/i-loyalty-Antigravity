import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface CustomerQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
}

export default function CustomerQrModal({ isOpen, onClose, userId, userEmail, userName }: CustomerQrModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My QR Code</h2>
              <p className="text-sm text-gray-500 px-4">
                Show this code to the vendor to receive your loyalty points.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-orange-100 inline-block mb-6 shadow-sm">
              <QRCodeSVG 
                value={JSON.stringify({ id: userId, email: userEmail, name: userName })} 
                size={200}
                level="H"
                includeMargin={false}
                className="mx-auto"
                fgColor="#000000"
              />
            </div>

            <div className="space-y-1">
              <p className="font-bold text-gray-900">{userName}</p>
              <p className="text-xs text-orange-600 font-mono tracking-tighter uppercase opacity-60">
                Customer ID: {userId.substring(0, 8)}...
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

