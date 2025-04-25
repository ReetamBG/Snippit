import { Bell, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggler } from "@/components/ThemeToggler";
import Link from "next/link";
import { UserButton, SignInButton } from "@clerk/nextjs";
import type {User as ClerkUser} from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/actions/user.action";

interface Props {
  user: ClerkUser | null
}

const DesktopNavbar =  async ({user}: Props) => {

  const dbUser = await getUserByClerkId()

  return (
    <div className="hidden md:flex gap-3 items-center">
      <ThemeToggler />

      <nav>
        {user ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/">
                <Home />
                Home
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/notifications">
                <Bell />
                Notifications
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/profile/${dbUser?.username}`}>
                <User />
                Profile
              </Link>
            </Button>
          </>
        ) : (
          <SignInButton mode="modal">
            <Button>
              <User />
              Sign In
            </Button>
          </SignInButton>
        )}
      </nav>
      {user && <UserButton />}
    </div>
  );
};

export default DesktopNavbar;
