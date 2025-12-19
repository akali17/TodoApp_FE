import { useEffect, useState } from "react";
import { getBoardStats, getActivityStats } from "../api/stats";
import PageContainer from "../components/common/PageContainer";
import DeadlineCalendar from "../components/common/DeadlineCalendar";
import { useAuthStore } from "../store/useAuthStore";
import { getSocket } from "../socket";

// Simple bar chart component
const SimpleBarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || d.count || 0));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <div className="flex items-end justify-around gap-2" style={{ height: chartHeight, minWidth: '100%' }}>
          {data.map((item, idx) => {
            const height = (item.value || item.count || 0) / (maxValue || 1);
            return (
              <div key={idx} className="flex flex-col items-center flex-1 min-w-fit">
                <div
                  className="w-12 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{
                    height: `${height * chartHeight}px`,
                    minHeight: height > 0 ? "4px" : "0px",
                  }}
                />
                <span className="text-xs text-gray-600 mt-2 text-center break-words max-w-14 font-medium">
                  {item.label || item.date}
                </span>
                <span className="text-xs font-bold text-gray-800 mt-1">
                  {item.value !== undefined ? item.value : item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Progress circle
const ProgressCircle = ({ percentage, label, size = 120 }) => {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
      </div>
      <p className="text-sm text-gray-600 mt-8 text-center">{label}</p>
    </div>
  );
};

// Detailed bar chart with completed/not completed
const DetailedBarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => (d.total || 0)));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <div className="flex items-end justify-around gap-2" style={{ height: chartHeight, minWidth: '100%' }}>
          {data.map((item, idx) => {
            const completedHeight = ((item.completed || 0) / (maxValue || 1)) * chartHeight;
            const notCompletedHeight = ((item.notCompleted || 0) / (maxValue || 1)) * chartHeight;
            const totalHeight = completedHeight + notCompletedHeight;
            
            return (
              <div key={idx} className="flex flex-col items-center flex-1 min-w-fit">
                <div className="relative w-12" style={{ height: `${totalHeight}px` }}>
                  {/* Not Completed (Yellow) */}
                  {notCompletedHeight > 0 && (
                    <div
                      className="w-12 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t transition-all hover:from-yellow-500 hover:to-yellow-400 absolute bottom-0 left-0"
                      style={{
                        height: `${notCompletedHeight}px`,
                        minHeight: notCompletedHeight > 0 ? "4px" : "0px",
                      }}
                      title={`Not completed: ${item.notCompleted}`}
                    />
                  )}
                  {/* Completed (Green) */}
                  {completedHeight > 0 && (
                    <div
                      className="w-12 bg-gradient-to-t from-green-500 to-green-400 transition-all hover:from-green-600 hover:to-green-500 absolute left-0"
                      style={{
                        height: `${completedHeight}px`,
                        bottom: `${notCompletedHeight}px`,
                        minHeight: completedHeight > 0 ? "4px" : "0px",
                      }}
                      title={`Completed: ${item.completed}`}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-2 text-center break-words max-w-14 font-medium">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-gray-800 mt-1">
                  {item.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-4 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Hoàn thành</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>Chưa hoàn thành</span>
        </div>
      </div>
    </div>
  );
};

export default function Statistics() {
  const [boardStats, setBoardStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const user = useAuthStore((state) => state.user);

  const fetchStats = async () => {
    try {
      const [boardRes, activityRes] = await Promise.all([
        getBoardStats(),
        getActivityStats(),
      ]);
      setBoardStats(boardRes.data);
      setActivityStats(activityRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, [user]);

  // Real-time updates via Socket.io
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      console.log("📊 Stats updated, refreshing...");
      fetchStats();
    };

    // Listen to card-related events
    socket.on("card:created", handleUpdate);
    socket.on("card:updated", handleUpdate);
    socket.on("card:deleted", handleUpdate);
    socket.on("card:member-added", handleUpdate);
    socket.on("card:member-removed", handleUpdate);
    socket.on("column:created", handleUpdate);
    socket.on("column:reordered", handleUpdate);
    socket.on("board:updated", handleUpdate);
    socket.on("activity:updated", handleUpdate);

    return () => {
      socket.off("card:created", handleUpdate);
      socket.off("card:updated", handleUpdate);
      socket.off("card:deleted", handleUpdate);
      socket.off("card:member-added", handleUpdate);
      socket.off("card:member-removed", handleUpdate);
      socket.off("column:created", handleUpdate);
      socket.off("column:reordered", handleUpdate);
      socket.off("board:updated", handleUpdate);
      socket.off("activity:updated", handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <PageContainer title="Statistics">
        <div className="flex items-center justify-center h-96">
          <p className="text-xl text-gray-500">Loading statistics...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="">
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-8 flex-1">
            <h1 className="text-4xl font-bold mb-2">Thống Kê Tiến Độ</h1>
            <p className="text-blue-100">Theo dõi tiến độ công việc của bạn</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchStats().finally(() => setLoading(false));
            }}
            disabled={loading}
            className="ml-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium flex items-center gap-2 h-fit"
          >
            <svg
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-sm text-gray-500 text-right">
            Last updated: {lastUpdated}
          </div>
        )}

        {/* Overall Statistics */}
        {boardStats?.overall && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-gray-500 text-sm font-medium mb-2">
                Tổng Boards
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {boardStats.overall.totalBoards}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-gray-500 text-sm font-medium mb-2">
                Tổng Tasks
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {boardStats.overall.totalCards}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-gray-500 text-sm font-medium mb-2">
                Hoàn Thành
              </div>
              <div className="text-3xl font-bold text-green-600">
                {boardStats.overall.totalCompleted}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-gray-500 text-sm font-medium mb-2">
                Tỷ Lệ Hoàn Thành
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {boardStats.overall.overallCompletionRate}%
              </div>
            </div>
          </div>
        )}

        {/* Completion Rate Progress Circles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-8 text-center">
              Tỷ Lệ Hoàn Thành Chung
            </h3>
            <div className="flex justify-center">
              <div className="relative">
                <ProgressCircle
                  percentage={boardStats?.overall?.overallCompletionRate || 0}
                  label="Tasks Completed"
                />
              </div>
            </div>
          </div>

          {/* Activity by Day */}
          {activityStats?.activityByDay && (
            <SimpleBarChart
              data={activityStats.activityByDay}
              title="Hoạt Động 7 Ngày Gần Đây"
            />
          )}
        </div>

        {/* Board Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Thống Kê Theo Board</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Board
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Tổng Tasks
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Hoàn Thành
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Tỷ Lệ
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Thành Viên
                  </th>
                </tr>
              </thead>
              <tbody>
                {boardStats?.boards?.map((board) => (
                  <tr 
                    key={board.boardId} 
                    onClick={() => setSelectedBoardId(board.boardId)}
                    className={`border-b cursor-pointer transition ${
                      selectedBoardId === board.boardId
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {board.boardTitle}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {board.totalCards}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {board.completedCards}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${board.completionRate}%` }}
                          />
                        </div>
                        <span className="ml-2 font-semibold text-blue-600">
                          {board.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {board.memberCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Board Columns Statistics */}
        {selectedBoardId && (
          <div className="grid grid-cols-1 gap-6">
            {boardStats?.boards
              ?.filter((board) => board.boardId === selectedBoardId)
              .map((board) => {
                const columnData = Object.entries(board.cardsByColumn).map(
                  ([label, value]) => ({
                    label,
                    ...value,
                  })
                );
                return (
                  <DetailedBarChart
                    key={board.boardId}
                    data={columnData}
                    title={`${board.boardTitle} - Tasks Theo Column`}
                  />
                );
              })}
          </div>
        )}

        {/* Deadline Calendar */}
        <DeadlineCalendar />
      </div>
    </PageContainer>
  );
}
