# anmolsahu2k.github.io
My Personal Website

## Analytics Setup (GA4)

1. Create a GA4 Web Data Stream in Google Analytics.
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`).
3. Open `index.html` and update:
   - `window.WEBSITE_ANALYTICS.ga4MeasurementId`
4. Commit and deploy.

Notes:
- Tracking is SPA-aware and logs virtual pageviews for routes like `/#about`, `/#blog`, and `/#blog/<article-slug>`.
- If the ID is left as `G-XXXXXXXXXX`, analytics is disabled automatically.
