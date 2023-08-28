import { StreamingTextResponse, LangChainStream, Message, OpenAIStream } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { templates } from './templates';


// custom imports
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  loadQAStuffChain,
  loadQAMapReduceChain,
  loadQARefineChain,
  LLMChain
} from "langchain/chains";
import { PineconeClient } from '@pinecone-database/pinecone';
import { getMatchesFromEmbeddings } from './matches';
import { CallbackManager } from 'langchain/callbacks';
import { PromptTemplate } from 'langchain/prompts';
import { BytesOutputParser } from 'langchain/schema/output_parser';
import { RunnableSequence } from "langchain/schema/runnable";
import { createIterableReadableStreamFromText } from './utils';

export const runtime = 'edge'

// export const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// const runLLMChain = async (prompt) =>{

// } 
const initPineconeClient = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
  return pinecone;
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  console.log("messages: ", messages)
  // const encoder = new TextEncoder();
  // const stream = new TransformStream();
  // const writer = stream.writable.getWriter();

  interface Metadata {
    text: string;
    // Include other properties of metadata if any
  }

  interface Match {
    metadata?: Metadata; 
    // Assuming metadata can be optional, if not, remove the "?"
    // Include other properties of match if any
  }


  const pineconeClient = await initPineconeClient();
  const index = pineconeClient.Index(process.env.PINECONE_INDEX_NAME!);
  // console.log('index', index);
  // Embed the user's intent and query the Pinecone index

  const embedder = new OpenAIEmbeddings({});

  // const embeddings = await embedder.embedQuery(messages);
  // console.log('messages: ', messages[messages.length - 1].content);
  const embeddings = await embedder.embedQuery(messages[messages.length - 1].content);
  // console.log('temperature check: ', embeddings);

  const matches = await getMatchesFromEmbeddings(embeddings, pineconeClient, 4);
  console.log('/n, matches ( with additional metadata ): ', matches)

  // console.log('matches: ', matches);
  const extractedTexts: String[] = (matches as Match[])
  .filter(match => match.metadata && match.metadata.text)
  .map(match => match.metadata?.text!); 
  // Using "!" here to tell TypeScript we're sure metadata exists.

  // console.log('extractedTexts: ', extractedTexts);

  let callbackManagerTest = CallbackManager.fromHandlers({
    async handleLLMNewToken(token) {
      // await writer.ready;
      // await writer.write(encoder.encode(`${token}`));
    },
    async handleLLMEnd(result) {
      // await writer.ready;
      // await writer.close();
    }
  })

  // working version
  // const llm = new ChatOpenAI({
  //   streaming: true,
  //   verbose: true,
  //   modelName: "gpt-3.5-turbo",
  //   temperature: 0,
  //   callbackManager: CallbackManager.fromHandlers({
  //     async handleLLMNewToken(token) {
  //       console.log(token);
  //     },
  //     async handleLLMEnd(result) {
  //       // console.log('result: ', result);
  //     }
  //   }),
  // });

  
  const llm = new ChatOpenAI({
    streaming: true,
    verbose: true,
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    callbackManager: callbackManagerTest
  });

  console.log('question: ', messages[messages.length - 1].content);
  console.log('urls: ', extractedTexts);

  const promptTemplate = new PromptTemplate({
    template: templates.summarizerDocumentTemplate,
    inputVariables: ["documents"],
  });

  // const prompt = PromptTemplate.fromTemplate(`You are tasked with summarizing multiple documents{documents} on a similar topic. Ensure that your summary:

  // Lists the key details from each document separately.
  // Provides an overall synthesis of common themes and findings.
  // Highlights any divergent or unique views across the documents.
  // Offers insights into the significance or implications of the combined findings.
  // (Optional) Suggests recommendations or next steps based on the summarized information.
  // `)

  // const prompt = PromptTemplate.fromTemplate(`You are tasked with summarizing multiple documents{documents} on a similar topic. Ensure that your summary:

  // Lists the key details from each document separately.
  // Provides an overall synthesis of common themes and findings.
  // Highlights any divergent or unique views across the documents.
  // Offers insights into the significance or implications of the combined findings.
  // Try to achieve everything without repetition`);

  // const prompt = PromptTemplate.fromTemplate(`
  // You are tasked with combining multiple documents{documents}.
  // Any code found in the documents should ALWAYS be preserved in the summary, unchanged
  // Try to summarize overarching themes and findings, but DO NOT make examples of your own.
  // Optionally discuss the collective implications of these documents.`)

  const prompt = PromptTemplate.fromTemplate(templates.summarizerDocumentTemplate)

  // const prompt = PromptTemplate.fromTemplate(templates.summarizerDocumentTemplate)
  const outputParser = new BytesOutputParser()
  const chain = RunnableSequence.from([prompt, llm, outputParser]);

  // const chain = new LLMChain({prompt: promptTemplate, llm});

  const test = await chain.stream({
    question: messages[messages.length - 1].content,
    documents: extractedTexts
  });

  return new StreamingTextResponse(test);

  // return new StreamingTextResponse(stream, {
  //   headers: { 'X-RATE-LIMIT': 'lol' }
  // })

  // const stream = runLLMChain(messages);
  // return new Response(await stream);
}
