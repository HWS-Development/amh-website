import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslated } from '@/lib/utils';

const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage } = useLanguage();

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('title_tr, slug, hero_image_url, short_intro_tr')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching experiences:', error);
      } else {
        setExperiences(data.map(exp => ({
          ...exp,
          title: getTranslated(exp.title_tr, currentLanguage),
          short_intro: getTranslated(exp.short_intro_tr, currentLanguage),
        })));
      }
      setLoading(false);
    };

    if (currentLanguage) {
      fetchExperiences();
    }
  }, [currentLanguage]);

  if (loading) {
    return (
        <section className="section-padding bg-white">
            <div className="content-wrapper">
                <div className="text-center mb-12">
                    <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-96 mx-auto animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 h-96 rounded-none animate-pulse"></div>
                    ))}
                </div>
            </div>
        </section>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="content-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="h2-style text-brand-ink mb-4">
            {t('unforgettableExperiences')}
          </h2>
          <p className="body-text max-w-3xl mx-auto">
            {t('unforgettableExperiencesDesc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="h-full overflow-hidden rounded-none border-none group relative text-white">
                <div className="absolute inset-0 z-0">
                  <img
                    src={experience.hero_image_url}
                    alt={experience.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                </div>
                <CardContent className="relative z-10 flex flex-col justify-end h-96 p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white/80 font-display mb-2">{experience.title}</h3>
                    <p className="text-white/90 text-sm mb-4">{experience.short_intro}</p>
                    <Button asChild variant="link" className="p-0 h-auto text-white font-semibold">
                      <Link to={`/experiences/${experience.slug}`} className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                        {t('discoverMore')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experiences;