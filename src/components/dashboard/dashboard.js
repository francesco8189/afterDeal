export class AdDashboard extends HTMLElement {
  async connectedCallback() {
    const root = this.attachShadow({ mode: "open" });

    const [html, css] = await Promise.all([
      fetch(new URL("./dashboard.html", import.meta.url)).then(r => r.text()),
      fetch(new URL("./dashboard.css", import.meta.url)).then(r => r.text()),
    ]);

    root.innerHTML = `<style>${css}</style>${html}`;

    // Riferimenti
    this.kpiCards = {
      contracts: root.querySelector('[data-kpi="contracts"] .kpi-value'),
      deadlines: root.querySelector('[data-kpi="deadlines"] .kpi-value'),
      penalties: root.querySelector('[data-kpi="penalties"] .kpi-value'),
      avoided: root.querySelector('[data-kpi="avoided"] .kpi-value'),
    };

    this.timelineBox = root.querySelector(".timeline-box");
    this.criticalList = root.querySelector(".critical-list");
    this.tasksList = root.querySelector(".tasks-list");

    // Caricamento dati iniziali
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      // Qui in futuro userai invoke("get_dashboard_data")
      const data = await this.fakeData();

      // KPI
      this.kpiCards.contracts.textContent = data.kpi.contracts;
      this.kpiCards.deadlines.textContent = data.kpi.deadlines;
      this.kpiCards.penalties.textContent = `€ ${data.kpi.penalties}`;
      this.kpiCards.avoided.textContent = `€ ${data.kpi.avoided}`;

      // Timeline
      this.timelineBox.innerHTML = data.timeline
        .map(t => `<div>${t.date} — ${t.label}</div>`)
        .join("");

      // Criticità
      this.criticalList.innerHTML = data.critical
        .map(c => `<li>${c}</li>`)
        .join("");

      // Tasks
      this.tasksList.innerHTML = data.tasks
        .map(t => `<li>${t}</li>`)
        .join("");

    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  }

  // Mock temporaneo
  async fakeData() {
    return {
      kpi: {
        contracts: 42,
        deadlines: 7,
        penalties: 12400,
        avoided: 8900,
      },
      timeline: [
        { date: "2025-01-12", label: "Contratto Alfa – Revisione" },
        { date: "2025-01-15", label: "Contratto Beta – Scadenza milestone" },
      ],
      critical: [
        "Contratto Gamma – scade tra 2 giorni",
        "Contratto Delta – milestone non assegnata",
      ],
      tasks: [
        "Mario – Revisione contratto Gamma",
        "Lucia – Aggiornamento SLA Delta",
                "Lucia – Aggiornamento SLA Delta",
                        "Mario – Revisione contratto Gamma",
        "Lucia – Aggiornamento SLA Delta",
                "Lucia – Aggiornamento SLA Delta",
                        "Mario – Revisione contratto Gamma",
        "Lucia – Aggiornamento SLA Delta",
                "Lucia – Aggiornamento SLA Delta",

      ],
    };
  }
}

customElements.define("ad-dashboard", AdDashboard);
