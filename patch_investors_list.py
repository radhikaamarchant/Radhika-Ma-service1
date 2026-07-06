import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# Mobile View
mobile_target = """                          <div className="flex items-center space-x-1.5 mb-1">
                            {" "}
                            <span className="font-normal text-kite-text text-[13px] md:text-[14px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide">
                              {investor.name?.toUpperCase()}
                            </span>{" "}"""

mobile_replacement = """                          <div className="flex items-center space-x-2 mb-1">
                            {investor.photoUrl ? (
                              <img src={investor.photoUrl} alt="Profile" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                            ) : null}
                            {" "}
                            <span className="font-normal text-kite-text text-[13px] md:text-[14px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide">
                              {investor.name?.toUpperCase()}
                            </span>{" "}"""

# Desktop View
desktop_target = """                          <div className="w-[30%] text-left py-3 flex items-center overflow-hidden pr-2">
                            <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                              {investor.name?.toUpperCase()}
                            </span>"""

desktop_replacement = """                          <div className="w-[30%] text-left py-3 flex items-center overflow-hidden pr-2 gap-2">
                            {investor.photoUrl ? (
                              <img src={investor.photoUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                            ) : null}
                            <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                              {investor.name?.toUpperCase()}
                            </span>"""

content = content.replace(mobile_target, mobile_replacement)
content = content.replace(desktop_target, desktop_replacement)

with open('src/pages/Investors.tsx', 'w') as f:
    f.write(content)

