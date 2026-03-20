import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function HowToUse() {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-selta-deep-purple mb-4">
            Your Beauty Journey
          </h2>
          <p className="text-gray-600 text-lg">
            Getting started with Selta Magic is simple. Here's how to find your perfect routine.
          </p>
        </div>

        {/* Custom layout: steps alternate left/right of centered image */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="relative flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-8"
        >
          {/* Left steps */}
          <div className="flex flex-col items-end flex-1 space-y-16">
            <motion.div variants={itemVariants} className="flex items-center justify-end w-full max-w-md">
              <div className="bg-selta-gold rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shrink-0 mr-4 shadow-md">
                1
              </div>
              <div className="text-right">
                <h3 className="font-display text-xl font-semibold text-selta-deep-purple mb-2">
                  Browse Our Collection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore our curated selection of hair care and beauty products designed to nourish, protect, and transform.
                </p>
              </div>
            </motion.div>
            {/* Step 3 below image, left side */}
            <motion.div variants={itemVariants} className="flex items-center justify-end w-full max-w-md mt-16">
              <div className="bg-selta-gold rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shrink-0 mr-4 shadow-md">
                3
              </div>
              <div className="text-right">
                <h3 className="font-display text-xl font-semibold text-selta-deep-purple mb-2">
                  Follow the Instructions
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Each product comes with detailed usage instructions so you can get the best results from day one.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Centered image */}
          <div className="relative p-4 z-10 flex-shrink-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-selta-gold/20 rounded-2xl transform rotate-3"></div>
            <img
              src="/lovable-uploads/hair-oil.avif"
              alt="Selta Magic products"
              className="relative z-10 rounded-xl shadow-lg w-full max-w-xs lg:max-w-sm mx-auto"
            />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-selta-gold rounded-full opacity-20 blur-xl"></div>
          </div>

          {/* Right steps */}
          <div className="flex flex-col items-start flex-1 space-y-16">
            {/* Step 2, right of image, slightly lower */}
            <motion.div variants={itemVariants} className="flex items-center justify-start w-full max-w-md mt-16 lg:mt-24">
              <div className="text-left">
                <h3 className="font-display text-xl font-semibold text-selta-deep-purple mb-2">
                  Choose Your Products
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Select the products that match your hair type, skin needs, and beauty goals — from oils and soaps to premium wigs.
                </p>
              </div>
              <div className="bg-selta-gold rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shrink-0 ml-4 shadow-md">
                2
              </div>
            </motion.div>
            {/* Step 4, right of image, below step 2 */}
            <motion.div variants={itemVariants} className="flex items-center justify-start w-full max-w-md">
              <div className="text-left">
                <h3 className="font-display text-xl font-semibold text-selta-deep-purple mb-2">
                  See the Transformation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience the Selta Magic difference with consistent use. Real ingredients, real results — every single time.
                </p>
              </div>
              <div className="bg-selta-gold rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shrink-0 ml-4 shadow-md">
                4
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
