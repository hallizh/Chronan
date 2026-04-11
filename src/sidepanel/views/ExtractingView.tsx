interface ExtractingViewProps {
  label?: string;
}

export function ExtractingView({ label = "Scanning recipe…" }: ExtractingViewProps) {
  return (
    <div className="h-full bg-surface flex flex-col items-center justify-center gap-5 p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-1">Just a moment…</p>
      </div>
    </div>
  );
}
