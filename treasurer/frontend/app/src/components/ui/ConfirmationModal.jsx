import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @param {{ title: string, description: string, confirmLabel?: string, onConfirm: () => void, onCancel: () => void, variant?: 'danger'|'default', isOpen: boolean }} props
 */
export default function ConfirmationModal({
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  variant = 'default',
  isOpen,
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative bg-[#1a1d27] border border-white/[0.07] rounded-xl p-6 w-full max-w-md shadow-2xl"
          >
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variant === 'danger' ? 'bg-[#e05252]/15 text-[#e05252]' : 'bg-[#7c6ff7]/15 text-[#7c6ff7]'}`}>
                {variant === 'danger' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.12] text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${variant === 'danger' ? 'bg-[#e05252] hover:bg-[#c94444] text-white' : 'bg-[#7c6ff7] hover:bg-[#6b5fe6] text-white'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
