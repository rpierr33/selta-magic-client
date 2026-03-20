
import { Heart, Sparkles, Star } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-selta-deep-purple" />,
    title: "Premium Ingredients",
    description: "Our hair care and beauty products are formulated with only the finest natural ingredients for maximum effectiveness and lasting results."
  },
  {
    icon: <Heart className="h-6 w-6 text-selta-deep-purple" />,
    title: "Nourishes & Revitalizes",
    description: "From hair oils to handcrafted soaps and luxury wigs, every product delivers deep nourishment that you can see and feel."
  },
  {
    icon: <Star className="h-6 w-6 text-selta-deep-purple" />,
    title: "No Harmful Additives",
    description: "Free from parabens, sulfates, and artificial colors. Just pure, clean beauty — crafted with care for your hair and skin."
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-selta-soft-purple/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-selta-deep-purple mb-4">
            Why Choose Selta Magic
          </h2>
          <p className="text-gray-600 text-lg">
            Curated hair care and beauty essentials crafted to bring out the best in you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 border-t-4 border-t-selta-gold hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-selta-gold/90 rounded-full w-14 h-14 flex items-center justify-center mb-5 shadow-md">
                {feature.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-selta-deep-purple mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
