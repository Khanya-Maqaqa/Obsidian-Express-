# Obsidian Express

A website for **Obsidian Express**, a fast-fine-dining South African restaurant in Braamfontein, Johannesburg.
WEDE5020 POE - Part 3: Enhancing Functionality and SEO.

**Live site:** _add your Netlify / GitHub Pages URL here_ (then update the URL in `sitemap.xml`, `robots.txt` and the `<link rel="canonical">` / Open Graph tags - search for `obsidian-express.netlify.app`).

## Pages
| Page | Purpose |
|---|---|
| `home.html` (`index.html` copy) | Landing page, menu categories, lightbox gallery |
| `menu.html` | NEW - dynamic menu with search, category filter, sort and details modal |
| `plateKos.html`, `rsaClassics.html`, `rsaSandwiches.html`, `rsaExotics.html` | Category pages |
| `about.html` | Story, team, values tabs, FAQ accordion |
| `enquiry.html` | NEW - enquiry form that validates and returns cost / availability |
| `contact.html` | Contact details, Leaflet map, validated message form that compiles an email |

## Technologies
HTML5, CSS3, vanilla JavaScript (`js/main.js`), Leaflet + OpenStreetMap, JSON data (`data/menu.json`).

## Changelog

### Part 3 - Feedback corrections
- **Fixed stray character in `CSS/styles.css`** (a lone `c` between rules that broke the following declaration).
- **Fixed background image path** in `styles.css` (`images/...` -> `../images/...`) so the textured wallpaper loads from the CSS folder.
- **Removed duplicate `CSS/style` file** (an old copy of the stylesheet that `rsaSandwiches.html` pointed to); every page now links `CSS/styles.css`.
- **`rsaSandwiches.html`**: the file contained a second, duplicated HTML document and a stray `plateKos.html` text line; the duplicate was removed so the page is valid with one `<h1>`, one set of ids and the correct stylesheet.
- **Renamed `rsaSandwitches.html` -> `rsaSandwiches.html`** (spelling) and updated every link.
- **`rsaExotics.html`**: removed an incorrect line copied from Amagwinya ("Served with a variety of fillings...") from Pork Trotters; renamed heading "Chicken Gizzard" -> "Chicken Gizzards".
- **Navigation** extended with Menu and Enquiry on all pages; consistent footer with links and social links added to all pages.
- **About / Contact**: main heading changed from `<h2>` to `<h1>` so every page has one H1.
- **Accessibility**: skip-to-content link, `id="main"` on `<main>`, visible focus styles, reduced-motion support, aria attributes on interactive widgets.

### Part 3 - Functionality (JavaScript)
- **Accordions** - FAQ on `about.html` and `enquiry.html` (one open at a time, keyboard accessible).
- **Tabs** - "What We Stand For" on `about.html` (ARIA tabs with arrow-key support).
- **Modal** - dish detail dialog on `menu.html` (Esc / overlay click to close, focus returned).
- **Lightbox gallery** - gallery on `home.html`; dish photos on all category pages open larger with previous/next, arrow keys and Esc.
- **Interactive map** - the Google Maps iframe on `contact.html` was replaced with a Leaflet / OpenStreetMap map with a marker and popup for 50 Stiemens Street.
- **Animations / transitions** - scroll-reveal (IntersectionObserver + CSS), hero fade-up, back-to-top button, accordion/tab/modal transitions, button and card hover effects.
- **Advanced DOM manipulation** - menu cards, option lists, error messages, quote tables and email previews are all created and updated dynamically.
- **Dynamic content** - `menu.html` loads dishes from `data/menu.json` with `fetch()` (with `js/menu-data.js` as a fallback when opened from disk) and renders the cards with JavaScript.
- **Search / filter / sort** - live text search (name, description, ingredients, tags), category chips, sort by name or price, result counter and "no results" message.

### Part 3 - Forms and validation
- **`enquiry.html` (new)** - name, email, phone, enquiry type, dish, portions, date, notes. After validation it fetches the menu data asynchronously (no page reload) and shows a quote: unit price, bulk discount (5% for 10+, 10% for 50+), R150 catering delivery, estimated total, availability (braai plate Fri-Sun only, catering needs 48 hours' notice, 100+ portions must be catering) and a reference number. A dish can be pre-selected from the menu via `?item=`.
- **`contact.html`** - rebuilt form with name, email, optional phone, message type (`select`), subject and message. Valid input is compiled into an email (To / Subject / Body preview) and sent to `info@obsidianexpress.com` through a `mailto:` link. The form `action` is also a `mailto:` for non-JS fallback.
- **Validation** - HTML5 attributes (`required`, `type`, `min`, `max`, `minlength`, `maxlength`) plus JavaScript: regexes for names and South African phone numbers, email format, date range (not past, within 12 months), quantity 1-500, message length 20-1000, live character counters. Errors appear under each field, are announced with `aria-invalid` / `aria-describedby`, and focus moves to the first invalid field.
- Form styling (inputs, error state, result cards) added to `styles.css`.

### Part 3 - SEO
- **Keywords** - researched terms (South African fast food, kota, gatsby, braai, Braamfontein, Johannesburg, catering) used naturally in headings, copy, alt text and meta keywords.
- **Title tags and meta descriptions** - unique for every page.
- **Heading structure** - one `<h1>` per page, then `<h2>` / `<h3>` in order.
- **Image optimisation** - all images renamed to descriptive kebab-case (e.g. `seven-colours-plate.jpg`), resized to max 1000px and recompressed (images folder 6.5 MB -> 2.3 MB), descriptive alt text, `loading="lazy"`, width/height on dynamic images.
- **URL structure** - clean lowercase file names with no spaces; canonical URL on every page.
- **Internal linking** - category pages link to the full menu and enquiry page; home, about and menu cross-link in the body copy.
- **Mobile friendliness** - viewport meta, responsive layouts for forms, menu grid, gallery, modal and lightbox.
- **Off-page** - Open Graph and Twitter card tags for sharing; Facebook / Instagram links in the footer and contact page; `Restaurant` JSON-LD (address, hours, cuisine, `sameAs`) on the home page for local SEO.
- **`robots.txt`** and **`sitemap.xml`** created.
- **Page speed** - compressed images, `defer` on scripts, lazy loading, cache headers in `_headers`, no JavaScript framework.
- **Security** - `_headers` file (Netlify) with Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy and Permissions-Policy; `rel="noopener noreferrer"` on external links; user text is escaped before being inserted into the DOM; Subresource Integrity on Leaflet.

## Notes
- Menu prices in `data/menu.json` are placeholder values for the assignment; keep `js/menu-data.js` in sync if you edit them.
- To deploy on Netlify: drag the project folder onto Netlify Drop (or connect the repo). GitHub Pages also works (`index.html` is included).
