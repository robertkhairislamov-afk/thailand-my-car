import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface EnhancedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function EnhancedCheckbox({
  checked,
  onChange,
  disabled = false,
  label,
}: EnhancedCheckboxProps) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-3 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />

        {/* Checkbox Container */}
        <motion.div
          className={`
            flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all
            ${
              checked
                ? 'border-[#4A9FD8] bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]'
                : 'border-border bg-card'
            }
            ${
              !disabled &&
              'group-hover:border-[#4A9FD8]/50 group-hover:shadow-sm group-active:scale-95'
            }
            peer-focus-visible:ring-2 peer-focus-visible:ring-[#4A9FD8]/30 peer-focus-visible:ring-offset-2
          `}
          whileTap={!disabled ? { scale: 0.9 } : {}}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {/* Checkmark */}
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ripple Effect on Click */}
        {!disabled && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-md bg-[#4A9FD8]/20"
            initial={{ scale: 1, opacity: 0 }}
            animate={checked ? { scale: 1.5, opacity: [0.5, 0] } : {}}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      {/* Label */}
      {label && (
        <span
          className={`
            select-none transition-all
            ${checked ? 'text-muted-foreground line-through' : 'text-foreground'}
            ${!disabled && 'group-hover:text-[#4A9FD8]'}
          `}
          style={{ fontSize: '14px' }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

// Re-export AnimatePresence for the component
import { AnimatePresence } from 'motion/react';
