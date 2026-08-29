'use client';

import React from 'react';
import { Briefcase, Check } from 'lucide-react';
import { WorkExperience } from '../../types';

interface Props {
  experiences?: WorkExperience[];
}

export default function PublicExperience({ experiences = [] }: Props) {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-base text-ink flex items-center gap-1.5 mb-3">
          <Briefcase size={18} className="text-brand-500" />
          Professional Experience
        </h3>
        <p className="text-xs text-ink-subtle italic">
          This professional has not listed previous work experience yet.
        </p>
      </div>
    );
  }

  // Split description into bullet points if it uses newlines or starts with dash/bullet patterns.
  const toBullets = (text: string): string[] => {
    if (!text) return [];
    return text
      .split(/\r?\n|•|·|\u2022/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
          <Briefcase size={18} className="text-brand-500" />
          Professional Experience
        </h3>
        <span className="text-xxs font-extrabold uppercase tracking-wider text-ink-subtle">
          {experiences.length} {experiences.length === 1 ? 'Role' : 'Roles'}
        </span>
      </div>

      <div className="space-y-5">
        {experiences.map((exp) => {
          const bullets = toBullets(exp.description || '');
          return (
            <div key={exp.id} className="relative pl-6 border-l-2 border-brand-200">
              <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-brand-500 border-2 border-white shadow-2xs" />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-bold text-ink">{exp.jobTitle}</h4>
                  <p className="text-[11px] font-extrabold text-brand-700">
                    {exp.startDate}
                    {' – '}
                    {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                  </p>
                </div>
                <p className="text-xs text-ink-muted font-semibold">{exp.organization}</p>

                {bullets.length > 0 ? (
                  <ul className="space-y-1 pt-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-muted leading-relaxed">
                        <span className="h-4 w-4 shrink-0 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5">
                          <Check size={10} />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : exp.description ? (
                  <p className="text-xs text-ink-muted leading-relaxed pt-1">{exp.description}</p>
                ) : null}

                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex bg-brand-50 text-brand-700 border border-brand-100 rounded-lg px-2 py-0.5 text-[10px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}