const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

code = code.replace(
  '>\\n                  REGULAR\\n                </button>',
  '>\\n                  Regular\\n                </button>'
);

code = code.replace(
  '>\\n                  CAP\\n                </button>',
  '>\\n                  Cap\\n                </button>'
);
fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
