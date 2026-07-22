const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

// Update Regular tab
code = code.replace(
  'border-[#4184F3] text-[#4184F3] dark:text-[#D4603B] dark:border-[#D4603B]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]"',
  'border-[#4184F3] text-[#4184F3] dark:text-[#4987EE] dark:border-[#4987EE]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]"'
);
// Update Cap tab
code = code.replace(
  'border-[#4184F3] text-[#4184F3] dark:text-[#D4603B] dark:border-[#D4603B]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]"',
  'border-[#4184F3] text-[#4184F3] dark:text-[#4987EE] dark:border-[#4987EE]" : "border-[#FF5722] text-[#FF5722] dark:text-[#D4603B] dark:border-[#D4603B]"'
);

code = code.replace(
  '>\\n                  REGULAR\\n                </button>',
  '>\\n                  Regular\\n                </button>'
);

code = code.replace(
  '>\\n                  CAP\\n                </button>',
  '>\\n                  Cap\\n                </button>'
);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
