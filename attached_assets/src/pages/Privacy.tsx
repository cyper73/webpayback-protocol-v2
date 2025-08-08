import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-8" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              WebPayback Protocol ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our platform and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-medium mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address for beta registration</li>
              <li>Wallet addresses for blockchain interactions</li>
              <li>Profile information you provide</li>
              <li>Content metadata and verification data</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-2">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage patterns and analytics</li>
              <li>Blockchain transaction data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>Provide and maintain our services</li>
              <li>Process creator verification and compensation</li>
              <li>Communicate with you about updates and features</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist our operations</li>
              <li>In connection with business transfers or mergers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or destruction. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Erase your personal data under certain circumstances</li>
              <li>Restrict processing of your personal data</li>
              <li>Data portability</li>
              <li>Object to processing of your personal data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and improve our services. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-none mt-4">
              <li>Email: privacy@webpayback.com</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}