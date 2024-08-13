import Image from 'next/image'

const IdentificationResult = ({ result, imageUrl }) => {
  if (!result) return null

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-green-700 mb-2">{result.name || 'Unknown'}</h2>
        <div className="flex gap-6">
          <div className="w-1/2">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={result.name || 'Identified image'}
                width={400}
                height={300}
                objectFit="cover"
                className="rounded-lg"
              />
            )}
          </div>
          <div className="w-1/2">
            {result.description && (
              <p className="text-gray-700 mb-4">{result.description}</p>
            )}
            <h3 className="text-xl font-semibold text-green-700 mb-2">Details</h3>
            <table className="w-full">
              <tbody>
                {Object.entries(result.details).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 font-semibold text-gray-600">{key} :</td>
                    <td className="py-2 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IdentificationResult