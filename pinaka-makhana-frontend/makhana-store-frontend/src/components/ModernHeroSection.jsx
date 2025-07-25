import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Award, Truck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../images/hero-banner.jpg';
import makhanaImage from '../images/makhana.png';

const ModernHeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Premium Makhana Collection",
      subtitle: "Crafted with Love, Delivered Fresh",
      description: "Experience the finest quality makhana (fox nuts) sourced directly from the pristine waters of Bihar. Each bite delivers nutrition, taste, and tradition.",
      cta: "Shop Now",
      image: heroImage
    },
    {
      title: "100% Natural & Healthy",
      subtitle: "Zero Artificial Preservatives",
      description: "Our makhana is naturally processed, gluten-free, and packed with protein. Perfect for health-conscious snacking at any time of the day.",
      cta: "Explore Products",
      image: makhanaImage
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "Handpicked from Bihar's finest farms"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Fresh products delivered to your doorstep"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "100% natural with no artificial additives"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Main Hero Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 lg:px-8 pt-24 pb-16"
        style={{ y, opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Text Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="flex items-center space-x-2 text-primary-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">
                Premium Snacking Experience
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              key={currentSlide}
            >
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {heroSlides[currentSlide].title.split(' ')[0]}
              </span>{' '}
              <br />
              {heroSlides[currentSlide].title.split(' ').slice(1).join(' ')}
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-600 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              key={`subtitle-${currentSlide}`}
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            <motion.p 
              className="text-lg text-gray-600 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              key={`description-${currentSlide}`}
            >
              {heroSlides[currentSlide].description}
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/products">
                <motion.button 
                  className="group bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{heroSlides[currentSlide].cta}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
              
              <Link to="/about">
                <motion.button 
                  className="border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>

            {/* Slide Indicators */}
            <motion.div 
              className="flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="relative z-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <img 
                src={heroSlides[currentSlide].image} 
                alt="Premium Makhana"
                className="w-full h-auto max-w-lg mx-auto rounded-3xl shadow-2xl"
                key={`image-${currentSlide}`}
              />
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-6 -right-6 bg-accent-500 text-white p-4 rounded-2xl shadow-lg"
              animate={{ rotate: [0, 5, 0], y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Award className="w-8 h-8" />
            </motion.div>

            <motion.div 
              className="absolute -bottom-6 -left-6 bg-primary-500 text-white p-4 rounded-2xl shadow-lg"
              animate={{ rotate: [0, -5, 0], y: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-3xl blur-3xl -z-10 scale-110" />
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 lg:px-8 pb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-primary-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

export default ModernHeroSection;