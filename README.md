# AIF Team Offsite 2026 — Web App

A simple, shareable web app for the Lake Tahoe offsite with three pages:
- **Itinerary** — full schedule with links
- **Rooms** — Airbnb room assignments
- **Cars** — van allocations both directions

## File Structure

```
aif-offsite/
├── index.html        ← main entry point (open this in a browser)
├── css/
│   └── styles.css    ← all styles
├── js/
│   └── app.js        ← tab navigation logic
└── README.md
```

## Viewing Locally

Just open `index.html` in any browser — no server needed.

## Deploying Online (choose one)

### Option A — GitHub Pages (free, easiest)
1. Create a new GitHub repo (can be private or public)
2. Upload all files keeping the folder structure
3. Go to Settings → Pages → Source: main branch / root
4. Your site will be live at `https://yourusername.github.io/repo-name`

### Option B — Netlify Drop (fastest, no account needed)
1. Go to https://app.netlify.com/drop
2. Drag and drop the entire `aif-offsite` folder
3. Get an instant shareable URL (e.g. `https://random-name.netlify.app`)
4. Optionally rename the URL in Netlify settings

### Option C — Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside the `aif-offsite` folder
3. Follow prompts — get a live URL in under a minute

### Option D — Google Drive / Dropbox (read-only sharing)
Upload the whole folder and share the `index.html` link — note that
some cloud drives don't render HTML directly, so Netlify Drop is recommended.

## Making Updates

- Edit content in `index.html`
- Edit styles in `css/styles.css`  
- Navigation logic is in `js/app.js`

URLs support deep-linking via hash:
- `index.html#itinerary`
- `index.html#rooms`
- `index.html#cars`
