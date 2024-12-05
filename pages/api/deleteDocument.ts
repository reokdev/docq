import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebaseAdmin';
import { auth } from '@clerk/nextjs/server';

export default async function deleteDocument(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { fileId } = req.query;
    if (typeof fileId !== 'string' || !fileId || Array.isArray(fileId)) {
      return res.status(400).json({ message: 'fileId must be a non-empty string' });
    }
    const { userId } = await auth();

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // Delete the document from the database
      await adminDb.collection('users').doc(userId).collection('files').doc(fileId).delete();
      return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ message: 'Error deleting document' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
