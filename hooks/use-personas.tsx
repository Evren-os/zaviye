"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  type PropsWithChildren,
  type ElementType,
} from "react";
import type { Persona } from "@/lib/types";
import { systemPrompts } from "@/lib/system-prompts";
import { ZapIcon, GitBranchIcon, VolumeXIcon, User } from "lucide-react";

const CUSTOM_PERSONAS_STORAGE_KEY = "zaviye-custom-personas";

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: "glitch",
    name: "Glitch",
    prompt: systemPrompts.glitch,
    isDefault: true,
    icon: ZapIcon,
    placeholder: "Enter formal text to convert...",
    introMessage:
      "Transform formal text into authentic internet speak. Drop your text here and watch it become natural, conversational, and real.",
    description:
      "Glitch converts formal or technical text into authentic casual internet speech while preserving 100% of the original meaning. Perfect for making your messages sound natural and conversational. You can add parameters like '+emotion' for expressive output, '+formal' to maintain professionalism, or '+variants=3' for multiple options. Just paste your text and get instant transformation.",
    demoPrompts: [
      "The board has decided to postpone the quarterly review meeting until next week to accommodate the new project timelines.",
      "Our analysis indicates a statistically significant correlation between user engagement and the implementation of the new feature.",
      "Per my previous email, please ensure all documentation is updated in Confluence prior to the client demonstration.",
      "I am writing to formally request an extension for the submission deadline of the Q3 performance report.",
    ],
  },
  {
    id: "blame",
    name: "Blame",
    prompt: systemPrompts.blame,
    isDefault: true,
    icon: GitBranchIcon,
    placeholder: "Paste git status, changed files, and a description...",
    introMessage:
      "Craft professional git commits that follow best practices. Share your changes and get perfectly formatted commit messages.",
    description:
      "Blame generates professional git commit messages following Conventional Commits standards. Simply paste your git status output, list changed files, and describe what you did. Blame analyzes your changes and creates properly formatted commit messages that your team will appreciate. Perfect for maintaining clean git history and following best practices.",
    demoPrompts: [
      "git status: modified: src/components/ui/button.tsx\nidea: updated button styles to match new design system",
      "changed files: src/utils/api.ts, src/hooks/use-data.ts\nidea: refactored api calls to use new auth middleware",
      "git status: new file: docs/new-feature.md, modified: README.md\nidea: added documentation for the new import feature",
      "changed files: package.json, yarn.lock\nidea: upgraded nextjs and other dependencies",
    ],
  },
  {
    id: "reson",
    name: "Reson",
    prompt: systemPrompts.reson,
    isDefault: true,
    icon: VolumeXIcon,
    placeholder: "Enter words to pronounce, e.g., onomatopoeia, ambiguous",
    introMessage:
      "Master pronunciation of any English word. Type a word or phrase for a detailed pronunciation guide.",
    description:
      "Reson provides detailed pronunciation guides for any English word or phrase using only standard English letters - no complex phonetic symbols. Just type a word like 'pronunciation' and get step-by-step guides showing syllable breakdown, stress patterns, and practice tips. Ideal for learning technical terms, names, or difficult vocabulary.",
    demoPrompts: ["Worcestershire", "Anemone", "Onomatopoeia", "Phenomenon"],
  },
];

interface PersonasContextType {
  getPersona: (id: string) => Persona | undefined;
  getAllPersonas: () => Persona[];
  createPersona: (data: { name: string; prompt: string }) => string;
  updatePersona: (id: string, data: Partial<Omit<Persona, "id" | "isDefault">>) => void;
  deletePersona: (id: string) => void;
  selectPersona: (id: string) => void;
  resetPersonaToDefault: (id: string) => void;
}

const PersonasContext = createContext<PersonasContextType | null>(null);

export function PersonasProvider({ children }: PropsWithChildren) {
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY);
      if (saved) {
        const parsed = (JSON.parse(saved) as Persona[]).map((p) => ({ ...p, icon: User }));
        setCustomPersonas(parsed);
      }
    } catch (error) {
      console.error("Failed to load custom personas from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const toSave = customPersonas.map(({ icon, ...rest }) => rest);
      localStorage.setItem(CUSTOM_PERSONAS_STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error("Failed to save custom personas to localStorage:", error);
    }
  }, [customPersonas, isMounted]);

  const personas = useMemo<Persona[]>(() => {
    if (!isMounted) return DEFAULT_PERSONAS;

    const defaultMap = new Map(DEFAULT_PERSONAS.map((p) => [p.id, p]));
    const customMap = new Map(customPersonas.map((p) => [p.id, p]));

    const merged = DEFAULT_PERSONAS.map((defaultPersona) => {
      const customOverride = customMap.get(defaultPersona.id);
      if (customOverride) {
        return {
          ...defaultPersona,
          name: customOverride.name || defaultPersona.name,
          prompt: customOverride.prompt || defaultPersona.prompt,
          placeholder: customOverride.placeholder || defaultPersona.placeholder,
          lastUsed: customOverride.lastUsed,
        };
      }
      return defaultPersona;
    });

    const nonOverridingCustom = customPersonas.filter((p) => !defaultMap.has(p.id));

    return [...merged, ...nonOverridingCustom];
  }, [customPersonas, isMounted]);

  const getPersona = useCallback(
    (id: string): Persona | undefined => {
      return personas.find((p) => p.id === id);
    },
    [personas],
  );

  const getAllPersonas = useCallback((): Persona[] => {
    return [...personas].sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0));
  }, [personas]);

  const updatePersona = useCallback(
    (id: string, data: Partial<Omit<Persona, "id" | "isDefault">>) => {
      setCustomPersonas((prev) => {
        const existing = prev.find((p) => p.id === id);
        if (existing) {
          return prev.map((p) => (p.id === id ? { ...p, ...data } : p));
        }
        const defaultPersona = DEFAULT_PERSONAS.find((p) => p.id === id);
        if (defaultPersona) {
          const newOverride: Persona = {
            id,
            name: data.name ?? defaultPersona.name,
            prompt: data.prompt ?? defaultPersona.prompt,
            placeholder: data.placeholder,
            isDefault: true,
            icon: User,
            lastUsed: data.lastUsed,
          };
          return [...prev, newOverride];
        }
        return prev;
      });
    },
    [],
  );

  const createPersona = useCallback((data: { name: string; prompt: string }): string => {
    const newId = crypto.randomUUID();
    const newPersona: Persona = {
      ...data,
      id: newId,
      isDefault: false,
      icon: User,
      lastUsed: Date.now(),
    };
    setCustomPersonas((prev) => [...prev, newPersona]);
    return newId;
  }, []);

  const deletePersona = useCallback((id: string) => {
    setCustomPersonas((prev) => prev.filter((p) => p.id !== id && !p.isDefault));
  }, []);

  const selectPersona = useCallback(
    (id: string) => {
      const persona = getPersona(id);
      if (!persona) return;
      updatePersona(id, { lastUsed: Date.now() });
    },
    [getPersona, updatePersona],
  );

  const resetPersonaToDefault = useCallback((id: string) => {
    const isDefault = DEFAULT_PERSONAS.some((p) => p.id === id);
    if (!isDefault) return;
    setCustomPersonas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const contextValue = useMemo(
    () => ({
      getPersona,
      getAllPersonas,
      createPersona,
      updatePersona,
      deletePersona,
      selectPersona,
      resetPersonaToDefault,
    }),
    [
      getPersona,
      getAllPersonas,
      createPersona,
      updatePersona,
      deletePersona,
      selectPersona,
      resetPersonaToDefault,
    ],
  );

  return <PersonasContext.Provider value={contextValue}>{children}</PersonasContext.Provider>;
}

export function usePersonas() {
  const context = useContext(PersonasContext);
  if (!context) {
    throw new Error("usePersonas must be used within a PersonasProvider");
  }
  return context;
}
