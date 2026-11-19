import React, { useState, useEffect } from 'react';
import { 
  Scale, X, CheckCircle, Brain, UserCheck, TrendingUp, 
  Save, AlertCircle, Sparkles, Check
} from 'lucide-react';

export default function EvaluatorRubricModal({ sessionId, onClose }) {
  const [rubric, setRubric] = useState({
    integrity: 92,
    technical: 88,
    communication: 90,
    versatility: 85,
    recommendation: 'Hire',
    feedback: 'Candidate displayed deep architectural knowledge of distributed WebSockets and maintained consistent gaze stability throughout the evaluation.'
  });

  const [aiScores, setAiScores] = useState({
    integrity: 94.2,
    technical: 88.5,
    communication: 91.0,
    versatility: 86.4,
    overall_hireability: 89.8
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}/rubric`);
        if (res.ok) {
          const data = await res.json();
          if (data.human_scores) setRubric(data.human_scores);
          if (data.ai_ensemble_scores) setAiScores(data.ai_ensemble_scores);
        }
      } catch (e) {
        console.warn('Could not fetch session rubric:', e);
      }
    };
    if (sessionId) fetchRubric();
  }, [sessionId]);

  const handleSaveRubric = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}/rubric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rubric)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Error saving rubric:', e);
    } finally {
      setSaving(false);
    }
  };

  const computeDelta = (human, ai) => {
    const diff = (human - ai).toFixed(1);
    return diff > 0 ? `+${diff}%` : `${diff}%`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-2xl p-6 relative border border-white/[0.14] shadow-2xl bg-[#0c111f]/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Scale className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Ajna Evaluator Rubric & 32-Head Ensemble Sync
              </h2>
              <p className="text-[11px] text-slate-400">
                Calibrate human judgment against the MSCMLP multimodal ensemble prediction.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Competency Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* 1. Integrity */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">1. Integrity & Proctoring</span>
              <span className="text-[10px] font-mono font-bold text-orange-300 bg-orange-500/15 px-2 py-0.5 rounded">
                Δ {computeDelta(rubric.integrity, aiScores.integrity)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>AI Ensemble: <strong className="text-slate-300">{aiScores.integrity}%</strong></span>
              <span>Evaluator: <strong className="text-orange-400">{rubric.integrity}%</strong></span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rubric.integrity}
              onChange={(e) => setRubric({ ...rubric, integrity: parseFloat(e.target.value) })}
              className="glass-slider"
            />
          </div>

          {/* 2. Technical Depth */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">2. Technical Architecture</span>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                Δ {computeDelta(rubric.technical, aiScores.technical)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>AI Ensemble: <strong className="text-slate-300">{aiScores.technical}%</strong></span>
              <span>Evaluator: <strong className="text-emerald-400">{rubric.technical}%</strong></span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rubric.technical}
              onChange={(e) => setRubric({ ...rubric, technical: parseFloat(e.target.value) })}
              className="glass-slider"
            />
          </div>

          {/* 3. Communication Pacing */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">3. Verbal Cadence & Clarity</span>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded">
                Δ {computeDelta(rubric.communication, aiScores.communication)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>AI Ensemble: <strong className="text-slate-300">{aiScores.communication}%</strong></span>
              <span>Evaluator: <strong className="text-amber-400">{rubric.communication}%</strong></span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rubric.communication}
              onChange={(e) => setRubric({ ...rubric, communication: parseFloat(e.target.value) })}
              className="glass-slider"
            />
          </div>

          {/* 4. Social Versatility */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">4. Composure & Versatility</span>
              <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded">
                Δ {computeDelta(rubric.versatility, aiScores.versatility)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>AI Ensemble: <strong className="text-slate-300">{aiScores.versatility}%</strong></span>
              <span>Evaluator: <strong className="text-purple-400">{rubric.versatility}%</strong></span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rubric.versatility}
              onChange={(e) => setRubric({ ...rubric, versatility: parseFloat(e.target.value) })}
              className="glass-slider"
            />
          </div>
        </div>

        {/* Overall Recommendation Grid */}
        <div className="space-y-2 mb-4">
          <span className="text-xs font-semibold text-slate-300">Overall Hiring Recommendation</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Strong Hire', label: 'Strong Hire', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
              { id: 'Hire', label: 'Hire', color: 'bg-teal-500/20 text-teal-300 border-teal-500/50' },
              { id: 'Neutral', label: 'Neutral', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
              { id: 'Decline', label: 'Decline', color: 'bg-rose-500/20 text-rose-300 border-rose-500/50' }
            ].map((rec) => {
              const isSelected = rubric.recommendation === rec.id;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setRubric({ ...rubric, recommendation: rec.id })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? `${rec.color} shadow-lg scale-[1.02]`
                      : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  {rec.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Evaluator Assessment Notes */}
        <div className="space-y-1.5 mb-5">
          <span className="text-xs font-semibold text-slate-300">Forensic Assessment Notes</span>
          <textarea
            value={rubric.feedback}
            onChange={(e) => setRubric({ ...rubric, feedback: e.target.value })}
            className="w-full h-16 glass-inset p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-orange-500/50 resize-none"
            placeholder="Record your observations for the final audit report..."
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <div className="text-[11px] text-slate-400 font-mono">
            {saveSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Rubric synced to MongoDB session record
              </span>
            ) : (
              <span>Synced with Motor MongoDB persistence</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="glass-pill text-xs px-3.5 py-1.5 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSaveRubric}
              disabled={saving}
              className="btn-glass-primary text-xs px-5 py-2 shadow-md shadow-orange-600/30 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Syncing...' : 'Save & Sync Rubric'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
