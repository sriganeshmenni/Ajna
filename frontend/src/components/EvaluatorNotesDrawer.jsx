import React, { useState, useEffect } from 'react';
import { FileText, Send, X, Clock, Tag, Check, MessageSquare } from 'lucide-react';

export default function EvaluatorNotesDrawer({ sessionId, duration, isOpen, onClose }) {
  const [noteText, setNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Technical Depth');
  const [notes, setNotes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const TAGS = ['Technical Depth', 'Architectural Clarity', 'Gaze Shift', 'Cadence Change', 'Integrity Observation'];

  // Fetch session notes on open
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}/notes`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      } catch (e) {
        console.warn('Error fetching notes:', e);
      }
    };
    if (isOpen && sessionId) fetchNotes();
  }, [isOpen, sessionId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmitting(true);
    const newNote = {
      timestamp: duration || 0,
      text: noteText.trim(),
      tags: [selectedTag]
    };

    try {
      const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [...prev, data.note || newNote]);
        setNoteText('');
      }
    } catch (e) {
      console.error('Error posting note:', e);
      setNotes((prev) => [...prev, newNote]);
      setNoteText('');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSec = (s) => {
    const mins = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${mins}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0c1222]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 flex flex-col font-sans text-slate-100">
      {/* Drawer Header */}
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Ajna Dossier Notes
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center px-4">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <span>No observations logged yet. Type a note below to bind with the current session timestamp.</span>
          </div>
        ) : (
          notes.map((n, idx) => (
            <div key={n.id || idx} className="bubble-card p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatSec(n.timestamp)}
                </span>
                {n.tags && n.tags[0] && (
                  <span className="bubble-pill bg-orange-500/15 text-orange-300 border-orange-500/30 text-[9px] py-0.5">
                    {n.tags[0]}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{n.text}</p>
            </div>
          ))
        )}
      </div>

      {/* New Note Form */}
      <form onSubmit={handleAddNote} className="p-4 border-t border-white/10 bg-black/40 space-y-3">
        {/* Quick Tag Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`bubble-pill px-2.5 py-1 text-[10px] whitespace-nowrap cursor-pointer ${
                selectedTag === tag ? 'bubble-pill-active' : 'bg-white/5 text-slate-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Input & Send */}
        <div className="relative">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={`Log observation at ${formatSec(duration)}...`}
            rows={3}
            className="w-full bubble-glass-inset p-3 pr-10 text-xs text-slate-200 font-sans focus:outline-none focus:border-orange-500/50 resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !noteText.trim()}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-orange-600/30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
