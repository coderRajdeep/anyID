'use client'

import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import { API_BASE_URL } from './config'
import IdentificationResult from './components/IdentificationResult'
import IdentifyAnimation from './components/IdentifyAnimation'
import HowToUse from './components/Howtouse'
import ChatSection from './components/ChatSection'
import HistoryList from './components/HistoryList'
import CompareSection from './components/CompareSection'
import { useHistory } from './hooks/useHistory'
import { IdentificationResultType } from './types'



export default function Home() {
  const [identificationResult, setIdentificationResult] = useState<IdentificationResultType | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'identify' | 'compare' | 'history'>('identify');
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);

  const { history, addToHistory, toggleFavorite, deleteItem } = useHistory();

  const languages = ['English', 'Bengali', 'Hindi', 'Marathi', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Tamil', 'Telugu'];



  const handleUpload = async (file: File, category: string) => {
    setLoading(true)
    setError(null)
    setIdentificationResult(null)
    const url = URL.createObjectURL(file);
    setImageUrl(url)

    try {
      const base64Image = await fileToBase64(file)

      // Call Java Backend
      const response = await fetch(`${API_BASE_URL}/api/images/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          category: category,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Backend failed to respond');
      }

      const parsedResult = await response.json();

      const { name, description, details, searchQuery } = parsedResult;

      let hyperlinkValue = "";
      if (searchQuery) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        hyperlinkValue = `<a href="${searchUrl}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">Click here to learn more</a>`;
      }

      const finalResult = { name, description, hyperlinkValue, details };
      setIdentificationResult(finalResult);

      // Add to history
      const newId = Date.now().toString();
      addToHistory({
        id: newId,
        timestamp: Date.now(),
        imageUrl: url,
        result: finalResult,
        isFavorite: false
      });
      setCurrentResultId(newId);

    } catch (err) {
      console.error('Error identifying image:', err)
      setError(`An error occurred while identifying the image: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setLoading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleHistorySelect = (item: any) => {
    setIdentificationResult(item.result);
    setImageUrl(item.imageUrl);
    setCurrentResultId(item.id);
    setActiveTab('identify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <IdentifyAnimation />

      {/* Tab Navigation */}
      <div className="flex justify-center mb-12">
        <div className="glass p-1 rounded-xl flex space-x-2">
          {['identify', 'compare', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'identify' && (
        <div className="animate-fade-in">
          <div className="max-w-md mx-auto mb-12">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="" className="bg-gray-900 text-gray-400">
                Select a Language (Optional)
              </option>
              {languages.map((language) => (
                <option key={language} value={language} className="bg-gray-900 text-white">
                  {language}
                </option>
              ))}
            </select>
          </div>

          <ImageUploader onUpload={handleUpload} />

          {loading && (
            <div className="flex flex-col items-center justify-center mt-8 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-400 animate-pulse">Identifying image...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center mt-8">
              {error}
            </div>
          )}

          <IdentificationResult
            result={identificationResult}
            imageUrl={imageUrl}
            loading={loading}
            isFavorite={currentResultId ? history.find(h => h.id === currentResultId)?.isFavorite : false}
            onToggleFavorite={() => currentResultId && toggleFavorite(currentResultId)}
          />

          {identificationResult && imageUrl && (
            <ChatSection
              imageUrl={imageUrl}
              initialDescription={identificationResult.description}
            />
          )}

          {!imageUrl && !loading && <HowToUse />}
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="animate-fade-in">
          <CompareSection />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">My Discoveries</h2>
          <HistoryList
            history={history}
            onSelect={handleHistorySelect}
            onDelete={(id, e) => {
              e.stopPropagation();
              deleteItem(id);
            }}
          />
        </div>
      )}
    </div>
  )
}
