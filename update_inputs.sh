#!/bin/bash

# Update Qty/Amount Group
cat << 'INNEREOF' > patch1.txt
                      <div className="relative group mt-1">
                        <label className={`absolute top-[-9px] left-[10px] text-[10.8px] px-[5px] text-[#9B9B9B] bg-[#FFFFFF] dark:bg-[#111111] z-10 font-sans pointer-events-none transition-colors group-focus-within:${orderMode === "BUY" ? "text-[#4184F3]" : "text-[#FF5722]"}`}>
                          {inputMode === "QTY" ? "Qty." : "Amount"}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={desktopInputValue}
                            onChange={handleDesktopInputChange}
                            className={`w-[172.18px] h-[44.5px] pl-[15px] pr-[40px] py-[10px] bg-transparent border border-gray-200 dark:border-[#2A2A2A] rounded-[4px] text-[13px] text-gray-900 dark:text-[#E3E3E3] outline-none transition-colors hover:border-gray-400 dark:hover:border-gray-500 ${orderMode === "BUY" ? "focus:border-[#4184F3]" : "focus:border-[#FF5722]"}`}
                          />
                          {orderMode === "BUY" && (<button
                            type="button"
                            onClick={() =>
                              handleInputModeChange(
                                inputMode === "QTY" ? "AMOUNT" : "QTY",
                              )
                            }
                            className="absolute right-[0.5px] top-[0.5px] w-[34.7px] h-[43.3px] p-[14px_7px] flex items-center justify-center bg-[#F8F8F8] dark:bg-[#1E1E1E] hover:bg-[#EBEBEB] dark:hover:bg-[#2A2A2A] text-gray-500 cursor-pointer rounded-r-[3.5px] border-l border-gray-200 dark:border-[#2A2A2A] transition-colors"
                          >
                            {inputMode === "QTY" ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 12 12 17 22 12"></polyline>
                                <polyline points="2 17 12 22 22 17"></polyline>
                              </svg>
                            ) : (
                              <span className="font-semibold text-[14px]">
                                ₹
                              </span>
                            )}
                          </button>)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8F8F8F] absolute -bottom-5">
                          {inputMode === "AMOUNT"
                            ? `${formData.quantity || 0} qty.`
                            : `₹${formData.amount || 0}`}
                        </div>
                      </div>
INNEREOF

# Note: The above patch replaces lines 1469-1516
