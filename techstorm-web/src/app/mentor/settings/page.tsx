export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile information and account security.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-brand-dark">Profile Information</h3>
        </div>
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-400 border border-slate-200">
                    <i className="fas fa-user"></i>
                </div>
                <button className="bg-white border border-slate-200 text-brand-dark px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                    Change Photo
                </button>
            </div>

            <div className="text-center py-10">
                <p className="text-slate-500 italic text-sm">Full settings functionality coming soon.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
