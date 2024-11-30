'use client'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { PlusCircleIcon } from 'lucide-react'

function PlaceholderDoc() {
    const router = useRouter();
    const handleClick = () => {
        router.push('/dashboard/upload');
    }
  return (
    <Button onClick={handleClick} className='flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-100 drop-shadow-md text-gray-400'> 
        <PlusCircleIcon className="h-16 w-16" />
        <p>Upload</p>
    </Button>
  )
}

export default PlaceholderDoc
