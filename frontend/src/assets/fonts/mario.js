import React from 'react';

const BombasticText = ({ text, className = '' }) => {
  const wrapLettersInSpans = (text) => {
    return text.split('').map((letter, index) => (
      <span key={index} className={letter === ' ' ? 'ml-2' : ''}>
        {letter}
      </span>
    ));
  };

  return (
    <div 
      className={`relative text-4xl leading-normal ${className}`}
      style={{
        '--shadow-color': 'rgba(0, 0, 0, 0.9)',
        textShadow: `
          -2px -2px 0 var(--shadow-color),
           2px -2px 0 var(--shadow-color),
          -2px 2px 0 var(--shadow-color),
           2px 2px 0 var(--shadow-color)
        `,
        fontFamily: 'mario'
      }}
    >
      <style jsx>{`
        @font-face {
            font-family: "mario";
            src: url("./assets/fonts/mario.ttf") format("truetype");
            font-weight: normal;
            font-style: normal;
        }
        
        span:nth-child(5n + 1) { color: #00A8E8; }
        span:nth-child(5n + 2) { color: #FFD700; }
        span:nth-child(5n + 3) { color: #FF4136; }
        span:nth-child(5n + 4) { color: #2ECC40; }
        span:nth-child(5n + 5) { color: #FFB700; }
      `}</style>
      {wrapLettersInSpans(text)}
    </div>
  );
};

export default BombasticText;