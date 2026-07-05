import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

// Remove 'My Applications' from tab list
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'Open' | 'Upcoming' | 'Closed' | 'Allotted' | 'Listed' | 'My Applications'>('Open');",
  "const [activeTab, setActiveTab] = useState<'Open' | 'Upcoming' | 'Closed' | 'Allotted' | 'Listed'>('Open');"
);

content = content.replace(
  "(['Open', 'Upcoming', 'Closed', 'Allotted', 'Listed', 'My Applications'] as const).map(tab => (",
  "(['Open', 'Upcoming', 'Closed', 'Allotted', 'Listed'] as const).map(tab => ("
);

content = content.replace(
  "if (activeTab !== ipo.status && activeTab !== 'My Applications') return false;",
  "if (activeTab !== ipo.status) return false;"
);

fs.writeFileSync('src/pages/Bids.tsx', content);
