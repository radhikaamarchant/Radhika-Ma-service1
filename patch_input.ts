import fs from 'fs';
let code = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

code = code.replace(
  `                      <input
                        required
                        type="text"
                        autoFocus
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Acme Corp"
                      />{" "}
                    </div>{" "}`,
  `                      <input
                        required
                        type="text"
                        autoFocus
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Acme Corp"
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
                        Short Business Name
                      </label>{" "}
                      <input
                        type="text"
                        className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-[13px] md:text-[14px] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none uppercase"
                        value={formData.shortName}
                        onChange={(e) =>
                          setFormData({ ...formData, shortName: e.target.value })
                        }
                        placeholder="e.g. ACME"
                      />{" "}
                    </div>{" "}`
);

fs.writeFileSync('src/pages/Businesses.tsx', code);
console.log("Success Patch");
