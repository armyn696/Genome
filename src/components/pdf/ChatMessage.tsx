import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onPageClick?: (page: number) => void;
}

export const ChatMessage = ({ message, onPageClick }: ChatMessageProps) => {
  const renderMessage = (text: string) => {
    // Split into paragraphs and filter empty ones
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    // Check if the message follows the numbered format (e.g., "1. text")
    const hasNumbering = paragraphs.some(p => /^\d+\.\s/.test(p));
    
    if (hasNumbering) {
      // If message has numbering, preserve the format
      return paragraphs.map((paragraph, index) => {
        let content = paragraph;
        
        // Apply all the page reference patterns
        content = applyPageReferences(content);

        return (
          <div 
            key={index} 
            className="mb-3 relative flex gap-2"
            dir="rtl"
          >
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              onClick={handlePageClick}
              className="flex-1"
            />
          </div>
        );
      });
    } else {
      // If message doesn't have numbering, use the default rendering
      return paragraphs.map((paragraph, index) => {
        let content = paragraph;
        
        // Apply all the page reference patterns
        content = applyPageReferences(content);

        return (
          <div 
            key={index} 
            className="mb-3 relative"
            dangerouslySetInnerHTML={{ __html: content }}
            onClick={handlePageClick}
          />
        );
      });
    }
  };

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('page-ref')) {
      const pageNum = parseInt(target.getAttribute('data-page') || '0');
      if (pageNum > 0) {
        onPageClick?.(pageNum);
      }
    }
  };

  const applyPageReferences = (content: string) => {
    const patterns = [
      // Pattern for single page [p.X]
      /\[p\.(\d+)\]/g,
      // Pattern for comma-separated pages [p.X, p.Y]
      /\[(p\.\d+(?:,\s*p\.\d+)*)\]/g,
      // Pattern for range of pages [p.X-Y]
      /\[p\.(\d+)-(\d+)\]/g,
      // Pattern for web references [web]
      /\[web\]/g
    ];

    // Handle single page references first
    content = content.replace(patterns[0], (match, pageNum) => {
      return `<button class="page-ref" data-page="${pageNum}">p.${pageNum}</button>`;
    });

    // Handle comma-separated pages
    content = content.replace(patterns[1], (match, pages) => {
      if (match.includes('-')) return match; // Skip if it's actually a range
      return '[' + pages.split(',').map(page => {
        const pageNum = page.trim().replace('p.', '');
        return `<button class="page-ref" data-page="${pageNum}">p.${pageNum}</button>`;
      }).join(', ') + ']';
    });

    // Handle page ranges [p.X, Y]
    content = content.replace(/\[p\.(\d+),\s*(\d+)\]/g, (match, start, end) => {
      return '[' + `<button class="page-ref" data-page="${start}">p.${start}</button>, ` +
             `<button class="page-ref" data-page="${end}">p.${end}</button>]`;
    });

    // Handle page ranges [p.X-Y]
    content = content.replace(/\[p\.(\d+)-(\d+)\]/g, (match, start, end) => {
      const pages = [];
      for (let i = parseInt(start); i <= parseInt(end); i++) {
        pages.push(`<button class="page-ref" data-page="${i}">p.${i}</button>`);
      }
      return '[' + pages.join(', ') + ']';
    });

    // Handle web references
    content = content.replace(/\[web\]/g, () => {
      return '<span class="web-ref">[اینترنت]</span>';
    });

    return content;
  };

  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2 relative items-start gap-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M16.5 7.5h-9v9h9v-9z" />
            <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div
        className={`inline-block px-4 py-2 max-w-[85%] ${
          isUser
            ? 'text-gray-900'
            : 'text-gray-900'
        }`}
        dir="rtl"
      >
        <style>{`
          .page-ref {
            display: inline-flex;
            align-items: center;
            padding: 0 0.25rem;
            margin: 0 0.125rem;
            height: 1.5rem;
            font-size: 0.75rem;
            background-color: rgba(59, 130, 246, 0.1);
            color: rgb(37, 99, 235);
            border-radius: 0.375rem;
            cursor: pointer;
            border: none;
            transition: background-color 0.2s;
            white-space: nowrap;
          }
          
          .page-ref:hover {
            background-color: rgba(59, 130, 246, 0.2);
          }
          
          .page-range {
            display: inline-flex;
            align-items: center;
            gap: 0.125rem;
            white-space: nowrap;
            overflow: visible;
          }
          
          .web-ref {
            display: inline-flex;
            align-items: center;
            padding: 0 0.5rem;
            margin: 0 0.25rem;
            height: 1.5rem;
            font-size: 0.75rem;
            background-color: rgba(34, 197, 94, 0.1);
            color: rgb(22, 163, 74);
            border-radius: 0.375rem;
          }
        `}</style>
        {renderMessage(message.text)}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 mt-4" />
    </div>
  );
};