import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, User, Bot, Plus, MessageSquare, Library, Search, Trash2, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Landing() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch recent chat threads
  const { data: chatThreads = [], refetch: refetchThreads } = useQuery({
    queryKey: ['/api/chat/threads'],
    retry: false,
  });

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const response = await apiRequest("POST", "/api/chat/threads", { 
        message: message,
        threadId: currentThreadId
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Update current thread ID
      setCurrentThreadId(data.threadId);

      // Set messages from thread data
      if (data.thread && data.thread.messages) {
        setMessages(data.thread.messages.map((msg, index) => ({
          id: `${msg.timestamp || Date.now()}-${index}`,
          type: msg.type,
          content: msg.content,
          sources: msg.sources || [],
          timestamp: new Date(msg.timestamp)
        })));
      }

      // Refresh threads list
      refetchThreads();
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

  // Load specific thread
  const loadThread = async (threadId) => {
    try {
      const response = await apiRequest("GET", `/api/chat/threads/${threadId}`);
      if (response.ok) {
        const thread = await response.json();
        setCurrentThreadId(threadId);
        setMessages(thread.messages.map((msg, index) => ({
          id: `${msg.timestamp || Date.now()}-${index}`,
          type: msg.type,
          content: msg.content,
          sources: msg.sources || [],
          timestamp: new Date(msg.timestamp)
        })));
        setShowChat(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat thread",
        variant: "destructive",
      });
    }
  };

  // Delete thread function
  const deleteThread = async (threadId, e) => {
    e.stopPropagation(); // Prevent thread loading when delete is clicked

    try {
      const response = await apiRequest("DELETE", `/api/chat/threads/${threadId}`);
      if (response.ok) {
        // If current thread is deleted, reset the chat
        if (currentThreadId === threadId) {
          setCurrentThreadId(null);
          setMessages([]);
          setShowChat(false);
        }

        // Refresh threads list
        refetchThreads();

        toast({
          title: "Success",
          description: "Chat thread deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat thread",
        variant: "destructive",
      });
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
            </div>

            <Button 
              onClick={() => {
                setMessages([]);
                setCurrentThreadId(null);
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
              <div className="text-sm text-muted-foreground px-2 mb-2">Recent Chats</div>
              {chatThreads && chatThreads.length > 0 ? (
                chatThreads.map((thread) => (
                  <div key={thread.id} className="relative group">
                    <Button
                      variant={currentThreadId === thread.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-auto p-3 text-left pr-10"
                      onClick={() => loadThread(thread.id)}
                      data-testid={`thread-${thread.id}`}
                    >
                      <div className="flex flex-col items-start w-full">
                        <div className="font-medium text-sm truncate w-full">
                          {thread.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate w-full">
                          {thread.lastMessage}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>

                    <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            data-testid={`thread-menu-${thread.id}`}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => deleteThread(thread.id, e)}
                            className="text-red-600 focus:text-red-600"
                            data-testid={`delete-thread-${thread.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground px-2">
                  No chat history yet
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                  {currentThreadId ? 
                    (chatThreads.find(t => t.id === currentThreadId)?.title || "Chat Thread") :
                    "New Thread"
                  }
                </h1>
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* 3D Background Animation */}
        <div className="absolute inset-0 z-0">
          <iframe 
            src='https://my.spline.design/retrofuturisticcircuitloop-80c0cN4NN5WUDdFm77fNa740/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            className="pointer-events-none"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10">
          {/* Header */}
          <header className="border-b bg-background/80 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>

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
              <h1 className="text-5xl font-light mb-6 text-cyan-400 drop-shadow-lg glow-text" data-testid="hero-title">
                PrinceTech AI
              </h1>
              <p className="text-xl text-muted-foreground mb-8 drop-shadow-sm" data-testid="hero-subtitle">
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
                  className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-cyan-400 hover:border-cyan-400 bg-black/80 backdrop-blur-sm text-white transition-colors"
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
                    className="justify-start h-auto p-4 text-left rounded-xl hover:bg-muted/50 bg-background/70 backdrop-blur-sm border-muted/50"
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
              <div className="text-center bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-muted/30">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Search</h3>
                <p className="text-sm text-muted-foreground">Get up-to-date information from across the web with comprehensive source citations.</p>
              </div>

              <div className="text-center bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-muted/30">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Advanced AI understands context and provides detailed, accurate responses.</p>
              </div>

              <div className="text-center bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-muted/30">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Library className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Comprehensive</h3>
                <p className="text-sm text-muted-foreground">Explore any topic with detailed explanations and reliable source verification.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}