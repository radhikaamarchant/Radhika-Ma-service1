import re
with open('src/pages/Businesses.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    '<button\n                            type="button"\n                            onClick={() => {\n                              setShowInvestorSelect(!showInvestorSelect);\n                              setInvestorSearch("");\n                            }}\n                            className="text-[11px] md:text-[12px] font-medium text-kite-blue hover:underline focus:outline-none"\n                          >',
    '<button\n                            type="button"\n                            onClick={() => {\n                              setShowInvestorSelect(!showInvestorSelect);\n                              setInvestorSearch("");\n                            }}\n                            className="text-[11px] md:text-[12px] font-medium text-kite-blue hover:underline focus:outline-none ml-auto relative z-10"\n                          >'
)
with open('src/pages/Businesses.tsx', 'w') as f:
    f.write(text)
