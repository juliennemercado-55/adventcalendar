# Advent Calendar 2025

A simple, customizable web advent calendar. It shows 24 doors, unlocking one per day in December. You can enable Preview mode to view any door ahead of time. Opened doors persist in your browser via localStorage.

## Features

- 24 doors with titles from per-user JSON (e.g., `assets/days-alex.json`)
- Simple client-side login for 3 friends (Alex, Bella, Chen)
- Locked until the calendar day (Dec 1–24), or unlocked in Preview
- Modal with content: title, text, optional image and link
- "Reset" clears opened door state (per user)
- Responsive grid; works offline once loaded

## Structure

- `index.html` — Main page, login UI, layout
- `assets/style.css` — Styles (calendar + login)
- `assets/script.js` — Calendar logic, login, per-user state
- `assets/days.json` — Default content (used if not logged in)
- `assets/days-julliana.json`, `assets/days-russell.json`, `assets/days-zaira.json` — Tailored calendars
- `assets/days-alex.json`, `assets/days-bella.json`, `assets/days-chen.json` — Sample calendars

## Customize

Edit `assets/days.json` with up to 24 entries. Each entry supports:

```json
{
  "title": "My Title",
  "text": "Message for this day.",
  "image": "https://example.com/image.jpg",
  "link": "https://example.com"
}
```

You can omit `image` or `link`.

To make unique calendars for friends, edit the per-user files:

- `assets/days-alex.json`
- `assets/days-bella.json`
- `assets/days-chen.json`

If you add another friend, update the login `<select>` in `index.html`, create `assets/days-<name>.json`, and add a passcode in `PASSCODES` inside `assets/script.js`.

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
