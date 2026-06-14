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
        <header className="mb-6 text-center">
          <Image
            src={Logo}
            alt="ServeTube — ad-free, distraction-free YouTube player"
            className="mx-auto mb-2 h-12 w-auto drop-shadow-sm sm:h-14"
            priority
          />
          <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
            <span className="st-gradient-text">Ad-free, distraction-free YouTube</span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Watch only what you want, not what the algorithm wants. Playlists, no ads, no feed.
          </p>
        </header>
        <VideoPlayer />
      </main>
    </>
  );
}
