import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, CreditCard, Shield, Home, Bell, X, MessageSquare } from "lucide-react";
import { notificationApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const notificationIcons = {
  booking: CheckCircle,
  payment: CreditCard,
  security: Shield,
  message: MessageSquare,
  recommendation: Home,
};

const notificationStyles = {
  booking: "bg-green-100 text-green-600",
  payment: "bg-blue-100 text-blue-600",
  security: "bg-yellow-100 text-yellow-600",
  message: "bg-purple-100 text-purple-600",
  recommendation: "bg-primary/10 text-primary",
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationApi.getNotifications(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al marcar notificación como leída",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Ahora mismo";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays === 1) {
      return "Hace 1 día";
    } else {
      return `Hace ${diffInDays} días`;
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="notifications-page">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No se pudieron cargar las notificaciones</h2>
          <p className="text-muted-foreground">Inténtalo de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="notifications-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
        {data?.notifications && data.notifications.some(n => !n.isRead) && (
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80"
            onClick={() => {
              // Mark all unread notifications as read
              data.notifications
                .filter(n => !n.isRead)
                .forEach(n => handleMarkAsRead(n.id));
            }}
            data-testid="button-mark-all-read"
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.notifications && data.notifications.length > 0 ? (
        <div className="space-y-4">
          {data.notifications.map((notification) => {
            const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
            const iconStyle = notificationStyles[notification.type as keyof typeof notificationStyles] || "bg-gray-100 text-gray-600";
            
            return (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow ${!notification.isRead ? "border-primary/20 bg-primary/5" : ""}`}
                data-testid={`notification-${notification.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`rounded-full p-2 flex-shrink-0 ${iconStyle}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="font-medium text-foreground mb-1" 
                        data-testid={`notification-title-${notification.id}`}
                      >
                        {notification.title}
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-primary rounded-full ml-2"></span>
                        )}
                      </h3>
                      <p 
                        className="text-sm text-muted-foreground mb-2" 
                        data-testid={`notification-message-${notification.id}`}
                      >
                        {notification.message}
                      </p>
                      <span 
                        className="text-xs text-muted-foreground" 
                        data-testid={`notification-time-${notification.id}`}
                      >
                        {formatTimeAgo(new Date(notification.createdAt || new Date()))}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleMarkAsRead(notification.id)}
                        data-testid={`button-mark-read-${notification.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12" data-testid="empty-notifications">
          <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Sin notificaciones</h3>
          <p className="text-muted-foreground">¡Estás al día! Vuelve más tarde para ver actualizaciones.</p>
        </div>
      )}
    </main>
  );
}
