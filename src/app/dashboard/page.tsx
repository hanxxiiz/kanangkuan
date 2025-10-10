export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Example stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Total Tests</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-1">128</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Average WPM</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-1">82</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Accuracy</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-1">96%</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Badges Earned</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-1">12</p>
        </div>
      </div>
    </div>
  );
}
