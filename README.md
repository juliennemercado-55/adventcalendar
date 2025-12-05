# Advent Calendar 2025

A simple, customizable web advent calendar. It shows 24 doors, unlocking one per day in December. You can enable Preview mode to view any door ahead of time. Opened doors persist in your browser via localStorage.

## Features

- 25 doors with titles from per-user JSON
- Simple client-side login for 3 friends
- Locked until the calendar day (Dec 1–25), or unlocked in Preview
- Modal with content: title, text, optional image and link
- "Reset" clears opened door state (per user)
- Responsive grid; works offline once loaded

## Structure

- `index.html` — Main page, login UI, layout
- `assets/style.css` — Styles (calendar + login)
- `assets/script.js` — Calendar logic, login, per-user state

## Customize

Edit the per-user JSON files:

- `assets/days-julliana.json` - Julliana's 25 days
- `assets/days-russell.json` - Russell's 25 days
- `assets/days-zaira.json` - Zaira's 25 days

Each day entry supports:

```json
{
  "title": "My Title",
  "text": "Message for this day.",
  "image": "assets/images/my-image.jpg",
  "link": "https://example.com"
}
```

To add another user:

1. Create `assets/days-<username>.json` with 25 entries
2. Add passcode to `PASSCODES` in `assets/script.js`

```javascript
const PASSCODES = {
  julliana: "matchaJ",
  russell: "chaosR",
  zaira: "greenZ",
  newuser: "password123", // Add here
};
```

## Run locally

If you have VS Code, the easiest way is using a local server:

```sh
# Option 1: Python 3 built-in server
cd /Users/admin/adventcalendar
python3 -m http.server 8000
# Visit http://localhost:8000

# Option 2: Node (if installed)
cd /Users/admin/adventcalendar
npx serve -p 8000
# Visit http://localhost:8000
```

Alternatively, use the Live Server extension in VS Code.

## Notes

- Opened doors are stored in `localStorage` under `advent.opened.2025.<username>`.
- Preview mode only changes lock state; it doesn’t mark a door "opened" until you click it.
- You can safely host this as static files (e.g., GitHub Pages, Netlify).

### Login and Passcodes (client-side)

- This project uses client-side passcodes for convenience only; they are visible in source and not secure.
- Intended for personal/friendly sharing. For real authentication, use a backend or a hosted auth solution.
