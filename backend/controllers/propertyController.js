// Datos de propiedades de ejemplo
let properties = [
  {
    id: 'prop-1',
    title: 'Beachfront Villa in Malibu',
    description: 'Escape to this breathtaking beachfront villa in Malibu, where luxury meets the Pacific Ocean. This stunning 4-bedroom, 3-bathroom retreat features floor-to-ceiling windows, an infinity pool, and direct beach access.',
    location: 'Malibu, California',
    latitude: '34.0259',
    longitude: '-118.7798',
    pricePerNight: '299.00',
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    images: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    amenities: ['Pool', 'WiFi', 'Kitchen', 'Parking', 'TV', 'Air conditioning'],
    hostId: '1',
    rating: '4.95',
    reviewCount: 127,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop-2',
    title: 'Cozy Mountain Cabin',
    description: 'Relax in this charming mountain cabin surrounded by nature. Perfect for a peaceful getaway with hiking trails nearby.',
    location: 'Aspen, Colorado',
    latitude: '39.1911',
    longitude: '-106.8175',
    pricePerNight: '189.00',
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
    ],
    amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Parking'],
    hostId: '1',
    rating: '4.87',
    reviewCount: 89,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop-3',
    title: 'Modern Downtown Loft',
    description: 'Stylish loft in the heart of the city with floor-to-ceiling windows and modern amenities.',
    location: 'New York, NY',
    latitude: '40.7128',
    longitude: '-74.0060',
    pricePerNight: '159.00',
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
    ],
    amenities: ['WiFi', 'Kitchen', 'Gym', 'Parking'],
    hostId: '1',
    rating: '4.92',
    reviewCount: 156,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const getAllProperties = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const activeProperties = properties.filter(p => p.isActive);
    const paginatedProperties = activeProperties.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({ 
      properties: paginatedProperties,
      total: activeProperties.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties', error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = properties.find(p => p.id === id && p.isActive);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json({ property });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch property', error: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const { title, description, location, pricePerNight, maxGuests, bedrooms, bathrooms, amenities, images } = req.body;
    
    const newProperty = {
      id: 'prop-' + Date.now(),
      title,
      description,
      location,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities: amenities || [],
      images: images || [],
      hostId: req.user?.userId || '1', // En producción, obtener desde JWT
      rating: '0',
      reviewCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    properties.push(newProperty);
    res.status(201).json({ property: newProperty });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create property', error: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    properties[propertyIndex] = { ...properties[propertyIndex], ...req.body };
    res.json({ property: properties[propertyIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update property', error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyIndex = properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    properties[propertyIndex].isActive = false; // Eliminación suave
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete property', error: error.message });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};