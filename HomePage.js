import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Clock, TrendingUp, Brain, Star, Zap, Users, Award } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Daily Planner",
      description: "Intelligent scheduling based on your priorities and energy levels",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <CheckSquare className="w-8 h-8" />,
      title: "Smart Task Manager",
      description: "Break down complex goals into achievable steps with AI",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Focus Timer",
      description: "Adaptive Pomodoro timer with distraction blocking",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Habit Builder",
      description: "Build productive habits with streak tracking and rewards",
      color: "from-orange-500 to-red-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Free Forever",
      price: "$0",
      description: "Access to basic features",
      features: [
        "Basic Task Management",
        "Simple Focus Timer",
        "Habit Tracking",
        "Basic Notes",
        "Ad-supported"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Premium",
      price: "Watch Ad",
      description: "Unlock 24-hour premium access",
      features: [
        "AI Daily Planning",
        "Unlimited Task Breakdown",
        "Advanced Analytics",
        "Team Collaboration",
        "Offline Mode",
        "Custom Themes",
        "Priority Support"
      ],
      cta: "Unlock Premium",
      highlighted: true
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 opacity-90"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
        
        <div className="relative container mx-auto px-4 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Supercharge Your Productivity with
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
                DailyWork AI
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              An intelligent productivity platform that's free forever. 
              Unlock premium features by watching short ads instead of paying subscriptions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
              >
                Start Free Today
              </Link>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                Watch Demo Video
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Access premium productivity tools without subscriptions
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: "1", title: "Sign Up Free", desc: "Create your free account in seconds" },
              { step: "2", title: "Use Basic Features", desc: "Access all essential productivity tools" },
              { step: "3", title: "Watch Short Ad", desc: "30-second ad unlocks 24h premium" },
              { step: "4", title: "Enjoy Premium", desc: "Full access to AI features and analytics" }
            ].map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">AI-Powered Features</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to master your productivity
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Fair & Transparent Pricing</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Pay with your attention, not your wallet
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${plan.highlighted ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white transform scale-105' : 'bg-white'}`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.name === "Premium" && (
                    <span className="text-lg opacity-90"> / 24 hours</span>
                  )}
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckSquare className={`w-5 h-5 mr-3 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={plan.highlighted ? "/premium" : "/auth"}
                  className={`block w-full py-4 text-center rounded-xl font-bold text-lg transition-all ${
                    plan.highlighted
                      ? 'bg-white text-purple-700 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-600 mt-8">
            Average user watches 1.5 ads per day • That's just 45 seconds for premium features
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-white/80">Tasks Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-white/80">Ad Views</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Productivity</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Productivity?</h2>
          <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are achieving more with DailyWork AI
          </p>
          <Link
            to="/auth"
            className="inline-block px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Start Your Free Journey
          </Link>
          <p className="text-gray-500 mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;