# Mobile App Starter

Clean React mobile-app starter. Duplicate this project when you begin a new app.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

This project was built with [Lovable](https://lovable.dev).

## Deploy on Vercel

Import the repository in Vercel. The build command is `npm run build`. Leave the output directory empty so Vercel uses the Nitro build in `.vercel/output`.

On Vercel the app is served at the domain root. Local dev and the Nginx demo stay on `/explola/`.

Optional environment variables, if you connect Supabase:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
