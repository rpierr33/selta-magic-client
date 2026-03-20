
import { Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-selta-deep-purple pt-16 pb-8 relative z-40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="space-y-4">
            <Logo className="h-10 w-auto brightness-110" />
            <p className="text-gray-300 mt-2 leading-relaxed">
              Elevate your beauty with our premium hair care products designed for natural hair growth and health.
            </p>
            <div className="flex space-x-3 pt-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-selta-gold hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-selta-gold hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-selta-gold hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-medium mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Products</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-display text-lg font-medium mb-4 text-white">Our Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Terms of Service</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gray-300 hover:text-selta-gold transition-colors duration-200">Return Policy</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-lg font-medium mb-4 text-white">Subscribe</h3>
            <p className="text-gray-300 mb-4">Stay updated with our latest offers.</p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-selta-gold focus-visible:border-selta-gold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-selta-gold hover:bg-selta-gold/90 text-selta-deep-purple font-medium shrink-0 transition-colors duration-200"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/15 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Selta Magic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
