import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../utils/AppContext';

interface BioMentionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BioMentionEditor({ value, onChange }: BioMentionEditorProps) {
  const { state } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggestions
  const businesses = state.businesses;
  const investors = state.investors;

  const getFilteredSuggestions = () => {
    const query = mentionQuery.toLowerCase();
    const bMatches = businesses
      .filter(b => (b.shortName || b.name).toLowerCase().includes(query))
      .map(b => ({ type: 'business', id: b.id, name: b.shortName || b.name, data: b }));
    
    const iMatches = investors
      .filter(i => (i.shortName || i.name).toLowerCase().includes(query))
      .map(i => ({ type: 'investor', id: i.id, name: i.shortName || i.name, data: i }));

    return [...bMatches, ...iMatches].slice(0, 10);
  };

  const suggestions = getFilteredSuggestions();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    // Check if we are currently typing a mention
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowDropdown(true);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
    }
  };

  const insertMention = (name: string) => {
    if (!textareaRef.current) return;
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);
    if (match) {
      const startPos = cursorPosition - match[0].length;
      const newValue = value.slice(0, startPos) + `@${name.replace(/\s+/g, '_')} ` + textAfterCursor;
      onChange(newValue);
      setShowDropdown(false);
      
      // Move cursor after insertion
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = startPos + name.length + 2; // +2 for @ and space
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex].name);
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none min-h-[100px] resize-y whitespace-pre-wrap"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter investor bio... Use @ to tag businesses or investors"
      />
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-kite-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              onClick={() => insertMention(suggestion.name)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-[#2a2a2a]' : 'hover:bg-gray-50 dark:hover:bg-[#202020]'
              }`}
            >
              {suggestion.type === 'investor' && suggestion.data.photoUrl ? (
                <img src={suggestion.data.photoUrl} alt={suggestion.name} className="w-8 h-8 rounded-full object-cover" />
              ) : suggestion.type === 'investor' ? (
                 <div className="w-8 h-8 rounded-full bg-kite-blue/10 flex items-center justify-center text-kite-blue font-medium text-xs">
                   {suggestion.name.substring(0, 2).toUpperCase()}
                 </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-medium text-xs">
                   {suggestion.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className={`text-[13px] md:text-[14px] font-medium ${suggestion.type === 'business' ? 'text-kite-blue uppercase' : 'text-kite-text'}`}>
                  {suggestion.name}
                </span>
                <span className="text-[10px] md:text-[11px] text-kite-text-light capitalize">
                  {suggestion.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
