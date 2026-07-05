const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

const target = `                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="p-1.5 text-kite-text-muted hover:text-kite-text transition-colors flex-shrink-0"
                          >
                            {" "}
                            <X className="w-4 h-4" />{" "}
                          </button>
                        )}{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            </div>{" "}`;

const replacement = `                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="p-1.5 text-kite-text-muted hover:text-kite-text transition-colors flex-shrink-0"
                          >
                            {" "}
                            <X className="w-4 h-4" />{" "}
                          </button>
                        )}{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            </div>
            </div>{" "}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/Businesses.tsx', content);
  console.log('Fixed Businesses.tsx part 3');
} else {
  console.log('Could not find target in Businesses.tsx part 3');
}
