import React, { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // Certifique-se de que o caminho para o Firebase está correto
import styles from './page.module.css'; // Para os estilos do vídeo

interface VideoPlayerProps {
  youtubeUrl?: string; // URL do vídeo do YouTube, se aplicável
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeUrl }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar o vídeo do Firebase Storage, se a URL do YouTube não for fornecida
  useEffect(() => {
    if (!youtubeUrl) {
      const fetchVideo = async () => {
        try {
          const videoRef = ref(storage, 'videos/video.mp4'); // Ajuste o caminho do vídeo conforme necessário
          const url = await getDownloadURL(videoRef);
          setVideoUrl(url);
        } catch (error) {
          console.error("Erro ao buscar o vídeo:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchVideo();
    } else {
      setLoading(false); // Não carregar do Firebase se houver uma URL do YouTube
    }
  }, [youtubeUrl]);


  // Função para garantir que o parâmetro rel=0 seja adicionado corretamente
  const generateYouTubeEmbedUrl = (url: string): string => {
    const hasParams = url.includes("?");
    return `${url}${hasParams ? "&" : "?"}rel=0`;
  };

  return (
    <section className={styles.videoSection}>
      <div className={styles.videoContainer}>
        {loading && <p>Carregando...</p>}

        {/* Renderiza o iframe do YouTube com estilo atualizado */}
        {!loading && youtubeUrl && (
          <iframe
            className={styles.videoPlayer}
            src={generateYouTubeEmbedUrl(youtubeUrl)} // Gera a URL correta com rel=0
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            
          ></iframe>
        )}

        {/* Renderiza o vídeo do Firebase */}
        {!loading && !youtubeUrl && videoUrl && (
          <video
            className={styles.videoPlayer}
            src={videoUrl}
            autoPlay
            muted
            playsInline
            loop
            controls
            preload="auto"
          />
        )}
      </div>
    </section>
  );
};

export default VideoPlayer;
