const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 animate-bounce"
            aria-label="Back to Top"
        >
            <ArrowUp size={24} />
        </button>
    );
};

// Add ArrowUp to import
import { Search, Plus, X, Loader2, ArrowUp } from 'lucide-react';

// Main Component changes...

// A-Z Navigation Logic
const groupedSongs = useMemo(() => {
    const groups: Record<string, Song[]> = {};
    // Normalize sorting as well
    const sorted = [...filteredSongs].sort((a, b) =>
        a.song.normalize('NFC').localeCompare(b.song.normalize('NFC'), 'zh-CN')
    );

    sorted.forEach(song => {
        // Trim and Normalize title to avoid encoding issues
        const normalizedTitle = song.song.trim().normalize('NFC');
        if (!normalizedTitle) return; // Skip empty titles

        let firstChar = normalizedTitle.charAt(0).toUpperCase();
        let groupKey = '#';

        // Check if it's A-Z
        if (/[A-Z]/.test(firstChar)) {
            groupKey = firstChar;
        } else if (!/[0-9]/.test(firstChar)) {
            // Force Pinyin conversion for non-numeric characters
            const pinyin = TinyPinyin.convertToPinyin(firstChar);
            const pinyinChar = pinyin.charAt(0).toUpperCase();
            if (/[A-Z]/.test(pinyinChar)) {
                groupKey = pinyinChar;
            }
        }

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(song);
    });
    return groups;
}, [filteredSongs]);

// ...

const scrollToGroup = (key: string) => {
    const element = document.getElementById(`group-${key}`);
    if (element) {
        // Use native scrollIntoView which respects scroll-margin-top logic we will add in CSS
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// ... Render ...

// Add scroll-margin-top via Tailwind class to h2 group headers
// The sticky header is about 180px-200px (12rem-13rem)

{
    sortedKeys.map(key => (
        <div key={key} id={`group-${key}`} className="scroll-mt-48 md:scroll-mt-40"> {/* CSS Scroll Margin Optimization */}
            <h2 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2 px-2 border-b border-gray-200 dark:border-gray-700">
                {key}
            </h2>

    // ...

            <BackToTop />
        </main>
    );
}
