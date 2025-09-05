'use client';

import { useAppContext } from '@/context/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { chat, type ChatInput } from '@/ai/flows/chat-flow';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function LiveChat() {
  const { isChatOpen, toggleChat } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome to Rare Diamonds! How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const historyForAI = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: [{ text: msg.content }]
      })) as ChatInput['history'];

      const aiResponse = await chat({
        history: historyForAI,
        message: currentInput
      });

      const assistantMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isChatOpen} onOpenChange={toggleChat}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Live Chat Support</SheetTitle>
          <SheetDescription>
            Have a question? We're here to help!
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-grow my-4" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && "justify-end")}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0 border">
                      <AvatarFallback>D</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("p-3 rounded-lg max-w-xs text-sm",
                    message.role === 'assistant' ? "bg-muted" : "bg-primary text-primary-foreground"
                  )}>
                    <p>{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                     <Avatar className="h-8 w-8 flex-shrink-0 border">
                       <AvatarFallback>You</AvatarFallback>
                     </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0 border">
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg max-w-xs">
                     <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              )}
            </div>
        </ScrollArea>
        <SheetFooter>
          <form className="w-full flex items-center gap-2" onSubmit={handleSendMessage}>
            <Input 
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
