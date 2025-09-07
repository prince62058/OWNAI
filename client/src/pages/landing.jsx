import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Bot, Plus, MessageSquare, Library, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Landing() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const response = await apiRequest("POST", "/api/chat", { 
        message: message 
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

  const suggestedQuestions = [
    "What are the latest AI developments?",
    "How does machine learning work?",
    "Explain quantum computing",
    "What is blockchain technology?"
  ];

  if (showChat) {
    return (
      <Layout>
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <div className="w-64 border-r bg-background p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">PrinceTech AI</span>
            </div>
            
            <Button 
              onClick={() => {
                setMessages([]);
                setShowChat(false);
              }}
              className="w-full mb-4" 
              variant="outline"
              data-testid="new-thread-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Button>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground px-2 mb-2">Recent</div>
              <div className="text-xs text-muted-foreground px-2">
                Chat history will appear here
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">New Thread</h1>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="md:hidden"
                  data-testid="back-button"
                >
                  Back
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bot className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                        <p className="text-muted-foreground">Ask me anything and I'll provide detailed answers with sources.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div key={message.id} className="group">
                          <div className="flex gap-4">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className={message.type === "user" ? "bg-blue-500" : "bg-purple-500"}>
                                {message.type === "user" ? (
                                  <User className="w-4 h-4 text-white" />
                                ) : (
                                  <Bot className="w-4 h-4 text-white" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="mb-2">
                                <span className="font-medium text-sm">
                                  {message.type === "user" ? "You" : "PrinceTech AI"}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {message.timestamp.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              </div>
                              
                              {/* Sources */}
                              {message.type === "ai" && message.sources && message.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="text-sm font-medium mb-2">Sources</div>
                                  <div className="grid gap-2">
                                    {message.sources.slice(0, 5).map((source, idx) => (
                                      <a
                                        key={idx}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-2 p-2 rounded border hover:bg-muted/50 transition-colors group/source"
                                      >
                                        <div className="w-5 h-5 bg-muted rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <span className="text-xs font-mono">{idx + 1}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-sm font-medium truncate group-hover/source:text-blue-600">
                                            {source.title}
                                          </div>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {source.url}
                                          </div>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Loading indicator */}
                      {chatMutation.isPending && (
                        <div className="group">
                          <div className="flex gap-4">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-purple-500">
                                <Bot className="w-4 h-4 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="mb-2">
                                <span className="font-medium text-sm">PrinceTech AI</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    disabled={chatMutation.isPending}
                    className="pr-12 resize-none"
                    data-testid="chat-input"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || chatMutation.isPending}
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8"
                    data-testid="send-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl">PrinceTech AI</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Discover</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Library</a>
                <Button variant="outline" size="sm">Sign in</Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-light mb-6" data-testid="hero-title">
              PrinceTech AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="hero-subtitle">
              Ask anything and get instant, accurate answers with cited sources
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={chatMutation.isPending}
                className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-blue-500"
                data-testid="main-search-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                size="sm"
                className="absolute right-2 top-2 h-10 px-4 rounded-lg"
                data-testid="main-search-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start h-auto p-4 text-left rounded-xl hover:bg-muted/50"
                  onClick={() => {
                    setInput(question);
                    setTimeout(() => handleSend(), 100);
                  }}
                  data-testid={`suggested-question-${idx}`}
                >
                  <div>
                    <div className="font-medium text-sm">{question}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Search</h3>
              <p className="text-sm text-muted-foreground">Get up-to-date information from across the web with comprehensive source citations.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Advanced AI understands context and provides detailed, accurate responses.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Library className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Comprehensive</h3>
              <p className="text-sm text-muted-foreground">Explore any topic with detailed explanations and reliable source verification.</p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}