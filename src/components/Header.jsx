import { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  User,
  Users,
  Settings,
  ChevronDown
} from 'lucide-react';
import Logo from '../assets/55957344485-1.png';

function Header({ isAuthenticated, handleLogout, currentPage = 'dashboard' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/products') return 'products';
    if (path === '/invoices') return 'invoices';
    if (path === '/accounts') return 'accounts';
    if (path === '/customer') return 'customers';
    if (path === '/customer-details') return 'customer-details';
    return 'dashboard'; // Default fallback to dashboard
  };

  // Use getCurrentPage() to determine active page instead of relying on currentPage prop
  const activePage = getCurrentPage();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Products', href: '/products', icon: Package, key: 'products' },
    { name: 'Invoices', href: '/invoices', icon: FileText, key: 'invoices' },
    { name: 'Accounts', href: '/accounts', icon: CreditCard, key: 'accounts' },
    { name: 'Customers', href: '/customer', icon: Users, key: 'customers' },
    { name: 'Customer Details', href: '/customer-details', icon: Users, key: 'customer-details' },
  ];

  const profileMenuItems = [
    { name: 'Company Settings', href: '/company-settings', icon: Settings },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileDropdownToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  if (!isAuthenticated) return null;

  return (
    <header className="sticky bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/30 top-0 z-50 shadow-xl">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 animate-gradient-x"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo Section */}
          <div className="flex items-center group">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 group-hover:border-slate-600/50 transition-all duration-300">
                <img 
                  src={Logo} 
                  alt="Krilo Technologies" 
                  className="h-8 w-8 object-contain filter drop-shadow-lg"
                />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Krilo
              </h1>
              <p className="text-xs text-gray-400 font-medium">Technologies</p>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-1 border border-slate-700/50">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-xl blur-sm"></div>
                  )}
                  <Icon className={`w-4 h-4 mr-2 relative z-10 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Enhanced Desktop User Menu with Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileDropdownToggle}
                className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/50 p-3 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">Welcome back</p>
                  <p className="text-gray-400">Admin User</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Admin User</p>
                        <p className="text-gray-400 text-sm">admin@krilo.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Menu Items */}
                  <div className="py-2">
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 group"
                        >
                          <Icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                          <span className="font-medium">{item.name}</span>
                        </a>
                      );
                    })}
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-slate-700/50 pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group"
                    >
                      <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={handleMobileMenuToggle}
              className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/95 backdrop-blur-xl rounded-2xl mt-2 border border-slate-700/50 shadow-2xl">
              {/* Mobile Navigation Items */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.key;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30 shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                );
              })}
              
              {/* Mobile User Section */}
              <div className="border-t border-slate-700/50 pt-3 mt-3">
                {/* User Info */}
                <div className="flex items-center px-4 py-3 text-sm">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Admin User</p>
                    <p className="text-gray-400 text-xs">admin@krilo.com</p>
                  </div>
                </div>

                {/* Mobile Profile Menu Items */}
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 mx-2"
                    >
                      <Icon className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  );
                })}
                
                {/* Mobile Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 mt-2 mx-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
    </header>
  );
}

export default Header;