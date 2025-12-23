import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, RotateCcw, LogOut, Loader2, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import bilgenLogo from "@/assets/bilgen-logo.png";

interface AppHeaderProps {
  showBackButton?: boolean;
  backPath?: string;
  onBackClick?: () => void;
  showClearButton?: boolean;
  onClearClick?: () => void;
}

const ADMIN_USER_ID = "bc8ed488-4ebc-49b1-988b-4b0e926c7b8d";

const AppHeader = ({
  showBackButton = false,
  backPath = "/start",
  onBackClick,
  showClearButton = false,
  onClearClick,
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isAdmin = user?.id === ADMIN_USER_ID;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(backPath);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Användare";

  return (
    <header
      className="sticky top-0 z-50 h-16 transition-all duration-300"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {/* Left side - Back button or Contact */}
        <div className="flex w-32 items-center">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 opacity-70 transition-opacity duration-300 hover:opacity-100" />
              Tillbaka
            </button>
          ) : (
            <a
              href="mailto:info@datavoxx.se"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:text-gray-900"
            >
              <Mail className="h-4 w-4" />
              Kontakta oss
            </a>
          )}
        </div>

        {/* Center - Logo (absolutely centered, clickable home link) */}
        <button
          onClick={() => navigate("/")}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
        >
          <img src={bilgenLogo} alt="BILGEN - Gå till startsidan" className="h-7" />
        </button>

        {/* Right side - Actions */}
        <div className="flex items-center justify-end gap-2">
          {showClearButton && onClearClick && (
            <button
              onClick={onClearClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
              title="Rensa"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          
          {isLoading ? (
            <div className="flex h-10 w-24 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
              </button>
              
              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg animate-fade-in">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-xs text-gray-500">Inloggad som</p>
                    <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => navigate("/admin/roles")}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Shield className="h-4 w-4" />
                      Rollhantering
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logga ut
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-all duration-300 hover:bg-neutral-800"
            >
              Logga in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
