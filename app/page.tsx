import VideoPlayer from "@/components/VideoPlayer";
import { Onboarding } from "@/components/Onboarding";
import { JsonLd } from "@/components/JsonLd";
import Image from "next/image";
import Logo from '../assets/logo.svg';

export default function Home() {
  return (
    <>
      <JsonLd />
      <main className="flex flex-col items-center px-2 pt-4 pb-20 sm:pb-12">
        <Onboarding />
        <header className="text-center mb-4">
          <Image
            src={Logo}
            alt="ServeTube — ad-free, distraction-free YouTube player"
            className="h-12 w-auto mx-auto mb-1.5 sm:h-14"
            priority
          />
          <h1 className="text-base sm:text-lg font-bold tracking-tight max-w-lg mx-auto">
            Ad-free, distraction-free YouTube
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed mt-1">
            Watch only what you want, not what the algorithm wants. Playlists, no ads, no feed.
          </p>
        </header>
        <VideoPlayer />
      </main>
    </>
  );
}
