import { auth } from "@clerk/nextjs/server";
import Documents from "@/components/Documents";
import { adminDb } from "@/firebaseAdmin";

export const dynamic = "force-dynamic";

async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to view your documents.</div>;
  }

  // Fetch documents from Firebase
  const documentsSnapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('documents')
    .get();

  const documents = documentsSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || 'Untitled Document',
    downloadUrl: doc.data().downloadUrl || '',
    size: doc.data().size || 0,
  }));

  return (
    <div className="h-full max-w-7xl mx-auto">
      <h1 className="text-3xl p-5 bg-gray-100 font-extralight text-indigo-600">
        My Documents
      </h1>

      <Documents userId={userId} documentsSnapshot={documents} />
    </div>
  );
}

export default Dashboard;