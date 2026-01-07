
  # Comp Grad Toolbox UI Design

  This is a code bundle for Comp Grad Toolbox UI Design. The original project is available at https://www.figma.com/design/qCntEWCmKezMm0lkcLys8O/Comp-Grad-Toolbox-UI-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Environment Variables

  ### Production (Vercel)

  When deploying to Vercel, set the following environment variable:

  - `VITE_API_BASE_URL`: The base URL of the backend API
    - **Required value**: `https://compgradtoolbox-production.up.railway.app`
    - **Important**: Must include the `https://` protocol prefix
    - If the protocol is missing, the app will auto-prefix with `https://`, but it's recommended to set it correctly
    - This ensures the frontend connects to the production backend instead of localhost

  To set this in Vercel:
  1. Go to your project settings
  2. Navigate to "Environment Variables"
  3. Add `VITE_API_BASE_URL` with value `https://compgradtoolbox-production.up.railway.app`

  ### Local Development

  For local development, you can omit `VITE_API_BASE_URL`. The application will:
  - Use relative API paths (e.g., `/api/login`)
  - Rely on the Vite dev server proxy configured in `vite.config.ts` to forward requests to `http://localhost:8000`

  This allows you to develop locally without setting environment variables, while production deployments use the configured backend URL.
  