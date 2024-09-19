import React, { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // Certifique-se de que o caminho para o Firebase está correto
import styles from './page.module.css'; // Para os estilos do vídeo

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar o vídeo do Firebase Storage
  useEffect(() => {
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
  }, []);

  if (loading) {
    return <div>Carregando vídeo...</div>;
  }

  return (
    <div className={styles.videoContainer}>
      {videoUrl && (
        <video
          className={styles.videoPlayer}
          src={videoUrl}
          controlsList="nodownload" 
          autoPlay
          muted
          playsInline
          loop
          controls
          preload="auto" 
        />
      )}
    </div>
  );
};

export default VideoPlayer;
