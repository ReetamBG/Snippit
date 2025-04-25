// for small screens, show a dock at bottom for easier navigation

import { getUserByClerkId } from '@/actions/user.action'
import { Bell, Home, User } from 'lucide-react'
import Link from 'next/link'

const Dock = async () => {
  const user = await getUserByClerkId()
  return (
    <div className="w-full flex justify-center md:hidden sticky bottom-2">
      <div className="flex justify-around w-[80%] bg-white dark:bg-background rounded-full p-3 border-1 border-gray-800 dark:border-gray-500">
        <Link href="/"><Home className="hover:scale-105 cursor-pointer size-5" /></Link>
        <Link href="/notifications" ><Bell className="hover:scale-105 cursor-pointer size-5" /></Link>
        <Link href={`/profile/${user.username}`}><User className="hover:scale-105 cursor-pointer size-5" /></Link>
      </div>
    </div>
  )
}

export default Dock