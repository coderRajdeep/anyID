import { useState } from 'react';
import ImageUploader from './ImageUploader';
import Image from 'next/image';
import { API_BASE_URL } from '../config';

interface CompareSectionProps {
}

interface ComparisonPoint {
    feature: string;
    image1: string;
    image2: string;
}

interface ComparisonResult {
    comparison: ComparisonPoint[];
    conclusion: string;
}

const CompareSection: React.FC<CompareSectionProps> = () => {
    const [image1, setImage1] = useState<File | null>(null);
    const [image2, setImage2] = useState<File | null>(null);
    const [image1Url, setImage1Url] = useState<string | null>(null);
    const [image2Url, setImage2Url] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload1 = (file: File) => {
        setImage1(file);
        setImage1Url(URL.createObjectURL(file));
    };

    const handleUpload2 = (file: File) => {
        setImage2(file);
        setImage2Url(URL.createObjectURL(file));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleCompare = async () => {
        if (!image1 || !image2) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image1 = await fileToBase64(image1);
            const base64Image2 = await fileToBase64(image2);

            const response = await fetch(`${API_BASE_URL}/api/images/compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image1Base64: base64Image1,
                    image2Base64: base64Image2
                })
            });

            if (!response.ok) {
                throw new Error('Backend failed to respond');
            }

            const parsedResult = await response.json();
            setResult(parsedResult);

        } catch (err) {
            console.error("Comparison error:", err);
            setError("Failed to compare images. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto mt-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Compare Mode</h2>
                <p className="text-gray-400">Upload two images to see the differences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="glass p-4 rounded-xl flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">Image 1</h3>
                    <div className="w-full h-64 relative mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                        {image1Url ? (
                            <img src={image1Url} alt="Image 1" className="w-full h-full object-contain" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                        )}
                    </div>
                    <div className="transform scale-90 origin-top w-full">
                        <ImageUploader onUpload={handleUpload1} onStartQuiz={() => { }} />
                    </div>
                </div>
                <div className="glass p-4 rounded-xl flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">Image 2</h3>
                    <div className="w-full h-64 relative mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                        {image2Url ? (
                            <img src={image2Url} alt="Image 2" className="w-full h-full object-contain" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                        )}
                    </div>
                    <div className="transform scale-90 origin-top w-full">
                        <ImageUploader onUpload={handleUpload2} onStartQuiz={() => { }} />
                    </div>
                </div>
            </div>

            <div className="text-center mb-12">
                <button
                    onClick={handleCompare}
                    disabled={!image1 || !image2 || loading}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${!image1 || !image2 || loading
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-lg shadow-blue-500/30'
                        }`}
                >
                    {loading ? 'Analyzing...' : 'Compare Images'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center mb-8">
                    {error}
                </div>
            )}

            {result && (
                <div className="glass p-6 md:p-8 rounded-xl animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Comparison Result</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white/10">
                                    <th className="p-4 text-left text-green-400 font-bold w-1/4 border-b border-white/20">Feature</th>
                                    <th className="p-4 text-left text-blue-400 font-bold w-1/3 border-b border-white/20">
                                        <div className="flex items-center gap-2">
                                            <span>Image 1</span>
                                            {image1Url && <img src={image1Url} className="w-8 h-8 rounded object-cover border border-white/20" alt="1" />}
                                        </div>
                                    </th>
                                    <th className="p-4 text-left text-purple-400 font-bold w-1/3 border-b border-white/20">
                                        <div className="flex items-center gap-2">
                                            <span>Image 2</span>
                                            {image2Url && <img src={image2Url} className="w-8 h-8 rounded object-cover border border-white/20" alt="2" />}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.comparison.map((point, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors border-b border-white/10">
                                        <td className="p-4 font-semibold text-gray-300 align-top">{point.feature}</td>
                                        <td className="p-4 text-gray-400 align-top">{point.image1}</td>
                                        <td className="p-4 text-gray-400 align-top">{point.image2}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 bg-white/5 p-6 rounded-lg border border-white/10">
                        <h4 className="text-lg font-bold text-white mb-2">Conclusion</h4>
                        <p className="text-gray-300 leading-relaxed">{result.conclusion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompareSection;
