import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const words = [
  "a famous person",
  "animals",
  "plants",
  "anime characters",
  "real-life objects",
  "vehicles",
  "anything",
];

export default function IdentifyAnimation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-5xl md:text-7xl font-bold text-center mx-auto mb-12 leading-tight">
      <span className="text-white">Identify </span>
      <br className="md:hidden" />
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
        transition={{ duration: 0.5 }}
        className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
      >
        {words[index]}
      </motion.span>
    </h1>
  );
}