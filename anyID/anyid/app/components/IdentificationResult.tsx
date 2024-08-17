

import Image from 'next/image'

interface ResultDetails {
  [key: string]: string;
}

interface IdentificationResultProps {
  result: {
    name?: string;
    hyperlinkValue: string | TrustedHTML;
    details: ResultDetails;
  } | null;
  imageUrl: string | null;
}

const IdentificationResult: React.FC<IdentificationResultProps> = ({ result, imageUrl }) => {
  if (!result) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8 mx-4 md:mx-0">
      <div className="p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4">{result.name || 'Unknown'}</h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="md:w-1/2 w-full">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={result.name || 'Identified image'}
                width={400}
                height={300}
                objectFit="cover"
                className="rounded-lg w-full"
              />
            )}
          </div>
          <div className="md:w-1/2 w-full">
            <h3 className="text-lg md:text-xl font-semibold text-green-700 mb-2">Details</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(result.details).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row border-b py-2">
                  <span className="font-semibold text-gray-600 sm:w-1/3 mb-1 sm:mb-0">{key} :</span>
                  <span className="text-gray-800 sm:w-2/3">{value}</span>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row border-b py-2">
                <span className="font-semibold text-gray-600 sm:w-1/3 mb-1 sm:mb-0">Know More :</span>
                <span className="text-gray-800 sm:w-2/3 break-words">
                  <span dangerouslySetInnerHTML={{ __html: result.hyperlinkValue }}></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentificationResult;

