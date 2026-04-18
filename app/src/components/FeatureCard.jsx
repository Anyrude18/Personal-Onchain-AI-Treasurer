import { motion } from 'framer-motion';

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative bg-[#111318] border border-white/5 rounded-2xl p-7 cursor-default transition-all duration-200 overflow-hidden"
      style={{ '--hover-shadow': '0 0 32px rgba(0,212,170,0.12), 0 16px 48px rgba(0,0,0,0.5)' }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: 'linear-gradient(180deg, transparent, #00D4AA, transparent)' }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: '0 0 32px rgba(0,212,170,0.08), 0 12px 40px rgba(0,0,0,0.4)' }}
      />

      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl bg-[#0A0C10] border border-white/8 flex items-center justify-center text-2xl mb-5 group-hover:border-[#00D4AA]/20 transition-colors duration-200">
          {icon}
        </div>
        <h3 className="font-['Sora'] font-semibold text-[#E2E8F0] text-lg mb-2.5 group-hover:text-white transition-colors duration-200">
          {title}
        </h3>
        <p className="text-[#64748B] text-sm leading-relaxed group-hover:text-[#94A3B8] transition-colors duration-200">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
