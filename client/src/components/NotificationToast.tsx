import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, CreditCard, Shield, Home, Bell } from "lucide-react";

interface NotificationData {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  icon?: "check" | "card" | "shield" | "home" | "bell";
}

const iconMap = {
  check: CheckCircle,
  card: CreditCard,
  shield: Shield,
  home: Home,
  bell: Bell,
};

const typeStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (notification: Omit<NotificationData, "id">) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification(id);
    }, 5000);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Global function to show notifications
  useEffect(() => {
    (window as any).showNotification = showNotification;
    return () => {
      delete (window as any).showNotification;
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2" 
      data-testid="notification-container"
    >
      {notifications.map((notification) => {
        const IconComponent = notification.icon ? iconMap[notification.icon] : CheckCircle;
        
        return (
          <Card
            key={notification.id}
            className={`notification-slide max-w-sm shadow-lg ${typeStyles[notification.type]}`}
            data-testid={`notification-${notification.type}`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium" data-testid="notification-title">
                    {notification.title}
                  </p>
                  <p className="text-xs mt-1" data-testid="notification-message">
                    {notification.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 h-6 w-6"
                  onClick={() => hideNotification(notification.id)}
                  data-testid={`button-close-${notification.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
