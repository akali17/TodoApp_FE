# WWW: real-time task board

Live: https://wwwproject-xi.vercel.app (demo@test.com / 123456)

**What it does:** teams share boards of columns and cards; every change (moves, edits, members joining or leaving) syncs instantly to everyone.

**Why I built it:** I wanted to learn how real-time sync works on the web and practice deploying a full stack app to Render and Vercel. It taught me both, and small teams can use it as a free shared board.

**My decisions and tradeoffs:**
- Socket.IO with one room per board instead of polling: instant updates, but I had to handle permissions and stale state on sockets.
- MongoDB: nested board data fits documents; I gave up strict relational integrity.
- Email: Gmail SMTP timed out on Render's free tier. I tried Resend, then switched to Brevo's HTTP API and made sending non-blocking with a 5s timeout so signup never hangs.
- Free hosting (Vercel + Render): $0, but the API cold-starts (~50s), so I added an uptime ping.