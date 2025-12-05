import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '../types';
import { API_BASE_URL } from '../config';

interface QuizGameProps {
    category: string;
    language?: string;
    onClose: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ category, language, onClose }) => {
    const [quizMode, setQuizMode] = useState<'text' | 'image' | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(false); // Start false to wait for mode selection
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const handleModeSelect = (mode: 'text' | 'image') => {
        setQuizMode(mode);
        fetchQuiz(mode);
    };

    const fetchQuiz = async (mode: 'text' | 'image') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category, language, quizType: mode }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            const data = await response.json();
            // Ensure we have questions
            if (Array.isArray(data) && data.length > 0) {
                setQuestions(data);
            } else {
                throw new Error('No questions received');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Timer logic
    useEffect(() => {
        if (!quizMode || loading || showResult || isAnswered) return;

        console.log('Timer running. timeLeft:', timeLeft);

        if (timeLeft === 0) {
            handleTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading, showResult, isAnswered, quizMode]);

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        if (option === questions[currentQuestionIndex].correctAnswer) {
            setScore((prev) => prev + 1);
        }

        // Auto advance after 2 seconds
        setTimeout(nextQuestion, 2000);
    };

    const handleTimeUp = () => {
        setIsAnswered(true);
        // Auto advance after 2 seconds
        setTimeout(nextQuestion, 2000);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setTimeLeft(60);
            setSelectedOption(null);
            setIsAnswered(false);
            setIsImageLoading(true);
        } else {
            setShowResult(true);
        }
    };

    const restartQuiz = () => {
        setQuizMode(null); // Go back to mode selection on restart
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setTimeLeft(60);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsImageLoading(true);
    };

    // Mode Selection UI
    if (!quizMode) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center text-white">
                <button onClick={onClose} className="absolute top-8 left-8 text-gray-400 hover:text-white">← Back</button>
                <h2 className="text-4xl font-bold mb-8">Choose Your Challenge</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <button
                        onClick={() => handleModeSelect('text')}
                        className="glass p-12 rounded-2xl hover:scale-105 transition-all group bg-gradient-to-br from-blue-900/50 to-blue-600/50 border border-blue-400/30"
                    >
                        <div className="text-6xl mb-6 group-hover:animate-bounce">📝</div>
                        <h3 className="text-2xl font-bold mb-4">Trivia Quiz</h3>
                        <p className="text-gray-300">Test your knowledge with text-based questions. No images, just facts!</p>
                    </button>
                    <button
                        onClick={() => handleModeSelect('image')}
                        className="glass p-12 rounded-2xl hover:scale-105 transition-all group bg-gradient-to-br from-purple-900/50 to-purple-600/50 border border-purple-400/30"
                    >
                        <div className="text-6xl mb-6 group-hover:animate-bounce">🖼️</div>
                        <h3 className="text-2xl font-bold mb-4">Visual Quiz</h3>
                        <p className="text-gray-300">Identify species and objects from AI-generated images. A visual feast!</p>
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold animate-pulse">Generating your {quizMode === 'image' ? 'Visual' : 'Trivia'} Quiz...</h2>
                <p className="text-gray-400 mt-2">Preparing 5 challenging questions!</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold">Oops! Something went wrong.</h2>
                <p className="text-red-400 mt-2 mb-6">{error}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 rounded-2xl max-w-2xl mx-auto text-center text-white"
            >
                <h2 className="text-3xl font-bold mb-6">Quiz Completed!</h2>

                <div className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {score} / {questions.length}
                </div>

                <p className="text-xl text-gray-300 mb-8">
                    {score === questions.length ? "Perfect Score! You're an expert!" :
                        score >= questions.length / 2 ? "Great job! You know your stuff." :
                            "Keep learning! Nice try."}
                </p>

                <div className="space-y-4 mb-8 text-left">
                    <h3 className="font-bold text-lg mb-2">Review:</h3>
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-lg">
                            <p className="font-medium mb-1">{idx + 1}. {q.question}</p>
                            <p className="text-green-400 text-sm">✓ {q.correctAnswer}</p>
                            <p className="text-gray-400 text-xs mt-1">{q.explanation}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={restartQuiz}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        )
    }

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 text-white">
                <button onClick={onClose} className="text-gray-400 hover:text-white">← Exit Quiz</button>
                <div className="text-xl font-bold">{category} Quiz <span className="text-sm font-normal opacity-70">({quizMode === 'image' ? 'Visual' : 'Trivia'} Mode)</span></div>
                <div className={`text-xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="glass p-6 rounded-2xl"
                >
                    {/* Progress */}
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-6 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className={`grid ${quizMode === 'image' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 mb-8`}>
                        {/* Image Area - Only for Image Mode */}
                        {quizMode === 'image' && (
                            <div className="relative aspect-square md:aspect-video bg-black/30 rounded-xl overflow-hidden shadow-lg border border-white/10 group">
                                {isImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse z-10">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <img
                                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(currentQ.imagePrompt)}?width=600&height=400&nologo=true`}
                                    alt="Quiz Subject"
                                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    onLoad={() => setIsImageLoading(false)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                            </div>
                        )}

                        {/* Question Area */}
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                                <span className="text-blue-400 mr-2">Q{currentQuestionIndex + 1}.</span>
                                {currentQ.question}
                            </h2>

                            <div className="grid gap-3">
                                {currentQ.options.map((option, idx) => {
                                    const isSelected = selectedOption === option;
                                    const isCorrect = option === currentQ.correctAnswer;
                                    let btnClass = "bg-white/5 hover:bg-white/10 border-white/10";

                                    if (isAnswered) {
                                        if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-200";
                                        else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-200";
                                        else btnClass = "bg-white/5 opacity-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(option)}
                                            disabled={isAnswered}
                                            className={`w-full p-4 rounded-lg border text-left transition-all duration-200 flex justify-between items-center group ${btnClass}`}
                                        >
                                            <span className="font-medium text-white group-hover:text-blue-200">{option}</span>
                                            {isAnswered && isCorrect && <span className="text-green-400">✓</span>}
                                            {isAnswered && isSelected && !isCorrect && <span className="text-red-400">✗</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Explanation Preview (Optional - could show after answer) */}
                    {isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg"
                        >
                            <p className="text-blue-200 text-sm">
                                <span className="font-bold">Info:</span> {currentQ.explanation}
                            </p>
                        </motion.div>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default QuizGame;
