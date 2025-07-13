import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  User,
  Users
} from 'lucide-react';
import Logo from '../assets/55957344485-1.png';

function Header({ isAuthenticated, handleLogout, currentPage = 'products' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/products') return 'products';
    if (path === '/invoices') return 'invoices';
    if (path === '/accounts') return 'accounts';
    if (path === '/customer-details') return 'customer-details';
    return 'dashboard';
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Products', href: '/products', icon: Package, key: 'products' },
    { name: 'Invoices', href: '/invoices', icon: FileText, key: 'invoices' },
    { name: 'Accounts', href: '/accounts', icon: CreditCard, key: 'accounts' },
    { name: 'Customer-details', href: '/customer-details', icon: Users, key: 'customer-details' },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
if (!isAuthenticated) return null;
  return (
  
    <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50  top-0 z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src={Logo} alt="no" style={{height:"50px"}}/>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white">Krilo</h1>
              <p className="text-xs text-gray-400">Technologies</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-700/50 p-2 rounded-xl">
                <User className="w-5 h-5 text-gray-300" />
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">Welcome back</p>
                <p className="text-gray-400">Admin User</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl mt-2 border border-slate-700/50">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-white border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </a>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="border-t border-slate-700/50 pt-3 mt-3">
                <div className="flex items-center px-3 py-2 text-sm text-gray-300">
                  <User className="w-4 h-4 mr-3" />
                  <div>
                    <p className="text-white font-medium">Welcome back</p>
                    <p className="text-gray-400 text-xs">Admin User</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-300 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
    
  );
}

export default Header;