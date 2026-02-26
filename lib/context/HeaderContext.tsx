"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface HeaderContextType {
    title: string;
    description: string;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <HeaderContext.Provider value={{ title, description, setTitle, setDescription }}>
            {children}
        </HeaderContext.Provider>
    );
}

export function useHeader() {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("useHeader must be used within a HeaderProvider");
    }
    return context;
}
