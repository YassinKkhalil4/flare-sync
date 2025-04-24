import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { PLAN_DETAILS } from '@/lib/supabase';
import PlatformIcon from '@/components/social/PlatformIcon';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const popularFeatures = [
    "Schedule & automate posts",
    "Advanced analytics dashboard",
    "Brand partnerships",
    "Creator discovery",
    "Media kit builder",
    "Secure messaging"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center gap-6">
            <Link to="#features" className="text-sm font-medium hover:text-primary">Features</Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
            <Link to="#testimonials" className="text-sm font-medium hover:text-primary">Testimonials</Link>
            <Link to="/login" className="text-sm font-medium hover:text-primary">Sign In</Link>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
          <Button variant="outline" size="sm" className="md:hidden">
            Menu
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connect, create and <span className="gradient-text">monetize</span> your content
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            FlareSync helps creators and brands connect, collaborate, and grow together through powerful analytics and seamless integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="px-8">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          
          <div className="mt-20 flex justify-center gap-16">
            <a href="https://instagram.com/flaresync" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <PlatformIcon platform="instagram" size={32} />
            </a>
            <a href="https://twitter.com/flaresync" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <PlatformIcon platform="twitter" size={32} />
            </a>
            <a href="https://tiktok.com/@flaresync" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <PlatformIcon platform="tiktok" size={32} />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              FlareSync provides all the tools creators and brands need to build meaningful partnerships and grow their audience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Schedule & Automate",
                description: "Plan and schedule your content across multiple platforms with our intuitive calendar interface.",
                icon: "📅"
              },
              {
                title: "Analytics Dashboard",
                description: "Track engagement, growth, and performance with our comprehensive analytics dashboard.",
                icon: "📊"
              },
              {
                title: "Brand Partnerships",
                description: "Connect with brands looking for creators like you and manage deals in one place.",
                icon: "🤝"
              },
              {
                title: "Creator Discovery",
                description: "Find the perfect creators for your brand campaigns based on audience and engagement.",
                icon: "🔍"
              },
              {
                title: "Media Kit Builder",
                description: "Create a professional media kit that showcases your best work and audience demographics.",
                icon: "📁"
              },
              {
                title: "Secure Messaging",
                description: "Communicate directly with brands or creators through our encrypted messaging system.",
                icon: "💬"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you, whether you're just starting out or scaling your creator business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {(['free', 'basic', 'pro', 'enterprise'] as const).map((plan) => {
              const planInfo = PLAN_DETAILS[plan];
              const features = planInfo.features;
              
              return (
                <div key={plan} className="border border-border rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold capitalize">{plan}</h3>
                  <div className="text-3xl font-bold">
                    ${planInfo.pricing.monthly}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{features.maxPosts} posts/month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Up to {features.maxUsers} users</span>
                    </li>
                    {features.advancedAnalytics && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Advanced analytics</span>
                      </li>
                    )}
                    {features.prioritySupport && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Priority support</span>
                      </li>
                    )}
                    {features.customBranding && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Custom branding</span>
                      </li>
                    )}
                    {features.apiAccess && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>API access</span>
                      </li>
                    )}
                  </ul>

                  <Button 
                    className="w-full mt-4" 
                    variant={plan === 'free' ? 'outline' : 'default'}
                    asChild
                  >
                    <Link to="/signup">
                      {plan === 'free' ? 'Get Started' : 'Choose Plan'}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between mb-10">
            <div className="mb-8 md:mb-0">
              <Logo />
              <p className="mt-4 text-muted-foreground max-w-xs">
                Empowering creators and brands to build meaningful partnerships and grow together.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Features</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Documentation</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Guides</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">About</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Privacy</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Terms</Link></li>
                  <li><Link to="#" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2025 FlareSync. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="https://instagram.com/flaresync" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <PlatformIcon platform="instagram" size={20} />
              </a>
              <a href="https://twitter.com/flaresync" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <PlatformIcon platform="twitter" size={20} />
              </a>
              <a href="https://tiktok.com/@flaresync" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <PlatformIcon platform="tiktok" size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
