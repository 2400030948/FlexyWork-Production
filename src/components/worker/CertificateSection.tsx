'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Save
} from 'lucide-react';
import { Certification, VerificationStatus } from '../../types';
import {
  addCertification,
  deleteCertification,
  getMyCertifications,
  updateCertification
} from '../../services/providers';
import EmptyState from '../ui/EmptyState';

interface FormState {
  title: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  description: string;
  documentUrl: string;
}

const emptyForm: FormState = {
  title: '',
  issuingOrganization: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  description: '',
  documentUrl: ''
};

function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
        <ShieldCheck size={12} /> Verified
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
        <ShieldAlert size={12} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
      <Clock size={12} /> Pending Review
    </span>
  );
}

export default function CertificateSection() {
  const [items, setItems] = useState<Certification[]>([]);
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
      const list = await getMyCertifications();
      setItems(list);
    } catch (e: any) {
      setError(e.message || 'Unable to load certifications.');
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

  const openEditForm = (cert: Certification) => {
    setEditingId(cert.id);
    setForm({
      title: cert.title,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      description: cert.description || '',
      documentUrl: cert.documentUrl || ''
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
      if (!form.title.trim() || !form.issuingOrganization.trim() || !form.issueDate.trim()) {
        setError('Title, issuing organization and issue date are required.');
        setSubmitting(false);
        return;
      }
      if (editingId) {
        await updateCertification(editingId, {
          title: form.title.trim(),
          issuingOrganization: form.issuingOrganization.trim(),
          issueDate: form.issueDate.trim(),
          expiryDate: form.expiryDate.trim(),
          credentialId: form.credentialId.trim(),
          description: form.description.trim(),
          documentUrl: form.documentUrl.trim()
        });
        setFeedback('Certificate updated. Re-submitted for admin review.');
      } else {
        await addCertification({
          title: form.title.trim(),
          issuingOrganization: form.issuingOrganization.trim(),
          issueDate: form.issueDate.trim(),
          expiryDate: form.expiryDate.trim(),
          credentialId: form.credentialId.trim(),
          description: form.description.trim(),
          documentUrl: form.documentUrl.trim()
        });
        setFeedback('Certificate added. Our admins will review it shortly.');
      }
      await load();
      closeForm();
    } catch (e: any) {
      setError(e.message || 'Could not save certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this certificate? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteCertification(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setFeedback('Certificate removed.');
    } catch (e: any) {
      setError(e.message || 'Could not delete certificate.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-1.5">
            <Award size={16} className="text-brand-600" />
            Certifications & Credentials
          </h2>
          <p className="text-xs text-ink-muted">
            Showcase your licences, certifications and training. Verified by FlexyWork admins.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs btn-press"
        >
          <Plus size={14} /> Add Certificate
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

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">
              {editingId ? 'Edit Certificate' : 'Add Certificate'}
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
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-ink">Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. ITI Electrician Certificate"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  value={form.issuingOrganization}
                  onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
                  placeholder="e.g. Government ITI"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Credential ID</label>
                <input
                  type="text"
                  value={form.credentialId}
                  onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                  placeholder="e.g. ITI-2024-XXXX"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Issue Date / Year *</label>
                <input
                  type="text"
                  required
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  placeholder="2024 or Mar 2024"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Expiry Date / Year (optional)</label>
                <input
                  type="text"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  placeholder="2029 or No Expiry"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-ink">Document URL (optional)</label>
                <input
                  type="url"
                  value={form.documentUrl}
                  onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 px-3.5 py-2 text-xs font-medium text-ink"
                />
                <p className="text-[10px] text-ink-subtle">
                  Paste a public link to your certificate PDF or image. The "View Certificate"
                  button will open this safely in a new tab.
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-ink">Description (optional)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief context about what this certification covers"
                  className="w-full rounded-lg border border-surface-border bg-stone-50/40 p-3 text-xs leading-relaxed font-medium text-ink"
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
                <Save size={14} /> {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Certificate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-surface-border rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 text-xs text-ink-subtle animate-pulse">Loading certifications...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Add your professional certificates to build trust with employers."
            actionLabel="Add Certificate"
            onAction={openAddForm}
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {items.map((cert) => (
              <div key={cert.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-ink truncate">{cert.title}</h4>
                      <VerificationBadge status={cert.verificationStatus} />
                    </div>
                    <p className="text-xs text-ink-muted">{cert.issuingOrganization}</p>
                    <p className="text-[11px] text-ink-subtle">
                      Issued: <strong className="text-ink">{cert.issueDate}</strong>
                      {cert.expiryDate ? (
                        <>
                          {' '}· Expires: <strong className="text-ink">{cert.expiryDate}</strong>
                        </>
                      ) : null}
                      {cert.credentialId ? (
                        <>
                          {' '}· Credential ID:{' '}
                          <strong className="text-ink">{cert.credentialId}</strong>
                        </>
                      ) : null}
                    </p>
                    {cert.description && (
                      <p className="text-xs text-ink-muted leading-relaxed pt-1">{cert.description}</p>
                    )}
                    {cert.rejectionReason && cert.verificationStatus === 'rejected' && (
                      <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-2 mt-2">
                        <strong>Admin note:</strong> {cert.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cert.documentUrl && (
                      <a
                        href={cert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-ink border border-surface-border px-3 py-1.5 text-[11px] font-bold transition-colors"
                      >
                        <ExternalLink size={12} /> View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditForm(cert)}
                      className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-white hover:bg-stone-50 text-ink px-3 py-1.5 text-[11px] font-bold transition-colors"
                      aria-label={`Edit ${cert.title}`}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cert.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 px-3 py-1.5 text-[11px] font-bold transition-colors"
                      aria-label={`Delete ${cert.title}`}
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