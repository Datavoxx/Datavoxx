import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, RotateCcw } from "lucide-react";
import bilgenLogo from "@/assets/bilgen-logo.png";

interface AppHeaderProps {
  showBackButton?: boolean;
  backPath?: string;
  onBackClick?: () => void;
  showClearButton?: boolean;
  onClearClick?: () => void;
}

const AppHeader = ({
  showBackButton = false,
  backPath = "/",
  onBackClick,
  showClearButton = false,
  onClearClick,
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(backPath);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 h-16 border-b border-gray-200 bg-white/70 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? "shadow-[0_2px_10px_rgba(0,0,0,0.05)]" : ""
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {/* Left side - Back button */}
        <div className="flex w-32 items-center">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 opacity-70 transition-opacity duration-300 hover:opacity-100" />
              Tillbaka
            </button>
          )}
        </div>

        {/* Center - Logo (absolutely centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src={bilgenLogo} alt="BILGEN" className="h-7" />
        </div>

        {/* Right side - Actions */}
        <div className="flex w-32 items-center justify-end gap-2">
          {showClearButton && onClearClick && (
            <button
              onClick={onClearClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
              title="Rensa"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md">
            <User className="h-4 w-4" />
            Logga in
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
