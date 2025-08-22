import VideoPlayer from "@/components/VideoPlayer";
import Image from "next/image"
import Logo from '../assets/logo.svg'
export default function Home() {
  return (
    <div className="grid place-items-center text-white mx-2 my-0 p-5 md:pt-10 md:mx-2 md:p-0">
      <Image src={Logo} alt='logo' className="h-16 w-64 sm:h-20 sm:w-80 md:h-24 md:w-96 lg:w-[300px] xl:w-[300px] 2xl:w-[300px]" />
      <p className="mt-0">Enjoy Ad Free YouTube videos</p>
      <VideoPlayer />
    </div>
  );
}
