"use client";

import { usePersonas } from "@/hooks/use-personas";
import { generateContent } from "@/lib/gemini";
import type { ChatType, Message } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useChat(chatType: ChatType) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const { getPersona } = usePersonas();
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const fetchAssistantResponse = useCallback(
    async (userPrompt: string) => {
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
    if (!content.trim()) return;
    if (!hasStartedChat) setHasStartedChat(true);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      await fetchAssistantResponse(content);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 });
      }
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    }
  };

  const regenerateLastResponse = async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage) {
      toast.error("Could not find a message to regenerate.");
      return;
    }

    setMessages((prev) =>
      prev.filter((msg) => msg.role !== "assistant" || msg.timestamp < lastUserMessage.timestamp),
    );

    try {
      await fetchAssistantResponse(lastUserMessage.content);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 });
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
  };
}
