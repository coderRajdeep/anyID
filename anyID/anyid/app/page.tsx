


'use client'

import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ImageUploader from './components/ImageUploader'
import IdentificationResult from './components/IdentificationResult'
import IdentifyAnimation from './components/IdentifyAnimation'
import HowToUse from './components/Howtouse'

const API_KEY = 'AIzaSyBMmaBLlzS3VUp8hNrF9Vj4rNSLLutxM7s'
const genAI = new GoogleGenerativeAI(API_KEY)

interface IdentificationDetails {
  [key: string]: string;
}

interface IdentificationResult {
  name: string;
  description: string;
  details: IdentificationDetails;
}

export default function Home() {
  const [identificationResult, setIdentificationResult] = useState<IdentificationResult | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const createPrompt = (category: string): string => {
    switch (category) {
      case 'famous person':
        return `Identify the famous person in this image and provide the following information:
          1. Full Name
          2. Profession
          3. Date of Birth
          4. Nationality
          5. Notable Achievements
          6. Brief Biography
          7. Important Works
          8. Awards or Honors
          Don't give ** in the response and give the information as JSON format and the value should always be in string`
      case 'animal':
        return `Identify the animal in this image and provide the following information:
          1. Common Name
          2. Scientific Name
          3. Classification (Mammal, Reptile, etc.)
          4. Habitat
          5. Diet
          6. Lifespan
          7. Conservation Status
          8. Physical Characteristics
          9. Behavioral Traits
          Don't give ** in the response and give the information as JSON format and the value should always be in string`
      case 'plant':
        return `Identify the plant in this image and provide the following information:
          1. Common Name
          2. Scientific Name
          3. Plant Family
          4. Native Region
          5. Type (Tree, Shrub, Flower, etc.)
          6. Leaf Characteristics
          7. Flower Characteristics (if applicable)
          8. Growing Conditions
          9. Uses (Ornamental, Medicinal, Culinary, etc.)
          Don't give ** in the response and give the information as JSON format and the value should always be in string`
      default:
        return `Identify the object or entity in this image and provide the following information:
          1. Name
          2. Category or Classification
          3. Primary Use or Purpose
          4. Origin or History
          5. Composition or Materials
          6. Notable Features
          7. Cultural Significance (if any)
          Don't give ** in the response and give the information as JSON format and the value should always be in string`
    }
  }

  const handleUpload = async (file: File, category: string) => {
    setLoading(true)
    setError(null)
    setImageUrl(URL.createObjectURL(file))
  
    try {
      const base64Image = await fileToBase64(file)
      const prompt = createPrompt(category.toLowerCase())
  
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: base64Image.split(',')[1]
          }
        }
      ])
  
      const response = await result.response
      const text = response.text()
  
      console.log(text) // Log the full response for debugging
  
      // Parse the response more robustly
      const lines = text.split('\n').filter(line => line.trim() !== '')
      let name = "unknown"
      let description = ""
      const details: IdentificationDetails = {}
  
      lines.forEach((line, index) => {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()
  
        if (index === 0 && !line.includes(':')) {
          name = Object.keys(response)[0]
        } else if (key && value) {
          if (index === 1 && description === "") {
            description = value
          } else {
            key.trim()
            value.trim()
            details[key.substring(3,key.length-1)] = value.substring(1,value.length-2)
          }
        }
      })
  
      name = details[Object.keys(details)[0]]
      setIdentificationResult({ name, description, details })
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

  return (
    <div className="max-w-4xl mx-auto px-4">
      <IdentifyAnimation />
      <ImageUploader onUpload={handleUpload} />
      {loading && <p className="text-center mt-4">Identifying image...</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      <IdentificationResult result={identificationResult} imageUrl={imageUrl} />
      {!imageUrl && <HowToUse />}
    </div>
  )
}
