import { useState } from 'react';
import { useAppContext } from '../utils/AppContext';
import { formatINR } from '../utils/mockData';
import { ArrowLeft, Building2, Save, X, Edit2, Shield, AlertCircle, BadgeCheck } from 'lucide-react';
import { Business } from '../types';
import { getBlueTickBusinessIds } from '../utils/blueTick';

interface Props {
  businessId: string;
  onBack: () => void;
}

export default function BusinessDetail({ businessId, onBack }: Props) {
  const { state, dispatch } = useAppContext();
  const business = state.businesses.find(b => b.id === businessId);
  const [isEditing, setIsEditing] = useState(false);
  
  const blueTickBusinessIds = getBlueTickBusinessIds(state.businesses, state.investments);
  const isBlueTick = blueTickBusinessIds.has(businessId);

  
  const [formData, setFormData] = useState({
    fundingRequired: business?.fundingRequired.toString() || '0',
    interestRate: business?.interestRate.toString() || '0',
    status: business?.status || 'listed',
  });

  if (!business) return null;

  const getTime = (id: string) => parseInt(id.replace(/\D/g, '')) || 0;
  const businessInvestments = state.investments
    .filter(inv => inv.businessId === businessId)
    .sort((a, b) => getTime(b.id) - getTime(a.id));
  const activeBusinessInvestments = businessInvestments.filter(i => i.status !== 'completed');
  const totalFunded = activeBusinessInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_BUSINESS',
      payload: {
        ...business,
        fundingRequired: parseFloat(formData.fundingRequired),
        interestRate: parseFloat(formData.interestRate),
        status: formData.status as Business['status'],
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fundingRequired: business.fundingRequired.toString(),
      interestRate: business.interestRate.toString(),
      status: business.status,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-black" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-black tracking-tight flex items-center space-x-2">
            <span>{business.name}</span>
            {isBlueTick && <BadgeCheck size={24} className="text-blue-500 fill-white" title="RMAS Verified - High Profit" />}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Detailed View & Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-black flex items-center space-x-2">
                <Shield size={20} className="text-gray-700" />
                <span>Admin Configuration</span>
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-black border border-gray-300 px-3 py-1.5 rounded bg-white hover:bg-gray-50 transition-colors"
                >
                  <Edit2 size={14} />
                  <span>Edit Parameters</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleCancel}
                    className="flex items-center space-x-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center space-x-1 text-sm font-semibold text-white bg-black hover:bg-gray-800 px-3 py-1.5 rounded transition-colors"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Funding Required (₹)</label>
                {isEditing ? (
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-semibold text-black focus:ring-2 focus:ring-black outline-none" 
                    value={formData.fundingRequired} 
                    onChange={e => setFormData({...formData, fundingRequired: e.target.value})} 
                  />
                ) : (
                  <p className="text-xl font-bold text-black">{formatINR(business.fundingRequired)}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Interest Rate (%)</label>
                {isEditing ? (
                  <input 
                    type="number"
                    step="0.1" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-semibold text-black focus:ring-2 focus:ring-black outline-none" 
                    value={formData.interestRate} 
                    onChange={e => setFormData({...formData, interestRate: e.target.value})} 
                  />
                ) : (
                  <p className="text-xl font-bold text-green-600">{business.interestRate}%</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Status</label>
                {isEditing ? (
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-semibold text-black focus:ring-2 focus:ring-black outline-none bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="listed">Listed</option>
                    <option value="funded">Funded</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                      ${business.status === 'listed' ? 'bg-green-100 text-green-800' : 
                        business.status === 'funded' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {business.status.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Owner Name</label>
                 <p className="text-lg font-medium text-gray-900">{business.ownerName}</p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-800">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Changing these parameters will only affect future investments. Past investments will retain their mutually agreed upon rates at the time they were processed.</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-black flex items-center space-x-2">
                <Building2 size={20} className="text-gray-700" />
                <span>Investor Roster</span>
              </h3>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Funded</p>
                <p className="text-lg font-bold text-black">{formatINR(totalFunded)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="p-4 font-semibold text-gray-900">Investor Name</th>
                    <th className="p-4 font-semibold text-gray-900">Amount</th>
                    <th className="p-4 font-semibold text-gray-900">Interest</th>
                    <th className="p-4 font-semibold text-gray-900">Duration</th>
                    <th className="p-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {businessInvestments.map(inv => {
                    const investor = state.investors.find(i => i.id === inv.investorId);
                    return (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-black">{investor?.name}</td>
                        <td className="p-4 font-bold text-black">{formatINR(inv.amount)}</td>
                        <td className="p-4 font-medium text-green-600">{inv.interestRate}%</td>
                        <td className="p-4 text-gray-600 font-medium">{inv.timePeriodMonths} Months</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {businessInvestments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No investors have funded this business yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Registration Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Date Registered</p>
                  <p className="text-sm font-medium text-black mt-1">{new Date(business.registrationDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Reg. Commission Paid</p>
                  <p className="text-sm font-bold text-black mt-1">{formatINR(business.registrationCommissionPaid)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Tax Collected</p>
                  <p className="text-sm font-bold text-black mt-1">{formatINR(business.taxPaid)}</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold">Total Setup Revenue</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{formatINR(business.registrationCommissionPaid + business.taxPaid)}</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
