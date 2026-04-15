# 🚀 KillerCoda Cloud Deployment Guide

> Quick cloud deployment for teacher validation. KillerCoda provides a free Ubuntu VM with browser-based access.

---

## Step 1: Open KillerCoda

1. Go to **https://killercoda.com**
2. Sign in (GitHub/Google account — free)
3. Click **"Playground"** → **"Ubuntu"**
4. Wait ~30 seconds for the VM to boot

---

## Step 2: Install Docker & Docker Compose

Paste these commands into the KillerCoda terminal:

```bash
# Update packages
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify
sudo docker --version
sudo docker-compose --version
```

---

## Step 3: Clone & Deploy HumanCare

```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/HumanCare.git
cd HumanCare

# Start the full stack
sudo docker-compose up -d
```

> ⚠️ **First startup takes 3–5 minutes** because Java services need to build/download Maven dependencies.

---

## Step 4: Verify Services

Run this health-check script:

```bash
echo "=== Eureka ==="
curl -s http://localhost:8761/actuator/health
echo ""

echo "=== Config Server ==="
curl -s http://localhost:8888/actuator/health
echo ""

echo "=== Gateway + Swagger ==="
curl -s http://localhost:8081/actuator/health
echo ""

echo "=== Keycloak ==="
curl -s http://localhost:8090/health || echo "Keycloak starting..."

echo "=== Prometheus ==="
curl -s http://localhost:9090/-/healthy || echo "Prometheus starting..."

echo "=== Grafana ==="
curl -s http://localhost:3000/api/health || echo "Grafana starting..."
```

---

## Step 5: Access URLs in KillerCoda

KillerCoda auto-exposes ports via the **"Traffic / Ports"** tab (top-right of the terminal).

Click the **+** icon next to "Traffic" and add these ports:
- `8081` → Gateway / Swagger UI
- `8090` → Keycloak Admin
- `8761` → Eureka Dashboard
- `9090` → Prometheus
- `3000` → Grafana

Then click each port to open it in a browser tab inside KillerCoda.

### Direct Links (once ports are exposed)

| Service | URL | What to Show |
|---------|-----|--------------|
| Swagger UI | `http://localhost:8081/swagger-ui.html` | Centralized API docs with Gateway + 4 services |
| Eureka | `http://localhost:8761` | All registered services (green UP) |
| Keycloak | `http://localhost:8090/admin` | `admin` / `admin` → humancare realm |
| Prometheus | `http://localhost:9090` | Targets page showing `api-gateway`, `appointments-service`, etc. |
| Grafana | `http://localhost:3000` | `admin` / `admin` → Explore → Prometheus datasource |

---

## Step 6: Teacher Demo Script (2 mins)

```text
1. "We use Docker Compose for full-stack orchestration."
   → Show: docker-compose ps

2. "All services register with Eureka."
   → Show: http://localhost:8761

3. "Swagger is centralized at the API Gateway."
   → Show: http://localhost:8081/swagger-ui.html
   → Click through Gateway, Appointments, Medication tabs.

4. "We added Prometheus + Grafana for monitoring."
   → Show: http://localhost:9090/targets
   → Show: http://localhost:3000 (log in, click Explore, pick metric)

5. "Everything is deployed in the cloud on KillerCoda."
   → Point to the KillerCoda browser tab.
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker-compose` not found | Use `docker compose` (space, no hyphen) instead |
| Port not accessible | Click the **Traffic** tab → **Open Port** → enter port number |
| Java service fails to start | Run `sudo docker-compose logs -f hc-api-gateway` to check errors |
| Build too slow | In KillerCoda, run `sudo docker-compose build --parallel` before `up -d` |
| Out of memory | KillerCoda free tier has limited RAM. Start only infrastructure + 3 business services: `sudo docker-compose up -d hc-eureka-server hc-config-server hc-rabbitmq hc-postgres-keycloak hc-keycloak hc-api-gateway hc-appointments-service hc-medication-service hc-notification-service` |

---

## One-Command Copy-Paste

For quick teacher validation, use this single block:

```bash
cd HumanCare && sudo docker-compose up -d && sleep 120 && echo "Ready!" && curl -s http://localhost:8081/actuator/health && echo "" && curl -s http://localhost:8761/actuator/health
```
