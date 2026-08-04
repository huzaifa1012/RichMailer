import { Link } from "react-router-dom";
import { Mail, Zap, Shield, ArrowRight, Code2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powerful Email API</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Send Emails with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"> Richness</span>
          </h1>
          {/* Subtitle / Punchline using <p> + <strong> tags for keyword indexing */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl font-normal text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              <strong>Free REST API</strong> for sending rich HTML emails via your own SMTP provider. Simple parameters with no backend infrastructure required.
            </p>
            <p className="mt-3 text-base font-medium text-foreground/90">
              ⚡ <strong className="font-semibold text-primary">100% Free</strong> with <strong className="font-semibold text-primary">Unlimited Email Delivery</strong> & zero hidden limits.
            </p>
          </div>


          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Code2 className="w-4 h-4" /> View API Docs
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <FeatureCard
              icon={<Mail className="w-8 h-8 text-primary" />}
              title="Custom SMTP & HTML"
              description="Use your own email provider and send custom HTML emails with full control"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Unlimited Sending"
              description="Send unlimited emails based on your SMTP provider's limits - no restrictions from us"
            />
            <FeatureCard
              icon={<Rocket className="w-8 h-8 text-primary" />}
              title="Production Ready"
              description="Built with modern stack: Redux, TypeScript, Tailwind CSS"
            />
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose RichMailer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ShowcaseItem title="Custom SMTP Setup" description="Configure your own SMTP provider (Gmail, Outlook, Zoho, Yahoo, or any custom server) for maximum control." />
            <ShowcaseItem title="Custom HTML Emails" description="Send beautifully crafted emails with custom HTML, rich formatting, and complete design freedom." />
            <ShowcaseItem title="Unlimited Sending" description="No artificial limits on email sending - send as much as your email provider allows. You control your own limits." />
            <ShowcaseItem title="Real-Time Logs & Tracking" description="Track every email with detailed logs showing delivery status, timestamps, and error information." />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to get started?</h3>
          <p className="text-lg text-muted-foreground mb-8">Create an account in minutes and start sending unlimited emails through the RichMailer API with custom HTML support.</p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="glass-card rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const ShowcaseItem = ({ title, description }: { title: string; description: string }) => (
  <div className="glass-card rounded-xl p-6">
    <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default LandingPage;
