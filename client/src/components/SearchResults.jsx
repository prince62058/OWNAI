import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SearchResults({ 
  query, 
  response, 
  sources = [], 
  isLoading, 
  category 
}) {
  const { toast } = useToast();
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect for response
  useEffect(() => {
    if (response && !isLoading) {
      setDisplayedResponse("");
      setCurrentIndex(0);
      
      // Show response immediately if it's short, otherwise use typewriter effect
      if (response.length < 100) {
        setDisplayedResponse(response);
        setCurrentIndex(response.length);
      } else {
        const timer = setInterval(() => {
          setCurrentIndex((prev) => {
            if (prev < response.length) {
              setDisplayedResponse(response.slice(0, prev + 1));
              return prev + 1;
            } else {
              clearInterval(timer);
              return prev;
            }
          });
        }, 20);

        return () => clearInterval(timer);
      }
    }
  }, [response, isLoading]);

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Copied to clipboard",
        description: "The response has been copied to your clipboard.",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perplexity AI - ${query}`,
          text: response,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Loading Header */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white text-sm">🔍</span>
            </div>
            <Skeleton className="h-8 w-3/4" />
          </div>
        </div>

        {/* Loading AI Response */}
        <Card className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-l-blue-500">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Card>
        
        {/* Loading Sources */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/30 to-teal-50/30 dark:from-green-950/10 dark:to-teal-950/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
                <div className="ml-8 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="search-results">
      {/* Query Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-sm">🔍</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="search-query">
                {query}
              </h1>
            </div>
            {category && (
              <div className="ml-11">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" data-testid="search-category">
                  {category}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
              data-testid="copy-button"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950"
              data-testid="share-button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* AI Response */}
      {response && (
        <Card className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-l-blue-500">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">AI Response</h3>
            </div>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert ml-11">
            <div 
              className="whitespace-pre-wrap text-foreground leading-relaxed"
              data-testid="ai-response"
            >
              {displayedResponse}
              {currentIndex < response.length && (
                <span className="animate-pulse text-blue-500 font-bold">|</span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
              <ExternalLink className="h-3 w-3 text-white" />
            </div>
            <h2 className="text-lg font-semibold" data-testid="sources-header">
              Sources ({sources.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source, index) => (
              <Card 
                key={index} 
                className="p-5 hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:border-l-green-600 bg-gradient-to-r from-green-50/30 to-teal-50/30 dark:from-green-950/10 dark:to-teal-950/10"
                data-testid={`source-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 rounded">
                        {index + 1}
                      </span>
                      <h3 className="font-medium text-sm line-clamp-2 flex-1">
                        {source.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-xs mb-4 line-clamp-3 ml-8">
                      {source.snippet}
                    </p>
                    <div className="flex items-center justify-between ml-8">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {new URL(source.url).hostname}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-7 px-3 text-xs"
                        data-testid={`source-link-${index}`}
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1"
                        >
                          <span>Visit</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}