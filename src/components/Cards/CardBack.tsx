import React from "react";

const CardBack: React.FC = () => {
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/10"
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      }}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, rgba(255, 71, 87, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 70% 80%, rgba(66, 133, 244, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Floating elements */}
      <div className="absolute w-full h-full opacity-80">
        {/* Shape 1 */}
        <div
          className="absolute w-20 h-3 top-[50px] -left-5 rotate-[30deg] rounded-[50px] animate-float-1"
          style={{
            background: "linear-gradient(45deg, #ff4757, #ff6b7a)",
            filter: "blur(0.5px)",
            animationDelay: "0s",
          }}
        />

        {/* Shape 2 */}
        <div
          className="absolute w-15 h-2 top-[120px] -right-[10px] -rotate-45 rounded-[50px] animate-float-2"
          style={{
            background: "linear-gradient(45deg, #32cd32, #7bed9f)",
            filter: "blur(0.5px)",
            animationDelay: "1s",
          }}
        />

        {/* Shape 3 */}
        <div
          className="absolute w-25 h-[10px] top-[200px] -left-[30px] rotate-[60deg] rounded-[50px] animate-float-3"
          style={{
            background: "linear-gradient(45deg, #4285f4, #70a1ff)",
            filter: "blur(0.5px)",
            animationDelay: "2s",
          }}
        />

        {/* Shape 4 */}
        <div
          className="absolute w-[70px] h-[14px] top-[280px] -right-5 -rotate-[30deg] rounded-[50px] animate-float-4"
          style={{
            background: "linear-gradient(45deg, #ffdd59, #ffd700)",
            filter: "blur(0.5px)",
            animationDelay: "3s",
          }}
        />

        {/* Shape 5 */}
        <div
          className="absolute w-[50px] h-[6px] top-[160px] left-5 rotate-[15deg] rounded-[50px] animate-float-5"
          style={{
            background: "linear-gradient(45deg, #ff4757, #ff3838)",
            filter: "blur(0.5px)",
            animationDelay: "4s",
          }}
        />

        {/* Shape 6 */}
        <div
          className="absolute w-[90px] h-4 top-[100px] left-[50px] -rotate-[60deg] rounded-[50px] animate-float-6"
          style={{
            background: "linear-gradient(45deg, #32cd32, #2ed573)",
            filter: "blur(0.5px)",
            animationDelay: "5s",
          }}
        />
      </div>

      {/* Main text */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[32px] font-extrabold tracking-[6px] uppercase z-10"
        style={{
          background:
            "linear-gradient(45deg, #ff4757, #32cd32, #4285f4, #ffdd59)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily:
            "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        APOLOGIES!
      </div>

      {/* Corner dots */}
      <div className="absolute w-2 h-2 rounded-full bg-white/30 top-5 left-5" />
      <div className="absolute w-2 h-2 rounded-full bg-white/30 top-5 right-5" />
      <div className="absolute w-2 h-2 rounded-full bg-white/30 bottom-5 left-5" />
      <div className="absolute w-2 h-2 rounded-full bg-white/30 bottom-5 right-5" />

      {/* Glassmorphism circle */}
      <div
        className="absolute top-[30px] right-[30px] w-[60px] h-[60px] rounded-full border border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes float-1 {
          0%,
          100% {
            transform: translateY(0px) rotate(30deg);
          }
          50% {
            transform: translateY(-20px) rotate(210deg);
          }
        }
        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0px) rotate(-45deg);
          }
          50% {
            transform: translateY(-20px) rotate(135deg);
          }
        }
        @keyframes float-3 {
          0%,
          100% {
            transform: translateY(0px) rotate(60deg);
          }
          50% {
            transform: translateY(-20px) rotate(240deg);
          }
        }
        @keyframes float-4 {
          0%,
          100% {
            transform: translateY(0px) rotate(-30deg);
          }
          50% {
            transform: translateY(-20px) rotate(150deg);
          }
        }
        @keyframes float-5 {
          0%,
          100% {
            transform: translateY(0px) rotate(15deg);
          }
          50% {
            transform: translateY(-20px) rotate(195deg);
          }
        }
        @keyframes float-6 {
          0%,
          100% {
            transform: translateY(0px) rotate(-60deg);
          }
          50% {
            transform: translateY(-20px) rotate(120deg);
          }
        }
        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 8s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-3 8s ease-in-out infinite;
        }
        .animate-float-4 {
          animation: float-4 8s ease-in-out infinite;
        }
        .animate-float-5 {
          animation: float-5 8s ease-in-out infinite;
        }
        .animate-float-6 {
          animation: float-6 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CardBack;
