const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

// Add keyboardHeight state and effect
const stateToFind = `const [withdrawFormData, setWithdrawFormData] = useState({`;
const newCode = `const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setKeyboardHeight(window.innerHeight - window.visualViewport.height);
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      handleResize();
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  const [withdrawFormData, setWithdrawFormData] = useState({`;

if (content.includes(stateToFind)) {
  content = content.replace(stateToFind, newCode);
  
  // Now modify the mobile bottom section
  const footerOld = `            {/* Mobile Bottom Section */}
            <div 
              className="md:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-[#223042] border-t border-gray-200 dark:border-[#44546A] z-50 p-4 mobile-safe-pb"
            >`;
  const footerNew = `            {/* Mobile Bottom Section */}
            <div 
              className="md:hidden absolute left-0 right-0 bg-white dark:bg-[#223042] border-t border-gray-200 dark:border-[#44546A] z-50 p-4 transition-all duration-100 ease-out"
              style={{ bottom: \`\${keyboardHeight}px\`, paddingBottom: keyboardHeight > 0 ? '16px' : 'env(safe-area-inset-bottom, 16px)' }}
            >`;
            
  if (content.includes(footerOld)) {
    content = content.replace(footerOld, footerNew);
    
    // Modify content padding
    const contentOld = `<div className="flex-1 overflow-y-auto hide-scrollbar bg-[#F3F4F6] dark:bg-[#1E2938]">`;
    const contentNew = `<div className="flex-1 overflow-y-auto hide-scrollbar bg-[#F3F4F6] dark:bg-[#1E2938]" style={{ paddingBottom: \`\${keyboardHeight + 140}px\` }}>`;
    
    if (content.includes(contentOld)) {
       content = content.replace(contentOld, contentNew);
       fs.writeFileSync('src/pages/Investments.tsx', content);
       console.log("Patched investments page for keyboard fix!");
    } else {
       console.log("Could not find content container.");
    }
  } else {
    console.log("Could not find mobile bottom section.");
  }
} else {
  console.log("Could not find state hook.");
}
