import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "../firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
})

export const indexName = "docq";

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized: Please sign in to continue');
    }

    const firebaseRef = await adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .get();

    const downloadURL = firebaseRef.data()?.url;
    if (!downloadURL) {
        throw new Error('File not found');
    }

    console.log('--- downloading file ---', downloadURL);

    //fetch pdf from firebase storage
    const response = await fetch(downloadURL);
    const pdfBlob = await response.blob();

    //load pdf from specified path
    const loader = new PDFLoader(pdfBlob);
    const docs = await loader.load();

    //split docs into chunks
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    console.log('--- docs split into chunks ---', splitDocs.length);

    return splitDocs;
}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
    if (namespace === null) {
        throw new Error("namespace is null");
    }

    const { namespaces } = await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth();
    let pineconeVectorStore;

    if (!userId) {
        throw new Error('Unauthorized: Please sign in to continue');

        // generate embeddings (numerical representation) for the split docs
        console.log("--- generating embeddings for split docs ---");
    } else {
        const embeddings = new OpenAIEmbeddings();
        const splitDocs = await generateDocs(docId);
        console.log(`--- storing embeddings in namespace: ${docId} in the ${indexName} pinecone vector store---`);

        const index = await pineconeClient.Index(indexName);
        const namespaceAlreadyExists = await namespaceExists(index, docId);

        if (namespaceAlreadyExists) {
            console.log("namespace already exists, reusing existing embedding")
            pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex: index,
                namespace: docId,
            });
        } else {
            pineconeVectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings, {
                pineconeIndex: index,
                namespace: docId,
            });
        }
        return pineconeVectorStore;
    }
}