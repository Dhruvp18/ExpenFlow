import { useState, useEffect } from 'react';

export const useGameControls = () => {
  const [characterPosition, setCharacterPosition] = useState({ x: 20, y: 32 });
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          setCharacterPosition(prev => ({
            ...prev,
            x: Math.max(0, prev.x - 10)
          }));
          break;
        case 'ArrowRight':
          setCharacterPosition(prev => ({
            ...prev,
            x: Math.min(90, prev.x + 10)
          }));
          break;
        case 'ArrowUp':
        case ' ':
          if (!isJumping) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 500);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isJumping]);

  const handleDPadClick = (direction) => {
    switch(direction) {
      case 'left':
        setCharacterPosition(prev => ({
          ...prev,
          x: Math.max(0, prev.x - 10)
        }));
        break;
      case 'right':
        setCharacterPosition(prev => ({
          ...prev,
          x: Math.min(90, prev.x + 10)
        }));
        break;
      case 'up':
        if (!isJumping) {
          setIsJumping(true);
          setTimeout(() => setIsJumping(false), 500);
        }
        break;
    }
  };

  return {
    characterPosition,
    isJumping,
    handleDPadClick
  };
}