import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const btnRef = useRef(null);
  const isAnimating = useRef(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 600) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!btnRef.current) return;
    if (isAnimating.current) return;

    if (isVisible) {
      btnRef.current.style.display = 'block';
      isAnimating.current = true;
      gsap.fromTo(btnRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.2, onComplete: () => { isAnimating.current = false; } }
      );
    } else {
      isAnimating.current = true;
      gsap.to(btnRef.current, {
        opacity: 0, y: 20, duration: 0.2,
        onComplete: () => {
          if (btnRef.current) btnRef.current.style.display = 'none';
          isAnimating.current = false;
        }
      });
    }
  }, [isVisible]);

  return (
    <div ref={btnRef} className="fixed bottom-6 right-6 z-50" style={{ display: 'none' }}>
      <Button
        onClick={scrollToTop}
        className="btn-action h-12 w-12 p-0 shadow-lg"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default BackToTopButton;
