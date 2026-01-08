# SEO Images Setup Instructions

## Required Images for Full SEO Support

### 1. Open Graph Image (for social sharing)
**File:** `public/og-image.png`
- **Size:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **Content:** Your app logo/screenshot with text "Spaces - Virtual Metaverse Platform"
- **Tool:** Use Canva, Figma, or https://www.opengraph.xyz/

### 2. Favicon Files
Generate from: https://realfavicongenerator.net/

Required files in `public/` folder:
- `favicon.ico` (16x16, 32x32, 48x48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

### Quick Steps:
1. Visit https://realfavicongenerator.net/
2. Upload your `rec.png` logo
3. Download the generated package
4. Extract all files to `apps/frontend/public/`
5. Done!

### For OG Image:
1. Visit https://www.canva.com/
2. Search for "Open Graph Image" template (1200x630)
3. Add your logo and text "Spaces - Virtual Metaverse Platform"
4. Export as PNG
5. Save as `apps/frontend/public/og-image.png`

## Test Your SEO
After deployment, test at:
- https://cards-dev.twitter.com/validator (Twitter)
- https://developers.facebook.com/tools/debug/ (Facebook)
- https://www.opengraph.xyz/ (General preview)
