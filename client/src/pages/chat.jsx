import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "नमस्ते! मैं आपका AI असिस्टेंट हूं। आप मुझसे कुछ भी पूछ सकते हैं।",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

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
        description: "कुछ गलत हुआ है। कृपया दोबारा कोशिश करें।",
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
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
          {/* Chat Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">AI Chat</h1>
            <p className="text-muted-foreground">अपने AI असिस्टेंट से बात करें</p>
          </div>

          {/* Messages Area */}
          <Card className="flex-1 p-4 mb-4 overflow-hidden">
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
                          {message.timestamp.toLocaleTimeString('hi-IN', { 
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
              placeholder="कुछ भी पूछें..."
              disabled={chatMutation.isPending}
              className="flex-1"
              data-testid="chat-input"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
              data-testid="send-button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}