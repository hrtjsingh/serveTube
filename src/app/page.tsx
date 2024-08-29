import Image from "next/image";
import Logo from '../assets/logo.svg'
import VideoPlayer from '@/components/VideoPlayer';
export default function Home() {
  return (
    <div className="grid place-items-center text-white mx-10 my-0 p-5 pt-10 md:mx-2 md:p-0">
      <Image src={Logo} alt='logo' className="h-16 w-64 sm:h-20 sm:w-80 md:h-24 md:w-96 lg:w-[400px] xl:w-[450px] 2xl:w-[500px]" />
      <p className="mt-0">Enjoy Ad Free YouTube videos</p>
      <VideoPlayer />
    </div>
  );
}



