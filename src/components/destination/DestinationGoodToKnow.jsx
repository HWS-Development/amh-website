import React from 'react';
import { Check } from 'lucide-react';

const DestinationGoodToKnow = ({ goodToKnow, sectionRef }) => {
  if (!goodToKnow || goodToKnow.length === 0) return null;

  return (
    <section id="good-to-know" ref={sectionRef} className="bg-brand-ink/5 section-padding">
      <div className="content-wrapper text-column">
        <h2 className="h2-style text-center mb-12">Good to Know</h2>
        <ul className="space-y-4">
          {goodToKnow.map((item, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <span className="font-bold">{item.title}:</span> {item.tip}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DestinationGoodToKnow;