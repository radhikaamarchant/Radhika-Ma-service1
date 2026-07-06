const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

// Update useState
content = content.replace(
  /location: business\?\.location \|\| "",\n\s*photoUrl: business\?\.photoUrl \|\| "",\n\s*}\);/,
  `location: business?.location || "",\n    photoUrl: business?.photoUrl || "",\n    ownerName: business?.ownerName || "",\n  });`
);

// Update useEffect
content = content.replace(
  /location: business\.location \|\| "",\n\s*photoUrl: business\.photoUrl \|\| "",\n\s*}\);/,
  `location: business.location || "",\n        photoUrl: business.photoUrl || "",\n        ownerName: business.ownerName || "",\n      });`
);

// Update handleSaveProfile
const targetHandleSave = `  const handleSaveProfile = () => {
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...business,
        name: formData.name,
        shortName: formData.shortName ? formData.shortName.toUpperCase() : "",
        description: formData.description,
        location: formData.location,
        photoUrl: formData.photoUrl,
      },
    });
    setCurrentView("menu");
  };`;

const newHandleSave = `  const handleSaveProfile = () => {
    const updatedOwnerName = formData.ownerName.trim();
    
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...business,
        name: formData.name,
        shortName: formData.shortName ? formData.shortName.toUpperCase() : "",
        description: formData.description,
        location: formData.location,
        photoUrl: formData.photoUrl,
        ownerName: updatedOwnerName || business.ownerName,
      },
    });

    if (updatedOwnerName && updatedOwnerName !== business.ownerName) {
      state.businesses.forEach(b => {
        if (b.ownerName === business.ownerName && b.id !== business.id) {
          dispatch({
            type: "UPDATE_BUSINESS",
            payload: { ...b, ownerName: updatedOwnerName }
          });
        }
      });
      state.investors.forEach(inv => {
        if (inv.name === business.ownerName) {
          dispatch({
            type: "UPDATE_INVESTOR",
            payload: { ...inv, name: updatedOwnerName }
          });
        }
      });
    }

    setCurrentView("menu");
  };`;

if (content.includes('photoUrl: formData.photoUrl,')) {
    content = content.replace(targetHandleSave, newHandleSave);
}

// Update the rendering div to an input
const targetDiv = `<div className="w-full py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text tracking-normal">
               {business.ownerName}
             </div>`;
const newInput = `<input
               type="text"
               className="w-full border-b border-kite-border-hard py-1.5 bg-transparent text-[14px] md:text-[15px] font-normal text-kite-text focus:border-kite-blue outline-none"
               value={formData.ownerName}
               onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
               placeholder="Enter owner name"
             />`;

if (content.includes(targetDiv)) {
  content = content.replace(targetDiv, newInput);
}

fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Patched BusinessDetail.tsx");
