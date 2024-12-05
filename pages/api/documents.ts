import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const documentsSnapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('documents')
      .get();

    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      size: doc.data().size || 0,
      downloadUrl: doc.data().downloadUrl || '',
      name: doc.data().name || 'Untitled Document'
    }));

    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}
