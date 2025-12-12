import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useBoardStore = create((set, get) => ({

  board: null,
  columns: [],
  cards: [],
  activity: [],
  loading: false,

  /* =====================================================
      LOAD FULL BOARD
  ====================================================== */
  getFullBoard: async (boardId) => {
    try {
      set({ loading: true });

      const res = await axiosClient.get(`/boards/${boardId}/full`);

      set({
        board: res.data.board,
        columns: res.data.columns.sort((a,b)=>a.order-b.order),
        cards: res.data.cards.sort((a,b)=>a.order-b.order),
        activity: res.data.activity,
        loading: false
      });

    } catch (err) {
      console.error("GET FULL BOARD ERROR:", err);
      set({ loading: false });
    }
  },

  /* =====================================================
      LOCAL STATE UPDATE (Optimistic UI)
  ====================================================== */
  setLocalColumns: (cols) => set({ columns: cols }),
  setLocalCards: (cards) => set({ cards }),

  setLocalColumnsAndCards: (cols, cards) =>
    set({ columns: cols, cards: cards }),

  /* =====================================================
      REORDER COLUMNS
  ====================================================== */
  reorderColumns: async (boardId, reorderedColumns) => {
    try {
      // update UI ngay lập tức
      set({ columns: reorderedColumns });

      // gửi order lên server
      await axiosClient.post("/columns/reorder", {
        boardId,
        order: reorderedColumns.map(c => c._id)
      });

    } catch (err) {
      console.error("REORDER COLUMNS ERROR:", err);
      await get().getFullBoard(boardId); // rollback
    }
  },

  /* =====================================================
      MOVE CARD BETWEEN COLUMNS
  ====================================================== */
  moveCard: async ({ cardId, fromColumn, toColumn, newIndex }) => {
    try {
      await axiosClient.post(`/cards/${cardId}/move`, {
        fromColumn,
        toColumn,
        newIndex
      });

      // reload để đồng bộ order
      await get().getFullBoard(get().board._id);

    } catch (err) {
      console.error("MOVE CARD ERROR:", err);
    }
  },

  /* =====================================================
      CREATE COLUMN
  ====================================================== */
  createColumn: async (boardId, title) => {
    try {
      await axiosClient.post("/columns", { boardId, title });
      await get().getFullBoard(boardId);
    } catch (err) {
      console.error("CREATE COLUMN ERROR:", err);
    }
  },

  /* =====================================================
      CREATE CARD
  ====================================================== */
  createCard: async (columnId, title) => {
    try {
      await axiosClient.post("/cards", { columnId, title });

      // reload board
      await get().getFullBoard(get().board._id);

    } catch (err) {
      console.error("CREATE CARD ERROR:", err);
    }
  },

}));
