import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Pinaka Makhana</span>
            </h1>
            <p className="text-2xl lg:text-3xl font-light text-gray-300 mb-6">
              The Purest Snacking Journey
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-8">
        <div className="container mx-auto max-w-6xl">
          
          {/* Mission Statement */}
          <div className="text-center mb-20">
            <div className="max-w-4xl mx-auto">
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8">
                At Pinaka Makhana, we believe that nature holds the key to incredible health and delicious indulgence. 
                Our journey began with a simple yet profound mission: to bring the authentic goodness of Makhana – 
                the ancient superfood – directly from its pristine source to your everyday life.
              </p>
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-6 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold mb-2">Our Promise</h2>
                <p className="text-xl font-light">Purity, Power, Pinaka.</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Directly From The Source</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We're not just a brand; we're a bridge. Our Makhana is sourced directly from the heartlands 
                    where it's cultivated, ensuring unparalleled freshness and upholding sustainable practices 
                    that respect both nature and traditional communities.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">100% Natural & Organic</h3>
                  <p className="text-gray-600 leading-relaxed">
                    What you see is what you get – and nothing more. Our Makhana is cultivated and processed 
                    with utmost care, free from any artificial additives, preservatives, or chemicals. 
                    It's nature's perfection, delivered just as it's meant to be.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Premium Quality, Every Pop</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We meticulously select only the finest, largest, and most perfectly popped Makhana. 
                    Our stringent quality checks ensure every crunch is light, crispy, and utterly delightful – 
                    a truly premium snacking experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Rich in Nutrients & Antioxidants</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Pinaka Makhana is a powerhouse of essential nutrients. Naturally packed with protein, fiber, 
                    and important minerals, it's the perfect guilt-free snack. Rich antioxidants help combat daily 
                    stresses, promoting overall well-being.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Health Benefits Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Your Best Healthy Choice</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                In a world filled with processed snacks, Pinaka Makhana stands out as a beacon of health. 
                It's naturally gluten-free, low in calories, and incredibly versatile.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-2">🏃‍♂️</div>
                  <h4 className="font-bold text-gray-800">Fitness Enthusiasts</h4>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-2">💼</div>
                  <h4 className="font-bold text-gray-800">Busy Professionals</h4>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-2">👶</div>
                  <h4 className="font-bold text-gray-800">Growing Kids</h4>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-3xl mb-2">❤️</div>
                  <h4 className="font-bold text-gray-800">Health Conscious</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Pinaka */}
          <div className="text-center bg-gradient-to-br from-slate-900 to-gray-900 rounded-3xl p-12 text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">Why Choose Pinaka?</h2>
            <p className="text-xl lg:text-2xl font-light leading-relaxed mb-8 max-w-4xl mx-auto">
              Because we're passionate about bringing you not just a snack, but a tradition of wellness. 
              We celebrate the simplicity and incredible power of this ancient superfood, reimagined for your modern, healthy lifestyle.
            </p>
            <div className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Join the Pinaka Family
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 py-20">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Rediscover Snacking, The Way Nature Intended
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the perfect blend of tradition and innovation with every crunch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Shop Now
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
