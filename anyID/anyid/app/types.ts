export interface IdentificationDetails {
    [key: string]: string;
}

export interface IdentificationResultType {
    name: string;
    description: string;
    hyperlinkValue: string;
    details: IdentificationDetails;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    imagePrompt: string;
}

