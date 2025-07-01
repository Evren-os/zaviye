"use client";

import { usePersonas } from "@/hooks/use-personas";
import { generateContent } from "@/lib/gemini";
import { getModelById } from "@/lib/models";
import type { ChatType, Message, ModelId } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useChat(chatType: ChatType) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const { getPersona, globalModel } = usePersonas();
  const abortControllerRef = useRef<AbortController | null>(null);

  // New state for rate limiting
  const [requestTimestamps, setRequestTimestamps] = useState<Record<string, number[]>>({});
  const [throttleSeconds, setThrottleSeconds] = useState(0);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(`zaviye-${chatType}-messages`);
      const savedChatState = localStorage.getItem(`zaviye-${chatType}-started`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
      setHasStartedChat(savedChatState ? JSON.parse(savedChatState) : false);
    } catch (error) {
      console.error("Failed to load chat state from localStorage:", error);
      setMessages([]);
      setHasStartedChat(false);
    }
  }, [chatType]);

  useEffect(() => {
    try {
      localStorage.setItem(`zaviye-${chatType}-messages`, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save messages to localStorage:", error);
    }
  }, [messages, chatType]);

  useEffect(() => {
    try {
      localStorage.setItem(`zaviye-${chatType}-started`, JSON.stringify(hasStartedChat));
    } catch (error) {
      console.error("Failed to save chat started state to localStorage:", error);
    }
  }, [hasStartedChat, chatType]);

  // Cleanup throttle timer on component unmount or chat switch
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearInterval(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      setThrottleSeconds(0);
    };
  }, [chatType]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const checkAndApplyThrottle = useCallback(
    (modelId: ModelId): boolean => {
      const model = getModelById(modelId);
      if (!model) {
        toast.error("Invalid AI model selected.");
        return true; // Is throttled
      }

      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;

      const recentTimestamps = (requestTimestamps[modelId] || []).filter((ts) => ts > oneMinuteAgo);

      if (recentTimestamps.length >= model.rpm) {
        const oldestRequestTime = recentTimestamps[0];
        const timeToWait = Math.ceil((60 * 1000 - (now - oldestRequestTime)) / 1000);
        setThrottleSeconds(timeToWait);

        if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
        throttleTimerRef.current = setInterval(() => {
          setThrottleSeconds((prev) => {
            if (prev <= 1) {
              if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast.warning(`Rate limit reached. Please wait ${timeToWait} seconds.`, { duration: 2000 });
        return true; // Is throttled
      }

      setRequestTimestamps((prev) => ({
        ...prev,
        [modelId]: [...recentTimestamps, now],
      }));

      return false; // Not throttled
    },
    [requestTimestamps],
  );

  const fetchAssistantResponse = useCallback(
    async (userPrompt: string, modelName: ModelId) => {
      if (isLoading) stopGeneration();
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const persona = getPersona(chatType);
        if (!persona) {
          throw new Error(`Persona with ID "${chatType}" not found.`);
        }
        const systemPrompt = persona.prompt;

        const response = await generateContent({
          systemPrompt,
          userPrompt,
          modelName,
          signal: abortControllerRef.current.signal,
        });
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        // Re-throw to be handled by the calling function
        throw error;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [chatType, getPersona, isLoading, stopGeneration],
  );

  const sendMessage = async (content: string) => {
    if (!content.trim() || throttleSeconds > 0) return;

    const persona = getPersona(chatType);
    const effectiveModelId = persona?.model || globalModel;
    if (checkAndApplyThrottle(effectiveModelId)) return;

    if (!hasStartedChat) setHasStartedChat(true);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      await fetchAssistantResponse(content, effectiveModelId);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 3500,
          description: "Consider switching to a different model if this persists.",
        });
      }
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    }
  };

  const regenerateLastResponse = async () => {
    if (throttleSeconds > 0) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      toast.error("Could not find a message to regenerate.");
      return;
    }

    const persona = getPersona(chatType);
    const effectiveModelId = persona?.model || globalModel;
    if (checkAndApplyThrottle(effectiveModelId)) return;

    setMessages((prev) =>
      prev.filter((msg) => msg.role !== "assistant" || msg.timestamp < lastUserMessage.timestamp),
    );

    try {
      await fetchAssistantResponse(lastUserMessage.content, effectiveModelId);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 3500,
          description: "Consider switching to a different model if this persists.",
        });
      }
    }
  };

  const clearChatHistory = useCallback(() => {
    setMessages([]);
    setHasStartedChat(false);
    try {
      localStorage.removeItem(`zaviye-${chatType}-messages`);
      localStorage.removeItem(`zaviye-${chatType}-started`);
    } catch (error) {
      console.error("Failed to clear chat history from localStorage:", error);
    }
  }, [chatType]);

  return {
    messages,
    isLoading,
    sendMessage,
    regenerateLastResponse,
    hasStartedChat,
    clearChatHistory,
    stopGeneration,
    throttleSeconds,
  };
}
