import React from 'react';

interface StatePanelProps {
  message: string;
  tone?: 'neutral' | 'error' | 'success';
}

const toneClass: Record<NonNullable<StatePanelProps['tone']>, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
};

export default function StatePanel({ message, tone = 'neutral' }: StatePanelProps) {
  return (
    <div className={`rounded-xl border p-6 text-center ${toneClass[tone]}`}>
      <p>{message}</p>
    </div>
  );
}
