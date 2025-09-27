"use client";

import { usePersonas } from "@/hooks/use-personas";
import { generateContent } from "@/lib/gemini";
import { getModelById } from "@/lib/models";
import type { ChatType, Message, ModelId } from "@/lib/types";
import { checkThrottle, startThrottleTimer, handleError, safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from "@/lib/utils";
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
    const savedMessages = safeLocalStorageGet(`zaviye-${chatType}-messages`, []);
    const savedChatState = safeLocalStorageGet(`zaviye-${chatType}-started`, false);
    setMessages(savedMessages);
    setHasStartedChat(savedChatState);
  }, [chatType]);

  useEffect(() => {
    safeLocalStorageSet(`zaviye-${chatType}-messages`, messages);
  }, [messages, chatType]);

  useEffect(() => {
    safeLocalStorageSet(`zaviye-${chatType}-started`, hasStartedChat);
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
      return checkThrottle(
        modelId,
        requestTimestamps,
        setThrottleSeconds,
        setRequestTimestamps,
        (timeToWait) => {
          if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
          throttleTimerRef.current = startThrottleTimer(setThrottleSeconds);
          toast.warning(`Rate limit reached. Please wait ${timeToWait} seconds.`, { duration: 2000 });
        }
      );
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
      handleError(error, "sendMessage", toast);
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
      handleError(error, "regenerateLastResponse", toast);
    }
  };

  const clearChatHistory = useCallback(() => {
    setMessages([]);
    setHasStartedChat(false);
    safeLocalStorageRemove(`zaviye-${chatType}-messages`);
    safeLocalStorageRemove(`zaviye-${chatType}-started`);
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
