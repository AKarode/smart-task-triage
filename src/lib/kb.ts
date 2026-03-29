import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';
import path from 'path';

interface KBChunk {
  docName: string;
  content: string;
  embedding: number[];
}

let kbChunks: KBChunk[] = [];
let initialized = false;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function chunkMarkdown(content: string, docName: string): { docName: string; content: string }[] {
  return content
    .split(/\n\n+/)
    .filter(chunk => chunk.trim().length > 50)
    .map(chunk => ({ docName, content: chunk.trim() }));
}

async function initializeKB() {
  if (initialized) return;

  const kbDir = path.join(process.cwd(), 'kb');
  const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.md'));

  const allChunks: { docName: string; content: string }[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(kbDir, file), 'utf-8');
    allChunks.push(...chunkMarkdown(content, file));
  }

  const { embeddings } = await embedMany({
    model: openai.embeddingModel('text-embedding-3-small'),
    values: allChunks.map(c => c.content),
  });

  kbChunks = allChunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }));

  initialized = true;
}

export async function searchKB(query: string, topK = 4) {
  await initializeKB();

  const { embedding: queryEmbedding } = await embed({
    model: openai.embeddingModel('text-embedding-3-small'),
    value: query,
  });

  const scored = kbChunks
    .map(chunk => ({
      docName: chunk.docName,
      content: chunk.content,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return scored.map(s => ({
    source: s.docName,
    content: s.content,
    relevance: Math.round(s.similarity * 100) / 100,
  }));
}
