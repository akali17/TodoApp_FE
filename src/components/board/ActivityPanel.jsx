export default function ActivityPanel({ items }) {
  return (
    <div className="w-72 bg-white shadow rounded p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Activity</h2>

      {items?.map((log) => (
        <div key={log._id} className="mb-3 border-b pb-2">
          <p className="text-sm">
            <b>{log.userId?.username}</b> {log.detail}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
