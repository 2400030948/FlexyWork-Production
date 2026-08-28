'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IndianRupee, TrendingUp, Info, HelpCircle, Layers, Calendar, RefreshCw } from 'lucide-react';
import { Transaction, User } from '../../../types';
import EarningsChart from '../../../components/charts/EarningsChart';
import { getMe } from '../../../services/auth';
import { getPayments } from '../../../services/payments';

export default function WorkerEarningsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEarningsData = async () => {
    setLoading(true);
    const user = await getMe();
    setCurrentUser(user);

    if (!user) {
      router.push('/login');
      return;
    }

    setTransactions(await getPayments());
    setLoading(false);
  };

  useEffect(() => {
    fetchEarningsData();
    const interval = setInterval(fetchEarningsData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const grossEarnings = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const platformFees = Math.round(grossEarnings * 0.1);
  const netEarnings = grossEarnings - platformFees;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Your Earnings Ledger</h1>
          <p className="text-xs text-ink-muted mt-0.5">Audit transaction logs, cooperative pools, and weekly pay charts.</p>
        </div>
        <button
          onClick={fetchEarningsData}
          className="p-2 text-ink-muted hover:text-ink bg-white border border-surface-border rounded-xl transition-all shadow-sm"
          title="Refresh Ledger"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Main Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Gross */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Gross Earnings</p>
          <p className="text-2xl font-black text-ink flex items-center gap-0.5">
            <IndianRupee size={18} className="text-ink-subtle" />
            {grossEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-brand-600 font-bold">This calendar month</p>
        </div>

        {/* Platform Fees */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Platform & Insurance Fee</p>
          <p className="text-2xl font-black text-rose-600 flex items-center gap-0.5">
            <IndianRupee size={18} className="text-rose-400" />
            -{platformFees.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-rose-500 font-semibold">10% Platform escrow slice</p>
        </div>

        {/* Net payout */}
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xxs font-extrabold text-ink-muted uppercase tracking-wider">Net Payout</p>
          <p className="text-2xl font-black text-emerald-600 flex items-center gap-0.5">
            <IndianRupee size={18} className="text-emerald-450" />
            {netEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">Transferred to bank wallet</p>
        </div>

      </div>

      {/* Cooperative Pool contribution HUD */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden shadow">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#6366f1,transparent_50%)]" />
        <div className="relative z-10 space-y-1">
          <span className="text-[9px] font-extrabold text-brand-400 uppercase tracking-widest flex items-center gap-1">
            <Layers size={11} /> Collective Co-op Pool
          </span>
          <h3 className="font-extrabold text-base">Your Community Holdings Contribution</h3>
          <p className="text-xxs text-brand-200 font-medium">
            You contributed ₹3,400 to the Suryaraopeta Home Services Collective pooled equipment fund this month.
          </p>
        </div>
        <div className="relative z-10 shrink-0 text-left sm:text-right border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 w-full sm:w-auto">
          <p className="text-xl font-black text-white">₹3,400</p>
          <p className="text-[9px] text-brand-300 font-bold">12% Coop equity yield share</p>
        </div>
      </div>

      {/* Chart analytics section */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Weekly Earnings Performance</h3>
        <EarningsChart />
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-ink border-b border-surface-border pb-2">Ledger Transactions</h3>
        
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-10 bg-stone-50 rounded-xl" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-ink-muted italic">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border text-ink-subtle font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-ink-muted font-medium">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 pr-4 text-ink font-bold max-w-[200px] truncate">{tx.description}</td>
                    <td className="py-3.5 px-4 font-semibold text-ink-subtle">{tx.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'earnings' 
                          ? 'bg-brand-50 text-brand-700' 
                          : tx.type === 'coop_payout'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`py-3.5 pl-4 text-right font-black ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
