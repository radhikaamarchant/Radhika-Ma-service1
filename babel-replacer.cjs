const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Parse code
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let modified = false;

  const settersToTarget = [
    'setSearchTerm',
    'setOwnerSearch',
    'setBankSearch',
    'setInvestorSearch',
    'setBusinessSearch'
  ];

  traverse(ast, {
    JSXElement(path) {
      if (path.node.openingElement.name.name === 'input') {
        let isSearchInput = false;
        let setterName = '';

        // Check attributes for onChange matching our setters
        path.node.openingElement.attributes.forEach(attr => {
          if (t.isJSXAttribute(attr) && attr.name.name === 'onChange') {
            if (t.isJSXExpressionContainer(attr.value)) {
              let expr = attr.value.expression;
              // Check for arrow function: e => setX(e.target.value)
              if (t.isArrowFunctionExpression(expr)) {
                if (t.isCallExpression(expr.body)) {
                  if (t.isIdentifier(expr.body.callee)) {
                    if (settersToTarget.includes(expr.body.callee.name)) {
                      isSearchInput = true;
                      setterName = expr.body.callee.name;
                      
                      // Change onChange to just the setter
                      attr.value.expression = t.identifier(setterName);
                    }
                  }
                } else if (t.isBlockStatement(expr.body)) {
                   // e => { setX(e.target.value) }
                   if (expr.body.body.length === 1 && t.isExpressionStatement(expr.body.body[0])) {
                     let innerExpr = expr.body.body[0].expression;
                     if (t.isCallExpression(innerExpr) && t.isIdentifier(innerExpr.callee)) {
                        if (settersToTarget.includes(innerExpr.callee.name)) {
                          isSearchInput = true;
                          setterName = innerExpr.callee.name;
                          attr.value.expression = t.identifier(setterName);
                        }
                     }
                   }
                }
              }
            }
          }
        });

        if (isSearchInput) {
          modified = true;
          path.node.openingElement.name.name = 'DebouncedInput';
          if (path.node.closingElement) {
             path.node.closingElement.name.name = 'DebouncedInput';
          }
        }
      }
    }
  });

  if (modified) {
    let output = generate(ast, { retainLines: true }, code);
    
    // Check and add import
    if (!output.code.includes('import DebouncedInput from')) {
      output.code = `import DebouncedInput from "../components/DebouncedInput";\n` + output.code;
    }
    
    fs.writeFileSync(filePath, output.code);
    console.log(`Transformed ${filePath}`);
  }
}

processFile('src/pages/Businesses.tsx');
processFile('src/pages/Investors.tsx');
processFile('src/pages/Investments.tsx');
processFile('src/pages/DataAnalysis.tsx');

