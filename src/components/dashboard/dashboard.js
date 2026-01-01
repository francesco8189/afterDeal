import { formatCurrency } from "../../utils/formatters.js";
import { dataService } from "../../services/DataService.js";

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
      // Usa DataService centralizzato (con caching automatico)
      const data = await dataService.getDashboardData();

      // KPI - usa formatCurrency per formattazione consistente
      this.kpiCards.contracts.textContent = data.kpi.contracts;
      this.kpiCards.deadlines.textContent = data.kpi.deadlines;
      this.kpiCards.penalties.textContent = formatCurrency(data.kpi.penalties);
      this.kpiCards.avoided.textContent = formatCurrency(data.kpi.avoided);

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
}

customElements.define("ad-dashboard", AdDashboard);
