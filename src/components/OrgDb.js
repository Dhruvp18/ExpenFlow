import React from "react";
import { Plus } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-200 p-4">
        <div className="text-xl font-bold">ExpenFlow</div>
      </div>

     
      <div className="p-6">
   
        <h1 className="text-xl font-medium mb-6">Hey, Reliance Inc.</h1>

     
        <div className="flex gap-4 mb-8">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 w-64 hover:border-[#2ECC40] transition-colors cursor-pointer">
            <span className="text-gray-600">Active Applications</span>
            <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
              12
            </div>
          </div>

          <button className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 w-64 hover:border-[#2ECC40] hover:text-[#2ECC40] transition-colors">
            <span>Create Application</span>
            <div className="rounded-full w-8 h-8 flex items-center justify-center border border-current">
              <Plus className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Policy Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-6">Policy</h2>

          <div className="space-y-6">
            {/* Flight Policy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label className="text-gray-700">Flights</label>
              </div>
              <div className="ml-6 space-y-2">
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">upto</span>
                  <input
                    type="text"
                    placeholder="$$$"
                    className="w-24 p-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Hotel Stay Policy */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
              />
              <label className="text-gray-700">Hotel Stay</label>
            </div>

            {/* Office Supplies Policy */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
              />
              <label className="text-gray-700">Office Supplies</label>
            </div>

            {/* Add New Category */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
              />
              <label className="text-gray-700 italic">Add New Category</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
