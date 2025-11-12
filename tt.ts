import OpenAI from "openai";

const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY!})
async function main() {
  const myAssistant = await openai.beta.assistants.create({
    instructions:
      "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    name: "Math Tutor",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4.1-mini",
  });

  console.log(myAssistant);
}

async function main2() {
    const emptyThread = await openai.beta.threads.create();
  
    console.log(emptyThread);
  }


  
main();
main2();