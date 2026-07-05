import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_refund_display = '''                       <div className="flex justify-between">
                         <span className="text-kite-text-light">Refund Status</span>
                         <span className="text-kite-text font-medium">{myApp.refundStatus}</span>
                       </div>'''

new_refund_display = '''                       {isRefunded ? (
                         <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded">
                           <div className="flex justify-between mb-1">
                             <span className="text-kite-text-light">Refund Status</span>
                             <span className="text-kite-green font-medium">Refund Completed</span>
                           </div>
                           <div className="flex justify-between mb-1">
                             <span className="text-kite-text-light">Refund Amount</span>
                             <span className="text-kite-text font-medium">₹{myApp.appliedAmount.toLocaleString('en-IN')}</span>
                           </div>
                           <div className="flex justify-between mb-1">
                             <span className="text-kite-text-light">Refund Date</span>
                             <span className="text-kite-text font-medium">{new Date().toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-kite-text-light">Application</span>
                             <span className="text-kite-text font-medium">Closed</span>
                           </div>
                         </div>
                       ) : (
                         <div className="flex justify-between">
                           <span className="text-kite-text-light">Refund Status</span>
                           <span className="text-kite-text font-medium">{myApp.refundStatus}</span>
                         </div>
                       )}'''

content = content.replace(old_refund_display, new_refund_display)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
