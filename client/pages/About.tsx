import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Star, MessageCircle } from 'lucide-react';
import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-yellow-600">EliteJewels</span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            For over 25 years, EliteJewels has been India's trusted destination for authentic,
            handcrafted jewelry. We combine traditional artistry with modern designs to create
            pieces that celebrate life's most precious moments.
          </p>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-gray-600 text-lg">
              Our commitment to quality, authenticity, and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">916 Hallmark Certified</h3>
                <p className="text-gray-600">Every piece is certified pure gold and silver with government-approved hallmarking.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Handcrafted with Love</h3>
                <p className="text-gray-600">Our skilled artisans create each piece with passion and attention to detail.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer First</h3>
                <p className="text-gray-600">Your satisfaction is our priority. We're here to help you find the perfect piece.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Quality */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose EliteJewels?</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">25+</div>
              <p className="text-gray-600">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">10K+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">500+</div>
              <p className="text-gray-600">Unique Designs</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">4.9/5</div>
              <p className="text-gray-600">Customer Rating</p>
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            We only deal with <strong>916 hallmark ornaments</strong>, ensuring you get authentic,
            high-quality gold and silver that retains its value and purity.
          </p>

          <Button
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact Us Today
          </Button>
        </div>
      </section>
    </Layout>
  );
}
