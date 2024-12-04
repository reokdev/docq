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
        <main className="flex-1 overflow-auto p-4 bg-gradient-to-b from-blue-50 to-blue-100">
            <div className="bg-white py-16 sm:py-24 rounded-lg shadow-md">
                <div className="flex flex-col justify-center items-center mx-auto max-w-5xl px-4 lg:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Your new AI document friend</h2>
                        <p className="mt-4 text-lg leading-7 text-gray-700">Transform your PDF into interactive conversations</p>
                        <p className="mt-2">Introducing <span className="font-semibold text-blue-600">DocQ</span></p>
                        <p className="mt-4">Upload any document, and DocQ will generate a conversation between you and a virtual assistant.</p>
                        <p className="mt-2">Then, simply ask your questions and DocQ will answer them in real-time, enhancing productivity & engagement.</p>
                    </div>
                    <Button asChild className="mt-8 bg-blue-600 text-white hover:bg-blue-500">
                        <Link href="/dashboard">
                            Get started
                        </Link>
                    </Button>
                </div>
                <div className="relative overflow-hidden mt-12">
                    <div className="mx-auto max-w-5xl px-4 lg:px-6">
                        <Image 
                            alt="DocQ"
                            src="https://i.imgur.com/VciRSTI.jpeg"
                            width={2432}
                            height={1442}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </div>
                <div className="mx-auto max-w-5xl px-4 lg:px-6 mt-12">
                    <dl className="grid grid-cols-1 gap-8 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map(feature => (
                            <div key={feature.title} className="relative pl-10">
                                <dt className="inline-block font-medium text-gray-900">
                                    <feature.icon className="absolute left-0 top-0 h-6 w-6 text-blue-600" aria-hidden="true" />
                                    {feature.title}
                                </dt>
                                <dd className="mt-2 text-gray-500">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </main>
    )
}
