import { StreamingTextResponse, LangChainStream, Message } from 'ai'
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
// import { getMatchesFromEmbeddings } from './matches';

export const runtime = 'edge'

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

  const matches = await getMatchesFromEmbeddings(embeddings, pineconeClient, 5);
  // console.log('/n, matches ( with additional metadata ): ', matches)

  // console.log('matches: ', matches);
  const extractedTexts: String[] = (matches as Match[])
  .filter(match => match.metadata && match.metadata.text)
  .map(match => match.metadata?.text!); 
  // Using "!" here to tell TypeScript we're sure metadata exists.


  // console.log('extractedTexts: ', extractedTexts);

  let callbackManagerTest = CallbackManager.fromHandlers({
    async handleLLMNewToken(token) {
      console.log(token);
    },
    async handleLLMEnd(result) {
      // console.log('result: ', result);
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

  const chain = new LLMChain({prompt: promptTemplate, llm});


  const test = await chain.call({
    question: messages[messages.length - 1].content,
    documents: extractedTexts
  });

  // const test = await chain.call({
  //   input_documents: extractedTexts,
  //   question: messages[messages.length - 1].content,
  // })

  console.log('test: ', test)

  // test
  //   .call(
  //     (messages as Message[]).map(m =>
  //       m.role == 'user'
  //         ? new HumanMessage(m.content)
  //         : new AIMessage(m.content)
  //     ),
  //     // {},
  //     [handlers]
  //   )
  //   .catch(console.error)
    // .finally((output) => {
    //   handlers.handleChainEnd(output, 1)
    // })

  // return new StreamingTextResponse(res)
}
