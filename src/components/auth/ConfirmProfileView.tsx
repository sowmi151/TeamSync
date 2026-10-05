import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  name: string;
  email: string;
  onComplete: (name: string) => void;
  onLogout: () => Promise<void>;
}

export const ConfirmProfileView: React.FC<Props> = ({ name, email, onComplete, onLogout }) => {
  const [displayName, setDisplayName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) { setError("Please enter your name."); return; }
    setSaving(true);
    setError(null);
    try {
      const { error: saveError } = await supabase.auth.updateUser({ data: {
        full_name: trimmed, teamsync_profile_confirmed: true,
      } });
      if (saveError) throw saveError;
      onComplete(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save. Please try again.");
    } finally { setSaving(false); }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 text-white">
    <section className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b1021]/95 p-8 shadow-xl">
      <h1 className="text-2xl font-bold mb-2">Welcome to TeamSync</h1>
      <p className="text-slate-300 mb-6">You have signed in with Google. Confirm your details to continue.</p>
      <form onSubmit={confirm} className="space-y-5">
        <div>
          <label htmlFor="confirm-name" className="block mb-2">Your name</label>
          <input id="confirm-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            required maxLength={255} disabled={saving}
            className="w-full rounded-xl border border-white/20 bg-[#050819] p-3" />
        </div>
        <div>
          <label htmlFor="confirm-email" className="block mb-2">Google email</label>
          <input id="confirm-email" value={email} readOnly
            className="w-full rounded-xl border border-white/20 bg-[#050819] p-3 text-slate-300" />
          <p className="text-sm text-slate-400 mt-2">To use another email, sign out and choose another Google account.</p>
        </div>
        {error && <p role="alert" className="text-red-400">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full rounded-xl bg-sky-600 p-3 font-semibold disabled:opacity-60">
          {saving ? "Saving..." : "Confirm and continue"}
        </button>
        <button type="button" disabled={saving} className="w-full text-slate-300"
          onClick={async () => {
            setSaving(true);
            try { await onLogout(); }
            catch { setError("Unable to sign out. Please try again."); }
            finally { setSaving(false); }
          }}>Sign out</button>
      </form>
    </section>
  </div>;
};
