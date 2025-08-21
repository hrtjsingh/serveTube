import { Button } from '@/components/ui/button'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
export function Header() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4">
      <Link href="/" className="flex items-center gap-x-4">
        <span className="font-extrabold text-2xl"><span className='text-[#f8bf59]'>SERVE</span><span className='text-[#070707] bg-[#ffe49f] ml-0.5 p-0.5'>TUBE</span></span>
      </Link>
      <div className="flex items-center gap-x-4">
        <SignedOut>
          <SignInButton>
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
