import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, BookOpen, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Library() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: searchHistory = [], isLoading, error } = useQuery({
    queryKey: ["/api/search/history"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle API errors
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-4" data-testid="library-title">
                  Your Library
                </h1>
                <p className="text-muted-foreground text-lg">
                  Access your search history, saved threads, and collections
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" data-testid="export-history">
                  Export History
                </Button>
                <Button variant="outline" data-testid="clear-history">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Library Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {/* Tabs */}
            <div className="border-b border-border mb-8">
              <nav className="flex space-x-8">
                <button className="border-b-2 border-primary text-primary pb-4 px-1 font-medium" data-testid="tab-recent">
                  Recent Searches
                </button>
                <button className="border-b-2 border-transparent text-muted-foreground hover:text-foreground pb-4 px-1 font-medium" data-testid="tab-saved">
                  Saved Threads
                </button>
                <button className="border-b-2 border-transparent text-muted-foreground hover:text-foreground pb-4 px-1 font-medium" data-testid="tab-collections">
                  Collections
                </button>
              </nav>
            </div>

            {/* Recent Searches */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : searchHistory.length > 0 ? (
              <div className="space-y-4">
                {searchHistory.map((search, index) => (
                  <Card key={search.id || index} className="p-6 hover:shadow-md transition-shadow" data-testid={`search-history-${index}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-medium text-sm line-clamp-1" data-testid={`search-query-${index}`}>
                            {search.query}
                          </h3>
                          {search.category && (
                            <Badge variant="secondary" className="text-xs">
                              {search.category}
                            </Badge>
                          )}
                        </div>
                        
                        {search.response && (
                          <p className="text-muted-foreground text-sm line-clamp-2 ml-7 mb-3">
                            {search.response.substring(0, 150)}...
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 ml-7 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(search.createdAt)}</span>
                          </div>
                          {search.sources && (
                            <span>{search.sources.length} sources</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/search?q=${encodeURIComponent(search.query)}`}>
                          <Button variant="ghost" size="sm" data-testid={`view-search-${index}`}>
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" data-testid={`delete-search-${index}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No search history yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start searching to build your personal library
                </p>
                <Link href="/">
                  <Button data-testid="start-searching">
                    Start Searching
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}