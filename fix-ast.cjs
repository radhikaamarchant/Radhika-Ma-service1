const fs = require('fs');

function fixSyntax(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // The script previously did:
  // return filteredBusinesses.map((business, idx) => { ... };
  // Which is a syntax error because map expects ) at the end.
  // We need to find `  };\n  }, [filteredBusinesses` and change it to `  });\n  }, [filteredBusinesses`
  
  code = code.replace(/    \};\n  \}, \[filteredBusinesses/g, '    });\n  }, [filteredBusinesses');
  code = code.replace(/    \};\n  \}, \[filteredInvestors/g, '    });\n  }, [filteredInvestors');
  
  fs.writeFileSync(filePath, code);
}

fixSyntax('src/pages/Businesses.tsx');
fixSyntax('src/pages/Investors.tsx');

