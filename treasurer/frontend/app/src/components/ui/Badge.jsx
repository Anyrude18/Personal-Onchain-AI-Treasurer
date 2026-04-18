const variantStyles = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/25',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  purple: 'bg-[#7c6ff7]/15 text-[#7c6ff7] border border-[#7c6ff7]/25',
  default: 'bg-white/5 text-slate-400 border border-white/10',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

/**
 * @param {{ label: string, variant?: 'success'|'warning'|'danger'|'info'|'purple'|'default', size?: 'sm'|'md' }} props
 */
export default function Badge({ label, variant = 'default', size = 'sm' }) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {label}
    </span>
  );
}
