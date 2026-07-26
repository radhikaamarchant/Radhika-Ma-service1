const fs = require('fs');
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

// 1. Add state
code = code.replace(
  /const \[isVerifySuccess, setShowVerifySuccess\] = useState\(false\);|const \[showVerifySuccess, setShowVerifySuccess\] = useState\(false\);/,
  `const [showVerifySuccess, setShowVerifySuccess] = useState(false);\n  const [mobileStep, setMobileStep] = useState(1);`
);

// We need to reset mobileStep when switching views
code = code.replace(/setViewMode\("add-step-1"\)/g, 'setViewMode("add-step-1"); setMobileStep(1)');
code = code.replace(/setViewMode\("add-step-2"\)/g, 'setViewMode("add-step-2"); setMobileStep(1)');
code = code.replace(/setViewMode\("list"\)/g, 'setViewMode("list"); setMobileStep(1)');

// But wait, there are inline onClicks like `onClick={() => setViewMode("add-step-1")}`
// Let's replace them carefully:
code = code.replace(/onClick=\{\(\) => setViewMode\("add-step-1"\)\}/g, 'onClick={() => { setViewMode("add-step-1"); setMobileStep(1); }}');
code = code.replace(/onClick=\{\(\) => setViewMode\("add-step-2"\)\}/g, 'onClick={() => { setViewMode("add-step-2"); setMobileStep(1); }}');
code = code.replace(/onClick=\{\(\) => setViewMode\("list"\)\}/g, 'onClick={() => { setViewMode("list"); setMobileStep(1); }}');

// 2. Modify Next / Back buttons in step 1
const step1Buttons = `              <div className="flex flex-col items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border space-y-4">
                {/* Mobile buttons */}
                <div className="w-full flex md:hidden flex-col space-y-4">
                  {mobileStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setMobileStep(prev => prev + 1)}
                      className="w-full font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors"
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isNextLoading}
                      className="w-full font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-100 disabled:cursor-not-allowed"
                    >
                      {isNextLoading ? "Loading..." : "Next Step"}
                    </button>
                  )}
                  {mobileStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setMobileStep(prev => prev - 1)}
                      className="w-full font-medium text-kite-text hover:text-kite-blue py-2 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setViewMode("list"); setMobileStep(1); }}
                      className="w-full font-medium text-kite-text hover:text-kite-blue py-2 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {/* Desktop buttons */}
                <div className="hidden md:flex flex-col items-center w-full space-y-4">
                  <button
                    type="submit"
                    disabled={isNextLoading}
                    className="w-auto min-w-[200px] font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-100 disabled:cursor-not-allowed"
                  >
                    {isNextLoading ? "Loading..." : <><span>Next Step</span> <ArrowRight className="w-4 h-4 ml-2" /></>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode("list"); setMobileStep(1); }}
                    className="w-auto min-w-[200px] font-medium text-kite-text hover:text-kite-blue py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>`;
              
// 3. Modify Next / Back buttons in step 2
const step2Buttons = `              <div className="flex flex-col items-center pt-8 mt-4 border-t border-kite-border dark:border-kite-border space-y-4">
                {/* Mobile buttons */}
                <div className="w-full flex md:hidden flex-col space-y-4">
                  {mobileStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setMobileStep(prev => prev + 1)}
                      className="w-full font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors"
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-100 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? "Verifying..." : "✓ Verify & Register"}
                    </button>
                  )}
                  {mobileStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setMobileStep(prev => prev - 1)}
                      className="w-full font-medium text-kite-text hover:text-kite-blue py-2 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => { setViewMode("add-step-1"); setMobileStep(1); }}
                      className="w-full font-medium text-kite-text hover:text-kite-blue py-2 transition-colors disabled:opacity-50"
                    >
                      ← Back to Details
                    </button>
                  )}
                </div>
                {/* Desktop buttons */}
                <div className="hidden md:flex flex-col items-center w-full space-y-4">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-auto min-w-[200px] font-medium flex items-center justify-center bg-kite-blue text-white px-6 py-2.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-100 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? "Verifying..." : "✓ Verify & Register"}
                  </button>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => { setViewMode("add-step-1"); setMobileStep(1); }}
                    className="w-auto min-w-[200px] font-medium text-kite-text hover:text-kite-blue py-2 transition-colors disabled:opacity-50"
                  >
                    ← Back
                  </button>
                </div>
              </div>`;

// Wait, I will just manually edit the file using multiple targeted replacements to be safe.
fs.writeFileSync('rewrite.js', 'done');
