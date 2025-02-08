import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export const GameCard = ({ title, description, year, Icon, color }) => {
  return (
    <div className={`game-cartridge flex-shrink-0 w-full md:w-85  bg-gradient-to-b from-purple-300 to-purple-200 p-6 rounded-lg transform transition-all duration-150 hover:scale-105 hover:shadow-xl mx-4`}>
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Icon className="w-6 h-6 text-purple-700" />
          </div>
          <h3 className="text-xl font-bold text-purple-800">{title}</h3>
        </div>
        <p className="text-purple-800 mb-4 leading-relaxed text-sm">{description}</p>
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          {/* <span className="text-purple-700 font-bold">{year}</span> */}
          <button className="px-4 py-2 bg-purple-50 rounded-full text-purple-700 hover:bg-gray-200 transition-colors text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameCardCarousel = ({ cards }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: true
  }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative max-w-full overflow-hidden py-8">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {cards.map((card, index) => (
            <div key={index} className="embla__slide">
              <GameCard {...card} />
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"
        onClick={scrollPrev}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"
        onClick={scrollNext}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <style jsx>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
          gap: 1rem;
          cursor: grab;
        }
        .embla__slide {
          flex: 0 0 auto;
          min-width: 0;
        }
        .embla__container {
          backface-visibility: hidden;
          margin-left: -1rem;
        }
      `}</style>
    </div>
  );
};