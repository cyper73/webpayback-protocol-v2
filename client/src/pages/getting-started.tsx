import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Coins, 
  Shield, 
  FileText, 
  Globe, 
  Bookmark, 
  Trophy,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";

export default function GettingStarted() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coins className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Getting Started with WebPayback Protocol</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Learn how to protect your content from AI scraping and earn WPT tokens when AI systems use your work
        </p>
      </div>

      {/* What is WebPayback Protocol */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            What is WebPayback Protocol Token (WPT)?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            WebPayback Protocol Token (WPT) is a revolutionary blockchain-based solution that automatically rewards content creators 
            when AI systems use their work. Built on Polygon network, WPT creates a fair economy where creators are compensated 
            for their intellectual property.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Anti-AI Scraping</h4>
                <p className="text-xs text-muted-foreground">Protect your content from unauthorized AI usage</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Coins className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Automatic Rewards</h4>
                <p className="text-xs text-muted-foreground">Earn WPT tokens when AI systems use your content</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">NFT Certificates</h4>
                <p className="text-xs text-muted-foreground">Blockchain-verified content ownership</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            How to Register on the Platform
          </CardTitle>
          <CardDescription>
            Follow these simple steps to start protecting your content and earning WPT tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-2">Domain Verification</h4>
                <p className="text-muted-foreground mb-3">
                  Verify ownership of your website or content domain to establish authenticity.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md border">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Add this meta tag to your website's &lt;head&gt; section:</p>
                  <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                    &lt;meta name="webpayback-verification" content="your-verification-code" /&gt;
                  </code>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-2">Creator Profile Setup</h4>
                <p className="text-muted-foreground mb-3">
                  Complete your creator profile with relevant information about your content and channels.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border mb-3">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Required Information:</h5>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Website URL verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Content category selection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Social media links (optional)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-800 dark:text-gray-200">Polygon wallet address for rewards</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Important:</strong> Make sure your wallet is connected to Polygon network to receive WPT token rewards automatically.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-2">Start Earning WPT</h4>
                <p className="text-muted-foreground">
                  Once verified, your content is automatically monitored. Earn WPT tokens when AI systems access your work.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Tags and NFT Integration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-orange-500" />
            Meta Tags and NFT Content Certificates
          </CardTitle>
          <CardDescription>
            Advanced protection through blockchain-verified content ownership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Tags Section */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Enhanced Meta Tags Protection
            </h4>
            <p className="text-muted-foreground mb-4">
              Add these advanced meta tags to your content pages for enhanced AI detection and protection:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Basic Protection Meta Tag:</p>
                <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                  &lt;meta name="webpayback-protection" content="enabled" /&gt;
                </code>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Content Fingerprint Meta Tag:</p>
                <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                  &lt;meta name="webpayback-fingerprint" content="sha256-a1b2c3d4e5f6..." /&gt;
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Replace with actual SHA-256 hash of your content
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Creator Attribution Meta Tag:</p>
                <code className="text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border block font-mono">
                  &lt;meta name="webpayback-creator" content="creator-12345" /&gt;
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Use your unique Creator ID from the platform
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* NFT Certificates Section */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              NFT Content Certificates
            </h4>
            <p className="text-muted-foreground mb-4">
              Mint blockchain certificates for your most valuable content to establish permanent ownership records.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">What are Content Certificate NFTs?</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Blockchain-verified ownership certificates</li>
                  <li>• SHA-256 content fingerprints</li>
                  <li>• Immutable timestamp records</li>
                  <li>• Legal proof of content creation</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold mb-2">Benefits of NFT Certificates</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Enhanced WPT reward rates</li>
                  <li>• Legal protection against content theft</li>
                  <li>• Priority in dispute resolution</li>
                  <li>• Tradeable ownership certificates</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            Ready to Get Started?
          </CardTitle>
          <CardDescription>
            Access the main platform features to start protecting your content today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/creators">
              <Button className="w-full h-12 flex items-center gap-2" variant="default">
                <Globe className="h-4 w-4" />
                Register as Creator
              </Button>
            </Link>
            
            <Link href="/content-certificate">
              <Button className="w-full h-12 flex items-center gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                Mint NFT Certificate
              </Button>
            </Link>
            
            <Link href="/automation">
              <Button className="w-full h-12 flex items-center gap-2" variant="outline">
                <Shield className="h-4 w-4" />
                Auto Pool Manager
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              No upfront costs - earn while you protect
            </Badge>
            
            <a 
              href="https://github.com/cyper73/webpayback-protocol/tree/webpayback" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View Documentation
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}