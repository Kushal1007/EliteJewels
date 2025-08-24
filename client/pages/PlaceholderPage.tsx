import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="max-w-md mx-auto text-center px-4">
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                <Construction className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
              <p className="text-gray-600 mb-6">{description}</p>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  This page is ready to be customized with your content.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  <Button className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600">
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
