import { Button } from "@/components/ui/button";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <HitsLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary">
              <Link to="/programs">Programs</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to="/auth">
                <HitsMonogram className="h-6 w-6 mr-2" />
                App Login
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-12">Last Updated: January 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us when you create an account, upload videos for swing analysis, 
              or interact with our coaching platform. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name, email address, and contact information</li>
              <li>Training videos and performance data</li>
              <li>Payment and billing information</li>
              <li>Usage data and platform interactions</li>
              <li>Device information and IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide personalized swing analysis and coaching feedback</li>
              <li>Process your payments and manage your subscription</li>
              <li>Send you updates about your training progress and new features</li>
              <li>Improve our AI analysis algorithms and platform performance</li>
              <li>Communicate with you about your account and support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information and training data. 
              Your videos and performance metrics are stored securely and are only accessible to you and authorized coaches 
              working directly with you. We use encryption for data transmission and secure cloud storage infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your data only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With coaches you've been assigned to or have requested coaching from</li>
              <li>With service providers who help us operate our platform (payment processors, cloud storage)</li>
              <li>If required by law or to protect our legal rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access, update, or delete your personal information</li>
              <li>Export your training data and video analyses</li>
              <li>Opt-out of marketing communications</li>
              <li>Cancel your subscription at any time</li>
              <li>Request information about how we use your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve your experience on our platform, analyze usage patterns, 
              and personalize content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
            <p>
              Our platform is designed for athletes of all ages. For users under 18, we require parental consent and 
              take additional measures to protect minors' data in compliance with COPPA regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes via 
              email or through the platform. Your continued use of HITS after changes are made constitutes acceptance 
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:privacy@thehittingskool.com" className="text-primary hover:underline">privacy@thehittingskool.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <HitsMonogram className="h-8 w-8" />
              <p className="text-sm text-gray-400">
                © 2025 The Hitting Skool. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <Link to="/terms">Terms</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <a href="mailto:support@thehittingskool.com">Support</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
