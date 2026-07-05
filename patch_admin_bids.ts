import fs from 'fs';

let content = fs.readFileSync('src/pages/Bids.tsx', 'utf8');

const regex = /function AdminBidsView\(\{\s*ipos,\s*saveIpos,\s*commissions,\s*applications,\s*onClose\s*\}\s*:\s*any\)\s*\{([\s\S]*?)\}\nfunction DetailsModal/m;

const match = content.match(regex);
if (match) {
  let adminFuncBody = match[1];
  
  // We need to add useAppContext
  if (!adminFuncBody.includes('useAppContext')) {
    adminFuncBody = adminFuncBody.replace(
      'const [isCreating, setIsCreating] = useState(false);',
      'const { state } = useAppContext();\n  const [isCreating, setIsCreating] = useState(false);'
    );
  }
  
  console.log("Found AdminBidsView, replacing body...");
} else {
  console.log("Could not match AdminBidsView");
}
