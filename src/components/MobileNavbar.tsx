import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggler } from "@/components/ThemeToggler";
import { Bell, Home, LogOut, TableOfContents, User } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/actions/user.action";

interface Props {
  user: ClerkUser | null;
}

const MobileNavbar = async ({ user }: Props) => {
  const dbUser = await getUserByClerkId();

  return (
    <div className="flex md:hidden gap-3">
      <ThemeToggler />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <TableOfContents />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="text-center">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="w-full flex flex-col gap-4 px-3">
            {user ? (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/">
                    <Home />
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/notifications">
                    <Bell />
                    Notifications
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/profile/${dbUser?.username}`}>
                    <User />
                    Profile
                  </Link>
                </Button>
                <SignOutButton>
                  <Button variant="ghost" className="justify-start">
                    <LogOut />
                    Sign Out
                  </Button>
                </SignOutButton>
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
        </SheetContent>
      </Sheet>
      {user && <UserButton />}
    </div>
  );
};

export default MobileNavbar;
