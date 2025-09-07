import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";
import TrendingCard from "@/components/TrendingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Bot, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Landing() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your AI assistant. You can ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const response = await apiRequest("POST", "/api/search", { 
        query: message 
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: data.response,
        sources: data.sources || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
    setShowChat(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTopicClick = (topic) => {
    const searchParams = new URLSearchParams({ q: topic.title });
    setLocation(`/search?${searchParams.toString()}`);
  };

  const handleCreateThread = () => {
    setShowChat(true);
    setTimeout(() => {
      const searchInput = document.querySelector('[data-testid="chat-input"]');
      searchInput?.focus();
    }, 100);
  };

  return (
    <Layout>
      <main className="flex-1 pb-20 md:pb-0">
        {!showChat ? (
          // Hero Section with Search
          <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Spline 3D Background */}
            <div className="absolute inset-0 w-full h-full z-0">
              <iframe 
                src='https://my.spline.design/retrofuturisticcircuitloop-80c0cN4NN5WUDdFm77fNa740/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                className="w-full h-full"
              />
            </div>
            
            <div className="container mx-auto max-w-4xl text-center relative z-20">
              <div className="fade-in">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl mb-4 font-light leading-tight" data-testid="hero-title">
                  <span className="text-white">Hi, I'm </span>
                  <span className="text-cyan-400 font-medium">PrinceTech</span>
                  <br />
                  <span className="text-blue-400 font-medium">AI</span>
                </h1>
                <p className="text-xl text-cyan-300/90 mb-8 font-medium tracking-wide" data-testid="hero-subtitle">
                  AI/ML Enthusiast
                </p>
                <p className="text-lg text-blue-200/70 mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="hero-description">
                  Ask anything and get instant, accurate answers with cited sources. 
                  Powered by advanced AI and real-time web search.
                </p>

                {/* Chat Input */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={chatMutation.isPending}
                      className="flex-1 h-12 text-lg bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-white/60"
                      data-testid="chat-input"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || chatMutation.isPending}
                      size="icon"
                      className="h-12 w-12"
                      data-testid="send-button"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  {["What is AI?", "Latest tech trends", "How does ChatGPT work?", "Future of technology"].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      className="px-4 py-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => handleSend(), 100);
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          // Chat Interface
          <section className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-4xl mx-auto">
              {/* Chat Header */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">AI Chat</h1>
                  <p className="text-muted-foreground">Chat with your AI assistant</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowChat(false)}
                  className="text-sm"
                >
                  Back to Home
                </Button>
              </div>

              {/* Messages Area */}
              <Card className="p-4 mb-4 overflow-hidden">
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {message.type === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Show sources for AI messages */}
                          {message.type === "ai" && message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/20">
                              <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                              <div className="space-y-1">
                                {message.sources.slice(0, 3).map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs text-blue-500 hover:text-blue-600 truncate"
                                  >
                                    {source.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {chatMutation.isPending && (
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </Card>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={chatMutation.isPending}
                  className="flex-1"
                  data-testid="chat-input-main"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  size="icon"
                  data-testid="send-button-main"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {!showChat && (
          <>
            {/* Categories Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background/95 backdrop-blur relative z-10">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4" data-testid="categories-title">
                    Explore by Category
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="categories-description">
                    Discover curated content and get specialized insights across different domains
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            </section>

            {/* Trending Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2" data-testid="trending-title">
                      Trending Now
                    </h2>
                    <p className="text-muted-foreground" data-testid="trending-description">
                      Popular topics and discussions happening right now
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCreateThread}
                    className="flex items-center gap-2"
                    data-testid="create-thread-button"
                  >
                    <Plus className="h-4 w-4" />
                    Start Chat
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingTopics.slice(0, 6).map((topic) => (
                    <TrendingCard 
                      key={topic.id} 
                      topic={topic} 
                      onClick={() => handleTopicClick(topic)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Spaces Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 relative z-10">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4" data-testid="spaces-title">
                    Popular Spaces
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="spaces-description">
                    Join discussions in specialized communities and discover new perspectives
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaces.slice(0, 6).map((space) => (
                    <Card key={space.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group" data-testid={`space-${space.id}`}>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{space.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{space.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{space.category}</span>
                        <span>{space.memberCount || 0} members</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}