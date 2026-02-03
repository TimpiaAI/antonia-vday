import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Stars } from 'lucide-react';

// --- Assets ---
const IMAGES = {
  cute: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eWtkMHBlYjZwdWxoZjJ6a3ltNHB6emNrNTJhcjNkOW5pc2Nidm0zYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/y0Ym94AbxEk6Tgbzwp/giphy.gif", // Updated Initial Cute
  sad: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3l4eTNrYmpiMHVueGs3OTcyNGtiaDE3amxxdDQxd3A4ajQ5N3hyaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/P53TSsopKicrm/giphy.gif", // Crying/Angry
  happy: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnMzcWJqMzRkdjZqejM2c3RvZGEyMDlkbWlqNG9vcmc4MHZxcGRjZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/T70hpBP1L0N7U0jtkq/giphy.gif", // Happy/Celebrating
  extra1: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnY3cmE4c2hvaHhlaDkwMDZhM2RybWowcWl3ZWlrbml4ZmxqdmZ4ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H4Z0WPaFqdeOvRrJHL/giphy.gif", // Updated Kissing
  extra2: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDU3Y2RxcWtqcjFoNWVkZXBnMHVsM2J0NG1zb2Y2YWtrMWlraWc5eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Pk9n41p2yA7CFGJg60/giphy.gif" // Updated Dancing
};

// --- Texts for the refusal progression ---
const NO_PHRASES = [
  "Nu",
  "BABA, ești sigură???",
  "Chiar vrei să zici nu?",
  "Te rog eu frumos! 🥺",
  "Uite cât de trist sunt...",
  "O să plâng...",
  "Antonia, nu fi rea!",
  "Gata, butonul ăsta e stricat!"
];

// --- Components ---

const FloatingHearts = () => {
  // Generate random hearts for background atmosphere
  const hearts = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    scale: Math.random() * 0.5 + 0.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-pink-300/40 animate-float"
          style={{
            left: heart.left,
            top: heart.top,
            animationDelay: heart.animationDelay,
            transform: `scale(${heart.scale})`,
          }}
        >
          <Heart fill="currentColor" size={48} />
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [accepted, setAccepted] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ top: "50%", left: "50%" });
  const [isMoved, setIsMoved] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Autoplay music on page load
  useEffect(() => {
    audioRef.current = new Audio('/baby.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const playAudio = () => {
      audioRef.current?.play().catch(() => {
        // Browser blocked autoplay, try on first interaction
        const handleClick = () => {
          audioRef.current?.play();
          document.removeEventListener('click', handleClick);
        };
        document.addEventListener('click', handleClick);
      });
    };

    playAudio();

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Fire confetti when accepted
  useEffect(() => {
    if (accepted) {
      const duration = 10 * 1000;
      const animationEnd = Date.now() + duration;
      const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffffff', '#ff0000'];

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [accepted]);

  // Logic to move the "No" button randomly
  const moveNoButton = () => {
    // Get random coordinates within a safe area (padding of 10-20%)
    const x = Math.random() * 60 + 20; // 20% to 80%
    const y = Math.random() * 60 + 20; // 20% to 80%
    
    setNoButtonPos({ top: `${y}%`, left: `${x}%` });
    setIsMoved(true);
    setNoCount((prev) => prev + 1);
  };

  const handleNoInteraction = () => {
    moveNoButton();
  };

  const handleYesClick = () => {
    setAccepted(true);
  };

  // Dynamic Size for "Yes" button based on how many times "No" was attempted
  const yesButtonScale = 1 + noCount * 0.5; // Grow by 50% each time
  
  // Cap the phrase index so we don't overflow array
  const currentNoPhrase = NO_PHRASES[Math.min(noCount, NO_PHRASES.length - 1)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffe4ec] to-[#ffb6c1] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-pink-200">
      <FloatingHearts />


      {accepted ? (
        // --- SCREEN 2: SUCCESS ---
        <div className="relative z-10 flex flex-col items-center text-center p-8 animate-in fade-in zoom-in duration-700 w-full max-w-4xl">
          
          <div className="relative mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            
            {/* Extra GIF 1 (Mobile: Top, Desktop: Left) */}
            <img 
               src={IMAGES.extra2} 
               alt="Dancing Cat"
               className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-bounce sm:order-1 order-2"
            />

            {/* Main Image */}
            <div className="relative sm:order-2 order-1">
              <img 
                src={IMAGES.happy} 
                alt="Happy Bear" 
                className="w-64 h-64 object-cover rounded-2xl shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-lg">
                <Stars className="text-yellow-400 w-8 h-8 fill-current" />
              </div>
            </div>

             {/* Extra GIF 2 (Mobile: Bottom, Desktop: Right) */}
             <img 
               src={IMAGES.extra1} 
               alt="Kissing Cat"
               className="w-24 h-24 sm:w-32 sm:h-32 object-contain animate-pulse sm:order-3 order-3"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[#ff1493] mb-4 drop-shadow-sm">
            YAYYY! 🎉💕
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-800 font-semibold mb-8 max-w-lg">
            Știam eu că mă iubești 😏❤️
          </p>

          <div className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-[#ff69b4] rounded-full">
             Baba iti pregateste surpriza, mai trebuie sa astepti doar putin 💝
          </div>
        </div>
      ) : (
        // --- SCREEN 1: QUESTION ---
        <div className="relative z-10 flex flex-col items-center text-center p-4 w-full max-w-2xl">
          <div className="mb-8 relative transition-all duration-300 ease-in-out">
            <img
              src={noCount === 0 ? IMAGES.cute : IMAGES.sad}
              alt="Bear"
              className="w-64 h-64 object-contain rounded-xl drop-shadow-xl"
            />
            {/* Speech bubble effect */}
            {noCount > 0 && (
              <div className="absolute -top-6 -right-6 bg-white px-4 py-2 rounded-xl rounded-bl-none shadow-md text-sm font-bold text-gray-600 animate-bounce">
                 💔
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-[#d14777] mb-10 drop-shadow-sm leading-tight px-4">
            {noCount === 0 
              ? "Antonia, vrei să fii Valentine-ul meu? 🥺" 
              : "Baba cacaa nu atinge"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 w-full h-40 relative">
            {/* YES BUTTON */}
            <button
              onClick={handleYesClick}
              style={{ 
                transform: `scale(${yesButtonScale})`,
                zIndex: 50 // Ensure YES is always above everything
              }}
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 hover:shadow-xl"
            >
              Da! 💖
            </button>

            {/* NO BUTTON (Runaway) */}
            <button
              onMouseEnter={handleNoInteraction} // Desktop hover
              onTouchStart={handleNoInteraction} // Mobile tap
              onClick={handleNoInteraction}      // Fallback
              style={
                isMoved
                  ? {
                      position: "fixed",
                      top: noButtonPos.top,
                      left: noButtonPos.left,
                      transition: "all 0.3s ease-in-out",
                      zIndex: 40
                    }
                  : {
                      // Initial static position
                      position: "relative" 
                    }
              }
              className="bg-[#e74c3c] hover:bg-[#c0392b] text-white font-bold py-3 px-8 rounded-full shadow-lg cursor-pointer min-w-[100px]"
            >
              {currentNoPhrase}
            </button>
          </div>
        </div>
      )}
      
      {/* Footer / Signature */}
      <div className="absolute bottom-4 text-[#d14777] opacity-60 text-sm">
        Made with love for you ❤️
      </div>
    </div>
  );
}