# DigitalOcean Deployment Guide

> Pay-as-you-go cloud VM with fixed IP — ~$0.25 for 3 hours. No session expiry, no URL changes between boots.

---

## Step 1: Create Account & Droplet

1. Go to **digitalocean.com** → sign up (needs a card, ~$1 auth hold)
2. Click **Create** → **Droplets**
3. Configure:
   - **Region**: Frankfurt or Amsterdam (closer to Tunisia)
   - **OS**: Ubuntu 24.04 LTS
   - **Size**: Click **"General Purpose"** → pick **8 GB RAM / 2 vCPU** (~$0.071/hr)
   - **Authentication**: Password (set a root password)
4. Click **Create Droplet**
5. Wait ~30s — you'll get a **public IP** like `164.90.xxx.xxx` — **save this IP**

---

## Step 2: SSH Into the Droplet

From your Windows terminal or PowerShell:

```bash
ssh root@164.90.xxx.xxx
# enter the password you set
```

---

## Step 3: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
docker --version
```

---

## Step 4: Clone & Deploy

```bash
git clone https://github.com/HebhebJ/HumanCare.git
cd HumanCare

# Full stack fits in 8GB — start everything
docker compose up -d
```

Watch it come up (takes 5–8 min for Java services to build):

```bash
docker compose ps
docker compose logs -f hc-api-gateway
```

---

## Step 5: Update Frontend Config (One-Time, Permanent)

Your droplet IP is fixed forever. On your **local machine**, update `frontend/humancare-ui/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://164.90.xxx.xxx:8081',   // your droplet IP
  keycloak: {
    url: 'http://164.90.xxx.xxx:8090',    // your droplet IP
    realm: 'humancare',
    clientId: 'humancare-webapp'
  }
};
```

Then update `keycloak-service/realm-config/humancare-realm.json` — find the `humancare-webapp` client and add your Vercel URL:

```json
"redirectUris": [
  "http://localhost:4200/*",
  "http://127.0.0.1:4200/*",
  "https://YOUR-APP.vercel.app/*"
],
"webOrigins": [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "https://YOUR-APP.vercel.app"
],
```

Also update the `post.logout.redirect.uris` attribute in the same client block:

```json
"post.logout.redirect.uris": "http://localhost:4200/*##http://127.0.0.1:4200/*##https://YOUR-APP.vercel.app/*"
```

Commit and push both files:

```bash
git add frontend/humancare-ui/src/environments/environment.prod.ts
git add keycloak-service/realm-config/humancare-realm.json
git commit -m "chore: set prod URLs to DigitalOcean droplet"
git push
```

---

## Step 6: Deploy Frontend to Vercel

1. Go to **vercel.com** → **Add New Project** → import `HebhebJ/HumanCare`
2. Configure the project:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend/humancare-ui` |
| **Framework Preset** | Angular |
| **Build Command** | `npm run build -- --configuration production` |
| **Output Directory** | `dist/humancare-ui/browser` |

3. Click **Deploy** → get your Vercel URL (e.g. `https://humancare-abc.vercel.app`)
4. Go back and replace `YOUR-APP.vercel.app` in the two files above with the real URL, then push again.

---

## Step 7: Verify Backend Health

```bash
curl http://164.90.xxx.xxx:8081/actuator/health
curl http://164.90.xxx.xxx:8761/actuator/health
```

---

## Demo URLs for Teacher

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | `https://humancare-abc.vercel.app` | — |
| Swagger UI | `http://164.90.xxx.xxx:8081/swagger-ui.html` | — |
| Eureka | `http://164.90.xxx.xxx:8761` | — |
| Keycloak Admin | `http://164.90.xxx.xxx:8090/admin` | `admin` / `admin` |
| Prometheus | `http://164.90.xxx.xxx:9090` | — |
| Grafana | `http://164.90.xxx.xxx:3000` | `admin` / `admin` |

---

## Step 8: Destroy Droplet When Done

After the demo, go to DigitalOcean → your droplet → **Destroy Droplet**.
Total cost for 3 hours: **~$0.25**.

---

## Key Differences vs KillerCoda

| | KillerCoda | DigitalOcean |
|--|--|--|
| RAM | ~4 GB (not enough) | 8 GB (fits full stack) |
| URL | Changes every session | Fixed IP forever |
| Session limit | ~1 hour | None |
| Port access | Click "Open Port" in UI | `http://IP:PORT` works immediately |
| Cost | Free | ~$0.25 for 3 hours |
| Vercel redeploy needed each session? | Yes | No — update once, done |
