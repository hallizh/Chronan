interface QuantityInputProps {
  value: number;
  onChange: (n: number) => void;
}

export function QuantityInput({ value, onChange }: QuantityInputProps) {
  return (
    <div className="flex items-center border border-[#2a3d55] rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-base leading-none"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium text-white border-x border-[#2a3d55]">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-base leading-none"
      >
        +
      </button>
    </div>
  );
}
