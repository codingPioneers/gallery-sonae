import React, { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // Certifique-se de que o caminho para o Firebase está correto
import styles from './page.module.css'; // Para os estilos do vídeo

interface VideoPlayerProps {
  youtubeUrl?: string; // URL do vídeo do YouTube, se aplicável
  selectedEdition: string; // Prop para a edição selecionada

}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeUrl, selectedEdition }) => {
  const [videoWebmUrl, setVideoWebmUrl] = useState<string | null>(null);
  const [videoMp4Url, setVideoMp4Url] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar o vídeo do Firebase Storage, se a URL do YouTube não for fornecida
  useEffect(() => {
    if (!youtubeUrl) {
      const fetchVideo = async () => {
        try {
          const webmRef = ref(storage, `videos/${selectedEdition}.webm`);
          const mp4Ref = ref(storage, `videos/${selectedEdition}.mp4`);
  
          const webmUrl = await getDownloadURL(webmRef);
          const mp4Url = await getDownloadURL(mp4Ref);
  
          setVideoWebmUrl(webmUrl);
          setVideoMp4Url(mp4Url);
        } catch (error) {
          console.error("Erro ao buscar o vídeo:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchVideo();
    } else {
      setLoading(false);
    }
  }, [youtubeUrl, selectedEdition]); // Ensure selectedEdition triggers a re-fetch
  

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
        {!loading && !youtubeUrl && (videoWebmUrl || videoMp4Url) && (
          <video
          className={styles.videoPlayer}
          autoPlay
          muted
          playsInline
          loop
          controls
          preload="auto"
          controlsList="nodownload" // Bloqueia o botão de download
        >
          {videoMp4Url && <source src={videoMp4Url} type="video/mp4" />}
          {videoWebmUrl && <source src={videoWebmUrl} type="video/webm" />}
          Seu navegador não suporta a reprodução de vídeos.
        </video>
        )}
      </div>
    </section>
  );
};

export default VideoPlayer;
