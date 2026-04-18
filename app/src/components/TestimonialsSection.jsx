import { motion } from 'framer-motion';

const testimonials = [
  {
    initials: 'AM',
    name: 'Arjun M.',
    role: 'Crypto Trader',
    quote: '"CoinSage literally saved me ₹40K last month by catching an overspend pattern I completely missed. The AI is genuinely impressive."',
    color: '#00D4AA',
  },
  {
    initials: 'PS',
    name: 'Priya S.',
    role: 'Freelancer',
    quote: '"The AI insights are scary accurate. It feels like having a personal CFO working around the clock, without the hefty fee."',
    color: '#6366F1',
  },
  {
    initials: 'RV',
    name: 'Rahul V.',
    role: 'Startup Founder',
    quote: '"Set it up in 5 minutes. My on-chain finances have never been more organized. I don\'t know how I managed without it."',
    color: '#F59E0B',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-[#00D4AA] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            Testimonials
          </span>
          <h2 className="font-['Sora'] font-bold text-4xl lg:text-5xl text-[#E2E8F0] leading-tight">
            Trusted by smart money.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ initials, name, role, quote, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111318] border border-white/5 rounded-2xl p-7 flex flex-col gap-5"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-['Sora'] shrink-0"
                  style={{
                    background: `${color}20`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-[#E2E8F0] text-sm font-semibold font-['Sora']">{name}</div>
                  <div className="text-[#64748B] text-xs">{role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="12" height="12" viewBox="0 0 12 12" fill="#00D4AA" opacity="0.8">
                      <path d="M6 1l1.2 3.6H11L8.2 6.8l1.1 3.4L6 8.3l-3.3 1.9 1.1-3.4L1 4.6h3.8z"/>
                    </svg>
                  ))}
                </div>
              </div>

              <p className="text-[#94A3B8] text-sm leading-relaxed flex-1">{quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
