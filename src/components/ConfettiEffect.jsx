import React from 'react';
import confetti from 'canvas-confetti';

const ConfettiEffect = () => {
  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 }, // Center of the screen
      colors: ['#FFD700', '#1E90FF', '#FF4500'], // Customize colors
    });
  };

  return (
    <button
      onClick={launchConfetti}
      style={{
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Launch Confetti
    </button>
  );
};

export default ConfettiEffect;
