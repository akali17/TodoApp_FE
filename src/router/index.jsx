import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login/Login";
import Boards from "../pages/Boards/Boards";
import BoardDetail from "../pages/BoardDetail/BoardDetail";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/boards", element: <Boards /> },
  { path: "/board/:id", element: <BoardDetail /> },
]);