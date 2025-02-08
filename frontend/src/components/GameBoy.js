import React, { useState, useEffect } from 'react';
import { useGameControls } from '../hooks/useGameControls';

export const GameBoy = () => {
  const { characterPosition, isJumping, handleDPadClick } = useGameControls();

  return (
    <div className="col-span-6 py-10 relative">
      <div className="bg-gray-200 rounded-[2rem] p-8 aspect-square max-w-[500px] mx-auto relative gameboy-body">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-gray-500 font-bold tracking-widest text-sm">
          GAME BOY
        </div>

        <div className="bg-gray-300 rounded-lg p-6 mb-8">
          <div className="relative">
            <div className="absolute -left-4 top-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs text-gray-600">POWER</span>
            </div>

            <div className="bg-[#9ca300] rounded-sm aspect-square relative overflow-hidden p-2">
              <div className="retro-scene w-full h-full relative">
                <div 
                  className={`mario-run ${isJumping ? 'jumping' : ''}`}
                  style={{ left: `${characterPosition.x}%`, bottom: `${characterPosition.y}px` }}
                ></div>
                <div className="ground"></div>
                <div className="clouds-container">
                  <div className="cloud"></div>
                  <div className="cloud"></div>
                  <div className="cloud"></div>
                </div>
                <div className="coins">
                  <div className="coin"></div>
                  <div className="coin"></div>
                  <div className="coin"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="relative">
            <div className="bg-gray-400 w-24 h-24 rounded-full relative shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-800 w-20 h-8 rounded-sm"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-800 w-8 h-20 rounded-sm"></div>
              </div>
              <button 
                onClick={() => handleDPadClick('up')}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 transition-colors"
              ></button>
              <button 
                onClick={() => handleDPadClick('down')}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 transition-colors"
              ></button>
              <button 
                onClick={() => handleDPadClick('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 transition-colors"
              ></button>
              <button 
                onClick={() => handleDPadClick('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 transition-colors"
              ></button>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-4 -rotate-12">
              <button 
                onClick={() => handleDPadClick('up')}
                className="w-12 h-12 bg-gray-700 rounded-full hover:bg-gray-600 active:bg-gray-800 transition-colors flex items-center justify-center shadow-lg"
              >
                <span className="text-gray-400 text-sm font-bold">B</span>
              </button>
              <button 
                onClick={() => handleDPadClick('up')}
                className="w-12 h-12 bg-gray-700 rounded-full hover:bg-gray-600 active:bg-gray-800 transition-colors flex items-center justify-center shadow-lg"
              >
                <span className="text-gray-400 text-sm font-bold">A</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-8">
          <button className="w-12 h-4 bg-gray-700 rounded-pill hover:bg-gray-600 active:bg-gray-800 transition-colors shadow-md"></button>
          <button className="w-12 h-4 bg-gray-700 rounded-pill hover:bg-gray-600 active:bg-gray-800 transition-colors shadow-md"></button>
        </div>
      </div>
    </div>
  );
}