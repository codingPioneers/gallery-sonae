"use client"; // Indica que este componente é um Client Component

import React, { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth"; // Importe o tipo `User`
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable'; // Importa o hook react-swipeable
import { usePathname } from "next/navigation"; // Para saber a página atual
import Link from "next/link";
import { useMediaQuery } from '@mui/material';

import styles from './page.module.css';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from '../../firebase'; // Certifique-se de que este é o caminho correto
import { motion } from 'framer-motion'; // Importar Framer Motion
import JSZip from 'jszip'; // Importa JSZip para compactar os arquivos
import { saveAs } from 'file-saver'; // Biblioteca para salvar o arquivo zip
import logo from './assets/Sonae-Logo.png'; // Importar o logo
import bolas from './assets/BOLAS.png'
import risca from './assets/risca.png'
import circle from './assets/circle.png'
import VideoPlayer from './videoPlayer';
import Navbar from './global/Navbar';

const Gallery = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Estado para carregamento de autenticação
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Estado para bloquear o botão durante o download

  const [images, setImages] = useState<string[]>([]);
  const [imageLoadingStatus, setImageLoadingStatus] = useState<boolean[]>([]); // Estado para armazenar o carregamento de cada imagem
  const [currentBlock, setCurrentBlock] = useState(0);
  const [showTopLogo, setShowTopLogo] = useState(false); // Estado para controlar o logo do topo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null); // Referência para o modal
  const router = useRouter();
  const blockSize = 12; // Definir o número de imagens por bloco
  const [allImagesLoaded, setAllImagesLoaded] = useState(false); // Estado para verificar se todas as imagens foram carregadas
  const [isVisible, setIsVisible] = useState(false); // Controla a visibilidade da barra
  const pathname = usePathname(); // Identifica a página atual
  const isSmallScreen = useMediaQuery('(max-width: 768px)');


  // Verificação de autenticação
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); // Redireciona para login se não autenticado
      }
      setLoadingAuth(false); // Marca a verificação de autenticação como concluída
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Mostra a barra de navegação após 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Função chamada quando uma imagem termina de carregar
  const handleImageLoad = (index: number) => {
    setImageLoadingStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[index] = false;
      return newStatus;
    });
  };

  // Carregar as imagens em lotes (batches)
  const fetchImagesInBatches = async (batchSize: number) => {
    const storageRef = ref(storage, 'galeria/');
    const res = await listAll(storageRef);
    const totalImages = res.items.length;
  
    for (let i = 0; i < totalImages; i += batchSize) {
      const batch = res.items.slice(i, i + batchSize);
      const urls = await Promise.all(batch.map(item => getDownloadURL(item)));
      
      // Adicione uma verificação para garantir que as imagens não sejam duplicadas
      setImages((prevImages) => {
        const newImages = [...prevImages, ...urls];
        // Filtra imagens duplicadas
        return Array.from(new Set(newImages));
      });
      
      setImageLoadingStatus((prevStatus) => [...prevStatus, ...Array(urls.length).fill(true)]);
  
      // Pequeno delay entre os lotes para evitar sobrecarregar o navegador
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };
  

  useEffect(() => {
    fetchImagesInBatches(10); // Limite o número de imagens a serem carregadas por vez
  }, []);









  
  // Função para carregar mais blocos de imagens à medida que o usuário rola
  const loadMoreImages = () => {
    if (currentBlock * blockSize >= images.length) return; // Se todas as imagens forem carregadas, não faz mais nada
    setLoading(true);
    setTimeout(() => {
      setCurrentBlock((prevBlock) => prevBlock + 1);
      setLoading(false);
    }, 0); // Simula um pequeno atraso
  };







  // Função para observar o final da galeria e carregar mais imagens
  useEffect(() => {
    const currentObserver = observerRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreImages();
      }
    }, { threshold: 1.0 });

    if (currentObserver) observer.observe(currentObserver);

    return () => {
      if (currentObserver) observer.unobserve(currentObserver);
    };
  }, [observerRef, images]);











  const downloadZipFromStorage = async () => {
    setIsDownloading(true); // Bloqueia o botão enquanto o download estiver em andamento

    try {
      const zipRef = ref(storage, 'galeria-ziped/gallery.zip'); // Caminho para o arquivo ZIP no Firebase Storage
      const zipUrl = await getDownloadURL(zipRef);

      // Criar um link de download
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'galeria.zip'; // Nome do arquivo que será baixado
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsDownloading(false); // Desbloqueia o botão após o download
    } catch (error) {
      console.error("Erro ao fazer o download do ZIP:", error);
      setIsDownloading(false); // Desbloqueia o botão em caso de erro
    }
  };







  // Função para abrir a preview de uma imagem
  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(null);
  };

  // Função para navegar entre as imagens
  const goToNextImage = () => {
    if (currentImageIndex !== null && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex !== null && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Implementação do swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextImage(),
    onSwipedRight: () => goToPreviousImage(),
    preventScrollOnSwipe: true, // Evita o scroll enquanto faz o swipe
    trackTouch: true,
  });


  // Adicione um efeito para capturar eventos de teclado
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isModalOpen) {
      if (event.key === 'ArrowRight') {
        goToNextImage(); // Próxima imagem
      } else if (event.key === 'ArrowLeft') {
        goToPreviousImage(); // Imagem anterior
      } else if (event.key === 'Escape') {
        closeModal(); // Fechar modal com 'Esc'
      }
    }
  };

  // Adiciona o event listener quando o modal é aberto
  if (isModalOpen) {
    window.addEventListener('keydown', handleKeyDown);
  }

  // Remove o event listener quando o modal é fechado
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isModalOpen, currentImageIndex]); // Reexecuta quando o modal é aberto ou fechado




  const downloadImage = async () => {
    if (currentImageIndex !== null) {
      const imageUrl = images[currentImageIndex];
      try {
        // Extrai o nome do arquivo da URL sem o caminho completo, removendo "galeria/" se presente
        const fullPath = decodeURIComponent(imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split('?')[0]);
        const imageName = fullPath.replace('galeria/', ''); // Remove qualquer "galeria/" do caminho
  
        // Cria uma referência para a mesma imagem na pasta correta de alta qualidade
        const highQualityRef = ref(storage, `galeria-download/${imageName}`);
  
        // Obtém a URL de download da imagem em alta qualidade
        const highQualityUrl = await getDownloadURL(highQualityRef);
  
        // Faz o download da imagem em alta qualidade
        const response = await fetch(highQualityUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
  
        // Cria um link temporário para download
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = imageName; // Usar o mesmo nome de arquivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
  
        // Revoga o URL temporário
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Erro ao fazer o download da imagem de alta qualidade:", error);
      }
    }
  };
  
  

  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null); // URL para o download do vídeo
  const [isVideoDownloading, setIsVideoDownloading] = useState(false); // Estado para indicar se o vídeo está sendo baixado
  const [videoDownloadProgress, setVideoDownloadProgress] = useState(0); // Progresso do download do vídeo
  const [isVideoLoading, setIsVideoLoading] = useState(true); // Estado para indicar se o vídeo está carregando
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoRef = ref(storage, 'video-ziped/video.mov.zip'); // Caminho do vídeo no Firebase Storage
        const url = await getDownloadURL(videoRef);
        setVideoDownloadUrl(url); // Guarda a URL do vídeo no estado
      } catch (error) {
        console.error("Erro ao buscar o vídeo:", error);
      } finally {
        setIsVideoLoading(false); // O vídeo terminou de carregar
      }
    };
  
    fetchVideo();
  }, []);
  
  const handleDownloadVideo = async () => {
    setIsDownloading(true); // Bloqueia o botão enquanto o download estiver em andamento

    try {
      const zipRef = ref(storage, 'video-ziped/video.mov.zip'); // Caminho para o arquivo ZIP no Firebase Storage
      const zipUrl = await getDownloadURL(zipRef);

      // Criar um link de download
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = 'video.zip'; // Nome do arquivo que será baixado
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsDownloading(false); // Desbloqueia o botão após o download
    } catch (error) {
      console.error("Erro ao fazer o download do ZIP:", error);
      setIsDownloading(false); // Desbloqueia o botão em caso de erro
    }
  };
  














  const imagesToDisplay = images.slice(0, (currentBlock + 1) * blockSize);

  // Função de ref callback para combinar refs
  const combinedRef = (el: HTMLDivElement) => {
    modalRef.current = el;
    swipeHandlers.ref(el); // Associa o ref do swipeHandlers
  };

  // Exibe um carregamento durante a verificação de autenticação
  if (loadingAuth) {
    return (
      <div className={styles.loadingContainer}>
      <div className={styles.spinnerWrapper}>
        <motion.img
          src={logo.src}
          alt="Sonae Logo"
          className={styles.spinnerLogo}
          initial={{ opacity: 0, y: -50 }} // Inicialmente invisível e levemente acima
          animate={{ opacity: 1, y: 0 }}   // Fica visível e se move para a posição original
          exit={{ opacity: 0, y: 50 }}     // Ao sair, fica invisível e move para baixo
          transition={{ duration: 3 }}     // Duração da animação de 3 segundos
        />
      </div>
    </div>
    );
  }






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
            <p className={styles.heroSubtitle}>Shaping our culture</p>

            <motion.img
              src={risca.src}
              alt="Sonae Risca"
              className={styles.risca}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />

            <p className={styles.eventDate}>16 & 17 September</p>
            <motion.button
              className={styles.downloadAllButton}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              onClick={downloadZipFromStorage}
              disabled={isDownloading} // Desabilita o botão durante o download
            >
              {isDownloading ? 'A descarregar...' : 'Descarregar álbum'}
            </motion.button>

{/* Botão para baixar o vídeo */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, ease: "easeInOut", delay: 1.0 }}
  className={styles.additionalDownloadContainer}
>
  <button onClick={handleDownloadVideo} id={styles.downloadVideo}>
    {isVideoDownloading ? `A descarregar... (${videoDownloadProgress}%)` : 'Descarregar vídeo'}
  </button>
</motion.div>






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







    <div className={styles.videoSection}>
    <motion.div
    initial={{ opacity: 0, scale: 0.8 }} // Começa com opacidade 0 e menor escala
    animate={{ opacity: 1, scale: 1 }}   // Anima para opacidade 1 e escala normal
    transition={{  duration: 2, delay:2 }}       // Duração da animação de 1.5 segundos
    style={{ width: isSmallScreen ? '100%' : '90%', zIndex:'1' }}
  >
    <VideoPlayer/>
    </motion.div>

    </div>







     <div className={styles.gallery}>
        {imagesToDisplay.map((image, index) => (
          <motion.div
            key={index}
            className={styles.galleryItem}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay:0 }}
            onClick={() => openModal(index)} // Abre o modal ao clicar
          >
            <img
              loading="lazy"
              src={image}
              alt={`Gallery Image ${index}`}
              className={styles.image}
              width="100%"
              height="auto"
              decoding="async"
              onLoad={(e) => {
                const imgElement = e.currentTarget;
                const isHorizontal = imgElement.naturalWidth > imgElement.naturalHeight;

                // Aplica a classe CSS baseada na orientação da imagem
                if (isHorizontal) {
                  imgElement.parentElement?.classList.add(styles.horizontal); // Horizontal ocupa duas colunas
                } else {
                  imgElement.parentElement?.classList.add(styles.vertical); // Vertical ocupa uma coluna
                }

                // Marca a imagem como carregada
                handleImageLoad(index);
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Elemento "sentinela" para o IntersectionObserver */}
      <div ref={observerRef} className={styles.observer}></div>

      {loading && (
        <div className={styles.spinner}>
          <div className={styles.loader}></div>
        </div>
      )}













      {/* Modal de preview */}
      {isModalOpen && currentImageIndex !== null && (
        <div ref={combinedRef} className={styles.modal} onClick={closeModal}>
          <div className={styles.modalHeader}>
            <button className={styles.downloadButton} onClick={downloadImage}>
              <div className={styles.downloadIconWrapper}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                >
                  <path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4v-6h3l-5-5z" />
                </svg>
                <span>Descarregar</span>
              </div>
            </button>
            <button className={styles.closeButton} onClick={closeModal}>
              &times;
            </button>
          </div>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.prevButton} onClick={goToPreviousImage}>
              &#8249;
            </button>
            <img src={images[currentImageIndex]} alt="Preview" className={styles.modalImage} />
            <button className={styles.nextButton} onClick={goToNextImage}>
              &#8250;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;



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
