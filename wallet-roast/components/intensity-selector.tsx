'use client';

import { type Intensity } from '@/lib/grok/prompts';

interface IntensitySelectorProps {
  selected: Intensity;
  onChange: (intensity: Intensity) => void;
  disabled?: boolean;
}

const intensities: { value: Intensity; label: string; emoji: string; description: string }[] = [
  { value: 'mild', label: 'MILD', emoji: '😊', description: 'Gentle teasing' },
  { value: 'spicy', label: 'SPICY', emoji: '🌶️', description: 'Pointed burns' },
  { value: 'nuclear', label: 'NUCLEAR', emoji: '☢️', description: 'No mercy' },
];

export function IntensitySelector({
  selected,
  onChange,
  disabled,
}: IntensitySelectorProps) {
  return (
    <div className="mb-4">
      <p className="text-white/40 text-xs mb-3 text-center uppercase tracking-wider">
        Choose your roast level 🔥
      </p>
      <div className="flex gap-2 justify-center">
        {intensities.map(({ value, label, emoji }) => {
          const isSelected = selected === value;
          const isNuclear = value === 'nuclear';

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              disabled={disabled}
              className={`
                intensity-btn flex items-center gap-1.5
                ${isSelected && isNuclear ? 'active-destructive' : ''}
                ${isSelected && !isNuclear ? 'active' : ''}
                ${isSelected && isNuclear ? 'animate-shake' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
