import { openai } from "./index";

const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_EMBEDDING_RETRIES = 2;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set, skipping embedding generation");
    return null;
  }

  for (let attempt = 0; attempt <= MAX_EMBEDDING_RETRIES; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error(
        `Embedding generation attempt ${attempt + 1} failed:`,
        error
      );

      if (attempt < MAX_EMBEDDING_RETRIES) {
        // exponential backoff to not get rate limited
        await sleep((attempt + 1) * 1000);
      }
    }
  }

  console.error("All embedding generation attempts failed");
  return null;
}
