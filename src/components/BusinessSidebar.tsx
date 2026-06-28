import { useState } from "react";
import { useAppContext } from "../utils/AppContext";
import { Building2, Search } from "lucide-react";

export default function BusinessSidebar() {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBusinesses = state.businesses.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.businessId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-kite-bg">
      {/* Search Bar */}
      <div className="p-3 border-b border-kite-border bg-gray-50/50 dark:bg-kite-bg">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-kite-text-light" />
          <input
            type="text"
            placeholder="Search companies (eg. RIL, TCS)"
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-kite-surface border border-kite-border rounded-sm focus:outline-none focus:border-kite-blue focus:ring-1 focus:ring-kite-blue transition-all dark:text-kite-text placeholder:text-kite-text-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredBusinesses.map((business, index) => (
          <div
            key={business.id}
            className="px-4 py-2 flex items-start justify-between cursor-pointer border-b border-kite-border hover:bg-gray-50 dark:hover:bg-kite-surface transition-colors group bg-kite-bg"
          >
            <div className="flex items-center gap-3 w-full">
              {business.photoUrl ? (
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-kite-surface shrink-0 flex items-center justify-center overflow-hidden border border-kite-border/50">
                  <img src={business.photoUrl} alt={business.name} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] lg:text-[12px] font-medium text-kite-text truncate lg:tracking-tight">{business.name}</h4>
                  <span className="text-[11px] text-kite-text-light uppercase tracking-wider hidden lg:block">
                    {business.businessId}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-[1px]">
                  <span className="text-[11px] text-kite-text-light uppercase tracking-wider lg:hidden">
                    {business.businessId}
                  </span>
                  {business.authorityType && (
                    <span className="text-[10px] text-kite-blue lg:text-[#3B82F6] truncate">
                      {business.authorityType.replace(" Authorities", "")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredBusinesses.length === 0 && (
          <div className="p-8 text-center text-[12px] text-kite-text-light">
            No businesses found.
          </div>
        )}
      </div>
    </div>
  );
}
