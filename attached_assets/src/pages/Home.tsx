import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Brain, 
  DollarSign, 
  Users, 
  Zap, 
  CheckCircle,
  Github,
  ExternalLink
} from 'lucide-react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, this would call an API
    console.log('Subscribing email:', email)
    setSubscribed(true)
    setEmail('')
  }

  const features = [
    {
      icon: Brain,
      title: 'AI Usage Detection',
      description: 'Advanced algorithms detect when your content is used by AI systems'
    },
    {
      icon: DollarSign,
      title: 'Automatic Compensation',
      description: 'Creators receive payments without manual claims'
    },
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Blockchain-based verification system for content ownership'
    },
    {
      icon: Users,
      title: 'Multi-Platform Support',
      description: 'Works across YouTube, Instagram, TikTok, and more'
    }
  ]

  const stats = [
    { label: 'Creators Protected', value: '10,000+' },
    { label: 'AI Detections', value: '1M+' },
    { label: 'Total Compensation', value: '$2.5M+' },
    { label: 'Platforms Supported', value: '15+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">WebPayback</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-primary">Features</a>
            <a href="#stats" className="text-muted-foreground hover:text-primary">Stats</a>
            <a href="#join" className="text-muted-foreground hover:text-primary">Join Beta</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/webpayback/webpayback-protocol" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-4">
              Empowering Creators in the Age of AI
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Fair Compensation
              <br />for Creator Content
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              WebPayback Protocol ensures content creators get fairly compensated when AI systems utilize their work. 
              Building a sustainable creator economy for the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Join Waitlist
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How WebPayback Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our advanced technology stack ensures creators are compensated fairly and automatically
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Creators Worldwide</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of creators already earning with WebPayback
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="join" className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Join the Beta</CardTitle>
              <p className="text-muted-foreground">
                Be among the first creators to experience fair AI compensation
              </p>
            </CardHeader>
            <CardContent>
              {subscribed ? (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">
                    We'll notify you when beta access is available.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit">Join Beta</Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    No spam, unsubscribe at any time.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-bold">WebPayback</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering creators in the age of AI with fair compensation technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="/privacy" className="hover:text-primary">Privacy</a></li>
                <li><a href="/terms" className="hover:text-primary">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Discord</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 WebPayback Protocol. Built with ❤️ for creators worldwide.
          </div>
        </div>
      </footer>
    </div>
  )
}