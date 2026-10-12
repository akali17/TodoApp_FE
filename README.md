# WWW — Real-time Collaborative Task Board

A multi-user task management app (Trello-style) where board changes sync to every member in real time.

**Live demo:** https://wwwproject-xi.vercel.app
**Backend repo:** https://github.com/akali17/TodoApp_BE

## Demo account

| Email | Password |
| --- | --- |
| demo@test.com | 123456 |

> The backend runs on Render's free tier. The first request after a period of inactivity can take ~50 seconds while the server wakes up.

## Features

- Create boards, columns and cards; drag and drop cards between columns
- Real-time collaboration with Socket.IO: changes and online members appear instantly for everyone on the board
- Invite members to a board by email
- Calendar view of card deadlines, activity log and statistics page
- Sign up / sign in with email + password or Google OAuth
- Email verification and password reset

## Tech stack

**Frontend:** React 19, Vite, React Router, Zustand, Tailwind CSS, @dnd-kit, Socket.IO client, Axios
**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, Google OAuth, bcrypt, node-cron, Brevo (email)
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Run locally

```bash
git clone https://github.com/akali17/TodoApp_FE.git
cd TodoApp_FE
npm install
npm run dev
```

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Then start the backend (see the backend repo) and open http://localhost:5173.

## Author

Hoàng Gia Bảo — [github.com/akali17](https://github.com/akali17)
