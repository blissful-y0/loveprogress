interface PageHeaderProps {
  label: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ label, title, subtitle }: PageHeaderProps) {
  return (
    <div className="space-y-4 pb-2">
      <div className="text-center space-y-2 px-4">
        <p className="text-[11px] font-bold text-primary tracking-[0.18em] uppercase">{label}</p>
        <h1 className="text-[22px] md:text-[26px] font-bold text-foreground tracking-tight">{title}</h1>
        <p className="text-[13px] md:text-[14px] text-[#888]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#e0f0ea]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        <div className="flex-1 h-px bg-[#e0f0ea]" />
      </div>
    </div>
  );
}
