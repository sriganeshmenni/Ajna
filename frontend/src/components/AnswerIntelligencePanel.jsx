import React, { useState } from 'react';

const AnswerIntelligencePanel = () => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const questions = [
    {
      id: 'q1',
      question: 'Explain Dependency Injection in .NET Core and contrast it with Service Locator.',
      difficulty: '8/10',
      expected_concepts: ['Constructor Injection', 'Service Lifetimes (Transient, Scoped, Singleton)', 'Loose Coupling', 'Inversion of Control (IoC)', 'Service Locator Antipattern'],
      mentioned_concepts: ['Constructor Injection', 'Loose Coupling', 'Inversion of Control (IoC)'],
      missing_concepts: ['Service Lifetimes (Transient, Scoped, Singleton)', 'Service Locator Antipattern'],
      scores: { relevance: 0.92, correctness: 0.88, completeness: 0.79, coherence: 0.90 }
    },
    {
      id: 'q2',
      question: 'What is the difference between IEnumerable, ICollection, and IList in C#?',
      difficulty: '7/10',
      expected_concepts: ['Deferred Execution', 'Collection Count/Add/Remove', 'Index Access [i]', 'Memory Allocation'],
      mentioned_concepts: ['Deferred Execution', 'Index Access [i]'],
      missing_concepts: ['Collection Count/Add/Remove', 'Memory Allocation'],
      scores: { relevance: 0.89, correctness: 0.84, completeness: 0.72, coherence: 0.86 }
    }
  ];

  const q = questions[currentQuestionIdx];

  return (
    <div className="panel-card water-bubble-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--cyan-glow)' }}></span>
          <span className="hud-title" style={{ fontSize: '0.7rem', color: 'var(--text-primary)' }}>
            ANSWER INTELLIGENCE & EVALUATION
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--cyan-glow)', background: 'rgba(0, 243, 255, 0.1)', padding: '0.1rem 0.4rem', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
            DIFF: {q.difficulty}
          </span>
          <button
            onClick={() => setCurrentQuestionIdx((currentQuestionIdx + 1) % questions.length)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              background: '#090d16',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '0.2rem 0.5rem',
              cursor: 'pointer'
            }}
          >
            NEXT PROMPT →
          </button>
        </div>
      </div>

      {/* Active Question Box */}
      <div style={{
        background: 'rgba(0, 243, 255, 0.04)',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        padding: '0.6rem 0.75rem',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--cyan-glow)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
          ACTIVE PROMPT #{currentQuestionIdx + 1}
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#e0e6ed', lineHeight: 1.35 }}>
          "{q.question}"
        </div>
      </div>

      {/* Structured Answer Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
        <div style={{ background: '#090d16', border: '1px solid var(--border-subtle)', padding: '0.4rem', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>RELEVANCE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--cyan-glow)', fontWeight: 700 }}>
            {Math.round(q.scores.relevance * 100)}%
          </div>
        </div>
        <div style={{ background: '#090d16', border: '1px solid var(--border-subtle)', padding: '0.4rem', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>CORRECTNESS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--emerald-glow)', fontWeight: 700 }}>
            {Math.round(q.scores.correctness * 100)}%
          </div>
        </div>
        <div style={{ background: '#090d16', border: '1px solid var(--border-subtle)', padding: '0.4rem', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>COVERAGE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--amber-glow)', fontWeight: 700 }}>
            {Math.round(q.scores.completeness * 100)}%
          </div>
        </div>
        <div style={{ background: '#090d16', border: '1px solid var(--border-subtle)', padding: '0.4rem', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>COHERENCE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {Math.round(q.scores.coherence * 100)}%
          </div>
        </div>
      </div>

      {/* Concept Breakdown Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          TECHNICAL CONCEPT EMBEDDING MATCH (BGE-LARGE)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '140px', overflowY: 'auto' }}>
          {q.expected_concepts.map((concept, i) => {
            const isMentioned = q.mentioned_concepts.includes(concept);
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.3rem 0.5rem',
                  background: isMentioned ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                  borderLeft: isMentioned ? '2px solid var(--emerald-glow)' : '2px solid var(--rose-glow)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <span style={{ color: isMentioned ? 'var(--emerald-glow)' : 'var(--rose-glow)' }}>{isMentioned ? '✓' : '✗'}</span>
                  <span>{concept}</span>
                </div>
                <span style={{
                  fontSize: '0.58rem',
                  color: isMentioned ? 'var(--emerald-glow)' : 'var(--rose-glow)',
                  background: isMentioned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  padding: '0.05rem 0.35rem',
                  border: isMentioned ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
                }}>
                  {isMentioned ? 'DETECTED' : 'GAP'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnswerIntelligencePanel;

