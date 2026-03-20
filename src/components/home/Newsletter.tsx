
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // In a real app, this would be connected to your newsletter service
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-selta-deep-purple via-selta-purple to-selta-deep-purple relative overflow-hidden">
      {/* Decorative accents */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-selta-gold/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-selta-gold/6 rounded-full blur-3xl"></div>
      <Sparkles className="absolute top-8 right-[22%] h-4 w-4 text-selta-gold/25" />
      <Sparkles className="absolute bottom-10 left-[18%] h-5 w-5 text-selta-gold/20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Stay in the Magic
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Be the first to know about new products, exclusive offers, and beauty tips delivered straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-grow bg-white border-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-selta-gold focus-visible:ring-2 rounded-full px-5 h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-selta-gold hover:bg-selta-gold/90 text-white font-medium rounded-full px-8 h-11 transition-all hover:shadow-lg hover:shadow-selta-gold/25 hover:translate-y-[-1px]"
            >
              Subscribe
            </Button>
          </form>

          <p className="text-sm text-white/50 mt-5">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}
