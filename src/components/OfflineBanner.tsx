import React from 'react';
import { useData } from '../context/DataContext';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineBanner() {
  const { isOffline } = useData();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-50 px-4 py-2 flex items-center justify-center shadow-md"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          <p className="text-sm font-medium">
            You are currently offline. Scans will be saved and synced automatically when your connection is restored.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
