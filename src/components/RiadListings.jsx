import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import RiadCard from '@/components/RiadCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { getTranslated } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RiadListings = () => {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const ctaRef = useRef(null);

  const [riads, setRiads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiads = async () => {
      setLoading(true);
      const { data, error } = await supabase
  .from('mgh_properties_final')
  .select(`
    id,
    name,
    city,
    neighborhood,
    amenities,
    rating_avg,
    reviews_count,
    property_type
  `)
  .limit(3);

      if (error) {
        console.error('Error fetching riads:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch recommended riads.",
        });
        setRiads([]);
      } else {
        const formattedRiads = data.map(riad => ({
          id: riad.id,
          name: getTranslated(riad.name_tr, currentLanguage, riad.name),
          area: getTranslated(riad.area_tr, currentLanguage, riad.area),
          city: riad.city,
          quartier: riad.quartier,
          imageUrl: riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : (import.meta.env.VITE_FALLBACK_IMAGE || "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png"),
          amenities: riad.amenities || [],
          google_reviews_count: riad.google_reviews_count,
          google_rating: riad.google_rating,
          sblink: riad.sblink,
          property_type: riad.property_type,
        }));
        setRiads(formattedRiads);
      }
      setLoading(false);
    };

    fetchRiads();
  }, [toast, currentLanguage]);

  useEffect(() => {
    if (loading || riads.length === 0) return;

    const ctx = gsap.context(() => {
      if (gridRef.current) {
        gsap.from(gridRef.current.children, {
          opacity: 0, y: 20, duration: 0.5, stagger: 0.1,
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true }
        });
      }
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          opacity: 0, y: 20, duration: 0.6,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 90%', once: true }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, riads]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="content-wrapper">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left">
            <h2 className="h2-style text-brand-ink">
              {t('recommendedRiads')}
            </h2>
            <p className="body-text mt-2">
              {t('recommendedRiadsSubtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-brand-action animate-spin" />
          </div>
        ) : (
          <>
            <div ref={gridRef} className="hidden md:grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {riads.map((riad) => (
                <div key={riad.id}>
                  <RiadCard riad={riad} />
                </div>
              ))}
            </div>

            <div className="md:hidden mb-12">
              <div ref={carouselRef} onScroll={handleScroll} className="carousel-container">
                {riads.map((riad) => (
                  <div key={riad.id} className="carousel-item w-full px-4">
                    <RiadCard riad={riad} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-2 mt-6">
                {riads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (carouselRef.current) {
                        const itemWidth = carouselRef.current.offsetWidth;
                        carouselRef.current.scrollTo({
                          left: itemWidth * index,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className={`w-2 h-2 transition-colors ${
                      currentIndex === index ? 'bg-brand-action' : 'bg-brand-ink/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div ref={ctaRef} className="text-center">
          <Button
            asChild
            size="lg"
            className="btn-action font-semibold px-8 h-12 w-full md:w-auto"
          >
            <Link to="/all-riads">
              <Search className="w-5 h-5 mr-2" />
              {t('searchAllProperties')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RiadListings;
