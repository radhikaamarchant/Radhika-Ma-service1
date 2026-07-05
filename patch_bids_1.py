import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

old_app_iface = '''interface IPOApplication {
  id: string;
  ipoId: string;
  investorId: string;
  lotsApplied: number;
  appliedAmount: number;
  applicationDate: string;
  allotmentStatus: 'Pending' | 'Allotted' | 'Rejected' | 'Partially Allotted';
  allottedLots: number;
  refundStatus: 'N/A' | 'Pending' | 'Refunded';
  listingStatus: 'N/A' | 'Listed' | 'Exited';
}'''

new_app_iface = '''interface IPOApplication {
  id: string;
  ipoId: string;
  investorId: string;
  lotsApplied: number;
  appliedAmount: number;
  commissionPaid: number;
  applicationDate: string;
  applicationStatus: 'Active' | 'Cancelled';
  allotmentStatus: 'Pending' | 'Allotted' | 'Not Allotted';
  refundStatus: 'N/A' | 'Refunded';
  listingStatus: 'N/A' | 'Listed';
}'''
content = content.replace(old_app_iface, new_app_iface)
with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
