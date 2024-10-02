"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Para navegação após login
import { setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "firebase/auth"; // Importa a persistência e autenticação do Firebase
import { auth } from '../../../firebase'; // Certifique-se de que o caminho está correto
import { motion } from 'framer-motion'; // Importa o framer-motion para animações
import styles from './login.module.css'; // Arquivo CSS para o design
import logo from '../assets/Sonae-Logo.png'; // Logo da Sonae
import circle from '../assets/circle.png'; // Sua imagem de círculo
import risca from '../assets/risca.png'; // Sua imagem de risca

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // Controla quando mostrar o formulário
  const router = useRouter();

  useEffect(() => {
    // Mostra o formulário 3 segundos após carregar a página
    const formTimer = setTimeout(() => {
      setShowForm(true);
    }, 3000);

    return () => {
      clearTimeout(formTimer);
    };
  }, []);

  // Handle login with Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const email = 'corporatesonae@galery.com'; // Email corporativo predefinido
      // Define a persistência da sessão como 'session' (apenas na sessão atual do navegador)
      await setPersistence(auth, browserSessionPersistence);
      // Faz a autenticação com o email predefinido e a senha que o usuário insere
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redireciona após login bem-sucedido
    } catch (error) {
      // Define a mensagem de erro
      setError('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Circle Image with Sonae Logo */}
      <motion.div
        className={styles.circleWrapper}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 2 }}
      >
       {/** <img src={circle.src} alt="Circle" className={styles.circle} /> */}

        <div className={styles.centerContainer}>
          {/* Animação suave para o logotipo */}
          <motion.img
            src={logo.src}
            alt="Sonae Logo"
            className={styles.logoInsideCircle}
            initial={{ opacity: 0, scale: 0.8 }} // Começa com menor escala e opacidade
            animate={{ opacity: 1, scale: 1 }} // Gradualmente aumenta a opacidade e escala
            transition={{ duration: 1.5, ease: "easeInOut" }} // Animação suave
          />

          {/* Formulário de senha que aparece após 3 segundos */}
          {showForm && (
            <motion.form
              className={styles.loginForm}
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 50 }} // Começa abaixo com opacidade 0
              animate={{ opacity: 1, y: 0 }} // Gradualmente sobe para a posição correta e aumenta a opacidade
              transition={{ duration: 1.2, ease: "easeInOut" }} // Transição suave
            >
              <motion.input
                type="password"
                placeholder="Insira password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                initial={{ scale: 0.8, opacity: 0 }} // Campo de input começa menor e invisível
                animate={{ scale: 1, opacity: 1 }} // Gradualmente aumenta para o tamanho normal e fica visível
                transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }} // Pequeno atraso para a entrada
              />
              {error && (
                <motion.p
                  className={styles.errorMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
              <motion.button
                type="submit"
                initial={{ opacity: 0, y: 50 }} // Botão começa fora da tela
                animate={{ opacity: 1, y: 0 }} // Gradualmente sobe e aparece
                transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }} // Atraso para aparecer
              >
                Entrar
              </motion.button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
