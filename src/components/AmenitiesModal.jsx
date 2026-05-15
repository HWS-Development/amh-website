import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AmenityIcon from '@/components/AmenityIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import gsap from 'gsap';

const AmenitiesModal = ({ open, onOpenChange, amenities = [], riadName = '' }) => {
  const { t } = useLanguage();
  const backdropRef = useRef(null);
  const modalRef = useRef(null);
  const itemsRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      if (backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      }
      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { opacity: 0, scale: 0.98, y: 8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
        );
      }
      if (itemsRef.current) {
        const items = itemsRef.current.querySelectorAll('[data-amenity-item]');
        if (items.length) {
          gsap.from(items, { opacity: 0, y: 6, duration: 0.3, stagger: 0.02, delay: 0.15 });
        }
      }
    }
  }, [open]);

  const amenityEntries = (amenities || []).map((label, index) => ({
    id: `${label}-${index}`,
    label,
  }));

  const groupedAmenities = amenityEntries.reduce((acc, entry) => {
    if (!entry.label) return acc;
    const firstLetter = entry.label.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(entry);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedAmenities).sort();

  if (!open) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        ref={backdropRef}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-40 flex items-center justify-center"
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px) saturate(110%)',
        }}
      />

      {/* CENTERED MODAL */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
        aria-modal="true"
        role="dialog"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto w-full max-w-3xl max-h-[86vh] overflow-hidden"
        >
          {/* Creamy card with navy header */}
          <div className="relative shadow-2xl" style={{
            background: '#fff7ec',
            border: '1px solid rgba(2,22,42,0.06)'
          }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(2,22,42,0.06)' }}>
              <div>
                <h2 className="text-sm text-[#02162a] mt-1 opacity-80">{riadName}</h2>
              </div>

              {/* Close X in top-right */}
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close amenities"
                className="ml-4 p-2 bg-transparent hover:bg-[#f0e6db] transition-colors border border-transparent"
                style={{ color: '#02162a' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div ref={itemsRef} className="p-6 overflow-y-auto max-h-[62vh]">
              {sortedLetters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg text-[#02162a] opacity-70">{t('noAmenities')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedLetters.map((letter) => (
                    <div key={letter}>
                      <h3 className="text-sm font-semibold text-[#02162a] mb-3">{letter}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {groupedAmenities[letter].map((entry, idx) => (
                          <div
                            key={`${entry.id}-${idx}`}
                            data-amenity-item
                            className="flex items-center gap-3 p-3 bg-[#02162a] border border-[#063a65] hover:bg-[#063a65] hover:shadow-lg cursor-pointer transition-colors"
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <AmenityIcon label={entry.label} className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-sm text-white font-medium">{entry.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: 'rgba(2,22,42,0.04)' }}>
              <Button onClick={() => onOpenChange(false)} className="bg-[#02162a] hover:bg-[#063a65] text-white font-semibold px-5 py-2">
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AmenitiesModal;
