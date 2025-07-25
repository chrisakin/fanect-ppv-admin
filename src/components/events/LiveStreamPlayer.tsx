import { useEffect, useRef } from "react";

interface LiveStreamPlayerProps {
  playbackUrl: string;
}

declare global {
  interface Window {
    IVSPlayer: any
  }
}

export default function LiveStreamPlayer({ playbackUrl }: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const loadIVSPlayer = () => {
      return new Promise<typeof window.IVSPlayer>((resolve, reject) => {
        if (window.IVSPlayer) {
          return resolve(window.IVSPlayer);
        }

        const script = document.createElement("script");
        script.src = "https://player.live-video.net/1.29.0/amazon-ivs-player.min.js";
        script.async = true;

        script.onload = () => {
          if (window.IVSPlayer) {
            console.log("✅ IVS Player loaded successfully");
            resolve(window.IVSPlayer);
          } else {
            reject(new Error("IVS Player failed to load"));
          }
        };

        script.onerror = () => reject(new Error("Failed to load IVS Player script"));

        document.head.appendChild(script);
      });
    };

    const initializePlayer = async () => {
      try {
        const IVSPlayer = await loadIVSPlayer();

        if (!IVSPlayer.isPlayerSupported) {
          console.warn("❌ IVS Player is not supported in this browser.");
          return;
        }

        const player = IVSPlayer.create();
        player.attachHTMLVideoElement(videoRef.current!);
        player.load(playbackUrl);
        player.setVolume(1);
        player.play();
      } catch (error) {
        console.error("IVS Player setup error:", error);
      }
    };

    initializePlayer();

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [playbackUrl]);

  return (
    <div className="w-full aspect-video bg-black">
      <video ref={videoRef} className="w-full h-full" playsInline autoPlay muted controls />
    </div>
  );
}
