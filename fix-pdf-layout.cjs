const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetPortal = `      {showHpgPdf && createPortal(
        <div className="fixed inset-0 bg-[#F0F2F5] z-[100000] overflow-y-auto flex flex-col items-center">
          <div className="w-full bg-white shadow-sm flex items-center justify-between px-4 py-3 sticky top-0 z-10 border-b border-gray-300">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">H</div>
               <span className="text-gray-700 font-medium text-[15px]">{business.name} - HPG રિપોર્ટ.pdf</span>
            </div>
            <button onClick={() => setShowHpgPdf(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded font-medium text-[13px] transition-colors">Close / બંધ કરો</button>
          </div>
          
          <div className="bg-white w-full max-w-[850px] min-h-[1100px] my-10 shadow-sm border border-gray-300 p-8 md:p-16 text-black font-serif flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">HPG સહાય કેન્દ્ર - વ્યવસાયિક અહેવાલ</h1>
              <h2 className="text-lg md:text-xl font-medium text-gray-700">{business.name}</h2>
              <p className="text-sm text-gray-500 mt-2">તારીખ: {new Date().toLocaleDateString("gu-IN")}</p>
            </div>

            <div className="text-[15px] leading-relaxed text-justify space-y-4">
              <p>
                આ દસ્તાવેજ <strong>{business.name}</strong> ના HPG સહાય કેન્દ્ર સબસિડી પ્રોગ્રામ હેઠળનો સત્તાવાર અને અધિકૃત અહેવાલ છે. આ અહેવાલમાં રોકાણકારોના નફા-નુકસાન અને કંપનીની આર્થિક સ્થિતિનું વિગતવાર વર્ણન કરવામાં આવ્યું છે.
              </p>
            </div>`;

const injectPortal = `      {showHpgPdf && createPortal(
        <div className="fixed inset-0 bg-[#F0F2F5] z-[100000] overflow-y-auto block">
          <div className="w-full bg-white shadow-sm flex items-center justify-between px-4 py-3 sticky top-0 z-10 border-b border-gray-300">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">H</div>
               <span className="text-gray-700 font-medium text-[15px]">{business.name} - HPG રિપોર્ટ.pdf</span>
            </div>
            <button onClick={() => setShowHpgPdf(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded font-medium text-[13px] transition-colors">Close / બંધ કરો</button>
          </div>
          
          <div className="bg-white w-full max-w-[850px] md:max-w-[1123px] min-h-[1100px] md:min-h-[794px] h-max my-10 mx-auto shadow-sm border border-gray-300 p-8 md:p-16 text-black font-serif flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">HPG સહાય કેન્દ્ર - વ્યવસાયિક અહેવાલ</h1>
              <h2 className="text-lg md:text-xl font-medium text-gray-700">{business.name}</h2>
              <p className="text-sm text-gray-500 mt-2">તારીખ: {new Date().toLocaleDateString("gu-IN")}</p>
            </div>

            <div className="text-[15px] leading-relaxed text-justify space-y-4">
              <p>
                આ દસ્તાવેજ <strong>{business.name}</strong> ના HPG સહાય કેન્દ્ર સબસિડી પ્રોગ્રામ હેઠળનો સત્તાવાર અને અધિકૃત અહેવાલ છે. આ અહેવાલમાં રોકાણકારોના નફા-નુકસાન અને કંપનીની આર્થિક સ્થિતિનું વિગતવાર વર્ણન કરવામાં આવ્યું છે.
              </p>
            </div>
            
            {(() => {
              const totalInvestors = hpgStats.pastInvestorsCount + hpgStats.activeDetails.length;
              const minInvestors = business.hpgSahay?.minInvestors || 0;
              const subsidyPercent = business.hpgSahay?.percentage || 0;
              
              if (totalInvestors === 0) {
                return (
                  <div className="text-[15px] leading-relaxed text-justify space-y-4 bg-gray-50 border border-gray-200 p-5 rounded">
                    <p>
                      <strong>આપનો વ્યવસાય નવો નોંધાયેલ છે</strong> અને હજુ સુધી કોઈ રોકાણકાર જોડાયેલ નથી. આપે HPG સહાય સબસિડી માટે ઓછામાં ઓછા <strong>{minInvestors} રોકાણકારો</strong> નો લક્ષ્યાંક સેટ કરેલ છે.
                    </p>
                    <p>
                      આ <strong>{subsidyPercent}% ની સબસિડી</strong> લાગુ કરવા માટે આપના વ્યવસાયમાં નવા રોકાણકારો આવવા જરૂરી છે અને તેમને યોગ્ય નફો (Profit) મળવો અનિવાર્ય છે. નિર્ધારિત {minInvestors} રોકાણકારોનો લક્ષ્યાંક પૂરો થયા બાદ જ આ સબસિડી સિસ્ટમ આપમેળે સક્રિય થશે.
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="text-[15px] leading-relaxed text-justify space-y-4 bg-green-50 border border-green-200 p-5 rounded text-green-900">
                    <p>
                      <strong>સબસિડી મંજૂરી અહેવાલ:</strong> આપના વ્યવસાયમાં અત્યાર સુધીમાં કુલ <strong>{totalInvestors} રોકાણકારો</strong> (સક્રિય અને અગાઉના) જોડાયેલ છે અને આપે અત્યાર સુધીમાં રોકાણકારોને કુલ <strong>₹{formatINR(hpgStats.totalProfit).replace("₹", "")}</strong> નો નફો રળી આપેલ છે.
                    </p>
                    <p>
                      આ ઉત્કૃષ્ટ પ્રદર્શન અને આપના {minInvestors} રોકાણકારોના લક્ષ્યાંકના આધારે, આપને વર્તમાન <strong>{subsidyPercent}% સબસિડી</strong> માટે <strong>સંપૂર્ણપણે લાયક</strong> ગણવામાં આવે છે. આપનું પ્રોફિટ માર્જિન અને રોકાણકારોનો વિશ્વાસ આ સબસિડી ચાલુ રાખવા માટે પર્યાપ્ત છે.
                    </p>
                  </div>
                );
              }
            })()}`;

code = code.replace(targetPortal, injectPortal);
fs.writeFileSync('src/components/BusinessDetail.tsx', code);
