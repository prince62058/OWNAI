import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
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

  const handleTopicClick = (topic: any) => {
    const searchParams = new URLSearchParams({ q: topic.title });
    setLocation(`/search?${searchParams.toString()}`);
  };

  const handleCreateThread = () => {
    setLocation("/");
    // Focus on search input after navigation
    setTimeout(() => {
      const searchInput = document.querySelector('[data-testid="search-input"]') as HTMLInputElement;
      searchInput?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
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
              {categories.map((category: any) => (
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
              {trendingTopics.slice(0, 6).map((topic: any) => (
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
              {spaces.slice(0, 3).map((space: any) => (
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
                    {space.tags?.slice(0, 2).map((tag: string, index: number) => (
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
              
              <Card className="p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sign in or create an account</h3>
                <p className="text-muted-foreground text-sm mb-6">Unlock Pro Search and History</p>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-google"
                  >
                    <i className="fab fa-google text-lg mr-3" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-apple"
                  >
                    <i className="fab fa-apple text-lg mr-3" />
                    Continue with Apple
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-email"
                  >
                    <i className="fas fa-envelope text-lg mr-3" />
                    Continue with email
                  </Button>
                  
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="sso-signin"
                    >
                      Single sign-on (SSO)
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

      <MobileNav />
    </div>
  );
}
