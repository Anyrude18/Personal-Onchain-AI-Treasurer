import { motion } from 'framer-motion';

const stats = [
  { value: '10,000+', label: 'Transactions Analyzed' },
  { value: '98%', label: 'AI Decision Accuracy' },
  { value: '₹2.4Cr', label: 'Saved by Users' },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-6 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="font-['Sora'] font-bold text-5xl lg:text-6xl mb-3"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #E2E8F0, #94A3B8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </div>
              <div className="text-[#64748B] text-sm font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
