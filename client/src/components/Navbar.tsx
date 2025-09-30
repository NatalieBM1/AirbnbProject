import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Globe, Menu, User, Home, Bell, Minus, Plus, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { authApi } from "@/services/api";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  const [adminLoading, setAdminLoading] = useState(false);

  // Colombian destinations
  const searchSuggestions = [
    'Cartagena, Colombia',
    'Medellín, Colombia',
    'Bogotá, Colombia',
    'Santa Marta, Colombia',
    'Cali, Colombia',
    'Pereira, Colombia',
    'Manizales, Colombia',
    'Barranquilla, Colombia'
  ];

  const filteredSuggestions = searchSuggestions.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
    if (checkIn) {
      params.set('checkin', checkIn.toISOString().split('T')[0]);
    }
    if (checkOut) {
      params.set('checkout', checkOut.toISOString().split('T')[0]);
    }
    if (guests > 1) {
      params.set('guests', guests.toString());
    }
    
    setShowSuggestions(false);
    setLocation(params.toString() ? `/?${params.toString()}` : '/');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Agrega fecha...";
    return format(date, "d 'de' MMM", { locale: es });
  };

  const formatGuests = (count: number) => {
    if (count === 1) return "1 huésped";
    if (count <= 6) return `${count} huéspedes`;
    return `${count}+ huéspedes`;
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleAdminLogin = async () => {
    if (!adminCredentials.email || !adminCredentials.password) {
      alert("Por favor ingresa ambas credenciales");
      return;
    }

    setAdminLoading(true);
    try {
      const response = await authApi.login({
        email: adminCredentials.email,
        password: adminCredentials.password
      });
      
      // Verificar si el usuario es admin
      if (response.user.email === "admin@airbnbbm.com") {
        login(response.user, response.token);
        setShowAdminDialog(false);
        setAdminCredentials({ email: "", password: "" });
        setLocation("/admin");
      } else {
        alert("Credenciales de administrador inválidas");
      }
    } catch (error) {
      console.error("Error durante el login de admin:", error);
      alert("Credenciales incorrectas");
    } finally {
      setAdminLoading(false);
    }
  };

  const isAdmin = user?.email === "admin@airbnbbm.com";

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <Home className="text-primary h-8 w-8" />
            <span className="text-primary text-xl font-bold hidden sm:block">airbnbbm</span>
          </Link>

          {/* Modern Search Bar */}
          <div className="flex-1 max-w-xl mx-4 relative">
            <div className="bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center divide-x divide-gray-200">
                
                {/* Destination */}
                <div className="flex-1 min-w-0 px-4 py-2 relative">
                  <label className="block text-xs font-semibold text-gray-900 mb-0.5">
                    Dónde
                  </label>
                  <input
                    type="text"
                    placeholder="Explora destinos"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full text-xs text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
                    data-testid="input-search"
                  />
                  
                  {/* Search Suggestions */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 mt-3">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-200"
                          onClick={() => handleSuggestionClick(suggestion)}
                          data-testid={`search-suggestion-${index}`}
                        >
                          <div className="flex items-center space-x-4">
                            <Search className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-800 font-medium">{suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Check-in */}
                <div className="flex-1 min-w-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-none transition-colors"
                        data-testid="button-checkin"
                      >
                        <div className="text-xs font-semibold text-gray-900 mb-0.5">
                          Check-in
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDate(checkIn)}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out */}
                <div className="flex-1 min-w-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-none transition-colors"
                        data-testid="button-checkout"
                      >
                        <div className="text-xs font-semibold text-gray-900 mb-0.5">
                          Check-out
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDate(checkOut)}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < (checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div className="flex-1 min-w-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-none transition-colors"
                        data-testid="button-guests"
                      >
                        <div className="text-xs font-semibold text-gray-900 mb-0.5">
                          Quién
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatGuests(guests)}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Adultos</div>
                            <div className="text-sm text-gray-500">13 años o más</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setGuests(Math.max(1, guests - 1))}
                              disabled={guests <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-gray-900 font-medium w-8 text-center">
                              {guests}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setGuests(Math.min(16, guests + 1))}
                              disabled={guests >= 16}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Search Button */}
                <div className="px-1 py-1">
                  <Button
                    onClick={() => handleSearch()}
                    size="icon"
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-full h-8 w-8 shadow-sm hover:shadow-md transition-all duration-200"
                    data-testid="button-search"
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground hover:bg-muted">
              Aloja tu hogar
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Globe className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 rounded-full px-3 py-2"
                  data-testid="button-user-menu"
                >
                  <Menu className="h-4 w-4" />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {isAuthenticated ? user?.firstName?.[0] : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem>
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" data-testid="link-admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Panel de Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" data-testid="link-notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Notificaciones
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Cuenta</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Aloja tu hogar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" data-testid="link-login">Iniciar sesión</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" data-testid="link-register">Registrarse</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 font-medium" data-testid="button-admin-login">
                          <Shield className="mr-2 h-4 w-4" />
                          Acceso Admin
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-center">Acceso de Administrador</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="admin-email">
                              Email de administrador
                            </label>
                            <Input
                              id="admin-email"
                              type="email"
                              placeholder="admin@airbnbbm.com"
                              value={adminCredentials.email}
                              onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="admin-password">
                              Contraseña
                            </label>
                            <Input
                              id="admin-password"
                              type="password"
                              placeholder="••••••••"
                              value={adminCredentials.password}
                              onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowAdminDialog(false);
                                setAdminCredentials({ email: "", password: "" });
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleAdminLogin}
                              disabled={adminLoading}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {adminLoading ? "Verificando..." : "Ingresar"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuItem>
                      <span>Aloja tu hogar</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
