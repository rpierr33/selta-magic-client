
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Sparkles, Star } from "lucide-react";
import ImageCarousel from "./ImageCarousel";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => {
      setLoaded(true);
    });
  }, []);

  const handleShopNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/products");
  };

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/products");
  };

  return (
    <section
      className={`relative overflow-hidden min-h-[85vh] ${className ?? ""}`}
    >
      {/* Full dark purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-selta-deep-purple via-selta-dark-purple to-selta-deep-purple z-0" />

      {/* Top and bottom gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-selta-gold/40 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-selta-gold/30 to-transparent z-10" />

      {/* Decorative gradient orbs for depth */}
      <div className="absolute top-1/4 -right-20 h-[500px] w-[500px] bg-selta-gold/8 rounded-full blur-[120px] z-0" />
      <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] bg-selta-purple/15 rounded-full blur-[100px] z-0" />
      <div className="absolute top-10 left-1/3 h-[300px] w-[300px] bg-selta-vivid-purple/10 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-1/4 right-1/4 h-[250px] w-[250px] bg-selta-gold/5 rounded-full blur-[80px] z-0" />

      {/* Content */}
      <div className="relative container mx-auto px-4 z-10 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 max-w-xl">
            {/* Premium badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="inline-flex items-center px-5 py-2.5 bg-selta-gold/15 text-selta-gold rounded-full font-semibold text-sm border border-selta-gold/25 backdrop-blur-sm">
                <Star className="h-4 w-4 mr-2 fill-selta-gold" />
                Premium Hair & Beauty Products
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <span className="text-white">Transform Your</span>
              <br />
              <span className="text-white">Hair With </span>
              <span className="text-selta-gold inline-flex items-baseline gap-2">
                Selta Magic
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-selta-gold animate-pulse-gold inline-block" />
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-white/75 text-lg md:text-xl leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Discover our premium collection of hair care products made with
              natural ingredients. Experience the transformation from the first
              use.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Button
                className="bg-selta-gold hover:bg-selta-bright-gold text-selta-deep-purple font-bold px-8 py-6 text-base rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-selta-gold/25 hover:translate-y-[-2px] group"
                onClick={handleShopNowClick}
              >
                <ShoppingCart className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Shop Now
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 text-base rounded-full font-semibold transition-all duration-300 bg-transparent"
                onClick={handleExploreClick}
              >
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            {/* Happy Customers */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {["J", "K", "L", "M"].map((initial, i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-selta-gold/50 flex items-center justify-center bg-selta-purple/50 text-white font-semibold text-sm shadow-md backdrop-blur-sm"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/80 font-medium">
                  <span className="font-bold text-selta-gold">1200+</span>{" "}
                  happy customers
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Image Carousel */}
          <div className="relative">
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={loaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Gold glow behind image */}
              <div className="absolute -inset-3 bg-gradient-to-br from-selta-gold/20 via-selta-purple/10 to-selta-gold/15 rounded-2xl blur-xl z-0" />

              {/* Decorative rotated frames */}
              <div className="absolute -top-4 -right-4 w-full h-full border border-selta-gold/20 rounded-2xl rotate-2 z-0" />
              <div className="absolute -bottom-4 -left-4 w-full h-full border border-selta-purple/20 rounded-2xl -rotate-2 z-0" />

              {/* Carousel container with gold border accent */}
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-selta-gold/20 shadow-2xl shadow-black/30 z-10">
                <ImageCarousel />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
