
import Handlebars from 'handlebars'
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: "9cae4f82f3814110bf94608105a4af135680729b8a4a207098bd76b9e04e3235",
    baseURL: "https://api.together.xyz/v1",
    dangerouslyAllowBrowser: true
});

export enum QuestionMode {
    WaitingForPrompt, Submitting, QuestionEnded
}


type QuestionDisplay = {
    questionSet: string,
    question: string,
    chatDisplay: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    questionNum: number,
    totalQuestions: number,
    mode: QuestionMode,
    hasNextQuestion: boolean
}

export const display: QuestionDisplay = $state({
    questionSet: "",
    question: "",
    chatDisplay: [],
    questionNum: 0,
    totalQuestions: 0,
    mode: QuestionMode.WaitingForPrompt,
    hasNextQuestion: false
});


type QuestionState = {
    json: any | null,
    systemPromptFunc: HandlebarsTemplateDelegate<any> | null,
    questionIndex: number,
    chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
};

var questionState: QuestionState = {
    json: null,
    systemPromptFunc: null,
    questionIndex: 0,
    chatMessages: []
};

export async function selectQuestions(page: string) {
    questionState.json = null;
    display.questionSet = page;
    questionState.questionIndex = 0;
    await nextQuestion();
}

export async function nextQuestion() {
    if (questionState.json == null) {
        questionState.json = await (await fetch(`${display.questionSet}_questions.json`)).json();
        questionState.systemPromptFunc = Handlebars.compile(questionState.json.system.prompt);
        display.totalQuestions = questionState.json.questions.length;
    }
    if (questionState.systemPromptFunc == null) return;

    var question = questionState.json.questions[questionState.questionIndex];
    questionState.questionIndex += 1;
    display.questionNum = questionState.questionIndex;
    display.hasNextQuestion = display.questionNum < display.totalQuestions;
    
    display.question = question.display ?? question.question;
    display.chatDisplay = [];    
    display.mode = QuestionMode.WaitingForPrompt;

    let systemPrompt = questionState.systemPromptFunc(question);
    questionState.chatMessages = [{
        "role": "system",
        "content": systemPrompt
    }];
}   

function setLastElement<T>(arr: T[], value: T) {
    if (arr.length > 0) {
        arr[arr.length - 1] = value;
    } else {
        arr.push(value);
    }
  }

export async function sendPrompt(prompt: string) {
    display.mode = QuestionMode.Submitting;
    let userMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
        role: "user",
        content: prompt
    };
    questionState.chatMessages.push(userMessage);
    display.chatDisplay.push(userMessage);
 
    const stream = await openai.chat.completions.create({
        // model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: questionState.chatMessages,
        stream: true,
    });

    let reply: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
        role: "assistant",
        content: ""
    };
    questionState.chatMessages.push(reply);
    display.chatDisplay.push(reply);
    var replyContent = "";
    for await (const chunk of stream) {
        let text = chunk.choices[0]?.delta?.content || '';
        replyContent += text;
        reply.content = replyContent;
        setLastElement(questionState.chatMessages, reply);
        setLastElement(display.chatDisplay, reply);
    }

    display.mode = replyContent.endsWith("DONE") ? QuestionMode.QuestionEnded : QuestionMode.WaitingForPrompt;
}