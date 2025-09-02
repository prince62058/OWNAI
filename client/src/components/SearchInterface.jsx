import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUp, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";

const quickActions = [
  { label: "Parenting", icon: "👨‍👩‍👧‍👦" },
  { label: "Compare", icon: "⚖️" },
  { label: "Fact Check", icon: "✅" },
  { label: "Analyze", icon: "📊" },
  { label: "Sports", icon: "⚽" },
];

export default function SearchInterface({
  className = "",
  placeholder = "Ask anything...",
  autoFocus = false,
  size = "default"
}) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setLocation] = useLocation();
  const debouncedQuery = useDebounce(query, 300);

  // Fetch search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions", { q: debouncedQuery }],
    enabled: debouncedQuery.length > 2,
    retry: false,
  });

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      const searchParams = new URLSearchParams({ q: query.trim() });
      setLocation(`/search?${searchParams.toString()}`);
      setShowSuggestions(false);
    }
  }, [query, setLocation]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, [handleSearch]);

  const handleQuickAction = useCallback((action) => {
    setQuery(action);
    const searchParams = new URLSearchParams({ q: action });
    setLocation(`/search?${searchParams.toString()}`);
  }, [setLocation]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion);
    const searchParams = new URLSearchParams({ q: suggestion });
    setLocation(`/search?${searchParams.toString()}`);
    setShowSuggestions(false);
  }, [setLocation]);

  useEffect(() => {
    if (debouncedQuery.length > 2 && suggestions?.suggestions?.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, suggestions]);

  const inputClass = size === "large" 
    ? "search-input w-full px-6 py-4 pr-14 rounded-2xl text-lg focus:outline-none"
    : "w-full pl-10 pr-14 py-3 rounded-xl";

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {size === "default" && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className={inputClass}
          autoFocus={autoFocus}
          data-testid="search-input"
        />
        <Button
          onClick={handleSearch}
          size="icon"
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            size === "large" ? "h-10 w-10" : "h-8 w-8"
          } rounded-xl hover:bg-primary/90 transition-colors`}
          data-testid="search-button"
        >
          <ArrowUp className={size === "large" ? "h-5 w-5" : "h-4 w-4"} />
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions?.suggestions?.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-2" data-testid="search-suggestions">
          {suggestions.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-accent rounded-lg cursor-pointer text-left text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
              data-testid={`suggestion-${index}`}
            >
              {suggestion}
            </div>
          ))}
        </Card>
      )}

      {/* Quick Actions (only for large size) */}
      {size === "large" && (
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {quickActions.map((action) => (
            <Badge
              key={action.label}
              variant="secondary"
              className="px-4 py-2 cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => handleQuickAction(action.label)}
              data-testid={`quick-action-${action.label.toLowerCase()}`}
            >
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}