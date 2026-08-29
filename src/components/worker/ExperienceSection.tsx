'use client';

import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  ShieldAlert,
  Save
} from 'lucide-react';
import { WorkExperience } from '../../types';
import {
  addExperience,
  deleteExperience,
  getMyExperiences,
  updateExperience
} from '../../services/providers';
import EmptyState from '../ui/EmptyState';

interface FormState {
  jobTitle: string;
  organization: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  skillsText: string;
}

const emptyForm: FormState = {
  jobTitle: '',
  organization: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
  skillsText: ''
};

function toSkillArray(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function ExperienceSection() {
  const [items, setItems] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await getMyExperiences();
      setItems(list);
    } catch (e: any) {
      setError(e.message || 'Unable to load experience.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setFeedback('');
    setShowForm(true);
  };

  const openEditForm = (exp: WorkExperience) => {
    setEditingId(exp.id);
    setForm({
      jobTitle: exp.jobTitle,
      organization: exp.organization,
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      currentlyWorking: exp.currentlyWorking,
      description: exp.description || '',
      skillsText: (exp.skills || []).join(', ')
    });
    setError('');
    setFeedback('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFeedback('');
    try {
      if (!form.jobTitle.trim() || !form.organization.trim() || !form.startDate.trim()) {
        setError('Job title, organization and start date are required.');
        setSubmitting(false);
        return;
      }
      if (!form.currentlyWorking && !form.endDate.trim()) {
        setError('End date is required unless you are currently working here.');
        setSubmitting(false);
        return;
      }
      const payload = {
        jobTitle: form.jobTitle.trim(),
        organization: form.organization.trim(),
        startDate: form.startDate.trim(),
        endDate: form.currentlyWorking ? '' : form.endDate.trim(),
        currentlyWorking: form.currentlyWorking,
        description: form.description.trim(),
        skills: toSkillArray(form.skillsText)
      };

      if (editingId) {
        await updateExperience(editingId, payload);
        setFeedback('Experience updated.');
      } else {
        await addExperience(payload);
        setFeedback('Experience added to your profile.');
      }
      await load();
      closeForm();
    } catch (e: any) {
      setError(e.message || 'Could not save experience.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this experience entry? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteExperience(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setFeedback('Experience removed.');
    } catch (e: any) {
      setError(e.message || 'Could not delete experience.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
            <Briefcase size={16} className="text-brand-600" />
            Professional Experience
          </h2>
          <p className="text-xs text-ink-muted">
            Highlight your previous roles so employers can see your hands-on background.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs btn-press"
        >
          <Plus size={14} /> Add Experience
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          {feedback}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
          <ShieldAlert size={14} className="text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">
              {editingId ? 'Edit Experience' : 'Add Experience'}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1 text-ink-muted hover:text-ink"
              aria-label="Close form"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Job / Role Title *</label>
                <input
                  type="text"
                  required
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="e.g. Electrician"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Organization / Company *</label>
                <input
                  type="text"
                  required
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="e.g. ABC Electrical Services"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Start Date *</label>
                <input
                  type="text"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  placeholder="2022 or Apr 2022"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">End Date *</label>
                <input
                  type="text"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  placeholder="2025 or Present"
                  disabled={form.currentlyWorking}
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink disabled:opacity-60"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.currentlyWorking}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currentlyWorking: e.target.checked,
                        endDate: e.target.checked ? '' : form.endDate
                      })
                    }
                    className="accent-brand-600"
                  />
                  I am currently working here
                </label>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-ink">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What you did, key responsibilities, scope of work..."
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 p-3 text-xs leading-relaxed font-medium text-ink"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-ink">Relevant Skills (comma-separated)</label>
                <input
                  type="text"
                  value={form.skillsText}
                  onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
                  placeholder="Wiring, Maintenance, Safety inspection"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-surface-border bg-white text-ink px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-2xs btn-press disabled:opacity-50"
              >
                <Save size={14} /> {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Experience
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-surface-border rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 text-xs text-ink-subtle animate-pulse">Loading experience...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No experience added yet"
            description="Add your professional history to stand out to employers."
            actionLabel="Add Experience"
            onAction={openAddForm}
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {items.map((exp) => (
              <div key={exp.id} className="p-4 sm:p-5 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-ink">{exp.jobTitle}</h4>
                    <p className="text-xs text-ink-muted">{exp.organization}</p>
                    <p className="text-[11px] text-ink-subtle">
                      <strong className="text-ink">{exp.startDate}</strong>
                      {' – '}
                      {exp.currentlyWorking ? (
                        <strong className="text-emerald-700">Present</strong>
                      ) : (
                        <strong className="text-ink">{exp.endDate || 'Present'}</strong>
                      )}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-ink-muted leading-relaxed pt-1 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {exp.skills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex bg-stone-100 text-ink-muted border border-surface-border rounded-lg px-2 py-0.5 text-[10px] font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditForm(exp)}
                      className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-white hover:bg-stone-50 text-ink px-3 py-1.5 text-[11px] font-bold transition-colors"
                      aria-label={`Edit ${exp.jobTitle}`}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 px-3 py-1.5 text-[11px] font-bold transition-colors"
                      aria-label={`Delete ${exp.jobTitle}`}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}