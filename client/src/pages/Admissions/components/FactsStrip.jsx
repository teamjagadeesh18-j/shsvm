import React from 'react';
import Reveal from '../../../components/common/Reveal/Reveal';

const PROVABLE_FACTS = [
  'Established 1999',
  'Co-educational Matriculation School',
  'State Board'
];

export default function FactsStrip() {
  return (
    <section className="admissions-facts-strip">
      <div className="container">
        <Reveal>
          <div className="facts-pills-row">
            {PROVABLE_FACTS.map((fact, idx) => (
              <div key={idx} className="facts-pill-item">
                <span className="facts-dot" aria-hidden="true" />
                <span className="facts-text">{fact}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

