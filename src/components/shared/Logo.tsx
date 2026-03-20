
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const LOGO_VARIANTS = {
  ornate: "/lovable-uploads/0c6fa17b-fcb9-43d1-814f-db7cb931c513.png",
  cart: "/lovable-uploads/d8e395e3-a691-465a-8922-a688a2b6aa09.png",
} as const;

interface LogoProps {
  className?: string;
  variant?: "ornate" | "cart";
}

export default function Logo({ className, variant = "ornate" }: LogoProps) {
  return (
    <Link to="/" className={cn("block", className)}>
      <div className={cn("relative rounded-full overflow-hidden", className)}>
        <img
          src={LOGO_VARIANTS[variant]}
          alt="Selta Magic E-Commerce"
          className="h-12 md:h-16 w-auto object-contain rounded-full bg-white p-0.5"
          width="64"
          height="64"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </Link>
  );
}
