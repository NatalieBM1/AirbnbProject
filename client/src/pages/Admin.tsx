import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Property, InsertProperty } from "@shared/schema";
import { Plus, Edit, Trash2, MapPin, Users, Bed, Bath, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Verificar si el usuario es admin
  const isAdmin = user?.email === "admin@airbnbbm.com";

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLocation("/");
      return;
    }
    
    loadProperties();
  }, [isAuthenticated, isAdmin, setLocation]);

  const loadProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      const data = await response.json();
      setProperties(data.properties);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<InsertProperty>>({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    pricePerNight: "",
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
    hostId: "admin-1"
  });

  const handleSaveProperty = async () => {
    try {
      const token = localStorage.getItem("airbnb_token");
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : "/api/properties";
      const method = editingProperty ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadProperties();
        setShowDialog(false);
        setEditingProperty(null);
        resetForm();
      } else {
        throw new Error("Error saving property");
      }
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Error al guardar la propiedad");
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      const token = localStorage.getItem("airbnb_token");
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadProperties();
      } else {
        throw new Error("Error deleting property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error al eliminar la propiedad");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      latitude: "",
      longitude: "",
      pricePerNight: "",
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      images: [],
      hostId: "admin-1"
    });
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      location: property.location,
      latitude: property.latitude || "",
      longitude: property.longitude || "",
      pricePerNight: property.pricePerNight,
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      amenities: property.amenities || [],
      images: property.images || [],
      hostId: property.hostId
    });
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingProperty(null);
    resetForm();
    setShowDialog(true);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
          <p className="text-gray-600 mt-2">Gestiona las propiedades de AirBnbBM</p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-rose-600 hover:bg-rose-700">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Propiedad
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la propiedad"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada de la propiedad"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Cartagena, Bolívar"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    type="text"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="10.3932"
                  />
                  <p className="text-xs text-gray-500 mt-1">Coordenada GPS para el mapa</p>
                </div>
                
                <div>
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    type="text"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-75.4832"
                  />
                  <p className="text-xs text-gray-500 mt-1">Coordenada GPS para el mapa</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="price">Precio por noche (COP)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerNight || ""}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  placeholder="300000"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="guests">Huéspedes</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={formData.maxGuests || 1}
                    onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms">Habitaciones</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms || 1}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Baños</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms || 1}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="amenities">Comodidades (separadas por coma)</Label>
                <Input
                  id="amenities"
                  value={Array.isArray(formData.amenities) ? formData.amenities.join(", ") : ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    amenities: e.target.value.split(", ").filter(a => a.trim()) 
                  })}
                  placeholder="WiFi, AC, Kitchen, Pool"
                />
              </div>
              
              <div>
                <Label htmlFor="images">URLs de imágenes (separadas por coma)</Label>
                <Textarea
                  id="images"
                  value={Array.isArray(formData.images) ? formData.images.join(", ") : ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    images: e.target.value.split(", ").filter(img => img.trim()) 
                  })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProperty} className="bg-rose-600 hover:bg-rose-700">
                  {editingProperty ? "Actualizar" : "Crear"} Propiedad
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen</span>
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(property)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteProperty(property.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center ml-2">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm ml-1">{property.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {property.maxGuests}
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms}
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {property.amenities?.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {property.amenities && property.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.amenities.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-semibold">
                    ${parseInt(property.pricePerNight).toLocaleString()}
                  </span>
                  <span className="text-gray-600 text-sm"> / noche</span>
                </div>
                <Badge variant={property.isActive ? "default" : "secondary"}>
                  {property.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay propiedades registradas</p>
          <p className="text-gray-400">Utiliza el botón "Agregar Propiedad" para crear la primera</p>
        </div>
      )}
    </div>
  );
}