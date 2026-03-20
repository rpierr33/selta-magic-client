
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={cn("block", className)}>
      <img
        src="/lovable-uploads/selta-magic-logo.png"
        alt="Selta Magic"
        className="h-10 md:h-12 w-auto object-contain"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </Link>
  );
}
