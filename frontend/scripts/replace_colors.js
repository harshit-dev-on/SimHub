const fs = require('fs');
const path = require('path');

const files = [
  'app/page.tsx',
  'components/YouTubeHeader.tsx',
  'components/YouTubeSidebar.tsx',
  'components/YouTubeFeed.tsx',
  'components/WatchView.tsx'
];

const replacements = {
  'bg-slate-950': 'bg-[#F6F4EB]',
  'bg-slate-900': 'bg-[#FDFBF4]',
  'bg-slate-800': 'bg-[#EAE5D9]',
  'border-slate-800': 'border-[#EAE5D9]',
  'border-slate-700': 'border-[#DFD9CA]',
  'text-slate-100': 'text-stone-900',
  'text-white': 'text-stone-900',
  'text-slate-200': 'text-stone-800',
  'text-slate-300': 'text-stone-700',
  'text-slate-400': 'text-stone-600',
  'text-slate-500': 'text-stone-500',
  'hover:bg-slate-900': 'hover:bg-white',
  'hover:bg-slate-800': 'hover:bg-[#DFD9CA]',
  'hover:bg-slate-700': 'hover:bg-[#D4CEBF]',
  'ring-slate-800': 'ring-[#EAE5D9]',
  'ring-slate-700': 'ring-[#DFD9CA]',
  'shadow-inner': 'shadow-sm',
  'bg-transparent': 'bg-transparent text-stone-900',
};

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
      const regex = new RegExp(search, 'g');
      content = content.replace(regex, replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
