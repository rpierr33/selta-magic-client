
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, ShoppingCart, User, Package, LogOut, ChevronDown } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface NavbarProps {
  className?: string;
}

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/testimonials", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-selta-deep-purple/85 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-white/5"
          : "bg-selta-deep-purple",
        className
      )}
    >
      <div className="container max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo className="h-10 md:h-12 shrink-0" />

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center space-x-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                    isActive(to)
                      ? "text-selta-gold"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  {label}
                  {isActive(to) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-selta-gold rounded-full" />
                  )}
                </Link>
              ))}
              {user && (
                <Link
                  to="/orders"
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                    isActive("/orders")
                      ? "text-selta-gold"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  My Orders
                  {isActive("/orders") && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-selta-gold rounded-full" />
                  )}
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                    isActive("/admin")
                      ? "text-selta-gold"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  Admin
                  {isActive("/admin") && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-selta-gold rounded-full" />
                  )}
                </Link>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/90 hover:text-white hover:bg-white/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-selta-gold text-selta-deep-purple h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* User / Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/90 hover:text-white hover:bg-white/10 gap-2"
                  >
                    <div className="h-7 w-7 rounded-full bg-selta-purple/40 border border-selta-gold/40 flex items-center justify-center text-xs font-semibold text-white">
                      {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium">
                      {user.firstName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-selta-deep-purple border-white/10 shadow-xl shadow-black/30"
                >
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{user.firstName}</p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="bg-selta-gold hover:bg-selta-gold/90 text-selta-deep-purple font-bold rounded-full px-5 shadow-md shadow-selta-gold/20 transition-all hover:shadow-lg hover:shadow-selta-gold/30"
                >
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/90 hover:text-white hover:bg-white/10"
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="sm:max-w-sm bg-selta-deep-purple border-l border-white/10"
              >
                <SheetHeader className="space-y-2 text-left">
                  <SheetTitle className="text-white text-lg">Menu</SheetTitle>
                  <SheetDescription className="text-white/50">
                    Explore our collection of premium hair products.
                  </SheetDescription>
                </SheetHeader>
                <nav className="grid gap-1 py-6">
                  {NAV_LINKS.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive(to)
                          ? "text-selta-gold bg-white/5"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      )}
                      onClick={closeMenu}
                    >
                      {label}
                      {isActive(to) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-selta-gold" />
                      )}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      to="/orders"
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive("/orders")
                          ? "text-selta-gold bg-white/5"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      )}
                      onClick={closeMenu}
                    >
                      My Orders
                      {isActive("/orders") && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-selta-gold" />
                      )}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive("/admin")
                          ? "text-selta-gold bg-white/5"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      )}
                      onClick={closeMenu}
                    >
                      Admin Panel
                      {isActive("/admin") && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-selta-gold" />
                      )}
                    </Link>
                  )}
                </nav>

                {/* Mobile menu footer */}
                {!user && (
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <Link to="/login" onClick={closeMenu}>
                      <Button className="w-full bg-selta-gold hover:bg-selta-gold/90 text-selta-deep-purple font-bold rounded-full shadow-md">
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
