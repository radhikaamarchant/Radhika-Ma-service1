import React, { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { List, ArrowLeft, Percent, Landmark, Download, Calendar, X, FileText } from 'lucide-react';

import { downloadElementAsPDF } from '../utils/pdfGenerator';

interface StatementEntry {
  id: string;
  date: string;
  type: 'commission' | 'tax';
  title: string;
  source: string;
  amount: number;
  details: { label: string; value: string | number }[];
}

export default function MyPnL() {
  const { state } = useAppContext();
  const [showStatement, setShowStatement] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBill, setSelectedBill] = useState<StatementEntry | null>(null);

  let totalCommission = 0;
  let totalTax = 0;
  const statement: StatementEntry[] = [];

  // Calculate totals and build statement
  state.investments.forEach((inv) => {
    const business = state.businesses.find(b => b.id === inv.businessId);
    const investor = state.investors.find(i => i.id === inv.investorId);
    const bName = business ? business.name : 'Unknown';
    const iName = investor ? investor.name : 'Unknown';
    
    // Upfront Commissions
    if (inv.adminCommissionBusiness > 0) {
      totalCommission += inv.adminCommissionBusiness;
      statement.push({
        id: `comm_bus_${inv.id}`,
        date: inv.startDate,
        type: 'commission',
        title: `Upfront Commission (Business)`,
        source: bName,
        amount: inv.adminCommissionBusiness,
        details: [
          { label: 'Business Name', value: bName },
          { label: 'Investor Name', value: iName },
          { label: 'Investment Principal', value: formatINR(inv.amount) },
          { label: 'Commission Rate', value: `${inv.adminCommissionBusinessPct}%` }
        ]
      });
    }
    if (inv.adminCommissionInvestor > 0) {
      totalCommission += inv.adminCommissionInvestor;
      statement.push({
        id: `comm_inv_${inv.id}`,
        date: inv.startDate,
        type: 'commission',
        title: `Upfront Commission (Investor)`,
        source: iName,
        amount: inv.adminCommissionInvestor,
        details: [
          { label: 'Investor Name', value: iName },
          { label: 'Business Name', value: bName },
          { label: 'Investment Principal', value: formatINR(inv.amount) },
          { label: 'Commission Rate', value: `${inv.adminCommissionInvestorPct}%` }
        ]
      });
    }
    
    // Settlement/Completion details
    if (inv.status === 'completed' && inv.payoutDetails) {
      if (inv.payoutDetails.rmasCommission > 0) {
        totalCommission += inv.payoutDetails.rmasCommission;
        statement.push({
          id: `comm_set_${inv.id}`,
          date: inv.payoutDetails.payoutDate,
          type: 'commission',
          title: `Settlement RMAS Commission`,
          source: iName,
          amount: inv.payoutDetails.rmasCommission,
          details: [
            { label: 'Investor Name', value: iName },
            { label: 'Business Name', value: bName },
            { label: 'Completion Date', value: new Date(inv.payoutDetails.payoutDate).toLocaleDateString('en-IN') },
            { label: 'Gross Profit Earned', value: formatINR(inv.payoutDetails.totalCredited - inv.amount) }
          ]
        });
      }
      if (inv.payoutDetails.happyIncomeTax > 0) {
        totalTax += inv.payoutDetails.happyIncomeTax;
        statement.push({
          id: `tax_set_${inv.id}`,
          date: inv.payoutDetails.payoutDate,
          type: 'tax',
          title: `Settlement Tax Deduction`,
          source: iName,
          amount: inv.payoutDetails.happyIncomeTax,
          details: [
            { label: 'Investor Name', value: iName },
            { label: 'Business Name', value: bName },
            { label: 'Completion Date', value: new Date(inv.payoutDetails.payoutDate).toLocaleDateString('en-IN') },
            { label: 'Tax Deducted', value: formatINR(inv.payoutDetails.happyIncomeTax) }
          ]
        });
      }
    }
  });

  // Add Business Registration Charges
  state.businesses.forEach((b) => {
    if (b.registrationCommissionPaid && b.registrationCommissionPaid > 0) {
      totalCommission += b.registrationCommissionPaid;
      statement.push({
        id: `reg_bus_comm_${b.id}`,
        date: b.registrationDate,
        type: 'commission',
        title: `Business Registration Fees`,
        source: b.name,
        amount: b.registrationCommissionPaid,
        details: [
          { label: 'Business Name', value: b.name },
          { label: 'Owner Name', value: b.ownerName },
          { label: 'Registration Date', value: new Date(b.registrationDate).toLocaleDateString('en-IN') },
          { label: 'Required Funding Target', value: formatINR(b.fundingRequired) }
        ]
      });
    }
    if (b.taxPaid && b.taxPaid > 0) {
      totalTax += b.taxPaid;
      statement.push({
        id: `reg_bus_tax_${b.id}`,
        date: b.registrationDate,
        type: 'tax',
        title: `Business Registration Tax`,
        source: b.name,
        amount: b.taxPaid,
        details: [
          { label: 'Business Name', value: b.name },
          { label: 'Owner Name', value: b.ownerName },
          { label: 'Registration Date', value: new Date(b.registrationDate).toLocaleDateString('en-IN') },
          { label: 'GST / Tax Value', value: '18%' }
        ]
      });
    }
  });

  // Add Investor Registration Charges
  state.investors.forEach((i) => {
    if (i.rmasServiceCharge && i.rmasServiceCharge > 0) {
      totalCommission += i.rmasServiceCharge;
      statement.push({
        id: `reg_inv_comm_${i.id}`,
        date: i.joinDate,
        type: 'commission',
        title: `Investor Registration Service Charge`,
        source: i.name,
        amount: i.rmasServiceCharge,
        details: [
          { label: 'Investor Name', value: i.name },
          { label: 'Investor ID', value: `#${i.investorId}` },
          { label: 'Registration Date', value: new Date(i.joinDate).toLocaleDateString('en-IN') }
        ]
      });
    }
  });

  // Sort statement by date
  statement.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter Statement
  const filteredStatement = statement.filter(s => {
    if (fromDate && new Date(s.date) < new Date(fromDate)) return false;
    if (toDate && new Date(s.date) > new Date(toDate)) return false;
    return true;
  });

  const handlePrint = () => {
    downloadElementAsPDF('pnl-statement-table', 'RMAS_PnL_Statement');
  };
  
  const handlePrintBill = () => {
    downloadElementAsPDF('pnl-bill-receipt', 'RMAS_Receipt');
  };

  if (showStatement) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 print:hidden">
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowStatement(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-black tracking-tight">P&L Detailed Statement</h2>
              <p className="text-sm text-gray-500 mt-1">Transaction history of commissions and taxes collected.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded px-3 py-2">
               <Calendar size={16} className="text-gray-400" />
               <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="text-sm outline-none bg-transparent" />
            </div>
            <span className="text-gray-400">to</span>
            <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded px-3 py-2">
               <Calendar size={16} className="text-gray-400" />
               <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="text-sm outline-none bg-transparent" />
            </div>
            <button 
              onClick={handlePrint}
              className="bg-black text-white px-4 py-2 text-sm rounded flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            >
              <Download size={16} />
              <span>Download / Print</span>
            </button>
          </div>
        </div>

        <div id="pnl-statement-table" className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
           <div className="hidden print:block p-4 mb-8">
              <h2 className="text-2xl font-black text-black tracking-tight border-b-2 border-black pb-2 mb-4">RMAS P&L Statement</h2>
              <p className="text-sm text-gray-600 mb-2">Generated on: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</p>
              {(fromDate || toDate) && (
                 <p className="text-sm text-gray-600 mb-4 whitespace-nowrap">Period: {fromDate ? new Date(fromDate).toLocaleDateString('en-IN') : 'Start'} to {toDate ? new Date(toDate).toLocaleDateString('en-IN') : 'Present'}</p>
              )}
           </div>
           
           <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200 uppercase text-[10px] tracking-wider text-gray-500">
                  <tr>
                    <th className="py-4 px-6 w-32">Date</th>
                    <th className="py-4 px-6 text-center w-32">Type</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Source Party</th>
                    <th className="py-4 px-6 text-right">Credit Amount</th>
                    <th data-html2canvas-ignore="true" className="py-4 px-6 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredStatement.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 uppercase tracking-widest text-xs">No Records Found for the selected dates.</td>
                    </tr>
                  ) : (
                    filteredStatement.map((row) => (
                      <tr key={`pnl_desk_${row.id}`} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-6 text-gray-600 whitespace-nowrap">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded ${row.type === 'commission' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-black font-medium">{row.title}</td>
                        <td className="py-4 px-6 text-gray-600">{row.source}</td>
                        <td className="py-4 px-6 text-right text-black font-semibold">
                          {formatINR(row.amount)}
                        </td>
                        <td data-html2canvas-ignore="true" className="py-4 px-6 text-center print:hidden">
                          <button 
                            onClick={() => setSelectedBill(row)}
                            className="px-3 py-1 bg-white border border-gray-300 text-xs rounded hover:bg-gray-100 transition-colors text-black inline-flex items-center space-x-1"
                          >
                            <FileText size={14} />
                            <span>View Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>

           {/* Mobile View */}
           <div className="block md:hidden divide-y divide-gray-100">
             {filteredStatement.length === 0 ? (
                <div className="py-12 text-center text-gray-500 uppercase tracking-widest text-xs">No Records Found.</div>
             ) : (
               filteredStatement.map((row) => (
                 <div key={`pnl_mob_${row.id}`} className="p-4 bg-white">
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-black">{row.title}</span>
                     <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded ${row.type === 'commission' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                       {row.type}
                     </span>
                   </div>
                   
                   <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                     <span>{new Date(row.date).toLocaleDateString('en-IN')}</span>
                     <span className="font-medium text-gray-600">From: {row.source}</span>
                   </div>
                   
                   <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                     <div className="font-bold text-black text-lg">
                       {formatINR(row.amount)}
                     </div>
                     <button 
                       onClick={() => setSelectedBill(row)}
                       className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-xs font-semibold rounded hover:bg-gray-100 transition-colors text-black inline-flex items-center space-x-1"
                     >
                       <FileText size={14} />
                       <span>View Bill</span>
                     </button>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {selectedBill && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col items-center justify-center p-4 print:hidden backdrop-blur-sm">
            <div className="bg-white max-w-lg w-full rounded shadow-2xl relative flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                 <h3 className="text-xl tracking-tight text-black flex items-center">
                   RADHIKA MA<span className="text-blue-600 ml-1">SERVICE</span>
                 </h3>
                 <div className="flex items-center space-x-3">
                   <button onClick={handlePrintBill} className="px-3 py-1.5 text-xs bg-black text-white hover:bg-gray-800 rounded font-semibold transition-colors flex items-center space-x-1">
                     <Download size={14} />
                     <span>Download Bill</span>
                   </button>
                   <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-black transition-colors">
                     <X size={24} />
                   </button>
                 </div>
              </div>
              
              <div id="pnl-bill-receipt" className="bg-white">
                <div className="p-8 space-y-6">
                  <div className="text-center pb-6 border-b border-dashed border-gray-300 relative">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Receipt for</p>
                    <p className="text-lg font-medium text-black">{selectedBill.title}</p>
                    <div className="absolute top-0 right-0 opacity-10">
                      <FileText size={64} />
                    </div>
                  </div>

                  <div className="space-y-4 text-sm border-b border-dashed border-gray-300 pb-6">
                    {selectedBill.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <span className="text-gray-500">{detail.label}</span>
                        <span className="text-black text-right font-medium max-w-[60%] break-words leading-tight">{detail.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-start pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Date</span>
                      <span className="text-black text-right font-medium">{new Date(selectedBill.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="text-black text-right text-xs bg-gray-100 font-mono px-2 py-0.5 rounded">{selectedBill.id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg text-black font-semibold">Total Billed</span>
                    <span className="text-2xl text-black font-black">{formatINR(selectedBill.amount)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
                  <p className="text-xs text-gray-500">This is an auto-generated system receipt. All taxes and commissions are properly recorded according to RMAS policies.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-black tracking-tight">MY P&L Overview</h2>
        <p className="text-sm text-gray-500 mt-2">Track total administrative commissions and tax deductions collected across all investments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
             <span className="uppercase tracking-widest text-xs text-blue-600">Total Commissions</span>
             <Percent size={24} className="text-blue-200" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl tracking-tight text-black mb-2">{formatINR(totalCommission)}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Revenue from RMAS Admin Deductions</p>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <span className="uppercase tracking-widest text-xs text-purple-600">Total Taxes Collected</span>
            <Landmark size={24} className="text-purple-200" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl tracking-tight text-black mb-2">{formatINR(totalTax)}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Revenue from Tax Deductions</p>
          </div>
        </div>
      </div>

      <div className="pt-8 w-full md:w-auto">
        <button 
          onClick={() => setShowStatement(true)}
          className="w-full md:w-auto bg-black text-white py-4 px-10 rounded flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <List size={22} />
          <span>View Detailed P&L Statement</span>
        </button>
      </div>
    </div>
  );
}

