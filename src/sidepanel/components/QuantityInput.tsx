interface QuantityInputProps {
  value: number;
  onChange: (n: number) => void;
}

export function QuantityInput({ value, onChange }: QuantityInputProps) {
  return (
    <div className="flex items-center bg-surface-container-lowest rounded-full px-2 py-1 gap-3">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-sm">remove</span>
      </button>
      <span className="text-xs font-bold text-on-surface min-w-[1ch] text-center">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-sm">add</span>
      </button>
    </div>
  );
}
