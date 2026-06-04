import VideoPlayer from "@/components/VideoPlayer";
import { Onboarding } from "@/components/Onboarding";
import Image from "next/image";
import Logo from '../assets/logo.svg';

export default function Home() {
  return (
    <main className="flex flex-col items-center px-2 pt-4 pb-20 sm:pb-12">
      <Onboarding />
      <div className="text-center mb-4">
        <Image
          src={Logo}
          alt="ServeTube logo"
          className="h-12 w-auto mx-auto mb-1.5 sm:h-14"
          priority
        />
        <p className="text-xs sm:text-sm text-muted-foreground">
          Ad-free YouTube & YouTube Music · Playlists · Local or cloud sync
        </p>
      </div>
      <VideoPlayer />
    </main>
  );
}
