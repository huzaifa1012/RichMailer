import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/authSlice";
import { Mail, LayoutDashboard, ScrollText, LogOut, LogIn, UserPlus, Code2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutAction());
    sessionStorage.removeItem("apiKey");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-navbar border-b border-navbar/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-navbar-foreground tracking-tight">
              RichMailer <span className="font-medium opacity-70"></span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                <NavItem to="/dashboard" active={isActive("/dashboard")} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
                <NavItem to="/logs" active={isActive("/logs")} icon={<ScrollText className="w-4 h-4" />} label="Mail Logs" />
                <NavItem to="/docs" active={isActive("/docs")} icon={<Code2 className="w-4 h-4" />} label="Docs" />
                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-navbar-foreground/70 hover:text-navbar-foreground hover:bg-navbar-foreground/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                  <NavItem to="/docs" active={isActive("/docs")} icon={<Code2 className="w-4 h-4" />} label="Docs" />
                <NavItem to="/login" active={isActive("/login")} icon={<LogIn className="w-4 h-4" />} label="Login" />
                  <Link to="/register">
                    <Button size="sm" className="ml-2 gap-1.5">
                      <Rocket className="w-4 h-4" />
                      <span className="hidden sm:inline">Get Started</span>
                    </Button>
                  </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-navbar-foreground/70 hover:text-navbar-foreground hover:bg-navbar-foreground/10"
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Link>
);

export default Navbar;
