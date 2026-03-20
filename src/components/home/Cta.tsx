
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function Cta() {
  const navigate = useNavigate();

  const handleShopNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/products');
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-selta-deep-purple via-selta-purple to-selta-deep-purple">
      {/* Decorative sparkle elements */}
      <div className="absolute top-10 left-[15%] w-72 h-72 bg-selta-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-[15%] w-72 h-72 bg-selta-gold/8 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-selta-purple/20 rounded-full blur-3xl"></div>

      {/* Subtle gold sparkle accents */}
      <Sparkles className="absolute top-12 right-[20%] h-5 w-5 text-selta-gold/30" />
      <Sparkles className="absolute bottom-16 left-[18%] h-4 w-4 text-selta-gold/25" />
      <Sparkles className="absolute top-1/3 left-[10%] h-3 w-3 text-selta-gold/20" />
      <Sparkles className="absolute bottom-1/3 right-[12%] h-6 w-6 text-selta-gold/20" />

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Join thousands of satisfied customers who have experienced the magic of our premium hair care and beauty products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="bg-selta-gold hover:bg-selta-gold/90 text-white font-medium px-8 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-selta-gold/25 hover:translate-y-[-2px]"
              onClick={handleShopNowClick}
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild variant="outline" className="border-white/70 text-white hover:bg-white/10 hover:text-white px-8 py-2 rounded-full transition-all">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
