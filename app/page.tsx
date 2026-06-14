import VideoPlayer from "@/components/VideoPlayer";
import { Onboarding } from "@/components/Onboarding";
import { HomeHero } from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <div className="st-page-xl flex flex-col items-center pt-4 pb-20 sm:pt-6 sm:pb-12">
        <Onboarding />
        <HomeHero />
        <VideoPlayer />
      </div>
    </>
  );
}
