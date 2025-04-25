import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user.action";

const Navbar = async () => {
  const user = await currentUser()
  if (user) await syncUser() // sync clerk user with database

  return (
    <div className="w-full sticky top-0 flex justify-between -mb-3 py-4 px-5 sm:px-10 border backdrop-blur-md bg-neutral-50 dark:bg-neutral-950 z-10">
      <Link href="/">
        <h1 className="font-bold text-xl">Snippit</h1>
      </Link>
      <DesktopNavbar user={user}/>
      <MobileNavbar user={user}/>
    </div>
  );
};

export default Navbar;
