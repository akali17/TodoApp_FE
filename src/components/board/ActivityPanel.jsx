import { useState } from "react";
import { useBoardStore } from "../../store/useBoardStore";

export default function ActivityPanel({ activity: propActivity }) {
  const storeActivity = useBoardStore((state) => state.activity);
  const activity = propActivity ?? storeActivity;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={
        (collapsed ? "w-10 " : "w-full ") +
        "bg-white border rounded-xl shadow-sm p-3 md:p-4 transition-all duration-300 flex flex-col h-[calc(100vh-200px)]"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        {!collapsed && <h3 className="font-semibold">Activity</h3>}
        <button
          aria-label={collapsed ? "Expand activity" : "Collapse activity"}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setCollapsed((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={(collapsed ? "rotate-180 " : "") + "w-5 h-5 text-gray-600 transition-transform"}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="mt-3 overflow-y-auto flex-1">
          {activity.length === 0 && (
            <p className="text-sm text-gray-400">No activity yet</p>
          )}

          {activity.map((a) => (
            <div key={a._id} className="mb-3 text-sm">
              <div className="font-medium">{a.userId?.username}</div>
              <div className="text-gray-600">{a.detail}</div>
              <div className="text-xs text-gray-400">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
