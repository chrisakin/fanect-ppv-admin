import { useEffect, useRef } from "react";

// Props for the LiveStreamPlayer component
interface LiveStreamPlayerProps {
  // URL provided by the streaming backend (e.g., Amazon IVS playback URL)
  playbackUrl: string;
}

// Extend the global Window type with `IVSPlayer` which is injected by
// the Amazon IVS player script at runtime.
declare global {
  interface Window {
    IVSPlayer: any
  }
}

/**
 * LiveStreamPlayer
 * - Dynamically loads the Amazon IVS player script if it isn't already
 *   present on the page.
 * - Initializes the IVS player and attaches it to the internal
 *   <video> element referenced by `videoRef`.
 * - Starts playback of the provided `playbackUrl` and ensures basic
 *   cleanup (pausing) on unmount or when the URL changes.
 */
export default function LiveStreamPlayer({ playbackUrl }: LiveStreamPlayerProps) {
  // Reference to the native <video> element where IVS will render.
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // loadIVSPlayer: ensures the IVS player script is loaded and returns
    // the `IVSPlayer` object. If already loaded it resolves immediately.
    const loadIVSPlayer = () => {
      return new Promise<typeof window.IVSPlayer>((resolve, reject) => {
        if (window.IVSPlayer) {
          return resolve(window.IVSPlayer);
        }

        const script = document.createElement("script");
        script.src = "https://player.live-video.net/1.29.0/amazon-ivs-player.min.js";
        script.async = true;

        // On successful load, confirm the global was attached and resolve.
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

    // initializePlayer: loads the player library, verifies browser support,
    // creates a player instance, attaches it to the <video> element and
    // starts playback for the provided `playbackUrl`.
    const initializePlayer = async () => {
      try {
        const IVSPlayer = await loadIVSPlayer();

        // Check if the browser supports the IVS player APIs.
        if (!IVSPlayer.isPlayerSupported) {
          console.warn("❌ IVS Player is not supported in this browser.");
          return;
        }

        // Create the player, attach the DOM element and kick off playback.
        const player = IVSPlayer.create();
        player.attachHTMLVideoElement(videoRef.current!);
        player.load(playbackUrl);
        player.setVolume(1);
        player.play();
      } catch (error) {
        // Surface setup errors to the console so parent components can
        // optionally monitor issues in dev tools.
        console.error("IVS Player setup error:", error);
      }
    };

    initializePlayer();

    // Cleanup: pause the HTMLVideoElement when the component unmounts or
    // when `playbackUrl` changes. We don't attempt to destroy the IVS
    // player instance directly here because the IVS API manages its own
    // lifecycle and removing the element is sufficient for this usage.
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [playbackUrl]);

  // Render the container and native <video> element. The IVS player will
  // render into this element once the library initializes and attaches.
  return (
    <div className="w-full aspect-video bg-black">
      <video ref={videoRef} className="w-full h-full" playsInline autoPlay muted controls />
    </div>
  );
}
