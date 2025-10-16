import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAIStore } from '@/stores/ai';
import { streamAI, type AIMessage } from '@/services/api';
import { Send, Sparkles, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime } from '@/lib/format';
import { toast } from 'sonner';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { currentThreadId, createThread, addMessage, getCurrentThread } = useAIStore();
  const thread = getCurrentThread();

  useEffect(() => {
    if (!currentThreadId) {
      createThread();
    }
  }, [currentThreadId, createThread]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentThreadId || isStreaming) return;

    const userMessage: Omit<AIMessage, 'timestamp'> = {
      role: 'user',
      content: input.trim(),
    };

    addMessage(currentThreadId, userMessage);
    setInput('');
    setIsStreaming(true);

    // Create placeholder for assistant message
    const assistantPlaceholder: Omit<AIMessage, 'timestamp'> = {
      role: 'assistant',
      content: '',
    };
    addMessage(currentThreadId, assistantPlaceholder);

    let accumulatedContent = '';

    await streamAI(
      [...(thread?.messages || []), userMessage],
      (chunk) => {
        accumulatedContent += chunk;
        // Update the last message (assistant) with accumulated content
        const currentThread = useAIStore.getState().getCurrentThread();
        if (currentThread) {
          const updatedMessages = [...currentThread.messages];
          updatedMessages[updatedMessages.length - 1].content = accumulatedContent;
          useAIStore.setState((state) => ({
            threads: state.threads.map((t) =>
              t.id === currentThreadId
                ? { ...t, messages: updatedMessages, updatedAt: Date.now() }
                : t
            ),
          }));
        }
      },
      () => {
        setIsStreaming(false);
      },
      (error) => {
        console.error('AI streaming error:', error);
        toast.error('Failed to get AI response');
        setIsStreaming(false);
      }
    );
  };

  const handleCopy = async (content: string, idx: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
          <h1 className="text-4xl font-bold text-gradient-purple">AI Assistant</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Get intelligent help with attestations, schemas, and blockchain queries
        </p>
      </div>

      {/* Chat Container */}
      <Card className="glass h-[600px] flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <AnimatePresence mode="popLayout">
            {thread?.messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4"
              >
                <Sparkles className="h-16 w-16 text-primary/50" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground max-w-md">
                    Ask me anything about creating attestations, understanding schemas,
                    or navigating the Polygon ecosystem.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {thread?.messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 border border-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {message.role === 'user' ? 'You' : 'AI'}
                        </Badge>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(message.content, idx)}
                          >
                            {copiedId === idx ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                      </div>
                      {message.timestamp && (
                        <p className="text-xs opacity-50 mt-2">
                          {formatRelativeTime(message.timestamp)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isStreaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about attestations..."
              disabled={isStreaming}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="neon"
              disabled={!input.trim() || isStreaming}
            >
              <Send />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
