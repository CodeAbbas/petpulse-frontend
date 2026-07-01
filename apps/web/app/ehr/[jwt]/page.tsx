import React from "react";

interface EhrRecord {
  id: string;
  record_type: string;
  summary: string;
  notes?: string;
  heart_rate_bpm?: number;
  temperature_c?: number;
  computed_bmi?: number;
  computed_bmr?: number;
  created_at: string;
}

interface BackendEhrPayload {
  pet: {
    name: string;
    species: string;
    breed: string;
    sex: string;
    age_years: number;
    microchip_number: string;
    metrics: {
      current_weight_kg: number;
      current_bmi: number;
      current_bmr_kcal: number;
    };
  };
  health_records: EhrRecord[];
  share: {
    issued_at: string;
    expires_at: string;
    is_first_access: boolean;
  };
}

interface PageProps {
  params: Promise<{ jwt: string }>;
}

export default async function PublicEhrSharePage({ params }: PageProps) {
  const { jwt } = await params;
  
  // Explicitly force IPv4 127.0.0.1 to avoid Node's IPv6 localhost resolution mismatch
  const BACKEND_URL = "http://127.0.0.1:8000";

  let rawPayload: BackendEhrPayload | null = null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/ehr/${jwt}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const json = await response.json();
      rawPayload = json.data;
    }
  } catch (error) {
    console.error("Next.js Server Network Fetch Error:", error);
  }

  // ── ERROR STATE: Branded Fallback ──
  if (!rawPayload) {
    return (
      <div className="min-h-screen bg-[#04060e] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-purple-500/30">
        <div className="w-full max-w-md bg-[#0a0f24] border border-red-500/30 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Health Record Link Unavailable</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            This secure reference link has expired, been manually revoked by the attending veterinarian, or cannot connect to the primary database node.
          </p>
          <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
            Security Identifier Trace: FR-06 Pipeline Protection
          </div>
        </div>
      </div>
    );
  }

  const { pet, health_records: records, share } = rawPayload;
  const metrics = pet.metrics;
  
  const expiresDate = new Date(share.expires_at);
  const hoursRemaining = Math.max(0, (expiresDate.getTime() - Date.now()) / (1000 * 60 * 60));
  const isExpiringSoon = hoursRemaining <= 24;

  return (
    <div className="min-h-screen bg-[#04060e] text-slate-100 flex flex-col selection:bg-purple-500/30 font-sans">
      
      {isExpiringSoon && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs font-semibold text-amber-400 backdrop-blur-sm sticky top-0 z-50">
          ⚠️ Secure clinical exchange link active. Window automatically self-destructs in {Math.ceil(hoursRemaining)} hours.
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">PETPULSE</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-extrabold border border-purple-500/20 tracking-wider">EHR ACCESS PORTAL</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Attending Clinic Node</p>
            <p className="text-xs font-bold text-slate-300">Verified System Distributed Access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Profile Area */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-[#0a0f24] border border-slate-800/60 rounded-2xl p-6 shadow-xl text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r from-purple-500 to-indigo-500">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 text-slate-100 font-black text-3xl rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-800/50 shadow-md">
                {pet.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-100">{pet.name}</h2>
              <p className="text-xs text-purple-400 font-semibold tracking-wide uppercase mt-0.5">{pet.breed}</p>
              
              <div className="border-t border-slate-800/80 mt-5 pt-4 text-left space-y-3.5 text-xs md:text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400">Species</span><span className="text-slate-200 font-medium capitalize">{pet.species}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Biological Sex</span><span className="text-slate-200 font-medium capitalize">{pet.sex}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Current Age</span><span className="text-slate-200 font-medium">{pet.age_years} Years</span></div>
                <div className="flex justify-between items-center pt-1"><span className="text-slate-400">Microchip Ident</span><span className="text-[11px] font-mono bg-slate-900/80 px-2.5 py-1 rounded-md text-slate-300 border border-slate-800 tracking-wider font-semibold">{pet.microchip_number}</span></div>
              </div>
            </div>

            {/* Core Metric Blocks with UI Polish */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:grid-cols-1">
              <div className="bg-[#0a0f24] border-l-4 border-l-emerald-500 border border-slate-800/50 rounded-xl p-4 shadow-md transition-all hover:translate-x-0.5">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Current Weight</p>
                <p className="text-2xl font-black tracking-tight text-slate-100">{metrics.current_weight_kg}<span className="text-xs font-medium text-slate-400 ml-1">kg</span></p>
              </div>
              <div className="bg-[#0a0f24] border-l-4 border-l-purple-500 border border-slate-800/50 rounded-xl p-4 shadow-md transition-all hover:translate-x-0.5">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Calculated BMI</p>
                <p className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{metrics.current_bmi}</p>
              </div>
              <div className="bg-[#0a0f24] border-l-4 border-l-indigo-500 border border-slate-800/50 rounded-xl p-4 shadow-md transition-all hover:translate-x-0.5">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Basal Metabolic Rate</p>
                <p className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">{metrics.current_bmr_kcal}<span className="text-xs font-medium text-slate-400 ml-1">kcal</span></p>
              </div>
            </div>
          </div>

          {/* Records Timeline Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span>Clinical Health History</span>
              </h3>
              <span className="text-xs font-mono bg-slate-900 px-2.5 py-1 rounded-full text-slate-400 border border-slate-800">
                {records.length} {records.length === 1 ? 'Record Entry' : 'Record Entries'}
              </span>
            </div>

            {records.length === 0 ? (
              /* Polished Placeholder Box for Empty Timeline States */
              <div className="bg-[#0a0f24]/50 border-2 border-dashed border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[320px]">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 border border-slate-800">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="max-w-sm space-y-1.5">
                  <h4 className="font-bold text-slate-200 text-sm">No Active Treatment Entries</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No historical operations, diagnostic charts, or prescription timelines have been published to this distributed telemetry share token.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="bg-[#0a0f24] border border-slate-800/70 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                          record.record_type === 'checkup' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          record.record_type === 'surgery' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {record.record_type}
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm md:text-base tracking-tight">{record.summary}</h4>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(record.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {record.notes && (
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/40 mb-4">
                        {record.notes}
                      </p>
                    )}

                    {/* Timeline Data Aggregation Blocks */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1.5 border-t border-slate-800/40 text-xs font-mono">
                      {record.heart_rate_bpm && (
                        <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                          <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Heart Rate</span>
                          <span className="text-slate-200 font-semibold">{record.heart_rate_bpm} <span className="text-slate-500 text-[10px] font-sans font-normal">BPM</span></span>
                        </div>
                      )}
                      {record.temperature_c && (
                        <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                          <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Temperature</span>
                          <span className="text-slate-200 font-semibold">{record.temperature_c} <span className="text-slate-500 text-[10px] font-sans font-normal">°C</span></span>
                        </div>
                      )}
                      {record.computed_bmi && (
                        <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                          <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Hist. BMI</span>
                          <span className="text-purple-400 font-bold">{record.computed_bmi}</span>
                        </div>
                      )}
                      {record.computed_bmr && (
                        <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                          <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Hist. BMR</span>
                          <span className="text-indigo-400 font-bold">{record.computed_bmr} <span className="text-slate-500 text-[10px] font-sans font-normal">kcal</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Audit Advisory Footer Context */}
      <footer className="w-full border-t border-slate-900 bg-[#02040a] mt-auto py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs text-amber-500/80 font-bold tracking-wider uppercase flex items-center justify-center space-x-1.5">
            <span>🛡️</span> <span>Confidentiality and Access Audit Advisory Notice</span>
          </p>
          <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
            Access to this electronic health record interface is tracked and permanently audit-logged. Your origin IP address, device telemetry signature, and request timestamp have been appended to the clinical audit chain. Do not forward or distribute this custom encrypted URL pathway if the underlying private client telemetry data is unintended for public consumption.
          </p>
        </div>
      </footer>
    </div>
  );
}