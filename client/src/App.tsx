import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PropertyDetail from "@/pages/PropertyDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Booking from "@/pages/Booking";
import Notifications from "@/pages/Notifications";
import MapPage from "@/pages/MapPage";
import Admin from "@/pages/Admin";
import Navbar from "./components/Navbar";
import NotificationToast from "./components/NotificationToast";

function Router() {
  const [location, setLocation] = useLocation();

  const handleGlobalSearch = (query: string) => {
    const params = new URLSearchParams({ search: query });
    setLocation(`/?${params.toString()}`);
  };

  
  return (
    <div className="min-h-screen">
      <Navbar onSearch={handleGlobalSearch} />
      <NotificationToast />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/property/:id" component={PropertyDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/booking/:propertyId" component={Booking} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/map" component={MapPage} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
