import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const WelcomeMessage = () => {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, { opacity: 0, duration: 0.5, delay: 0.5 });
  }, []);

  return (
    <p
      ref={ref}
      className='text-xl md:text-2xl text-white max-w-2xl mx-auto'
    >
      Hello there! I'm <span className='font-semibold text-purple-300'>Horizons</span>, your AI coding companion.
      I'm here to help you build amazing web application!
    </p>
  );
};

export default WelcomeMessage;
