export default function EarningsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Earnings</h1>
        <p className="text-slate-500 mt-1">Track your course sales and manage payouts.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1 font-medium">Total Balance</p>
            <h3 className="text-3xl font-bold text-brand-dark">GH₵0.00</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1 font-medium">Pending Payout</p>
            <h3 className="text-3xl font-bold text-brand-dark">GH₵0.00</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 mb-1 font-medium">Total Sales</p>
            <h3 className="text-3xl font-bold text-brand-dark">0</h3>
        </div>
      </div>

      <div className="bg-white p-20 rounded-xl border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-brand-amber/10 text-brand-amber rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            <i className="fas fa-wallet"></i>
        </div>
        <h3 className="text-xl font-bold text-brand-dark mb-2">No Transactions Yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Once students start enrolling in your paid courses, your earnings and payout history will appear here.</p>
      </div>
    </div>
  );
}
