import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">About QuickMart-BH</h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Welcome to QuickMart-BH, your premier online shopping destination in the Kingdom of Bahrain.
            Founded with a vision to revolutionize the e-commerce experience in Bahrain, we are committed
            to providing our customers with quality products, competitive prices, and exceptional service.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Since our inception, we have been dedicated to offering a diverse range of products across
            multiple categories including electronics, fashion, accessories, and beauty products. Our
            team carefully curates each item to ensure it meets our high standards of quality and value.
          </p>
          <p className="text-gray-700 leading-relaxed">
            What sets us apart is our commitment to fast delivery across Bahrain, secure payment options,
            and customer-first approach. We understand the needs of our Bahraini customers and strive to
            exceed their expectations with every order.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Authentic Products</h3>
              <p className="text-gray-700 text-sm">
                All our products are 100% genuine and sourced from authorized suppliers and manufacturers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-700 text-sm">
                Quick and reliable delivery service across all areas of Bahrain, ensuring your orders arrive on time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
              <p className="text-gray-700 text-sm">
                Multiple secure payment options including PayPal and Stripe for your peace of mind.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
              <p className="text-gray-700 text-sm">
                Our dedicated support team is always ready to assist you with any questions or concerns.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Our Location & Contact</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Our Address</h3>
                <p className="text-gray-700">
                  QuickMart-BH Headquarters<br />
                  Building 456, Road 789<br />
                  Block 123, Manama<br />
                  Kingdom of Bahrain
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-gray-700">+973 1234 5678</p>
                <p className="text-gray-700">+973 9876 5432 (WhatsApp)</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-gray-700">QuickMart-BH@gmail.com</p>
                <p className="text-gray-700">support@quickmart-bh.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <p className="text-gray-700">Sunday - Thursday: 9:00 AM - 8:00 PM</p>
                <p className="text-gray-700">Friday - Saturday: 10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Find Us on the Map</h3>
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115681.93400473669!2d50.48219885!3d26.066700000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e5c1b8cb1111%3A0x9d3e2e5f5f5f5f5f!2sManama%2C%20Bahrain!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="QuickMart-BH Location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
