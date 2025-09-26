import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, CheckCircle, Info, MapPin, Sun, Users, DollarSign, Camera, Star,
  ShieldCheck, Box, Utensils, Coffee, Moon, Mountain, Droplets, Bath, Ticket, Wind, Waves
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RiadCard from '@/components/RiadCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated, getTranslatedArray } from '@/lib/utils';

const iconMapping = {
  "Best Time to Visit": <Sun className="w-5 h-5 text-brand-action" />,
  "Dress Code": <Users className="w-5 h-5 text-brand-action" />,
  "Bargaining": <DollarSign className="w-5 h-5 text-brand-action" />,
  "Authenticity": <ShieldCheck className="w-5 h-5 text-brand-action" />,
  "Shipping": <Box className="w-5 h-5 text-brand-action" />,
  "Photography": <Camera className="w-5 h-5 text-brand-action" />,
  "Street Food": <Utensils className="w-5 h-5 text-brand-action" />,
  "Mint Tea": <Coffee className="w-5 h-5 text-brand-action" />,
  "Ramadan": <Moon className="w-5 h-5 text-brand-action" />,
  "Mountain Weather": <Mountain className="w-5 h-5 text-brand-action" />,
  "Hydration": <Droplets className="w-5 h-5 text-brand-action" />,
  "Hammam Etiquette": <Bath className="w-5 h-5 text-brand-action" />,
  "Event Tickets": <Ticket className="w-5 h-5 text-brand-action" />,
  "Social Scene": <Users className="w-5 h-5 text-brand-action" />,
  "Respectful Photography": <Camera className="w-5 h-5 text-brand-action" />,
  "The Wind": <Wind className="w-5 h-5 text-brand-action" />,
  "Best Surf Season": <Waves className="w-5 h-5 text-brand-action" />,
  "Getting There": <MapPin className="w-5 h-5 text-brand-action" />,
  "default": <Info className="w-5 h-5 text-brand-action" />
};

const ExperiencePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();
  const heroRef = useRef(null);

  const [experience, setExperience] = useState(null);
  const [recommendedRiads, setRecommendedRiads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mgh_experiences')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('Error fetching experience:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find the requested experience.",
        });
        navigate('/404', { replace: true });
        return;
      }
      
      setExperience(data);
      if (data.related_riads && data.related_riads.length > 0) {
        fetchRecommendedRiads(data.related_riads);
      }
      setLoading(false);
    };

    const fetchRecommendedRiads = async (riadIds) => {
      const { data, error } = await supabase
        .from('mgh_properties')
        .select('*')
        .in('id', riadIds);

      if (error) {
        console.error('Error fetching recommended riads:', error);
      } else if (data) {
         const formattedRiads = data.map(riad => ({
          id: riad.id,
          name: getTranslated(riad.name_tr, currentLanguage),
          location: getTranslated(riad.area_tr, currentLanguage) || riad.address,
          city: riad.city,
          imageUrl: riad.image_urls && riad.image_urls.length > 0 ? riad.image_urls[0] : "https://horizons-cdn.hostinger.com/07285d07-0a28-4c91-b6c0-d76721e9ed66/23a331b485873701c4be0dd3941a64c9.png",
          imageDescription: `Image of ${getTranslated(riad.name_tr, currentLanguage)}`,
          amenities: riad.amenities || [],
          reviews: riad.google_reviews_count,
          rating: riad.google_rating ? parseFloat(riad.google_rating) : 4.7,
          bookNowLink: riad.sblink,
          category: 'Recommended'
        }));
        setRecommendedRiads(formattedRiads);
      }
    };

    if (currentLanguage) {
      fetchExperience();
    }
  }, [slug, navigate, toast, currentLanguage]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-action border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!experience) {
    return null;
  }

  const title = getTranslated(experience.title_tr, currentLanguage);
  const subtitle = getTranslated(experience.subtitle_tr, currentLanguage);
  const destination = getTranslated(experience.destination_tr, currentLanguage);
  const description_rich = getTranslated(experience.description_rich_tr, currentLanguage);
  const what_to_do = getTranslatedArray(experience.what_to_do_tr, currentLanguage);
  const good_to_know = getTranslatedArray(experience.good_to_know_tr, currentLanguage);
  const seo_title = getTranslated(experience.seo_title_tr, currentLanguage);
  const seo_description = getTranslated(experience.seo_description_tr, currentLanguage);

  return (
    <>
      <Helmet>
        <title>{seo_title || `${title} · MGH`}</title>
        <meta name="description" content={seo_description || subtitle} />
        <meta property="og:title" content={seo_title || `${title} · MGH`} />
        <meta property="og:description" content={seo_description || subtitle} />
        {experience.hero_image_url && <meta property="og:image" content={experience.hero_image_url} />}
      </Helmet>

      <motion.div
        className="bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <section ref={heroRef} className="relative h-[70vh] min-h-[500px] flex items-end justify-center text-white overflow-hidden">
          <motion.div className="absolute inset-0 z-0" style={{ y: heroParallax }}>
            <img src={experience.hero_image_url} alt={title} className="w-full h-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10"></div>
          <div className="relative z-20 text-center content-wrapper pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">{destination}</Badge>
              <h1 className="h1-style font-bold tracking-tight">{title}</h1>
              <p className="text-lg md:text-xl mt-2 text-white/90 max-w-3xl mx-auto">{subtitle}</p>
            </motion.div>
          </div>
        </section>
        
        <div className="sticky top-[64px] bg-white z-30 shadow-sm">
            <div className="content-wrapper">
                <div className="flex items-center justify-between py-3">
                    <Button asChild variant="ghost" className="text-brand-ink/80 hover:text-brand-ink">
                        <Link to="/#experiences">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('backToExperiences')}
                        </Link>
                    </Button>
                    <div className="hidden md:flex items-center space-x-4">
                        <Button variant="outline" onClick={() => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" })}>{t('planThisExperience')}</Button>
                        <Button asChild className="btn-action">
                            <Link to="/all-riads">{t('seeMemberRiads')}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <div className="section-padding">
          <div className="content-wrapper grid grid-cols-1 lg:grid-cols-3 gap-12">
            <main className="lg:col-span-2">
              <motion.section
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                id="overview" className="mb-12"
              >
                <div className="prose max-w-none text-brand-ink/90 text-lg leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: description_rich?.replace(/##/g, '<h2 class="h6-style text-lg text-brand-ink mb-4 mt-8">').replace(/\n/g, '<br/>') }} />
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
                id="what-to-do" className="mb-12"
              >
                <h2 className="h2-style text-brand-ink mb-6">{t('whatToDo')}</h2>
                <ul className="space-y-4">
                  {what_to_do?.map((item, index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <CheckCircle className="w-6 h-6 text-brand-action mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-brand-ink">{item.title}</h3>
                        <p className="text-brand-ink/80">{item.blurb}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.section>
              
              <motion.section
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}
                id="gallery"
              >
                <h2 className="h2-style text-brand-ink mb-6">{t('photoGallery')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {experience.gallery_urls?.map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-none overflow-hidden">
                      <img src={url} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )) || <p>{t('galleryComingSoon')}!</p>}
                </div>
              </motion.section>
            </main>

            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}
                  className="border border-brand-ink/10 p-6 rounded-none"
                >
                  <h3 className="h3-style text-brand-ink mb-4">{t('goodToKnow')}</h3>
                  <ul className="space-y-4">
                    {good_to_know?.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        {iconMapping[item.title] || iconMapping.default}
                        <div>
                          <h4 className="font-semibold text-brand-ink">{item.title}</h4>
                          <p className="text-sm text-brand-ink/80">{item.tip}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </aside>
          </div>
        </div>

        {recommendedRiads.length > 0 && (
          <section className="section-padding bg-gray-50">
            <div className="content-wrapper">
              <h2 className="h2-style text-brand-ink mb-8 text-center">{t('recommendedRiads')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedRiads.map(riad => (
                  <RiadCard key={riad.id} riad={riad} />
                ))}
              </div>
            </div>
          </section>
        )}
      </motion.div>
    </>
  );
};

export default ExperiencePage;