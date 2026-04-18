import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: '📊',
    title: 'Budget Tracking',
    description: 'Real-time visibility into every rupee you spend. Know exactly where your money goes, the moment it moves.',
  },
  {
    icon: '🧠',
    title: 'Smart Insights',
    description: 'AI-powered recommendations tailored to your habits. CoinSage learns and adapts as your finances evolve.',
  },
  {
    icon: '🔔',
    title: 'Alerts & Notifications',
    description: 'Instant alerts before you overspend. Stay ahead of your limits with proactive, intelligent warnings.',
  },
  {
    icon: '⚙️',
    title: 'Automated Decisions',
    description: 'Set rules. CoinSage executes them on-chain. Fully autonomous financial actions, with zero manual effort.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span className="text-[#00D4AA] text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
            Features
          </span>
          <h2 className="font-['Sora'] font-bold text-4xl lg:text-5xl text-[#E2E8F0] leading-tight max-w-lg">
            Everything your finances need, automated.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={i * 0.07}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
