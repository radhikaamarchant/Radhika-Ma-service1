const fs = require('fs');

const topContent = `import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, ArrowLeft, X, ChevronDown, BadgeCheck, Clock, CheckCircle2, User, Building, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../utils/AppContext';
import { Business, Investor, Investment } from '../types';
import { formatINR } from '../utils/mockData';
import { getVerificationStats, getBlueTickBusinessIds } from '../utils/blueTick';

export default function Businesses() {
  const { state, dispatch } = useAppContext();
  
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  
  const [expandedBusinessId, setExpandedBusinessId] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  
  const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerMode, setOwnerMode] = useState("existing");
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [showInterestCalculation, setShowInterestCalculation] = useState(false);
  
  const [formData, setFormData] = useState({
     name: "",
     ownerName: "",
     fundingRequired: "",
     interestRate: "",
     businessId: "",
     description: "",
     location: ""
  });
  
  const statsMap = useMemo(() => getVerificationStats(state.businesses, state.investments), [state.businesses, state.investments]);
  
  const formatLargeNumber = (num) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + " CR";
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(2) + " L";
    }
    return num.toLocaleString('en-IN');
  };

  const isBlueTick = (id) => statsMap.get(id)?.isBlueTick ?? false;
  const isPreVerified = (id) => statsMap.get(id)?.isPreVerified ?? false;
  
  const filteredBusinesses = state.businesses.filter(b => 
     (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
     (b.ownerName && b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const startAddBusiness = () => {
     setViewMode("add-step-1");
  };
  
  const handleExistingOwnerChange = (val) => {};
  const generateBusinessId = () => "BIZ" + Math.floor(Math.random()*1000);
  
  return (
    <div className="w-full space-y-6 print:m-0 print:p-0">
      <div className="print:hidden space-y-6">
        {viewMode === "list" && (
          <>
            <div className="md:sticky md:top-0 z-30 bg-white dark:bg-kite-bg shadow-sm">
              {/* Header Section */}
              <div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0 bg-white dark:bg-kite-bg">
                <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                  <div className="hidden md:block">
                    <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                      My Businesses
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">
                    <div className="w-full md:w-auto pt-1 md:pt-0 pb-2 md:pb-0">
                      <button
                        onClick={startAddBusiness}
                        className="flex items-center space-x-1.5 py-2 text-kite-blue font-medium text-[13px] md:text-[14px] hover:text-blue-600 transition-colors shadow-none"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Register Business</span>
                      </button>
                    </div>
                    {/* Search Container */}
                    <div className="w-full md:w-auto flex items-center justify-start md:justify-end pt-1 md:pt-0 h-[36px]">
                      <div className={\`flex items-center transition-all duration-300 w-full md:max-w-md \${isSearchExpanded ? "bg-white dark:bg-kite-surface md:dark:bg-[#161616] rounded-sm shadow-sm" : "bg-transparent"}\`}>
                        {!isSearchExpanded && (
                          <button
                            onClick={() => setIsSearchExpanded(true)}
                            className="-ml-1.5 p-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full transition-colors flex-shrink-0 flex items-center gap-2"
                          >
                            <Search className="w-[18px] h-[18px] text-kite-blue" />
                          </button>
                        )}
                        {isSearchExpanded && (
                          <div className="flex items-center w-full min-h-[36px] px-1">
                            <button
                              onClick={() => {
                                setIsSearchExpanded(false);
                                setSearchTerm("");
                              }}
                              className="p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-kite-bg rounded-full mr-1 transition-colors flex-shrink-0"
                            >
                              <ArrowLeft className="w-[18px] h-[18px] text-kite-blue" />
                            </button>
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search Eg: Radhika Kite Trade"
                              className="bg-transparent border-none outline-none w-full text-[13px] md:text-[14px] text-kite-text placeholder-gray-400 dark:placeholder-[#7A7A7A] font-sans h-[36px]"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                              <button
                                onClick={() => setSearchTerm("")}
                                className="p-1.5 text-kite-text-muted hover:text-kite-text transition-colors flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* DESKTOP HEADER */}
              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">
`;

let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// I need to strip the file from start to the remnant!
// The remnant is `<div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">BUSSINESS NAME</div>`
const startIndex = content.indexOf('<div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">BUSSINESS NAME</div>');

if (startIndex !== -1) {
    content = topContent + content.substring(startIndex);
    fs.writeFileSync('src/pages/Businesses.tsx', content);
    console.log("Success reconstructing top!");
} else {
    console.log("Could not find BUSSINESS NAME column text.");
}

