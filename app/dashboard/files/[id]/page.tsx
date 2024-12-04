import { adminDb } from '@/firebaseAdmin';
import { auth } from '@clerk/nextjs/server';
import PdfView from '@/components/PdfView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: Please sign in to continue');
  }

  const fileDoc = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(params.id)
    .get();
  
  if (!fileDoc.exists) {
    notFound();
  }

  const url = fileDoc.data()?.url;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
      {/* Left side - PDF Viewer */}
      <div className="flex-1 h-[60vh] lg:h-full bg-white p-4 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200">
        <div className="h-full rounded-lg bg-gray-50 flex items-center justify-center">
          <PdfView url={url} />
        </div>
      </div>

      {/* Right side - Chat Interface */}
      <div className="lg:w-[400px] flex-1 lg:flex-none bg-white flex flex-col h-[40vh] lg:h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Chat</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <p className="text-gray-500 text-center">Ask DocQ about your PDF</p>
          </div>
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
            />
            <Button>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}