import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-8" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using WebPayback Protocol ("the Service"), you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              WebPayback Protocol is a platform that enables content creators to receive compensation 
              when AI systems utilize their work. The Service includes creator verification, 
              content monitoring, and automatic payment distribution.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Creator Verification</h2>
            <p className="mb-4">
              To participate as a creator, you must:
            </p>
            <ul className="list-disc pl-6">
              <li>Prove ownership of content you wish to register</li>
              <li>Provide accurate information about your content</li>
              <li>Comply with platform-specific terms of service</li>
              <li>Maintain active ownership of registered content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
            <p className="mb-4">You may not use the Service:</p>
            <ul className="list-disc pl-6">
              <li>For any unlawful purpose or to solicit unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations or laws</li>
              <li>To infringe upon or violate intellectual property rights</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload viruses or malicious code</li>
              <li>To attempt to gain unauthorized access to the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
            <p>
              Compensation payments are processed through blockchain transactions. 
              Payment amounts are calculated based on detected AI usage and platform algorithms. 
              We reserve the right to modify payment structures with notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain 
              the exclusive property of WebPayback Protocol and its licensors. The Service is protected 
              by copyright, trademark, and other laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations 
              or warranties of any kind, express or implied, as to the operation of the Service or the 
              information, content, materials, or products included on the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              WebPayback Protocol will not be liable for any damages of any kind arising from the use 
              of the Service, including but not limited to direct, indirect, incidental, punitive, 
              and consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul className="list-none mt-4">
              <li>Email: legal@webpayback.com</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}