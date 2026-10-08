# CAR SCOUT 3.0
Phone browser → camera → on-device ML → tracker → scene model → HUD. No backend, no GPS, no uploads.
Setup (Node 18+): `npm run fetch` (downloads MediaPipe + EfficientDet-Lite0 into vendor/), `npm run check`, `npm test`, `npm run audit`, `npm run verify`, `npm run dev`.
Camera needs HTTPS or localhost: deploy to any static HTTPS host (GitHub Pages/Netlify) and open on the phone.
Image-space estimates only. Not a safety system.
