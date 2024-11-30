import {
    GlobeIcon,
    MonitorSmartphoneIcon,
    ServerCogIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import Image from "next/image";

const features = [
    {
        title: "Feature 1",
        description: "Description for feature 1",
        icon: GlobeIcon
    },
    {
        title: "Feature 2",
        description: "Description for feature 2",
        icon: MonitorSmartphoneIcon
    },
    {
        title: "Feature 3",
        description: "Description for feature 3",
        icon: ServerCogIcon
    },
]
export default function Home() {
    return (
        <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-teal-600 via-teal-600/50 to-teal-600">
            <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
                <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl smg: text-center">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-1xl" >Your new AI document friend</h2>
                        <p className="mt-2 text-3xl leading-8 text-gray-600">Transform your PDF into interactive conversations</p>
                        <p>Introducing <span>DocQ</span></p>
                        <br />
                        <p>Upload any document, and DocQ will generate a conversation between you and a virtual assistant.</p>
                        <p>Then, simply ask your questions and DocQ will answer them in real-time, enhancing productivity & engagement.</p>
                    </div>
                    <Button asChild className="mt-10">
                        <Link href="/dashboard">
                            Get started
                        </Link>
                    </Button>
                </div>
                <div className="relative overflow-hidden pt-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <Image 
                            alt="DocQ"
                            src="https://i.imgur.com/VciRSTI.jpeg"
                            width={2432}
                            height={1442}
                            className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                        />
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                        {features.map(feature => (
                            <div key={feature.title} className="relative pl-9">
                                <dt className="inline font-semibold text-teal-400">
                                    <feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-teal-400"/>
                                </dt>
                                <dd>{feature.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </main>
    );
}
