import { motion } from 'framer-motion';
import DashboardPreviewCard from './DashboardPreviewCard';

export default function PreviewSection() {
  return (
    <section className="py-28 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-[#00D4AA] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            Product
          </span>
          <h2 className="font-['Sora'] font-bold text-4xl lg:text-5xl text-[#E2E8F0] leading-tight">
            Your finances, at a glance.
          </h2>
          <p className="text-[#94A3B8] mt-4 max-w-md mx-auto text-base">
            A unified dashboard that puts your entire on-chain financial life in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-16 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 60%, rgba(0,212,170,0.1) 0%, rgba(99,102,241,0.05) 50%, transparent 70%)',
              }}
            />
          </div>
          <div className="relative">
            <DashboardPreviewCard large={true} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
