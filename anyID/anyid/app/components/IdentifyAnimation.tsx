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
      <h1 className="text-4xl font-bold text-center mx-auto">
        <span className="text-blue-600">Identify </span>
        <br/>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-green-600"
        >
          {words[index]}
        </motion.span>
      </h1>
  );
}