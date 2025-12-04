import Image from 'next/image'
import { SpeakerWaveIcon, BookmarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'
import jsPDF from 'jspdf'
import { IdentificationResultType } from '../types'

interface IdentificationResultProps {
  result: IdentificationResultType | null;
  imageUrl: string | null;
  loading: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

const IdentificationResult: React.FC<IdentificationResultProps> = ({ result, imageUrl, loading, onToggleFavorite, isFavorite }) => {
  if (!result && !loading) return null;

  const handleSpeak = () => {
    if (!result) return;
    // Cancel any current speech
    window.speechSynthesis.cancel();

    const text = `${result.name}. ${result.description}. ${Object.entries(result.details).map(([k, v]) => `${k}, ${v}`).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(0, 128, 0); // Green color
    doc.text(result.name, 10, 20);

    // Description
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitDescription = doc.splitTextToSize(result.description, 180);
    doc.text(splitDescription, 10, 30);

    let y = 30 + (splitDescription.length * 7) + 10;

    // Details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    doc.text("Details:", 10, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    Object.entries(result.details).forEach(([key, value]) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${key}:`, 10, y);
      doc.setFont("helvetica", "normal");
      const splitValue = doc.splitTextToSize(value, 130);
      doc.text(splitValue, 60, y);
      y += Math.max(7, splitValue.length * 5) + 3;
    });

    doc.save(`${result.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  return (
    <div className="glass rounded-xl overflow-hidden mt-8 mx-4 md:mx-0 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,157,0.1)]">
      <div className="p-6 md:p-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded mb-6 w-3/4"></div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="md:w-1/2 w-full">
                <div className="h-64 bg-white/10 rounded-xl"></div>
              </div>
              <div className="md:w-1/2 w-full space-y-4">
                <div className="h-6 bg-white/10 rounded w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : result ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">{result.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSpeak}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                  title="Listen"
                >
                  <SpeakerWaveIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                  title="Download PDF"
                >
                  <ArrowDownTrayIcon className="w-6 h-6" />
                </button>
                {onToggleFavorite && (
                  <button
                    onClick={onToggleFavorite}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    {isFavorite ? (
                      <BookmarkIconSolid className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="md:w-1/2 w-full">
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                    <Image
                      src={imageUrl}
                      alt={result.name}
                      width={400}
                      height={300}
                      objectFit="cover"
                      className="w-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <p className="mt-4 text-gray-300 italic">{result.description}</p>
              </div>
              <div className="md:w-1/2 w-full">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-green-400">⚡</span> Details
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.details).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row border-b border-white/10 py-3 group hover:bg-white/5 px-2 rounded-lg transition-colors">
                      <span className="font-medium text-gray-400 sm:w-1/3 mb-1 sm:mb-0 uppercase text-xs tracking-wider pt-1">{key}</span>
                      <span className="text-gray-100 sm:w-2/3 font-light">{value}</span>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row border-b border-white/10 py-3 px-2">
                    <span className="font-medium text-gray-400 sm:w-1/3 mb-1 sm:mb-0 uppercase text-xs tracking-wider pt-1">Know More</span>
                    <span className="text-blue-400 sm:w-2/3 break-words hover:text-blue-300 transition-colors">
                      <span dangerouslySetInnerHTML={{ __html: result.hyperlinkValue }}></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default IdentificationResult;


