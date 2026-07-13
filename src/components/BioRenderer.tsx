import React from 'react';
import { useAppContext } from '../utils/AppContext';

interface BioRendererProps {
  bio: string;
  onMentionClick?: (type: 'business' | 'investor', id: string, data: any) => void;
}

export default function BioRenderer({ bio, onMentionClick }: BioRendererProps) {
  const { state } = useAppContext();
  
  if (!bio) return null;

  // Split by whitespace but keep the whitespace
  const words = bio.split(/(\s+)/);

  return (
    <>
      {words.map((word, index) => {
        if (word.startsWith('@') && word.length > 1) {
          const query = word.substring(1).replace(/[.,!?]$/, ''); // Remove trailing punctuation
          const punctuation = word.substring(1 + query.length);
          
          const cleanQuery = query.toLowerCase().replace(/_/g, ' ');

          // Try to find business or investor match
          const bMatch = state.businesses.find(b => (b.shortName || b.name).toLowerCase() === cleanQuery || (b.shortName || b.name).toLowerCase().replace(/\s+/g, '_') === query.toLowerCase());
          const iMatch = state.investors.find(i => (i.shortName || i.name).toLowerCase() === cleanQuery || (i.shortName || i.name).toLowerCase().replace(/\s+/g, '_') === query.toLowerCase());

          if (bMatch) {
            return (
              <span key={index}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMentionClick) onMentionClick('business', bMatch.id, bMatch);
                  }}
                  className="text-kite-blue font-medium hover:underline focus:outline-none"
                >
                  @{(bMatch.shortName || bMatch.name).toUpperCase()}
                </button>
                {punctuation}
              </span>
            );
          } else if (iMatch) {
            return (
              <span key={index}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMentionClick) onMentionClick('investor', iMatch.id, iMatch);
                  }}
                  className="text-kite-blue font-medium hover:underline focus:outline-none"
                >
                  @{iMatch.shortName || iMatch.name}
                </button>
                {punctuation}
              </span>
            );
          }
          
          // If no match found, render in kite-blue anyway to show it's a mention
          return (
            <span key={index} className="text-kite-blue font-medium">
              {word}
            </span>
          );
        }
        
        return <span key={index}>{word}</span>;
      })}
    </>
  );
}
