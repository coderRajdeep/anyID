import { HistoryItem } from '../hooks/useHistory';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';

interface HistoryListProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onDelete }) => {
    if (history.length === 0) {
        return <div className="text-center text-gray-400 py-8">No history yet. Start identifying!</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {history.map((item) => (
                <div
                    key={item.id}
                    className="glass rounded-xl overflow-hidden cursor-pointer hover:bg-white/5 transition-all hover:scale-105 group relative"
                    onClick={() => onSelect(item)}
                >
                    <div className="relative h-48 w-full">
                        <Image src={item.imageUrl} layout="fill" objectFit="cover" alt={item.result.name} />
                        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-start">
                            {item.isFavorite && (
                                <span className="text-yellow-400 text-xl drop-shadow-md">★</span>
                            )}
                            <button
                                onClick={(e) => onDelete(item.id, e)}
                                className="p-1.5 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Delete"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-white truncate text-lg">{item.result.name}</h3>
                        <p className="text-gray-400 text-xs mt-1">{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryList;
