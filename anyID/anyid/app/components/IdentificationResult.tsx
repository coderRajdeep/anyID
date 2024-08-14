

import Image from 'next/image'

interface ResultDetails {
  [key: string]: string;
}

interface IdentificationResultProps {
  result: {
    name?: string;
    description?: string;
    details: ResultDetails;
  } | null;
  imageUrl: string | null;
}

const IdentificationResult: React.FC<IdentificationResultProps> = ({ result, imageUrl }) => {
  if (!result) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8 mx-4 md:mx-0">
      <div className="p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">{result.name || 'Unknown'}</h2>
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
            {result.description && (
              <p className="text-gray-700 mb-4 text-sm md:text-base">{result.description}</p>
            )}
            <h3 className="text-lg md:text-xl font-semibold text-green-700 mb-2">Details</h3>
            <table className="w-full text-sm md:text-base">
              <tbody>
                {Object.entries(result.details).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 font-semibold text-gray-600 pr-2">{key} :</td>
                    <td className="py-2 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentificationResult;
