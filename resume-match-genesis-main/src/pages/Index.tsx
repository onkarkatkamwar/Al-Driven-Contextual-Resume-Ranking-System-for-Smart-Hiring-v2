
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero />
      
      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How ResumeMatch Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our AI-powered system analyzes resumes against job descriptions to find the perfect match.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 shadow-lg">
              <div className="text-brand-blue text-4xl mb-4">01</div>
              <h3 className="text-xl font-bold text-gray-900">Upload Job Description</h3>
              <p className="mt-2 text-gray-500">
                HR managers upload job descriptions to set the benchmark for candidate evaluation.
              </p>
            </Card>

            <Card className="p-6 shadow-lg">
              <div className="text-brand-blue text-4xl mb-4">02</div>
              <h3 className="text-xl font-bold text-gray-900">Submit Resumes</h3>
              <p className="mt-2 text-gray-500">
                Job seekers upload their resumes to be matched against job requirements.
              </p>
            </Card>

            <Card className="p-6 shadow-lg">
              <div className="text-brand-blue text-4xl mb-4">03</div>
              <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
              <p className="mt-2 text-gray-500">
                Our AI analyzes skills, experience, soft skills, and adaptability to generate a comprehensive score.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Trusted by Leading Companies</h2>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 grayscale opacity-70">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" alt="Amazon" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/AT%26T_logo.svg/2560px-AT%26T_logo.svg.png" alt="AT&T" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/2560px-Walmart_logo.svg.png" alt="Walmart" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/FedEx_Express.svg/2560px-FedEx_Express.svg.png" alt="FedEx" className="h-8" />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-brand-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Start Matching Today</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
            Join thousands of HR professionals and job seekers using ResumeMatch.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" className="text-brand-blue">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold">ResumeMatch</span>
              <p className="mt-2 text-gray-400">AI-powered recruitment simplified</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">About</a>
              <a href="#" className="text-gray-400 hover:text-white">Features</a>
              <a href="#" className="text-gray-400 hover:text-white">Pricing</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 ResumeMatch. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400">Privacy Policy • Terms of Service</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
