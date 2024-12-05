import PlaceholderDocument from "./PlaceholderDoc";
import Document from "./Document";
import { GetServerSidePropsContext } from 'next';

// Define types for props
interface DocumentData {
  id: string;
  name: string;
  downloadUrl: string;
  size: number;
}

interface DocumentsProps {
  userId: string;
  documentsSnapshot: DocumentData[];
}

function Documents({ userId, documentsSnapshot }: DocumentsProps) {
  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      {/* Map through the documents */}
      {Array.isArray(documentsSnapshot) ? documentsSnapshot.map((doc) => {
        const { name, downloadUrl, size } = doc;

        return (
          <Document
            key={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadUrl={downloadUrl}
          />
        );
      }) : []}

      <PlaceholderDocument />
    </div>
  );
}

export default Documents;