# NetOS Monitor

**A Lab CSOC Endpoint Monitoring Dashboard**

NetOS Monitor is a web-based security operations dashboard designed to demonstrate endpoint monitoring, system resource tracking, process management, and security alert handling through a clean, interactive interface.

## Features

- **Dashboard:** Monitor CPU usage, memory utilization, endpoint health, and security alerts.
- **Endpoint Management:** View endpoint inventory and inspect machine details.
- **Process Monitoring:** Search, sort, filter, and paginate process records.
- **Simulated Process Termination:** Test process-response workflows and observe changes in resource statistics.
- **Security Alerts:** Filter alerts by severity and acknowledge or resolve them.
- **Reports:** Review resource snapshots, endpoint health, and export reports as CSV.
- **Blacklist Management:** Manage demo entries for process names, hashes, IP addresses, and domains.
- **Settings:** Configure monitoring thresholds, refresh intervals, and notification preferences.

## Tech Stack

- HTML5, CSS3, JavaScript
- Chart.js — resource monitoring charts
- AG Grid Community — interactive process tables
- Lucide Icons — interface icons
- JavaScript API endpoint — health status

## Project Structure

```text
netos-monitor/
├── public/
│   ├── index.html
│   ├── theme.css
│   └── app.js
└── api/
    └── health.js
```

## Getting Started

1. Clone or download this repository.
2. Open `public/index.html` in a browser, or deploy the project to a compatible static hosting platform.
3. Ensure internet access is available for the external charting, grid, and icon libraries.

## Important Note

**This is a demonstration project.** Endpoint information, resource readings, processes, and security events use simulated data. Process termination does not terminate real operating-system processes, and the dashboard is not connected to live endpoint agents.

Do not use it as a production security monitoring system without implementing authenticated backend services, real endpoint telemetry, authorization, audit logging, and secure process-control mechanisms.

## License

No license has been specified yet. Add a `LICENSE` file before distributing the project under an open-source license.
