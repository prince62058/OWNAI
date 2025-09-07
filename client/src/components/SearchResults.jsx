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

  // Debug logs removed for cleaner output

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
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="search-results">
      {/* Query Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2" data-testid="search-query">{query}</h1>
          {category && (
            <Badge variant="secondary" data-testid="search-category">
              {category}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="copy-button"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            data-testid="share-button"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* AI Response */}
      {response ? (
        <Card className="p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div 
              className="whitespace-pre-wrap"
              data-testid="ai-response"
            >
              {displayedResponse}
              {currentIndex < response.length && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          </div>
        </Card>
      ) : !isLoading && query && (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No AI response received. Please try again.</p>
          </div>
        </Card>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="sources-header">
            Sources ({sources.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source, index) => (
              <Card 
                key={index} 
                className="p-4 hover:shadow-md transition-shadow"
                data-testid={`source-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                      {source.title}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-3 line-clamp-3">
                      {source.snippet}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate">
                        {new URL(source.url).hostname}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        data-testid={`source-link-${index}`}
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
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