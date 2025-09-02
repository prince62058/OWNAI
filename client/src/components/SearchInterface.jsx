import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUp, Search, Image, Mic, Paperclip, Globe, Lightbulb, Wrench, AudioWaveform } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
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

  // Multi-modal input handlers
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setQuery(`[Image: ${file.name}] Analyze this image`);
      }
    };
    input.click();
  }, []);

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    
    recognition.start();
  }, []);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setQuery(`[File: ${file.name}] Analyze this file`);
      }
    };
    input.click();
  }, []);

  const handleWebSearch = useCallback(() => {
    setQuery(query + " (web search)");
  }, [query]);

  const handleIdeaGeneration = useCallback(() => {
    setQuery("Generate creative ideas about ");
  }, []);

  const handleToolSearch = useCallback(() => {
    setQuery("Find tools for ");
  }, []);

  useEffect(() => {
    if (debouncedQuery.length > 2 && suggestions?.suggestions?.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, suggestions]);

  const inputClass = size === "large" 
    ? "search-input w-full px-6 py-4 pr-60 sm:pr-60 pr-44 rounded-2xl text-lg focus:outline-none"
    : "w-full pl-10 pr-14 py-3 rounded-xl";

  const inputOptions = [
    { icon: Wrench, label: "Tools", action: handleToolSearch, color: "text-muted-foreground hover:text-primary" },
    { icon: Lightbulb, label: "Ideas", action: handleIdeaGeneration, color: "text-muted-foreground hover:text-primary" },
    { icon: Globe, label: "Web", action: handleWebSearch, color: "text-muted-foreground hover:text-primary" },
    { icon: Image, label: "Image", action: handleImageUpload, color: "text-muted-foreground hover:text-primary" },
    { icon: Paperclip, label: "File", action: handleFileUpload, color: "text-muted-foreground hover:text-primary" },
    { icon: isRecording ? AudioWaveform : Mic, label: "Voice", action: handleVoiceInput, color: isRecording ? "text-red-500" : "text-muted-foreground hover:text-primary" },
  ];

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
        
        {/* Multi-modal input options (only for large size) */}
        {size === "large" && (
          <>
            {/* Desktop version */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              {inputOptions.map((option, index) => (
              <Button
                key={option.label}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg transition-colors ${option.color}`}
                onClick={option.action}
                data-testid={`input-option-${option.label.toLowerCase()}`}
                title={option.label}
              >
                <option.icon className="h-4 w-4" />
              </Button>
              ))}
            </div>
            {/* Mobile version - show fewer options */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 flex sm:hidden items-center gap-1">
              {inputOptions.slice(0, 3).map((option, index) => (
                <Button
                  key={option.label}
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-lg transition-colors ${option.color}`}
                  onClick={option.action}
                  data-testid={`input-option-${option.label.toLowerCase()}`}
                  title={option.label}
                >
                  <option.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </>
        )}
        
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