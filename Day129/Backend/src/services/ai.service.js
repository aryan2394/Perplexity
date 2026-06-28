import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

const geminiModel = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.2
});

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

const agent = createAgent({
    model: "groq:llama-3.3-70b-versatile",
    tools: [searchInternetTool],
})

export async function generateResponse(messages) {
    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant for answering questions.
                Current Date and Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                
                CRITICAL INSTRUCTIONS:
                1. If the user asks for the current date or time, provide it using the Current Date and Time provided above.
                2. For any question related to current events, latest news, sports schedules, or recent information, you MUST use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
                3. Always formulate internet search queries based on the current date provided above.
            `),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            }))]
    });

    const finalMessage = response.messages[response.messages.length - 1];
    return finalMessage.content || finalMessage.text;
}

export async function generateChatTitle(message) {

    const response = await geminiModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    return response.text;

}

export async function generateResponseStream(messages, onChunk) {
    const systemMsg = new SystemMessage(`
        You are a helpful and precise assistant for answering questions.
        Current Date and Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        
        CRITICAL INSTRUCTIONS:
        1. If the user asks for the current date or time, provide it using the Current Date and Time provided above.
        2. For any question related to current events, latest news, sports schedules, or recent information, you MUST use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
        3. Always formulate internet search queries based on the current date provided above.
    `);

    const formattedMessages = messages.map(msg => {
        if (msg.role == "user") {
            return new HumanMessage(msg.content);
        } else if (msg.role == "ai") {
            return new AIMessage(msg.content);
        }
    });

    const eventStream = await agent.streamEvents({
        messages: [systemMsg, ...formattedMessages]
    }, { version: "v2" });

    let fullText = "";
    for await (const event of eventStream) {
        if (event.event === "on_chat_model_stream") {
            const chunkObj = event.data?.chunk;
            let content = "";
            if (chunkObj) {
                if (typeof chunkObj.content === "string") {
                    content = chunkObj.content;
                } else if (Array.isArray(chunkObj.content)) {
                    content = chunkObj.content.map(c => typeof c === "string" ? c : (c.text || "")).join("");
                } else if (chunkObj.text) {
                    content = chunkObj.text;
                }
            }
            if (content) {
                fullText += content;
                onChunk(content);
            }
        }
    }
    return fullText;
}

