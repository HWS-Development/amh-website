import React from 'react';

const DestinationGallery = ({ gallery, destinationName, sectionRef }) => {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section id="gallery" ref={sectionRef} className="section-padding">
      <div className="content-wrapper">
        <h2 className="h2-style text-center mb-12">Photo Gallery</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {gallery.map((url, index) => (
            <img 
              key={index} 
              src={url} 
              alt={`${destinationName} gallery image ${index + 1}`} 
              className="w-full h-auto object-cover break-inside-avoid" 
              loading="lazy" 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationGallery;