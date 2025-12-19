import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAllCardsWithDeadlines } from "../../api/stats";

export default function DeadlineCalendar() {
  const [date, setDate] = useState(new Date());
  const [cardsData, setCardsData] = useState([]);
  const [selectedDateCards, setSelectedDateCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await getAllCardsWithDeadlines();
      setCardsData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch cards with deadlines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    updateSelectedDateCards(newDate);
  };

  const updateSelectedDateCards = (selectedDate) => {
    const selected = cardsData.filter((card) => {
      if (!card.deadline) return false;
      const cardDate = new Date(card.deadline).toDateString();
      const compareDate = new Date(selectedDate).toDateString();
      return cardDate === compareDate;
    });
    setSelectedDateCards(selected);
  };

  const getTileContent = (tileDate) => {
    const tileContent = cardsData.filter((card) => {
      if (!card.deadline) return false;
      const cardDate = new Date(card.deadline).toDateString();
      const compareDate = tileDate.toDateString();
      return cardDate === compareDate;
    });

    if (tileContent.length === 0) return null;

    const completed = tileContent.filter((c) => c.isCompleted).length;
    const notStarted = tileContent.filter((c) => c.isNotStarted).length;

    return (
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {notStarted > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>}
        {completed > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>}
      </div>
    );
  };

  const getTileClassName = (tileDate) => {
    const tileCards = cardsData.filter((card) => {
      if (!card.deadline) return false;
      const cardDate = new Date(card.deadline).toDateString();
      const compareDate = tileDate.toDateString();
      return cardDate === compareDate;
    });

    if (tileCards.length === 0) return "";

    const completed = tileCards.filter((c) => c.isCompleted).length;
    const total = tileCards.length;

    if (completed === total) {
      return "react-calendar__tile--completed";
    } else if (completed > 0) {
      return "react-calendar__tile--partial";
    } else {
      return "react-calendar__tile--pending";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6">Lịch Deadline</h2>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <style>{`
              .react-calendar {
                width: 100%;
                border: none;
                font-family: inherit;
              }
              .react-calendar__month-view__weekdays {
                text-align: center;
                font-weight: 600;
                color: #374151;
                padding: 10px 0;
              }
              .react-calendar__month-view__weekdays__weekday {
                padding: 8px;
              }
              .react-calendar__tile {
                max-width: 100%;
                padding: 8px 4px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                margin: 2px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                color: #1f2937;
              }
              .react-calendar__tile abbr {
                display: block;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #000000 !important;
                text-decoration: none;
              }
              .react-calendar__tile:hover {
                background: #f3f4f6;
              }
              .react-calendar__tile--active {
                background: #3b82f6;
                color: #000000;
              }
              .react-calendar__tile--active abbr {
                color: #000000 !important;
              }
              .react-calendar__tile--now {
                color: #000000;
              }
              .react-calendar__tile--now abbr {
                color: #000000 !important;
              }
              .react-calendar__tile--now:hover {
                background: #f3f4f6;
                color: #000000;
              }
              .react-calendar__tile--completed {
                background: #ffffff;
                border-color: #e5e7eb;
              }
              .react-calendar__tile--completed:hover {
                background: #f3f4f6;
              }
              .react-calendar__tile--partial {
                background: #ffffff;
                border-color: #e5e7eb;
              }
              .react-calendar__tile--partial:hover {
                background: #f3f4f6;
              }
              .react-calendar__tile--pending {
                background: #ffffff;
                border-color: #e5e7eb;
              }
              .react-calendar__tile--pending:hover {
                background: #f3f4f6;
              }
              .react-calendar__tile--active.react-calendar__tile--completed,
              .react-calendar__tile--active.react-calendar__tile--partial,
              .react-calendar__tile--active.react-calendar__tile--pending {
                color: white;
              }
              .react-calendar__navigation {
                margin-bottom: 20px;
              }
              .react-calendar__navigation button {
                font-size: 14px;
                padding: 8px 12px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
              }
              .react-calendar__navigation button:hover {
                background: #e5e7eb;
              }
            `}</style>
            <Calendar
              value={date}
              onChange={handleDateChange}
              tileContent={({ date: tileDate }) => getTileContent(tileDate)}
              tileClassName={({ date: tileDate }) => getTileClassName(tileDate)}
            />
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Có task chưa hoàn thành</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">Có task hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Selected Date Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Ngày: {date.toLocaleDateString("vi-VN")}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateCards.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có task trong ngày này</p>
              ) : (
                selectedDateCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      card.isCompleted
                        ? "bg-green-50 border-green-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {card.title}
                        </p>
                        {card.boardTitle && (
                          <p className="text-xs text-gray-500 mt-1">
                            {card.boardTitle}
                          </p>
                        )}
                      </div>
                      {card.isCompleted && (
                        <span className="text-green-600 text-lg flex-shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          card.isCompleted
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {card.isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
