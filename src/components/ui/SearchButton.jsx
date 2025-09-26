import { useEffect, useState } from "react";
import PropertySearchModal from "./PropertySearchModal";
import { useLanguage } from '@/contexts/LanguageContext';

export default function SearchButton({ riads, locale }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onK = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setOpen(true);
      }
    };
    window.addEventListener("keydown", onK);
    return () => window.removeEventListener("keydown", onK);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="1.5"/></svg>
        <span className="hidden " >{t('search')}</span>
        <kbd className="ml-1 rounded border bg-neutral-50 px-1.5 text-[10px] hidden ">Ctrl</kbd>
        <kbd className="rounded border bg-neutral-50 px-1.5 text-[10px] hidden ">K</kbd>
      </button>

      <PropertySearchModal open={open} onClose={() => setOpen(false)} riads={riads} locale={locale} />
    </>
  );
}
