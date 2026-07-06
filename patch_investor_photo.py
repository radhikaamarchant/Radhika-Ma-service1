import re

with open('src/components/InvestorDetail.tsx', 'r') as f:
    content = f.read()

# 1. Add photoUrl to formData
content = content.replace(
    'accountHolderName: investor?.bankDetails?.accountHolderName || "",\n  });',
    'accountHolderName: investor?.bankDetails?.accountHolderName || "",\n    photoUrl: investor?.photoUrl || "",\n  });'
)

# 2. Add photoUrl to handleSaveDetails
content = content.replace(
    'accountHolderName: formData.accountHolderName,\n        },',
    'accountHolderName: formData.accountHolderName,\n        },\n        photoUrl: formData.photoUrl,'
)

# 3. Add states and functions for image cropping
new_states = """  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImageUrl(reader.result?.toString() || null);
      });
      reader.readAsDataURL(e.target.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    setFormData({ ...formData, photoUrl: croppedUrl });
    // Also save directly if we want, or wait for save button
    // Let's save directly to investor object for immediate effect
    dispatch({
      type: "UPDATE_INVESTOR",
      payload: {
        ...investor,
        photoUrl: croppedUrl,
      },
    });
    setCropImageUrl(null);
  };
"""

content = content.replace(
    '  const handleSaveDetails = () => {',
    new_states + '\n  const handleSaveDetails = () => {'
)

# 4. Add ImageCropModal to return
modal_code = """
      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onClose={() => setCropImageUrl(null)}
          onCrop={handleCropComplete}
        />
      )}
"""
content = content.replace(
    '  return (\n    <div className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 max-w-4xl mx-auto">',
    '  return (\n    <div className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 max-w-4xl mx-auto">\n' + modal_code
)

with open('src/components/InvestorDetail.tsx', 'w') as f:
    f.write(content)

