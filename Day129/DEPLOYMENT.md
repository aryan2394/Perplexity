# Render Deployment Guide (Single-URL Full-Stack App)

Since your GitHub repository `shrijiPerplexicity` has multiple folders (`Day120`, `Day121`, ..., `Day129`), we need to tell Render to deploy specifically from the **`Day129`** folder. 

Follow these steps exactly to deploy your app on Render.

---

## 🛠️ Step 1: Create a New Web Service on Render
1. Go to your **Render Dashboard** ([dashboard.render.com](https://dashboard.render.com/)).
2. Click the **"New +"** button (top right) and select **"Web Service"**.
3. Connect your GitHub account and select your repository: **`aryan2394/shrijiPerplexicity`**.

---

## ⚙️ Step 2: Configure Deployment Settings (Crucial Settings)
Configure the following settings in the creation form:

| Setting | Value | Why |
| :--- | :--- | :--- |
| **Name** | `shriji-perplexity` *(or any name you like)* | The name of your website |
| **Region** | Select the closest to you *(e.g., Singapore)* | Faster performance |
| **Branch** | `main` | The branch where your recent code is |
| **Root Directory** | `Day129` ⚠️ **(VERY IMPORTANT)** | **Do not leave empty!** This tells Render that our code is inside the `Day129` subfolder, not the repo root. |
| **Runtime** | `Node` | Backend runs on Node.js |
| **Build Command** | `npm run build` | Installs both frontend & backend packages, and compiles the frontend into the backend |
| **Start Command** | `npm start` | Launches our unified Backend server |

---

## 🔑 Step 3: Configure Environment Variables
Scroll down to the **Advanced** section or click **Environment** in the left menu, and add the following variables (you can copy values from your `Backend/.env` file):

> [!IMPORTANT]
> Render needs all of these environment variables to connect to MongoDB, send verification emails, and generate AI responses.

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port where the server runs |
| `CLIENT_URL` | `https://shriji-perplexity.onrender.com` | **Replace this** with your actual Render site URL (Render will show this URL on the top left of the dashboard once the service starts building). |
| `MONGO_URI` | `mongodb+srv://shriji:sy1cWg2niv5B2Rfd@cluster0.2bbrpf6.mongodb.net/perplexicity` | MongoDB Database Connection URL |
| `JWT_SECRET` | `7238d7e69bf12a17bf6cff0fbad3fd8b` | JWT Secret Key for Session Authentication |
| `GEMINI_API_KEY` | `AIzaSyDSkm2M6Gz9V0fOapJglRMikye_biHBWdE` | Google Gemini AI Key |
| `MISTRAL_API_KEY` | `GgwtfPUEohTJHIr4qEfW6f9NePtL1fzz` | Mistral AI API Key |
| `TAVILY_API_KEY` | `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` | Tavily Search Key for AI Web Search |
| `GOOGLE_USER` | `kumaranmol123123@gmail.com` | Gmail for sending verification emails |
| `GOOGLE_PASSWORD` | `yhtlucxaujtkgyrh` | Google App Password |
| `REDIS_HOST` | `rational-chimp-126968.upstash.io` | Upstash Redis Hostname |
| `REDIS_PORT` | `6379` | Upstash Redis Port |
| `REDIS_PASSWORD` | `gQAAAAAAAe_4AAIgcDFjZGVmNmU5MTMxZTQ0ODQ0YmFiNzA5ZDJmODgxYTMyNA` | Upstash Redis Password |

---

## 🚀 Step 4: Deploy & Verify
1. Click **"Create Web Service"** at the bottom of the page.
2. Render will start the build log:
   - It will install all dependencies.
   - It will compile the Frontend React app.
   - It will start the server: `Server running on port 3000`.
3. Once the build status turns green (**"Live"**), click the link at the top (e.g., `https://shriji-perplexity.onrender.com`).
4. **Boom!** Your site is now live on the internet under a single URL! Both API, Web Sockets, and Frontend will work perfectly together.
