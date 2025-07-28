import React, { useState, useEffect, useContext } from 'react';
import { formatPrice } from '../utils/formatPrice';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../components/context/CartContext';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';
import QuantitySelector from '../components/QuantitySelector';
import { getProductImage } from '../utils/productImageMapper';
import apiService from '../services/api';

// Local fallback data
import pack1 from "../images/pack1.jpg";
import pack2 from "../images/pack2.jpg";
import pack3 from "../images/pack3.jpg";
import pack4 from "../images/pack4.png";

const localProducts = [
  {
    id: 1,
    name: "Premium Roasted Makhana",
    flavor: "Chilli Lime",
    weight: "30g",
    image: pack1,
    price: 199,
    description: "Premium roasted makhana with authentic flavors. Made from the finest fox nuts, these crunchy delights are perfect for healthy snacking. Rich in protein and low in calories.",
    ingredients: ["Fox Nuts", "Chilli Powder", "Lime", "Salt", "Natural Spices"],
    nutritionalInfo: {
      calories: "347 per 100g",
      protein: "9.7g",
      carbs: "76g",
      fat: "0.1g",
      fiber: "14.5g"
    },
    rating: 4.5,
    reviews: 127,
    available: true
  },
  {
    id: 2,
    name: "Deluxe Flavor Collection",
    flavor: "Mixed Flavors",
    weight: "35g",
    image: pack2,
    price: 229,
    description: "Deluxe collection of premium makhana varieties. Experience multiple flavors in one pack including masala, salt & pepper, and tandoori.",
    ingredients: ["Fox Nuts", "Mixed Spices", "Salt", "Natural Flavoring"],
    nutritionalInfo: {
      calories: "347 per 100g",
      protein: "9.7g",
      carbs: "76g",
      fat: "0.1g",
      fiber: "14.5g"
    },
    rating: 4.7,
    reviews: 89,
    available: true
  },
  {
    id: 3,
    name: "Special Variety Pack",
    flavor: "Himalayan Salt",
    weight: "40g",
    image: pack3,
    price: 249,
    description: "Special blend of flavored makhana varieties with premium Himalayan salt. Perfect for health-conscious snacking.",
    ingredients: ["Fox Nuts", "Himalayan Salt", "Herbs", "Natural Oils"],
    nutritionalInfo: {
      calories: "347 per 100g",
      protein: "9.7g",
      carbs: "76g",
      fat: "0.1g",
      fiber: "14.5g"
    },
    rating: 4.3,
    reviews: 156,
    available: true
  },
  {
    id: 4,
    name: "Premium Variety Pack 4",
    flavor: "Butter Garlic",
    weight: "25g",
    image: pack4,
    price: 269,
    description: "Premium variety pack with multiple flavors including our signature butter garlic blend.",
    ingredients: ["Fox Nuts", "Butter", "Garlic", "Herbs", "Salt"],
    nutritionalInfo: {
      calories: "347 per 100g",
      protein: "9.7g",
      carbs: "76g",
      fat: "0.1g",
      fiber: "14.5g"
    },
    rating: 4.6,
    reviews: 203,
    available: true
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Try to get from backend first
      const backendProduct = await apiService.getProduct(id);
      if (backendProduct) {
        setProduct({
          ...backendProduct,
          image: getProductImage(backendProduct)
        });
      } else {
        throw new Error('Product not found in backend');
      }
    } catch (error) {
      // Fallback to local data
      const localProduct = localProducts.find(p => p.id === parseInt(id));
      if (localProduct) {
        setProduct(localProduct);
      } else {
        showError('Product not found');
        navigate('/products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showInfo('Please login to add items to cart');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }

    setAddingToCart(true);
    try {
      // Add the specified quantity to cart
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      setQuantity(1); // Reset quantity
    } catch (error) {
      showError('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/20">
            <div className="flex items-center space-x-2">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600 transition-colors duration-300 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button onClick={() => navigate('/products')} className="text-gray-600 hover:text-red-600 transition-colors duration-300">Products</button>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-800 font-medium">{product.name}</span>
            </div>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enhanced Product Images */}
          <div className="space-y-6">
            <div className="aspect-square overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20 p-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Thumbnail images - could be expanded for multiple images */}
            <div className="flex space-x-2">
              {[product.image].map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating || 4.5)}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviews || 0} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-green-600 font-medium">
                  {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-red-600">₹{formatPrice(product.price)}</span>
                <span className="text-sm text-gray-500">({product.weight})</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    size="md"
                    variant="default"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.available}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Product Information Tabs */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-6">
                {/* Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {(product.ingredients || ['Fox Nuts', 'Natural Spices']).map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nutritional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutritional Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(product.nutritionalInfo || {
                      calories: "347 per 100g",
                      protein: "9.7g",
                      carbs: "76g",
                      fat: "0.1g"
                    }).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      100% Natural & Organic
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      High in Protein & Fiber
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Gluten Free & Vegan Friendly
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      No Artificial Preservatives
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
