import { useNavigate } from "react-router";
import logoImage from "../../assets/6d0fec36f5b754d327b3baf1af81bb9d99c20aa5.png";
import llamaImage from "../../assets/ba3f08758491f6b17708870b4e0ceee5f6152335.png";
import { motion } from "motion/react";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center px-16 pt-32 pb-32"
      style={{ 
        background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
        fontFamily: 'Fredoka, sans-serif' 
      }}
    >
      <div className="max-w-[1200px] w-full text-center space-y-12">
        {/* Logo */}
        <div>
          <img 
            src={logoImage} 
            alt="Clarity Coach" 
            className="mx-auto"
            style={{ maxWidth: '800px', width: '100%', height: 'auto' }}
          />
        </div>

        {/* Subtitle - lower spacing */}
        <p 
          className="leading-snug mx-auto"
          style={{ 
            fontSize: '1.5rem',
            fontWeight: 500,
            color: '#FAF5F0',
            letterSpacing: '0.02em',
            maxWidth: '600px',
            marginTop: '2rem'
          }}
        >
          Speak with confidence.
        </p>

        {/* Button with Llama */}
        <div className="pt-2 flex items-center justify-center gap-8">
          <motion.button
            onClick={() => navigate('/record')}
            className="relative overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: '#FF6B5A',
              color: '#FAF5F0',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: '50px',
              padding: '1.5rem 4rem',
              border: '3px solid #FAF5F0',
              boxShadow: '0 0 50px rgba(255, 107, 90, 0.9), 0 0 100px rgba(255, 107, 90, 0.6), 0 0 150px rgba(255, 107, 90, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 60px rgba(255, 107, 90, 1), 0 0 120px rgba(255, 107, 90, 0.7), 0 0 180px rgba(255, 107, 90, 0.5), 0 12px 30px rgba(0, 0, 0, 0.25)'
            }}
            whileTap={{ scale: 0.98 }}
            animate={{
              boxShadow: [
                '0 0 50px rgba(255, 107, 90, 0.9), 0 0 100px rgba(255, 107, 90, 0.6), 0 0 150px rgba(255, 107, 90, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)',
                '0 0 60px rgba(255, 107, 90, 1), 0 0 120px rgba(255, 107, 90, 0.7), 0 0 170px rgba(255, 107, 90, 0.5), 0 8px 25px rgba(0, 0, 0, 0.2)',
                '0 0 50px rgba(255, 107, 90, 0.9), 0 0 100px rgba(255, 107, 90, 0.6), 0 0 150px rgba(255, 107, 90, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)'
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            Start Improving
          </motion.button>

          {/* Llama Character */}
          <motion.img
            src={llamaImage}
            alt="Llama coach"
            style={{
              width: '140px',
              height: 'auto'
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
}