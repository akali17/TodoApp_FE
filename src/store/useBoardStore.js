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
      SOCKET (CHỈ NGHE – KHÔNG PHÁ LOGIC CŨ)
  ====================================================== */
  initBoardSocket: (socket) => {
    if (!socket) return;

    // Cleanup old listeners
    socket.off("board:titleUpdated");
    socket.off("member:removed");
    socket.off("member:joined");
    socket.off("user:joined");
    socket.off("user:left");
    socket.off("card:updated");
    socket.off("card:moved");
    socket.off("card:created");
    socket.off("card:deleted");
    socket.off("column:created");
    socket.off("column:updated");
    socket.off("column:deleted");
    socket.off("columns:reordered");
    socket.off("cards:reordered");
    socket.off("activity:updated");

    // ====== BOARD EVENTS ======
    socket.on("board:titleUpdated", ({ title }) => {
      console.log("🔥 SOCKET board:titleUpdated", title);
      set((state) => ({
        board: { ...state.board, title },
      }));
    });

    socket.on("member:removed", ({ boardId, userId, removedBy }) => {
      console.log("🔥 SOCKET member:removed", { boardId, userId, removedBy });
      set((state) => {
        // Remove member from board.members array
        const updatedBoard = {
          ...state.board,
          members: state.board.members.filter(
            (m) => String(m._id) !== String(userId)
          ),
        };
        return { board: updatedBoard };
      });
    });

    socket.on("member:joined", ({ boardId, userId, username }) => {
      console.log("🔥 SOCKET member:joined", { boardId, userId, username });
      set((state) => {
        // Add new member to board if not already there
        const alreadyExists = state.board.members.some(
          (m) => String(m._id) === String(userId)
        );
        if (alreadyExists) return { board: state.board };
        
        const updatedBoard = {
          ...state.board,
          members: [...state.board.members, { _id: userId, username }],
        };
        return { board: updatedBoard };
      });
    });

    socket.on("user:joined", ({ userId, onlineUsers }) => {
      console.log("🔥 SOCKET user:joined", { userId, onlineUsers });
      // Update online users list (handled by useOnlineUsers hook)
    });

    socket.on("user:left", ({ userId, onlineUsers }) => {
      console.log("🔥 SOCKET user:left", { userId, onlineUsers });
      // Update online users list (handled by useOnlineUsers hook)
    });

    // ====== CARD EVENTS ======
    socket.on("card:created", ({ card }) => {
      console.log("🔥 SOCKET card:created", card);
      set((state) => ({
        cards: [...state.cards, card],
      }));
    });

    socket.on("card:updated", ({ card }) => {
      console.log("🔥 SOCKET card:updated", card);
      set((state) => ({
        cards: state.cards.map((c) =>
          String(c._id) === String(card._id) ? card : c
        ),
      }));
    });

    socket.on("card:deleted", ({ cardId }) => {
      console.log("🔥 SOCKET card:deleted", cardId);
      set((state) => ({
        cards: state.cards.filter((c) => String(c._id) !== String(cardId)),
      }));
    });

    socket.on("card:moved", ({ card }) => {
      console.log("🔥 SOCKET card:moved", card);
      set((state) => ({
        cards: state.cards.map((c) =>
          String(c._id) === String(card._id) ? card : c
        ),
      }));
    });

    // ====== COLUMN EVENTS ======
    socket.on("column:created", ({ column }) => {
      console.log("🔥 SOCKET column:created", column);
      set((state) => ({
        columns: [...state.columns, column],
      }));
    });

    socket.on("column:updated", ({ column }) => {
      console.log("🔥 SOCKET column:updated", column);
      set((state) => ({
        columns: state.columns.map((c) =>
          String(c._id) === String(column._id) ? column : c
        ),
      }));
    });

    socket.on("column:deleted", ({ columnId }) => {
      console.log("🔥 SOCKET column:deleted", columnId);
      set((state) => ({
        columns: state.columns.filter((c) => String(c._id) !== String(columnId)),
        // Also remove cards from deleted column
        cards: state.cards.filter((c) => String(c.column) !== String(columnId)),
      }));
    });

    socket.on("columns:reordered", ({ reorderedColumnIds }) => {
      console.log("🔥 SOCKET columns:reordered", reorderedColumnIds);
      set((state) => {
        const columnMap = new Map(state.columns.map(c => [String(c._id), c]));
        const reorderedColumns = reorderedColumnIds
          .map(id => columnMap.get(String(id)))
          .filter(Boolean);
        return { columns: reorderedColumns };
      });
    });

    socket.on("cards:reordered", ({ columnId, cards }) => {
      console.log("🔥 SOCKET cards:reordered", { columnId, cards });
      set((state) => ({
        cards: state.cards.map(c => {
          const updated = cards.find(card => String(card._id) === String(c._id));
          return updated || c;
        })
      }));
    });

    socket.on("activity:updated", ({ activity }) => {
      console.log("🔥 SOCKET activity:updated", activity);
      set({
        activity: activity || []
      });
    });
  },

  /* =====================================================
      LOCAL STATE UPDATE 
  ====================================================== */
  setLocalColumns: (cols) => set({ columns: cols }),
  setLocalCards: (cards) => set({ cards }),

  setLocalColumnsAndCards: (cols, cards) =>
    set({ columns: cols, cards: cards }),

  /* =====================================================
      REORDER CARDS IN COLUMN
  ====================================================== */
  reorderCardsInColumn: async (columnId, orderedCardIds) => {
    try {
      set((state) => ({
        cards: state.cards.map(c => {
          const newIndex = orderedCardIds.indexOf(String(c._id));
          return newIndex !== -1 ? { ...c, order: newIndex } : c;
        })
      }));

      await axiosClient.patch("/cards/reorder", {
        columnId,
        orderedCardIds
      });

    } catch (err) {
      console.error("REORDER CARDS ERROR:", err);
      // Socket will sync state
    }
  },

  /* =====================================================
      REORDER COLUMNS 
  ====================================================== */
  reorderColumns: async (boardId, reorderedColumns) => {
    try {
      set({ columns: reorderedColumns });

      await axiosClient.post("/columns/reorder", {
        boardId,
        reorderedColumnIds: reorderedColumns.map(c => c._id)
      });

    } catch (err) {
      console.error("REORDER COLUMNS ERROR:", err);
      await get().getFullBoard(boardId);
    }
  },

  /* =====================================================
      MOVE CARD (GIỮ RELOAD)
  ====================================================== */
  moveCard: async ({ cardId, toColumn, newOrder }) => {
    try {
      // Optimistic update
      const state = get();
      const card = state.cards.find(c => String(c._id) === String(cardId));
      
      if (card) {
        const oldCard = { ...card };
        const updatedCard = { ...card, column: toColumn, order: newOrder };
        
        set((s) => ({
          cards: s.cards.map(c => String(c._id) === String(cardId) ? updatedCard : c)
        }));

        try {
          await axiosClient.patch(`/cards/${cardId}/move`, {
            toColumn,
            newOrder
          });
          console.log("✅ Card moved successfully");
        } catch (err) {
          // Rollback on error
          set((s) => ({
            cards: s.cards.map(c => String(c._id) === String(cardId) ? oldCard : c)
          }));
          console.error("MOVE CARD ERROR:", err);
          throw err;
        }
      }
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
      // Socket event "column:created" sẽ tự động update state
    } catch (err) {
      console.error("CREATE COLUMN ERROR:", err);
    }
  },

  /* =====================================================
      UPDATE COLUMN 
  ====================================================== */
  updateColumn: async (columnId, title) => {
    try {
      await axiosClient.put(`/columns/${columnId}`, { title });
      // Socket event "column:updated" sẽ tự động update state
    } catch (err) {
      console.error("UPDATE COLUMN ERROR", err);
    }
  },

  /* =====================================================
      UPDATE BOARD TITLE
  ====================================================== */
  updateBoardTitle: async (boardId, title) => {
    const previousBoard = get().board;
    
    try {
      // Optimistic update
      set((state) => ({
        board: { ...state.board, title },
      }));

      // Call API
      await axiosClient.put(`/boards/${boardId}`, { title });
      // Socket event "board:titleUpdated" will update all clients

    } catch (err) {
      console.error("UPDATE BOARD ERROR:", err);
      // Rollback on error
      set({
        board: previousBoard,
      });
    }
  },

  /* =====================================================
      UPDATE CARD 
  ====================================================== */
  updateCard: async (cardId, data) => {
    try {
      // Không optimistic update - chờ socket event để tất cả users đồng bộ
      await axiosClient.put(`/cards/${cardId}`, data);
      // Socket event "card:updated" sẽ tự động update state cho tất cả users
    } catch (err) {
      console.error("UPDATE CARD ERROR:", err);
      throw err;
    }
  },

  /* =====================================================
      CREATE CARD 
  ====================================================== */
  createCard: async (columnId, title) => {
    try {
      await axiosClient.post("/cards", { columnId, title });
      // Socket event "card:created" sẽ tự động update state
    } catch (err) {
      console.error("CREATE CARD ERROR:", err);
    }
  },

}));
