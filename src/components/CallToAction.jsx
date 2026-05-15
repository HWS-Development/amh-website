import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const CallToAction = () => {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, { opacity: 0, duration: 0.5, delay: 0.8 });
  }, []);

  return (
    <p
      ref={ref}
      className='text-md text-white max-w-lg mx-auto'
    >
      Let's turn your ideas into reality.
    </p>
  );
};

export default CallToAction;
