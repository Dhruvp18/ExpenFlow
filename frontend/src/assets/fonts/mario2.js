import React from 'react';
const BombasticText2 = ({ text, className = '' }) => {
    const wrapLettersInSpans = (text) => {
      return text.split('').map((letter, index) => (
        <span key={index} className={letter === ' ' ? 'ml-2' : ''}>
          {letter}
        </span>
      ));
    };
  return (
    <div 
      className={`relative text-4xl leading-normal  ${className}`}
      style={{
        color: 'white',
        textShadow: `
          -2px -2px 0 rgba(88, 28, 135, 1),
           2px -2px 0 rgba(51, 65, 85, 1),
          -2px 2px 0 rgba(88, 28, 135, 1),
           2px 2px 0 rgba(51, 65, 85, 1)
         `,
        fontFamily: 'mario2'
      }}
    >
      {wrapLettersInSpans(text)}
    </div>
  );
};

export default BombasticText2;
