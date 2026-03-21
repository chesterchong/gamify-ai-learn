/**
 * Golden “full marks” chip — military_tech + amber glow. Optional label (icon-only if omitted).
 */
export default function PerfectScoreBadge({
  label = '',
  className = '',
  title = 'You scored 100% on this quiz at least once',
  iconSizeClass = 'text-[13px]',
  ...rest
}) {
  const labelText = typeof label === 'string' ? label.trim() : label != null ? String(label) : ''
  const showLabel = labelText.length > 0
  return (
    <span
      className={`inline-flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-wide py-0.5 rounded border border-amber-400/45 text-amber-200 bg-amber-500/[0.12] shadow-[0_0_12px_-4px_rgba(251,191,36,0.35)] shrink-0 ${
        showLabel ? 'px-1.5' : 'px-1'
      } ${className}`}
      title={title}
      aria-label={showLabel ? undefined : title}
      data-purpose="perfect-score-badge"
      {...rest}
    >
      <span
        className={`material-symbols-outlined text-amber-300 ${iconSizeClass}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden
      >
        military_tech
      </span>
      {showLabel ? labelText : null}
    </span>
  )
}
