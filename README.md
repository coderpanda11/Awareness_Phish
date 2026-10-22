# PHISHBREAK

PHISHBREAK is a self-contained phishing-awareness experience for authorized GoPhish simulations. It teaches the recipient what happened after GoPhish has recorded a simulated link click.

The page does not collect credentials, submit forms, add tracking, call APIs, store recipient data, or navigate away from the campaign URL.

## Files

```text
phishbreak/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── dist/
│   └── phishbreak.html
└── README.md
```

- `index.html`, `css/style.css`, and `js/app.js` are the readable development sources.
- `dist/phishbreak.html` is the production artifact. Its styles, scripts, and SVG graphics are fully inlined.

## Preview locally

Open `index.html` directly, or serve the project with any static file server. Python's standard library is sufficient:

```bash
cd phishbreak
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/`.

No package installation or build step is required.

## GoPhish integration

1. Sign in to the authorized GoPhish administrative interface.
2. Create or edit a landing page.
3. Open `dist/phishbreak.html` and copy its entire contents into the landing page HTML/source editor.
4. Keep credential capture and submitted-data capture disabled. PHISHBREAK has no form and does not need either option.
5. Save the landing page and select it in the intended campaign.
6. Send a test campaign to an approved test recipient before launching the authorized exercise.
7. Confirm the campaign link reaches PHISHBREAK and that GoPhish records the link click.

GoPhish remains the source of truth for campaign recipients and clicks. PHISHBREAK does not read, remove, overwrite, or transmit GoPhish query parameters. Its entire flow runs in place without a reload or redirect.

If your GoPhish version sanitizes pasted markup, use its source/HTML editing mode and verify that the inline `<style>` and `<script>` blocks remain present after saving.

## Safety and accessibility

- Fullscreen is optional and only requested from the visible button after a user gesture.
- Escape and normal browser or operating-system controls remain available.
- `Exit Simulation` is always visible and never attempts to close the browser tab.
- No audio autoplays.
- Reduced-motion preferences disable nonessential motion.
- Focus is moved to each new step, controls have visible focus indicators, and status changes are announced to assistive technology.
- The glass effect is only an SVG/CSS layer inside the webpage.
- Refreshing starts the briefing again; no state is persisted.

## Testing checklist

Use `dist/phishbreak.html` for release testing.

### Browsers and layouts

- [ ] Desktop Chrome: all four phases render and controls work.
- [ ] Desktop Firefox: all four phases render and controls work.
- [ ] Desktop Safari: all four phases render and controls work.
- [ ] Microsoft Edge: all four phases render and controls work.
- [ ] Mobile browser: content fits without horizontal scrolling.
- [ ] Narrow viewport (320 px): text and controls remain readable.
- [ ] Short desktop viewport: educational content remains reachable by scrolling.

### Interaction and accessibility

- [ ] Complete the experience using only Tab, Shift+Tab, Enter, and Space.
- [ ] Focus indicators are visible and focus moves to newly displayed content.
- [ ] Screen-reader status announcements identify each phase and lesson.
- [ ] With `prefers-reduced-motion: reduce`, no essential information depends on animation.
- [ ] No animation flashes repeatedly or at an unsafe frequency.
- [ ] The permanent exit control ends the simulation from every phase.

### Fullscreen and recovery

- [ ] Fullscreen starts only after selecting `Enter Fullscreen`.
- [ ] Denying fullscreen leaves the page usable and produces no console error.
- [ ] Pressing Escape exits fullscreen and updates the button label.
- [ ] `Exit Simulation` exits fullscreen when active and shows the neutral completion state.
- [ ] Refreshing during awareness safely restarts at the initial impact phase.

### GoPhish and offline operation

- [ ] Test with a representative GoPhish tracking query parameter in the URL.
- [ ] The query string is unchanged after every phase and button interaction.
- [ ] No phase causes a page load, redirect, or history entry.
- [ ] GoPhish records the campaign click before displaying the landing page.
- [ ] Browser developer tools show no outbound network requests from the page.
- [ ] The production HTML works with the network disconnected.
- [ ] The console contains no JavaScript errors.
- [ ] There are no forms, credential fields, analytics, external fonts, or CDN assets.

## Deployment note

Serve the GoPhish campaign and administrative interface according to your organization's approved security architecture. Use TLS for campaign links, restrict administrative access, and run the exercise only with documented authorization and scope.
