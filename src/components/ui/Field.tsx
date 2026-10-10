import React, { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  suffix?: string;
  trailing?: React.ReactNode;
}

export function Field({ label, icon: Icon, hint, error, suffix, trailing, className, id, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-[14px] text-mute mb-1.5 pl-1">
        {label}
      </label>
      <div
        className={cx(
          'flex items-center gap-2.5 h-14 px-4 rounded-[18px] bg-white border transition-[border-color,box-shadow] duration-200',
          'focus-within:border-brand-orange focus-within:shadow-[0_0_0_4px_rgba(242,153,53,0.15)]',
          error ? 'border-semantic-danger' : 'border-line-2',
        )}
      >
        {Icon && <Icon className="w-[19px] h-[19px] text-mute shrink-0" strokeWidth={1.7} />}
        <input
          id={inputId}
          className="flex-1 min-w-0 bg-transparent text-[17px] text-ink placeholder:text-faint h-full"
          aria-invalid={!!error}
          {...rest}
        />
        {suffix && <span className="text-[15px] text-mute shrink-0">{suffix}</span>}
        {trailing}
      </div>
      {error ? (
        <p className="text-[13px] text-semantic-danger mt-1.5 pl-1">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-mute mt-1.5 pl-1">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextArea({ label, hint, error, className, id, ...rest }: TextAreaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-[14px] text-mute mb-1.5 pl-1">
        {label}
      </label>
      <textarea
        id={inputId}
        className={cx(
          'w-full px-4 py-3.5 rounded-[18px] bg-white border text-[17px] text-ink placeholder:text-faint leading-relaxed resize-none',
          'focus:border-brand-orange focus:shadow-[0_0_0_4px_rgba(242,153,53,0.15)] transition-[border-color,box-shadow] duration-200',
          error ? 'border-semantic-danger' : 'border-line-2',
        )}
        aria-invalid={!!error}
        {...rest}
      />
      {error ? (
        <p className="text-[13px] text-semantic-danger mt-1.5 pl-1">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-mute mt-1.5 pl-1">{hint}</p>
      ) : null}
    </div>
  );
}

/** Large selectable radio card used across flows */
export function OptionCard({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  trailing,
  badge,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        'w-full text-left rounded-[22px] p-4 flex items-start gap-3.5 border transition-all duration-200 active:scale-[0.985]',
        selected
          ? 'bg-brand-orange-tint border-brand-orange shadow-[0_0_0_3px_rgba(242,153,53,0.14)]'
          : 'bg-white border-line shadow-card',
        className,
      )}
    >
      {Icon && (
        <span
          className={cx(
            'w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors',
            selected ? 'bg-orange-gradient text-white' : 'bg-fill text-ink-2',
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-[17px] text-ink leading-snug">{title}</span>
          {badge}
        </span>
        {description && <span className="block text-[15px] text-mute leading-snug mt-1">{description}</span>}
      </span>
      {trailing}
      <span
        className={cx(
          'w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors',
          selected ? 'border-brand-orange bg-brand-orange' : 'border-line-2 bg-white',
        )}
        aria-hidden
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
      </span>
    </button>
  );
}
