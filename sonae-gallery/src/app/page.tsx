"use client"; // Indica que este componente é um Client Component

import React, { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth"; // Importe o tipo `User`
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable'; // Importa o hook react-swipeable

import styles from './page.module.css';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // Certifique-se de que este é o caminho correto
import { motion } from 'framer-motion'; // Importar Framer Motion
import JSZip from 'jszip'; // Importa JSZip para compactar os arquivos
import { saveAs } from 'file-saver'; // Biblioteca para salvar o arquivo zip
import logo from './assets/Sonae-Logo.png'; // Importar o logo
import bolas from './assets/BOLAS.png'
import risca from './assets/risca.png'
import circle from './assets/circle.png'

const Gallery = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Estado para carregamento de autenticação
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Estado para bloquear o botão durante o download

  const [images, setImages] = useState<string[]>([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [showTopLogo, setShowTopLogo] = useState(false); // Estado para controlar o logo do topo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null); // Referência para o modal
  const router = useRouter();
  const blockSize = 12; // Definir o número de imagens por bloco
  const [imageLoadingStatus, setImageLoadingStatus] = useState<boolean[]>([]); // Estado para armazenar o carregamento de cada imagem


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
    const fetchImages = async () => {
      const storageRef = ref(storage, 'galeria/');
      const res = await listAll(storageRef);
      const imageUrls = await Promise.all(res.items.map(item => getDownloadURL(item)));
      setImages(imageUrls);
      // Define o estado de carregamento das imagens como verdadeiro inicialmente
      setImageLoadingStatus(Array(imageUrls.length).fill(true));
    };
    fetchImages();
  }, []);
   // Função chamada quando uma imagem termina de carregar
   const handleImageLoad = (index: number) => {
    const updatedLoadingStatus = [...imageLoadingStatus];
    updatedLoadingStatus[index] = false; // Marca a imagem como carregada
    setImageLoadingStatus(updatedLoadingStatus);
  };


  // Função para carregar mais blocos de imagens à medida que o usuário rola
  const loadMoreImages = () => {
    if (currentBlock * blockSize >= images.length) return; // Se todas as imagens forem carregadas, não faz mais nada
    setLoading(true);
    setTimeout(() => {
      setCurrentBlock((prevBlock) => prevBlock + 1);
      setLoading(false);
    }, 1000); // Simula um pequeno atraso
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

  // Função para baixar todas as imagens como ZIP
  const downloadAllAsZip = async () => {
    setIsDownloading(true); // Bloqueia o botão enquanto o download estiver em andamento
    const zip = new JSZip();
    const imgFolder = zip.folder('galeria-download'); 

    try {
      const downloadPromises = images.map(async (imageUrl, index) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const fileName = `image_${index}.jpg`;
        imgFolder?.file(fileName, blob);
      });

      await Promise.all(downloadPromises);

      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'galeria.zip'); // Salva o arquivo ZIP
        setIsDownloading(false); // Desbloqueia o botão após o download
      });
    } catch (error) {
      console.error("Erro ao fazer o download do álbum:", error);
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

  // Função para definir se uma imagem é horizontal ou vertical
  const isHorizontal = (width: number, height: number) => width > height;

  // Função para baixar a imagem como Blob
  const downloadImage = async () => {
    if (currentImageIndex !== null) {
      const imageUrl = images[currentImageIndex];
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `image_${currentImageIndex}.jpg`; // Nome do arquivo para download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Erro ao fazer o download da imagem:", error);
      }
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
          <img src={logo.src} alt="Sonae Logo" className={styles.spinnerLogo} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      {/* Logo do topo que agora é o logo grande (do loading) */}
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
      <p className={styles.heroSubtitle}>Event Photos</p>

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
        onClick={downloadAllAsZip}
        disabled={isDownloading} // Desabilita o botão durante o download
      >
        {isDownloading ? 'A descarregar...' : 'Descarregar álbum'}
      </motion.button>

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


      <div className={styles.gallery}>
        {imagesToDisplay.map((image, index) => (
          <motion.div
            key={index}
            className={`${styles.galleryItem}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
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
                if (isHorizontal(imgElement.naturalWidth, imgElement.naturalHeight)) {
                  imgElement.parentElement?.classList.add(styles.horizontal); // Horizontal ocupa duas colunas
                } else {
                  imgElement.parentElement?.classList.add(styles.vertical); // Vertical ocupa uma coluna
                }
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
