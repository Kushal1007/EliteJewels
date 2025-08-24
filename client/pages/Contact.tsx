import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  ShoppingCart, 
  Search, 
  Copy, 
  Send, 
  CheckCircle,
  Facebook,
  Instagram,
  Twitter,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function Contact() {
  const orderingSteps = [
    {
      icon: Search,
      title: "Choose Your Product",
      description: "Browse our collections and find the perfect piece from our Gold, Silver, or featured sections."
    },
    {
      icon: Copy,
      title: "Note the Product Code",
      description: "Each product has a unique code (R0001 for rings, C0001 for chains, etc.). Copy this code for easy ordering."
    },
    {
      icon: Send,
      title: "Send via WhatsApp",
      description: "Click the WhatsApp button or send us the product code directly to +91 98765 43210."
    },
    {
      icon: CheckCircle,
      title: "Confirm Details",
      description: "We'll confirm the weight, current gold/silver rates, final pricing, and customization options."
    },
    {
      icon: ShoppingCart,
      title: "Finalize Your Order",
      description: "Complete payment and provide delivery details. We'll keep you updated throughout the process."
    }
  ];

  const contactDetails = [
    {
      icon: Phone,
      title: "Phone Number",
      value: "+91 98765 43210",
      action: "tel:+919876543210"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+91 98765 43210",
      action: "https://wa.me/919876543210"
    },
    {
      icon: Mail,
      title: "Email",
      value: "info@elitejewels.com",
      action: "mailto:info@elitejewels.com"
    },
    {
      icon: MapPin,
      title: "Store Location",
      value: "123 Jewellery Street, Mumbai, Maharashtra 400001",
      action: "https://maps.google.com/?q=123+Jewellery+Street+Mumbai"
    }
  ];

  const socialLinks = [
    { icon: Instagram, name: "Instagram", url: "https://instagram.com/elitejewels", handle: "@elitejewels" },
    { icon: Facebook, name: "Facebook", url: "https://facebook.com/elitejewels", handle: "EliteJewels" },
    { icon: Twitter, name: "Twitter", url: "https://twitter.com/elitejewels", handle: "@elitejewels" }
  ];

  const faqItems = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our collections, note the product code, and send it to us via WhatsApp at +91 98765 43210. We'll guide you through the rest of the process including weight confirmation and pricing."
    },
    {
      question: "Are all your ornaments hallmarked?",
      answer: "Yes, we only deal with 916 hallmark gold ornaments. Every piece comes with proper certification ensuring authenticity and purity. Our silver items are also certified for quality."
    },
    {
      question: "What are your delivery options?",
      answer: "We offer secure delivery across India. Delivery time varies by location - typically 3-7 business days for major cities. We provide tracking details and insurance for all shipments."
    },
    {
      question: "Do you accept returns?",
      answer: "Yes, we have a 7-day return policy for unused items in original condition. Custom-made pieces are generally non-returnable unless there's a manufacturing defect."
    },
    {
      question: "Can I customize the weight of jewellery?",
      answer: "Absolutely! Most of our designs can be made in different weights. The minimum weight is mentioned for each product, and we can adjust according to your requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept bank transfers, UPI, cards, and cash on delivery (for select locations). Payment details will be shared once your order is confirmed."
    }
  ];

  const openWhatsApp = () => {
    const message = "Hi! I'm interested in placing an order. Could you please help me with the process?";
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Ready to find your perfect piece? We're here to help!
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* How to Order Section */}
          <section className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">How to Place an Order</CardTitle>
                <p className="text-gray-600 text-lg">Follow these simple steps to get your dream jewellery</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {orderingSteps.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <step.icon className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8 pt-8 border-t border-gray-200">
                  <Button 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                    onClick={openWhatsApp}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Order via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Details */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Get in Touch</CardTitle>
                  <p className="text-gray-600">Multiple ways to reach us</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactDetails.map((contact, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <contact.icon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{contact.title}</h3>
                        <p className="text-gray-600 mb-2">{contact.value}</p>
                        <a 
                          href={contact.action}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                        >
                          {contact.title === "Email" ? "Send Email" :
                           contact.title === "Store Location" ? "View on Map" :
                           "Contact Now"}
                        </a>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support Hours & Map */}
              <div className="space-y-8">
                {/* Support Hours */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <Clock className="w-6 h-6 mr-2 text-yellow-600" />
                      Support Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Monday - Saturday</span>
                        <span className="font-semibold text-gray-900">10:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-semibold text-gray-900">11:00 AM - 6:00 PM</span>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">
                          💬 WhatsApp responses within 30 minutes during business hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Maps */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">Visit Our Store</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8479494994847!2d72.8327!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNDknNTcuNyJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="EliteJewels Store Location"
                      />
                    </div>
                    <p className="text-gray-600 text-sm mt-3">
                      Located in the heart of Mumbai's jewellery district
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">Connect With Us</CardTitle>
                <p className="text-gray-600">Follow us for latest designs and offers</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-6">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-100 transition-colors">
                        <social.icon className="w-6 h-6 text-gray-600 group-hover:text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{social.name}</span>
                      <span className="text-xs text-gray-500">{social.handle}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section>
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">Frequently Asked Questions</CardTitle>
                <p className="text-gray-600">Find answers to common questions</p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-semibold text-gray-900">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-8 p-6 bg-yellow-50 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
                  <p className="text-gray-600 mb-4">Our team is here to help you find the perfect piece</p>
                  <Button 
                    variant="outline" 
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                    onClick={openWhatsApp}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Fixed WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
            onClick={openWhatsApp}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
