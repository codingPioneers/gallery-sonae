"use client"; 

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importando o hook do Next.js
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Instanciando o router para redirecionamento

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Se o usuário não estiver logado, redireciona para login
      if (!currentUser) {
        router.push("/login");
      }
    });

    return unsubscribe;
  }, [router]); // Dependência no router para evitar loops

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login"); // Redireciona para login ao deslogar
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children} {/* Só renderiza os filhos após carregar */}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
