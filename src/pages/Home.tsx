import { Link } from 'react-router-dom';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-8">
      <NetworkBackground />
      
      <div className="max-w-3xl text-center space-y-8 animate-fade-in">
        <h1 className="text-7xl font-bold tracking-tight">
          Parallel
        </h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-light text-muted-foreground">
            Digital Clone of Society
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create AI-powered entity profiles that mimic real company behavior. 
            Test decisions, visualize relationships, and predict outcomes before they happen.
          </p>
        </div>

        <div className="pt-8">
          <Link to="/simulation">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-accent transition-all duration-300"
            >
              Enter Simulation
            </Button>
          </Link>
        </div>

        <div className="pt-12 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span>→</span>
            <span>Upload company data and generate AI entity profiles</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>→</span>
            <span>Visualize networks and define relationships</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>→</span>
            <span>Save and load simulation projects</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;