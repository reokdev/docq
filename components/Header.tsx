import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "./ui/button"
import { FilePlus2 } from "lucide-react"

function Header() {
    return (
        <div className="flex items-center justify-between bg-white p-5 border-b">
            <Link href="/dashboard" className="text-2xl font-bold">Doc<span className="text-teal-800">Q</span></Link>
            <SignedIn>
                <div className="flex items-center space-x-2">
                    <Button asChild variant="link" className="hidden md:flex">
                        <Link href="/dashboard/pricing">Pricing</Link>
                    </Button>
                    <Button asChild variant="outline" className="hidden md:flex">
                        <Link href="/dashboard/documents">Documents</Link>
                    </Button>
                    <Button asChild variant="outline" className="hidden md:flex">
                        <Link href="/dashboard/upload">
                            <FilePlus2 className="h-4 w-4 text-teal-700" />
                        </Link>
                    </Button>
                    <UserButton />
                </div>
            </SignedIn>
        </div>
    )
}

export default Header
