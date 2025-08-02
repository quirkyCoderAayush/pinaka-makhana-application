import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useAnimation } from "framer-motion";
import { CartContext } from "../components/context/CartContext";
import QuantitySelector from "../components/QuantitySelector";
import FavoriteButton from "../components/FavoriteButton";
import ModernProductCard from "../components/ModernProductCard";
import ApiService from "../services/api";
import { useIntersectionObserver, usePerformanceOptimization } from "../hooks/useSmoothScroll";
import { useReducedMotion, getAnimationVariants } from "../hooks/useReducedMotion";
import makhanaImage from "../images/makhana.png";
import pack1 from "../images/pack1.jpg";
import pack2 from "../images/pack2.jpg";
import pack3 from "../images/pack3.jpg";
import pack4 from "../images/pack4.png";
import { formatPrice } from "../utils/formatPrice";
import "../styles/home-animations.css";

const productData = [
  {
    id: 1,
    name: "Premium Roasted Makhana",
    weight: "30g",
    image: pack1,
    price: 199
  },
  {
    id: 2,
    name: "Deluxe Flavor Collection",
    weight: "35g", 
    image: pack2,
    price: 229
  },
  {
    id: 3,
    name: "Special Variety Pack",
    weight: "40g",
    image: pack3,
    price: 249
  },
  {
    id: 4,
    name: "Premium Variety Pack 4",
    weight: "25g",
    image: pack4,
    price: 269
  }
];

const Home = () => {
  // Accessibility: Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Get animation variants based on motion preferences
  const animationVariants = getAnimationVariants(prefersReducedMotion);
  const { fadeInUp, staggerContainer, slideInLeft, slideInRight, scaleIn } = animationVariants;
  const { addToCart, loading: cartLoading } = useContext(CartContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState(productData);
  const [quantities, setQuantities] = useState({});
  const [displayLimit, setDisplayLimit] = useState(4);
  const [showingAll, setShowingAll] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);

  // Refs for scroll animations
  const heroRef = useRef(null);
  const productsRef = useRef(null);

  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // In-view animations
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const productsInView = useInView(productsRef, { once: true, margin: "-100px" });

  // Animation controls
  const heroControls = useAnimation();
  const productsControls = useAnimation();

  // Initialize smooth scrolling and performance optimizations
  useIntersectionObserver();
  usePerformanceOptimization();

  // Trigger animations when sections come into view
  useEffect(() => {
    if (heroInView) {
      heroControls.start("visible");
    } else {
      // Ensure content is visible even if animation hasn't triggered
      heroControls.start("visible");
    }
  }, [heroInView, heroControls]);

  useEffect(() => {
    if (productsInView) {
      productsControls.start("visible");
    } else {
      // Ensure content is visible even if animation hasn't triggered
      productsControls.start("visible");
    }
  }, [productsInView, productsControls]);

  // Fallback to ensure content is always visible after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      heroControls.start("visible");
      productsControls.start("visible");
    }, 1000);

    return () => clearTimeout(timer);
  }, [heroControls, productsControls]);

  // Load products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const backendProducts = await ApiService.getProducts();
      if (backendProducts && backendProducts.length > 0) {
        // Map backend products to include local images
        const productsWithImages = backendProducts.map((product, index) => ({
          ...product,
          image: productData[index]?.image || pack1 // Use local images as fallback
        }));
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Failed to load products from backend:', error);
      // Keep using local productData as fallback
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleToggleFavorite = (product) => {
    setFavorites(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      } else {
        return [...prev, product.id];
      }
    });
  };

  const handleAddToCart = async (product, cardQuantity = null) => {
    // Use the quantity from the card if provided, otherwise use the page-level quantity
    const quantity = cardQuantity || quantities[product.id] || 1;
    setIsLoading(true);
    setActiveProductId(product.id);

    // Add the specified quantity to cart in one call
    await addToCart(product, quantity);

    // Reset quantity selector for this product
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));

    setIsLoading(false);
    setActiveProductId(null);
  };

  const handleShowMore = () => {
    setDisplayLimit(products.length);
    setShowingAll(true);
  };

  const handleShowLess = () => {
    setDisplayLimit(4);
    setShowingAll(false);
  };

  const displayedProducts = products.slice(0, displayLimit);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 home-content"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        id="hero"
        className="hero-section relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Enhanced Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-6 w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.06 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.25, 0.45, 0.25],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-20 left-40 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.35, 0.15],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-8 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 relative z-10 w-full">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[85vh]"
            variants={staggerContainer}
            initial="visible"
            animate="visible"
          >

            {/* Left Content */}
            <motion.div
              className="text-white home-content w-full flex flex-col justify-center"
              variants={slideInLeft}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="space-y-6 sm:space-y-8 md:space-y-10"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Modern Badge */}
                <motion.div
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-medium shadow-lg"
                  variants={fadeInUp}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.span
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  />
                  <span>Premium Superfood</span>
                </motion.div>

                {/* Main Heading with Enhanced Animations */}
                <motion.h1
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl font-black leading-[0.9] sm:leading-[0.85] mb-4 sm:mb-6 md:mb-8"
                  variants={fadeInUp}
                >
                  <motion.span
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      textShadow: [
                        "0 0 0px rgba(255, 255, 255, 0)",
                        "0 0 15px rgba(255, 255, 255, 0.08)",
                        "0 0 0px rgba(255, 255, 255, 0)"
                      ]
                    }}
                    transition={{
                      delay: 0.2,
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      textShadow: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    PINAKA
                  </motion.span>
                  <motion.span
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      filter: [
                        "brightness(1) saturate(1)",
                        "brightness(1.05) saturate(1.1)",
                        "brightness(1) saturate(1)"
                      ]
                    }}
                    transition={{
                      delay: 0.4,
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      backgroundPosition: {
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      filter: {
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    style={{
                      backgroundSize: "300% 300%"
                    }}
                  >
                    MAKHANA
                  </motion.span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                  className="text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-light text-gray-300 leading-relaxed mb-4 sm:mb-6 md:mb-8"
                  variants={fadeInUp}
                >
                  The Future of
                  <motion.span
                    className="text-red-400 font-medium"
                    animate={{
                      color: ["#ef4444", "#f97316", "#eab308", "#ef4444"],
                      textShadow: [
                        "0 0 0px rgba(239, 68, 68, 0)",
                        "0 0 8px rgba(249, 115, 22, 0.2)",
                        "0 0 12px rgba(234, 179, 8, 0.3)",
                        "0 0 0px rgba(239, 68, 68, 0)"
                      ]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {" "}Healthy Snacking
                  </motion.span>
                </motion.p>

                {/* Description */}
                <motion.p
                  className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl text-gray-400 leading-relaxed max-w-md sm:max-w-lg md:max-w-xl lg:max-w-lg xl:max-w-xl mb-6 sm:mb-8 md:mb-10"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    color: ["#9ca3af", "#a1a1aa", "#9ca3af"]
                  }}
                  transition={{
                    delay: 0.6,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    color: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  Experience premium roasted fox nuts that redefine taste and nutrition.
                  Zero guilt, maximum flavor.
                </motion.p>
              </motion.div>

              {/* Enhanced CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8"
                variants={fadeInUp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    y: -2
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  <Link
                    to="/products"
                    className="group relative bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold text-base overflow-hidden transition-all duration-500 hover:shadow-2xl inline-block"
                  >
                    <motion.span
                      className="relative z-10"
                      animate={{
                        textShadow: [
                          "0 0 0px rgba(255,255,255,0)",
                          "0 0 8px rgba(255,255,255,0.2)",
                          "0 0 0px rgba(255,255,255,0)"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Explore Collection
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{
                        duration: 0.4,
                        originX: 0,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    />
                  </Link>
                </motion.div>

                <motion.button
                  className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold text-base hover:bg-white hover:text-black transition-all duration-500"
                  whileHover={{
                    scale: 1.08,
                    y: -2,
                    backgroundColor: "rgba(255,255,255,1)",
                    color: "rgba(0,0,0,1)",
                    boxShadow: "0 15px 40px rgba(255,255,255,0.25)",
                    borderColor: "rgba(255,255,255,1)"
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                >
                  <motion.span
                    animate={{
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Watch Story
                  </motion.span>
                </motion.button>
              </motion.div>

              {/* Enhanced Stats with Animations */}
              <motion.div
                className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-6 max-w-full"
                variants={staggerContainer}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              >
                <motion.div
                  className="text-center"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400"
                    animate={{
                      scale: [1, 1.1, 1],
                      textShadow: [
                        "0 0 0px rgba(248, 113, 113, 0)",
                        "0 0 20px rgba(248, 113, 113, 0.5)",
                        "0 0 0px rgba(248, 113, 113, 0)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    100%
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Natural</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400"
                    animate={{
                      scale: [1, 1.1, 1],
                      textShadow: [
                        "0 0 0px rgba(251, 146, 60, 0)",
                        "0 0 20px rgba(251, 146, 60, 0.5)",
                        "0 0 0px rgba(251, 146, 60, 0)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    0
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Chemicals</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400"
                    animate={{
                      scale: [1, 1.1, 1],
                      textShadow: [
                        "0 0 0px rgba(251, 191, 36, 0)",
                        "0 0 20px rgba(251, 191, 36, 0.5)",
                        "0 0 0px rgba(251, 191, 36, 0)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  >
                    High
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Protein</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Right Visual */}
            <motion.div
              className="relative home-content lg:block"
              variants={slideInRight}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              {/* Main Product Container */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Enhanced Multi-layer Glowing Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl blur-3xl opacity-40"
                  animate={{
                    opacity: [0.4, 0.6, 0.4],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-3xl blur-2xl opacity-20"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [0, 5, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Enhanced Product Image Container */}
                <motion.div
                  className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl p-4 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Enhanced Inner glow */}
                  <motion.div
                    className="absolute inset-4 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-yellow-500/30 rounded-2xl blur-sm"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Enhanced Image Container */}
                  <motion.div
                    className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {/* Enhanced Makhana Image */}
                    <motion.img
                      src={makhanaImage}
                      alt="Pinaka Premium Makhana"
                      className="relative z-10 w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] object-contain p-4 sm:p-6"
                      style={{
                        filter: 'brightness(1.2) contrast(1.1) saturate(1.3) drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                        mixBlendMode: 'normal'
                      }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 2, 0]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        filter: 'brightness(1.3) contrast(1.2) saturate(1.4) drop-shadow(0 25px 50px rgba(0,0,0,0.4))'
                      }}
                    />

                    {/* Enhanced highlighting overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 via-transparent to-orange-500/15 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-400/10 to-transparent pointer-events-none"></div>

                    {/* Enhanced Spotlight effect */}
                    <motion.div
                      className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-3xl pointer-events-none"
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Enhanced Floating Cards with Sophisticated Animations */}
                <motion.div
                  className="absolute top-4 -left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-red-200 hidden lg:block"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, 0],
                    borderColor: ["rgb(254 202 202)", "rgb(252 165 165)", "rgb(254 202 202)"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgb(248 113 113)",
                    boxShadow: "0 25px 50px rgba(239, 68, 68, 0.3)"
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: -50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      ₹199
                    </motion.div>
                    <div className="text-xs text-gray-700 font-semibold uppercase tracking-wider">Premium Quality</div>
                  </div>
                  {/* Enhanced glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl blur-lg -z-10"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                <motion.div
                  className="absolute -bottom-8 -right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-5 shadow-2xl hidden lg:block"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -2, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  whileHover={{
                    scale: 1.15,
                    boxShadow: "0 25px 50px rgba(34, 197, 94, 0.4)"
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 2.5, duration: 0.8 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full shadow-lg"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                    <div className="font-bold text-sm uppercase tracking-wider">Farm Fresh</div>
                  </div>
                  {/* Enhanced Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-2xl blur-lg -z-10"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                {/* Enhanced Additional highlighting element */}
                <motion.div
                  className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full p-3 shadow-xl hidden lg:block"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0],
                    boxShadow: [
                      "0 10px 25px rgba(251, 191, 36, 0.3)",
                      "0 15px 35px rgba(251, 191, 36, 0.5)",
                      "0 10px 25px rgba(251, 191, 36, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 3, duration: 0.8 }}
                >
                  <div className="text-xs font-bold">100% Natural</div>
                </motion.div>
              </motion.div>

              {/* Enhanced Floating Background Elements */}
              <motion.div
                className="absolute top-1/4 -right-12"
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-30 blur-sm"></div>
              </motion.div>
              <motion.div
                className="absolute bottom-1/4 -left-12"
                animate={{
                  y: [0, 15, 0],
                  x: [0, -8, 0],
                  rotate: [0, -180, -360]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full opacity-40 blur-sm"></div>
              </motion.div>
              <motion.div
                className="absolute top-1/2 right-4"
                animate={{
                  y: [0, -12, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-25 blur-sm"></div>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white z-20 w-full flex justify-center"
          animate={{
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          <div className="flex flex-col items-center space-y-2 mx-auto">
            <span className="text-xs sm:text-sm uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-white rounded-full mt-2"
                animate={{
                  y: [0, 10, 0],
                  opacity: [1, 0.3, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Enhanced Products Section */}
      <motion.section
        ref={productsRef}
        id="products"
        className="products-section py-16 px-8 relative overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Enhanced Background Pattern */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 opacity-60"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ backgroundSize: "400% 400%" }}
        />

        {/* Enhanced Scattered Makhana-like Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none w-full">
          {/* Large floating shapes with enhanced animations */}
          <motion.div
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-25"
            animate={{
              y: [0, 15, 0],
              x: [0, -10, 0],
              scale: [1, 1.1, 1],
              opacity: [0.25, 0.5, 0.25]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-15"
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full opacity-30"
            animate={{
              y: [0, -18, 0],
              x: [0, 8, 0],
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          {/* Medium scattered shapes */}
          <div className="absolute top-60 left-1/4 w-8 h-8 bg-gradient-to-br from-red-300 to-orange-300 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-32 right-1/3 w-10 h-10 bg-gradient-to-br from-yellow-300 to-red-300 rounded-full opacity-25 animate-bounce delay-700"></div>
          <div className="absolute bottom-60 left-1/2 w-6 h-6 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-30 animate-bounce delay-1200"></div>
          
          {/* Small decorative dots */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-300 rounded-full opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-300 rounded-full opacity-25"></div>
          <div className="absolute top-1/2 left-1/6 w-5 h-5 bg-yellow-300 rounded-full opacity-15"></div>
          
          {/* Geometric patterns */}
          <div className="absolute top-1/3 right-1/6 w-12 h-12 border-2 border-orange-200 rounded-full opacity-20 animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-8 h-8 border border-red-200 rotate-45 opacity-25"></div>
        </div>

        <div className="container mx-auto relative z-10 home-content">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="visible"
            animate="visible"
          >
            <motion.h2
              className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4"
              variants={fadeInUp}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                backgroundPosition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Pinaka Makhana Collection
            </motion.h2>
            <motion.p
              className="text-gray-600 text-lg max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Discover our premium range of roasted makhana - healthy, delicious, and crafted with love for your well-being
            </motion.p>
          </motion.div>

          {/* Enhanced Product Grid with Staggered Animations */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-full"
            variants={staggerContainer}
            initial="visible"
            animate="visible"
          >
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="w-full flex"
                variants={scaleIn}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <ModernProductCard
                  product={product}
                  onAddToCart={(product, quantity) => handleAddToCart(product, quantity)}
                  loading={isLoading && activeProductId === product.id}
                  className="w-full flex flex-col transform transition-all duration-300 hover:z-10"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Show More Products Button */}
          {products.length > 0 && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={productsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to="/products"
                  className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-600 hover:from-red-600 hover:via-red-700 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  style={{
                    boxShadow: '0 15px 35px -5px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  {/* Enhanced Button Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />

                  <span className="relative z-10 mr-3">Explore All Products</span>
                  <motion.svg
                    className="relative z-10 w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>

                  {/* Enhanced Floating particles effect */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </Link>
              </motion.div>

              {/* Enhanced info text */}
              <motion.p
                className="mt-4 text-gray-600 text-sm"
                initial={{ opacity: 0 }}
                animate={productsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                Discover our complete collection of premium makhana varieties
              </motion.p>
            </motion.div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;