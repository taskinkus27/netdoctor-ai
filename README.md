# 🩺 NetDoctor: Network Diagnostic & ISP Dispute Engine

**NetDoctor** is a hybrid Python & Web diagnostic engine designed to isolate internet connectivity issues down to their root cause—whether it's weak Wi-Fi, gateway bufferbloat, faulty DNS servers, or ISP-side backbone packet loss.

It features a dependency-free single-file Python engine (`netdoctor.py`) for local CLI/GUI/Daemon execution and a Web dashboard integrated with **Google Gemini AI** to generate official, BTK-compliant legal evidence dossiers (SLA Dispute Dossiers) for ISP claims.

---

## ✨ Features

### 1. 🔍 Layered Root Cause Isolator
* **Wi-Fi & Network Card:** RSSI (dBm) signal strength, 2.4 GHz vs. 5 GHz band detection, channel overlap checks, and local air packet loss.
* **Modem / Gateway (e.g., `192.168.1.1`):** Local latency benchmarks (nominal 1–2 ms vs. >15 ms congestion checks).
* **DNS Benchmarking:** Millisecond-level resolution testing against Cloudflare (`1.1.1.1`), Google (`8.8.8.8`), Quad9 (`9.9.9.9`), OpenDNS, and local ISP resolvers.
* **ISP Backbone & Peering:** Measures packet loss and jitter across OLT/DSLAM cabinets, CGNAT nodes, backbone routers, and international transit links.

### 2. ⚡ Automated Diagnostic Verdicts
* **Weak Wi-Fi / Interference:** Recommends channel locking or switching to 5 GHz.
* **Gateway Unresponsiveness:** Confirms local modem lockup and suggests power cycles or IP release/renew actions.
* **DNS Resolution Failure (SERVFAIL):** Guides redirection to the lowest-latency public DNS.
* **ISP Backbone Packet Loss:** Proves 0% local modem loss alongside >40% external drop rates to isolate fault to the service provider.

### 3. 📄 Official ISP Dispute Dossier (SLA Compliance)
* **Causality Proof:** Documented proof showing zero local network fault vs. outer line degradation.
* **Official Document Format:** Formatted according to RFC 2544 standards, subscriber info, and ready for consumer arbitration (BTK / Tüketici Hakem Heyeti).
* **Export Options:** Print-friendly PDF export and time-stamped JSON/CSV log export for customer support ticketing.

### 4. 📈 Continuous Live Monitor
* Background monitoring with periodic ping sweeps (every 3–5 seconds).
* Real-time SVG sparkline latency/jitter visualization.
* Web Audio API sound alarm alerts upon connection drops.

### 5. 🐍 Zero-Dependency Python Agent (`netdoctor.py`)
* Built purely with Python 3 standard libraries (`socket`, `subprocess`, `platform`, `tkinter`). No `pip install` required.
* **CLI Mode:** `python netdoctor.py`
* **GUI Mode:** `python netdoctor.py --gui`
* **Daemon Mode:** `python netdoctor.py --daemon` (logs silently to `netdoctor_evidence.json`).
* **Web Importer:** Upload `netdoctor_evidence.json` directly to the web dashboard for AI analysis.

---

## 🚀 Quick Start

### Prerequisites
* **Python 3.10+** (for local agent)
* **Node.js 18+** (for web dashboard)
* **Google Gemini API Key** ([Get your API Key from Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/netdoctor-ai.git](https://github.com/YOUR_USERNAME/netdoctor-ai.git)
   cd netdoctor-ai
