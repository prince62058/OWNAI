import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SearchInterface from "@/components/SearchInterface";
import CategoryCard from "@/components/CategoryCard";
import TrendingCard from "@/components/TrendingCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const { data: trendingTopics = [] } = useQuery({
    queryKey: ["/api/trending"],
    retry: false,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["/api/spaces"],
    retry: false,
  });

  const handleTopicClick = (topic) => {
    const searchParams = new URLSearchParams({ q: topic.title });
    setLocation(`/search?${searchParams.toString()}`);
  };

  const handleCreateThread = () => {
    setLocation("/");
    // Focus on search input after navigation
    setTimeout(() => {
      const searchInput = document.querySelector('[data-testid="search-input"]');
      searchInput?.focus();
    }, 100);
  };

  return (
    <Layout>
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section with Search */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
                Where knowledge begins
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto" data-testid="hero-description">
                Ask anything and get instant, accurate answers with cited sources. 
                Powered by advanced AI and real-time web search.
              </p>

              <SearchInterface size="large" autoFocus />
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold mb-8 text-center" data-testid="categories-title">
              Explore by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  description={category.description}
                  icon={category.icon}
                  color={category.color}
                  href={category.href}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold" data-testid="trending-title">Trending Now</h2>
              <Button
                variant="ghost"
                onClick={() => setLocation("/discover")}
                data-testid="view-all-trending"
              >
                View all
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTopics.slice(0, 6).map((topic) => (
                <TrendingCard
                  key={topic.id}
                  id={topic.id}
                  title={topic.title}
                  description={topic.description}
                  category={topic.category}
                  readTime={topic.readTime}
                  icon={topic.icon}
                  viewCount={topic.viewCount}
                  onClick={() => handleTopicClick(topic)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Spaces/Templates Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2" data-testid="spaces-title">Spaces & Templates</h2>
                <p className="text-muted-foreground">Organized collections for specific topics and workflows</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setLocation("/spaces")}
                data-testid="browse-all-spaces"
              >
                Browse all
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.slice(0, 3).map((space) => (
                <Card key={space.id} className="category-card rounded-xl p-6 group cursor-pointer" data-testid={`space-${space.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${space.gradient} rounded-lg flex items-center justify-center`}>
                      <i className={`${space.icon} text-white text-sm`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{space.templateCount} templates</span>
                  </div>
                  <h3 className="font-semibold mb-2" data-testid={`space-title-${space.id}`}>{space.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4" data-testid={`space-description-${space.id}`}>{space.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {space.tags?.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-secondary rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sign-in Prompt */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold mb-4" data-testid="library-title">Your Library</h2>
              <p className="text-muted-foreground mb-8">Access your search history, saved threads, and collections</p>
              
              <Card className="relative p-10 max-w-lg mx-auto border-0 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
                
                {/* Floating icon with glow effect */}
                <div className="relative mb-8 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/10">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-2">
                      <img src="/ft-logo-signin.png" alt="FrienchTech.Ai" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
                
                <div className="relative text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Welcome back
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Sign in to unlock Pro Search, History, and personalized AI assistance
                  </p>
                </div>
                
                <div className="relative space-y-4">
                  <Button
                    className="w-full h-12 justify-start text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 rounded-xl group"
                    variant="outline"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-google"
                  >
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <i className="fab fa-google text-red-500 text-sm" />
                    </div>
                    <span className="font-medium">Continue with Google</span>
                  </Button>
                  
                  <Button
                    className="w-full h-12 justify-start text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 rounded-xl group"
                    variant="outline"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-apple"
                  >
                    <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <i className="fab fa-apple text-white text-sm" />
                    </div>
                    <span className="font-medium">Continue with Apple</span>
                  </Button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-4 text-muted-foreground font-medium">or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full h-12 justify-start text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 rounded-xl group"
                    variant="outline"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-email"
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <i className="fas fa-envelope text-primary text-sm" />
                    </div>
                    <span className="font-medium">Email address</span>
                  </Button>
                  
                  <div className="pt-6 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-300 rounded-lg px-6"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="sso-signin"
                    >
                      <span className="text-sm font-medium">Enterprise SSO →</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="floating-action w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-all"
        onClick={handleCreateThread}
        data-testid="create-thread-fab"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Layout>
  );
}