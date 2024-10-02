"use client"; // Indica que este componente é um Client Component

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Importar Framer Motion
import styles from './page.module.css';
import logo from '../assets/Sonae-Logo.png'; // Importar o logo
import bolas from '../assets/BOLAS.png';
import risca from '../assets/risca.png';
import circle from '../assets/circle.png';
import VideoPlayer from '../videoPlayer'; // Importar o componente VideoPlayer
import { usePathname } from "next/navigation"; // Para saber a página atual
import Link from "next/link";


const videoData = [
  {
    url: "https://www.youtube.com/embed/QX1Qy50UllQ?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "João Gunther Amaral",
    subtitle: "Welcome"
  },
  {
    url: "https://www.youtube.com/embed/r3FOwKdTgyA?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Marta Cunha",
    subtitle: "Agenda & Check in"
  },
  {
    url: "https://www.youtube.com/embed/4DvKsip96r4?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Christiane Duarte",
    subtitle: "Above the Line & Below the Line"
  },
  {
    url: "https://www.youtube.com/embed/Y8it9n3l7bU?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Marta Cunha",
    subtitle: "Our Legacy"
  },
  {
    url: "https://www.youtube.com/embed/I3Ls3C_kflU?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Fernando Guedes Oliveira",
    subtitle: "Our Legacy"
  },
  {
    url: "https://www.youtube.com/embed/K-Q5Paul1ac?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Cláudia Azevedo",
    subtitle: "Change Story"
  },
  {
    url: "https://www.youtube.com/embed/ddfFZWLFsM0?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Christiane Duarte",
    subtitle: "Reflection"
  },
  {
    url: "https://www.youtube.com/embed/ETnT07o-DXU?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Marta Cunha",
    subtitle: "The BackStage"
  },
  {
    url: "https://www.youtube.com/embed/NON3wNatfOs?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "João Gunther Amaral",
    subtitle: "People Performance Management"
  },
  {
    url: "https://www.youtube.com/embed/uStJUFOGUWI?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "BPM Project",
    subtitle: "Stations People Performance Management"
  },
  {
    url: "https://www.youtube.com/embed/gyGgNAi2v80?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Miguel Tolentino",
    subtitle: "PPM System"
  },
  {
    url: "https://www.youtube.com/embed/40aCIz3eBik?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Doug Manuel",
    subtitle: ""
  },
  {
    url: "https://www.youtube.com/embed/INQg5g0aDRk?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Marta Cunha",
    subtitle: "Agenda & Check In"
  },
  {
    url: "https://www.youtube.com/embed/2vQT0INi2Rc?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "João Dolores",
    subtitle: "Business Performance Management"
  },
  {
    url: "https://www.youtube.com/embed/LWweVkGLSYs?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "Pedro Guerner",
    subtitle: "BPM System"
  },
  {
    url: "https://www.youtube.com/embed/BfcOpF6AOlQ?list=PLLnBG4u93eKIY0QbTHxn-panFBTIVJPpP",
    speaker: "ExCom & CEOs",
    subtitle: "Interviewing our ExCom & our CEOs"
  }
];




const VideosPage = () => {
  const [isDownloading, setIsDownloading] = useState(false); // Estado para bloquear o botão durante o download
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null); // URL para o download do vídeo
  const [isVideoLoading, setIsVideoLoading] = useState(true); // Estado para indicar se o vídeo está carregando
  const [isVisible, setIsVisible] = useState(false); // Controla a visibilidade da barra
  const pathname = usePathname(); // Identifica a página atual

 

  const handleDownloadVideo = async (videoUrl: string) => {
    setIsDownloading(true); // Bloqueia o botão enquanto o download estiver em andamento
  
    try {
      // Criar um link de download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'video.mp4'; // Nome do arquivo que será baixado
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      setIsDownloading(false); // Desbloqueia o botão após o download
    } catch (error) {
      console.error("Erro ao fazer o download do vídeo:", error);
      setIsDownloading(false); // Desbloqueia o botão em caso de erro
    }
  };
  

  useEffect(() => {
    // Mostra a barra de navegação após 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className={styles.background}>

{isVisible && (
        <motion.nav
          style={navStyle}
          initial={{ opacity: 0, y: -50 }} // Começa invisível e deslocada para cima
          animate={{ opacity: 1, y: 0 }} // Suavemente se torna visível e desloca para a posição correta
          transition={{ duration: 1 }} // Controle da duração da animação (1 segundo)
        >
          <ul style={navListStyle}>
            <li style={navItemStyle}>
              <Link href="/" style={pathname === "/" ? navLinkActiveStyle : navLinkStyle}>
                Galeria
              </Link>
            </li>
            <li style={navItemStyle}>
              <Link href="/palestras" style={pathname === "/palestras" ? navLinkActiveStyle : navLinkStyle}>
                Palestras
              </Link>
            </li>
          </ul>
        </motion.nav>
      )}
      <div className={styles.heroSection}>
        {/* Círculo grande de fundo com animação */}
        <motion.img
          src={circle.src}
          alt="Sonae Logo"
          className={styles.circle1}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />

        {/* Coluna Esquerda: Logo e Texto */}
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.img
            src={logo.src}
            alt="Sonae Logo"
            className={styles.heroLogo}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          />

          <motion.div
            className={styles.textContainer}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <p className={styles.heroSubtitle}>Palestras & Oradores</p>

            <motion.img
              src={risca.src}
              alt="Sonae Risca"
              className={styles.risca}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />

            <p className={styles.eventDate}>16 & 17 September</p>
          </motion.div>
        </motion.div>






        {/* Coluna Direita: Imagem de Bolas com Círculo */}
        <motion.div
          className={styles.heroImageContainer}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.img
            src={bolas.src}
            alt="Event Graphic"
            className={styles.heroImage}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
          />

          <motion.img
            src={circle.src}
            alt="Sonae Circle"
            className={styles.circle}
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 1.6 }}
          />
        </motion.div>
      </div>




    {/* Lista de Vídeos */}
<div className={styles.videoList}>
  {videoData.map((video, index) => (
    <motion.div
      key={index}
      className={styles.videoItem}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <VideoPlayer youtubeUrl={video.url} />
      <div className={styles.videoInfo}>
        <div className={styles.leftSection}>
          <h1>{video.speaker}</h1> 
          <p className={styles.subtitle}>{video.subtitle}</p> 
        </div>
      </div>
    </motion.div>
  ))}
</div>


    </div>
  );
};

export default VideosPage;






// Estilos da barra de navegação
const navStyle = {
  backgroundColor: "transparent",
  padding: "10px",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60px",
  fontWeight: "600",
};

const navListStyle = {
  listStyle: "none",
  display: "flex",
  justifyContent: "center",
  margin: 0,
  padding: 0,
};

const navItemStyle = {
  display: "inline",
  margin: "0 20px",
};

const navLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "18px",
  padding: "10px 20px",
  fontWeight: "bold",
};

const navLinkActiveStyle = {
  ...navLinkStyle,
  textDecoration: "underline",
};


