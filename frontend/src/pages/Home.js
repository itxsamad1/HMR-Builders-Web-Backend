import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowRight, TrendingUp, Shield, Users, Building2, Star } from 'lucide-react';
import { propertiesAPI } from '../services/api';
import Layout from '../components/Layout/Layout';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);

  const handleInvest = (property) => {
    navigate(`/wallet?buyTokens=1&propertyId=${property.id}`);
  };

  // Fetch featured properties
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    'featured-properties',
    () => propertiesAPI.getFeatured(),
    {
      onSuccess: (data) => {
        // Handle both old and new API response formats
        const properties = data.data?.properties || data.properties || [];
        setFeaturedProperties(properties);
      },
    }
  );

  const stats = [
    {
      icon: Building2,
      value: '50+',
      label: 'Properties Listed',
      description: 'Diverse real estate portfolio',
    },
    {
      icon: Users,
      value: '1,200+',
      label: 'Active Investors',
      description: 'Growing community',
    },
    {
      icon: TrendingUp,
      value: '12.5%',
      label: 'Average ROI',
      description: 'Proven returns',
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Secure Platform',
      description: 'Bank-grade security',
    },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Fractional Ownership',
      description: 'Own a piece of premium real estate with as little as PKR 10,000',
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Earn rental income and capital appreciation on your investments',
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Blockchain-based tokenization ensures transparency and security',
    },
    {
      icon: Users,
      title: 'Expert Management',
      description: 'Professional property management for hassle-free investing',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Invest in Real Estate
              <span className="block text-primary-200">Without the Hassle</span>
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 mb-8 leading-relaxed">
              Own fractional shares of premium properties in Pakistan. Start investing with as little as PKR 10,000 and earn rental income plus capital appreciation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
                as={Link}
                to="/properties"
              >
                Browse Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-600"
                as={Link}
                to="/register"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-600">Handpicked premium real estate opportunities</p>
          </div>
          <Button variant="outline" as={Link} to="/properties">
            View All Properties
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 3).map((property) => {
              // Debug: Log the property data
              console.log('Property data in Home:', property);
              return <PropertyCard key={property.id} property={property} onInvest={handleInvest} />;
            })}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HMR Builders?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We make real estate investing accessible, transparent, and profitable for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Start Investing?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of investors who are already earning returns from real estate without the traditional barriers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-100"
            as={Link}
            to="/register"
          >
            Create Free Account
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary-600"
            as={Link}
            to="/properties"
          >
            Browse Properties
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
