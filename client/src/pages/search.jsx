import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import SearchInterface from "@/components/SearchInterface";
import SearchResults from "@/components/SearchResults";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Search() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchData, setSearchData] = useState(null);

  const searchMutation = useMutation({
    mutationFn: async ({ query, category }) => {
      try {
        const response = await apiRequest("POST", "/api/search", { query, category });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Search response:", data); // Debug log
        return data;
      } catch (error) {
        console.error("Search mutation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setSearchData(data);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      
      toast({
        title: "Search Failed",
        description: error.message || "Unable to process your search. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Parse search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    
    if (query && query.trim() && query !== searchData?.query) {
      searchMutation.mutate({ query: query.trim(), category: category || undefined });
    }
  }, [location]);

  const currentQuery = new URLSearchParams(location.split('?')[1] || '').get('q') || '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Search Interface */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="container mx-auto max-w-4xl">
            <SearchInterface 
              className="max-w-2xl mx-auto"
              placeholder="Ask anything..."
            />
          </div>
        </section>

        {/* Search Results */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            {(currentQuery || searchMutation.isPending) && (
              <SearchResults
                query={currentQuery}
                response={searchData?.response}
                sources={searchData?.sources}
                category={searchData?.category}
                isLoading={searchMutation.isPending}
              />
            )}
            
            {!currentQuery && !searchMutation.isPending && (
              <div className="max-w-4xl mx-auto text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-muted-foreground text-xl" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ready to search</h2>
                <p className="text-muted-foreground">
                  Enter your query above to get started with AI-powered search.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}