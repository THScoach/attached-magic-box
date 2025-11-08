import { Button } from "@/components/ui/button";
import { HitsLogo, HitsMonogram } from "@/components/HitsLogo";
import { Link } from "react-router-dom";

export default function Terms() {
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
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-12">Last Updated: January 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the HITS (Hitting Intelligence Training System) platform, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all 
              users, including athletes, coaches, parents, and organizations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <p className="mb-4">
              HITS provides baseball and softball swing analysis, training programs, and coaching services through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI-powered video analysis of hitting mechanics</li>
              <li>Personalized training programs and drill libraries</li>
              <li>Performance tracking and progress analytics</li>
              <li>Live coaching sessions and feedback</li>
              <li>Educational content and resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
            <p className="mb-4">
              To use HITS, you must create an account and provide accurate information. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring you meet the age requirements or have parental consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Payment</h2>
            <p className="mb-4">HITS offers various subscription tiers and one-time programs:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Free Tier:</strong> Basic tempo score analysis with limited features</li>
              <li><strong>Paid Subscriptions:</strong> Recurring monthly or annual billing</li>
              <li><strong>Premium Programs:</strong> One-time payment for intensive coaching programs</li>
            </ul>
            <p className="mt-4">
              All fees are non-refundable except as required by law or as specified in our refund policy. 
              You may cancel subscriptions at any time, effective at the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Performance Guarantee (90-Day Program)</h2>
            <p className="mb-4">
              Our 90-Day Transformation program includes a +5 MPH exit velocity guarantee, subject to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Complete adherence to the prescribed training program</li>
              <li>Submission of all required video analyses and check-ins</li>
              <li>Active participation in scheduled coaching sessions</li>
              <li>Baseline and final measurements conducted properly</li>
            </ul>
            <p className="mt-4">
              Refunds are provided only if performance criteria are not met AND program requirements are fulfilled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Content Ownership and License</h2>
            <p className="mb-4">
              <strong>Your Content:</strong> You retain ownership of videos and data you upload. By uploading content, 
              you grant HITS a license to use, analyze, and store it to provide services and improve our platform.
            </p>
            <p>
              <strong>Our Content:</strong> All training materials, analysis algorithms, drill videos, and educational 
              content are proprietary to HITS and protected by copyright. You may not reproduce, distribute, or create 
              derivative works without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Share your account credentials with others</li>
              <li>Upload content that infringes on others' rights</li>
              <li>Attempt to reverse engineer or copy our technology</li>
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Harass, abuse, or harm other users or coaches</li>
              <li>Distribute or resell our content without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Medical Disclaimer</h2>
            <p>
              HITS provides athletic training guidance, not medical advice. Our analysis and recommendations are for 
              educational and performance purposes only. Consult with medical professionals before starting any training 
              program, especially if you have existing injuries or health conditions. We are not liable for injuries 
              sustained during training.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p>
              HITS and its coaches are not liable for indirect, incidental, or consequential damages arising from use of 
              the platform. Our total liability for any claim is limited to the amount you paid for services in the 
              past 12 months. We do not guarantee specific performance improvements or results, except as explicitly 
              stated in our performance guarantee program.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <p className="mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate these Terms of Service</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent or abusive behavior</li>
              <li>Request account deletion</li>
            </ul>
            <p className="mt-4">
              Upon termination, your access to the platform ends immediately. We may retain certain data as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Material changes will be communicated 
              via email or platform notification. Continued use after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
            <p>
              These terms are governed by the laws of the United States and the state in which our business operates. 
              Any disputes will be resolved through binding arbitration in accordance with applicable arbitration rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:legal@thehittingskool.com" className="text-primary hover:underline">legal@thehittingskool.com</a><br />
              <strong>Support:</strong> <a href="mailto:support@thehittingskool.com" className="text-primary hover:underline">support@thehittingskool.com</a>
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
              <div>
                <p className="text-sm text-gray-400">
                  © 2025 The Hitting Skool. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  All programs managed through GoHighLevel and Coachly platforms.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-sm">
                <Link to="/privacy">Privacy</Link>
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
