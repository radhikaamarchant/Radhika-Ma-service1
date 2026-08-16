const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetPdfPortal = `      {showHpgPdf && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-3xl max-h-[90vh] flex flex-col relative rounded shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t">
              <h3 className="text-[16px] font-medium text-black">HPG સહાય કેન્દ્ર - રિપોર્ટ</h3>
              <button onClick={() => setShowHpgPdf(false)} className="text-gray-500 hover:text-black transition-colors text-[24px] leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="text-center mb-8">
                <h1 className="text-[22px] font-bold text-black mb-2">{business.name}</h1>
                <p className="text-[14px] text-gray-600">સહાય સબસિડી ડેટા લિસ્ટ</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">કુલ રોકાણકારો</p>
                  <p className="text-[20px] font-medium text-black">{hpgStats.investors}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">કુલ નફો</p>
                  <p className="text-[20px] font-medium text-green-600">₹{formatINR(hpgStats.totalProfit).replace("₹", "")}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">કુલ નુકસાન</p>
                  <p className="text-[20px] font-medium text-red-600">₹{formatINR(hpgStats.totalLoss).replace("₹", "")}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">વધુ નફો</p>
                  <p className="text-[20px] font-medium text-blue-600">₹{formatINR(hpgStats.highProfit).replace("₹", "")}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-3">
                  <h2 className="text-[14px] font-medium text-black">{business.name} ડેટા લિસ્ટ</h2>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white">
                    <tr>
                      <th className="py-3 px-4 border-b border-gray-200 text-[12px] text-gray-500 font-medium">રોકાણકારનું નામ</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-[12px] text-gray-500 font-medium">તારીખ</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-[12px] text-gray-500 font-medium text-right">ચોખ્ખો નફો/નુકસાન</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hpgStats.details.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-[13px] text-gray-500">કોઈ ડેટા ઉપલબ્ધ નથી</td>
                      </tr>
                    ) : (
                      hpgStats.details.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 border-b border-gray-100 text-[13px] text-black font-medium">{item.investorName}</td>
                          <td className="py-3 px-4 border-b border-gray-100 text-[13px] text-gray-600">{new Date(item.date).toLocaleDateString("gu-IN")}</td>
                          <td className={\`py-3 px-4 border-b border-gray-100 text-[13px] font-medium text-right \${item.netProfit >= 0 ? "text-green-600" : "text-red-600"}\`}>
                            {item.netProfit >= 0 ? "+" : "-"}₹{formatINR(Math.abs(item.netProfit)).replace("₹", "")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center rounded-b">
              <button onClick={() => setShowHpgPdf(false)} className="px-6 py-2 bg-gray-800 text-white rounded text-[13px] font-medium hover:bg-black transition-colors">બંધ કરો</button>
            </div>
          </div>
        </div>,
        document.body
      )}`;

const injectPdfPortal = `      {showHpgPdf && createPortal(
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
            </div>

            <div className="mt-6">
              <h3 className="text-[17px] font-bold border-b border-gray-300 pb-2 mb-4">1. ઐતિહાસિક માહિતી (અગાઉનો રેકોર્ડ)</h3>
              <ul className="list-disc list-inside space-y-2 text-[15px] ml-2">
                <li>અગાઉ કુલ <strong>{hpgStats.pastInvestorsCount}</strong> રોકાણકારોએ રોકાણ કર્યું હતું.</li>
                <li>રોકાણકારોએ કુલ <strong>₹{formatINR(hpgStats.totalProfit).replace("₹", "")}</strong> નો નફો મેળવ્યો છે.</li>
                <li>રોકાણકારોએ કુલ <strong>₹{formatINR(hpgStats.totalLoss).replace("₹", "")}</strong> નું નુકસાન સહન કર્યું છે.</li>
                <li>કંપનીએ અત્યાર સુધીમાં આ રોકાણો મારફતે <strong>{hpgStats.companyNet >= 0 ? \`₹\${formatINR(hpgStats.companyNet).replace("₹", "")} નો નફો\` : \`₹\${formatINR(Math.abs(hpgStats.companyNet)).replace("₹", "")} નું નુકસાન\`}</strong> કર્યું છે.</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-[17px] font-bold border-b border-gray-300 pb-2 mb-4">2. હાલના સક્રિય રોકાણકારો (Current Active Investors)</h3>
              <table className="w-full border-collapse border border-gray-800 text-[14px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-800 px-3 py-2 text-center font-bold w-12">ક્રમ</th>
                    <th className="border border-gray-800 px-3 py-2 text-left font-bold">રોકાણકારનું નામ</th>
                    <th className="border border-gray-800 px-3 py-2 text-left font-bold w-32">તારીખ</th>
                    <th className="border border-gray-800 px-3 py-2 text-right font-bold">રોકાણની રકમ</th>
                  </tr>
                </thead>
                <tbody>
                  {hpgStats.activeDetails.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border border-gray-800 px-3 py-4 text-center italic text-gray-500">હાલમાં કોઈ સક્રિય રોકાણકાર નથી.</td>
                    </tr>
                  ) : (
                    hpgStats.activeDetails.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-800 px-3 py-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-800 px-3 py-2">{item.investorName}</td>
                        <td className="border border-gray-800 px-3 py-2">{new Date(item.date).toLocaleDateString("gu-IN")}</td>
                        <td className="border border-gray-800 px-3 py-2 text-right font-medium">₹{formatINR(item.amount).replace("₹", "")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="text-[17px] font-bold border-b border-gray-300 pb-2 mb-4">3. અગાઉના રોકાણકારોની વિગત (Previous Investors Details)</h3>
              <table className="w-full border-collapse border border-gray-800 text-[14px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-800 px-3 py-2 text-center font-bold w-12">ક્રમ</th>
                    <th className="border border-gray-800 px-3 py-2 text-left font-bold">રોકાણકારનું નામ</th>
                    <th className="border border-gray-800 px-3 py-2 text-left font-bold w-32">તારીખ</th>
                    <th className="border border-gray-800 px-3 py-2 text-right font-bold">રોકાણની રકમ</th>
                    <th className="border border-gray-800 px-3 py-2 text-right font-bold">ચોખ્ખો નફો/નુકસાન</th>
                  </tr>
                </thead>
                <tbody>
                  {hpgStats.details.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-800 px-3 py-4 text-center italic text-gray-500">અગાઉનો કોઈ ડેટા ઉપલબ્ધ નથી.</td>
                    </tr>
                  ) : (
                    hpgStats.details.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-800 px-3 py-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-800 px-3 py-2">{item.investorName}</td>
                        <td className="border border-gray-800 px-3 py-2">{new Date(item.date).toLocaleDateString("gu-IN")}</td>
                        <td className="border border-gray-800 px-3 py-2 text-right font-medium">₹{formatINR(item.amount).replace("₹", "")}</td>
                        <td className={\`border border-gray-800 px-3 py-2 text-right font-bold \${item.netProfit >= 0 ? "text-green-700" : "text-red-700"}\`}>
                          {item.netProfit >= 0 ? "+" : "-"}₹{formatINR(Math.abs(item.netProfit)).replace("₹", "")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-auto pt-10 border-t border-gray-300">
               <p className="text-center text-[12px] text-gray-500 italic">આ અહેવાલ સિસ્ટમ દ્વારા સ્વયં-જનરેટ (Auto-generated) થયેલ છે અને કોઈ ભૌતિક સહી (Physical Signature) ની જરૂર નથી.</p>
            </div>
          </div>
        </div>,
        document.body
      )}`;

code = code.replace(targetPdfPortal, injectPdfPortal);
fs.writeFileSync('src/components/BusinessDetail.tsx', code);
