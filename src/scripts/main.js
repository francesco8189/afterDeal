import { router } from "./utils/router.js";

window.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector("ad-navbar");
  if (!navbar) return;

  // =========================================================
  // REGISTRAZIONE ROUTES
  // =========================================================

  // Dashboard routes
  router.register("dashboard", "riskoverview", () => {
    console.log("Opening Risk Overview...");
    // TODO: Implementare apertura vista risk overview
  });

  router.register("dashboard", "upcomingdeadlines", () => {
    console.log("Opening Upcoming Deadlines...");
    // TODO: Implementare apertura vista upcoming deadlines
  });

  router.register("dashboard", "keymetrics", () => {
    console.log("Opening Key Metrics...");
    // TODO: Implementare apertura vista key metrics
  });

  router.register("dashboard", "latestactivity", () => {
    console.log("Opening Latest Activity...");
    // TODO: Implementare apertura vista latest activity
  });

  // Contracts routes
  router.register("contracts", "allcontracts", () => {
    console.log("Opening All Contracts...");
    // TODO: Implementare apertura vista all contracts
  });

  router.register("contracts", "newcontract", () => {
    console.log("Opening New Contract Modal...");
    // TODO: Implementare apertura modal nuovo contratto
  });

  router.register("contracts", "renewals", () => {
    console.log("Opening Renewals...");
    // TODO: Implementare apertura vista renewals
  });

  router.register("contracts", "slapenalties", () => {
    console.log("Opening SLAs & Penalties...");
    // TODO: Implementare apertura vista SLAs & penalties
  });

  router.register("contracts", "attachments", () => {
    console.log("Opening Attachments...");
    // TODO: Implementare apertura vista attachments
  });

  // Deadlines routes
  router.register("deadlines", "calendar", () => {
    console.log("Opening Calendar...");
    // TODO: Implementare apertura calendario
  });

  router.register("deadlines", "bypriority", () => {
    console.log("Opening Deadlines by Priority...");
    // TODO: Implementare apertura vista by priority
  });

  router.register("deadlines", "byclient", () => {
    console.log("Opening Deadlines by Client...");
    // TODO: Implementare apertura vista by client
  });

  router.register("deadlines", "reminders", () => {
    console.log("Opening Reminders...");
    // TODO: Implementare apertura vista reminders
  });

  router.register("deadlines", "escalations", () => {
    console.log("Opening Escalations...");
    // TODO: Implementare apertura vista escalations
  });

  // Risks routes
  router.register("risks", "riskregister", () => {
    console.log("Opening Risk Register...");
    // TODO: Implementare apertura risk register
  });

  router.register("risks", "assessments", () => {
    console.log("Opening Assessments...");
    // TODO: Implementare apertura vista assessments
  });

  router.register("risks", "mitigationactions", () => {
    console.log("Opening Mitigation Actions...");
    // TODO: Implementare apertura vista mitigation actions
  });

  router.register("risks", "criticalalerts", () => {
    console.log("Opening Critical Alerts...");
    // TODO: Implementare apertura vista critical alerts
  });

  router.register("risks", "trends", () => {
    console.log("Opening Trends...");
    // TODO: Implementare apertura vista trends
  });

  // Tasks routes
  router.register("tasks", "mytasks", () => {
    console.log("Opening My Tasks...");
    // TODO: Implementare apertura vista my tasks
  });

  router.register("tasks", "teamtasks", () => {
    console.log("Opening Team Tasks...");
    // TODO: Implementare apertura vista team tasks
  });

  router.register("tasks", "checklists", () => {
    console.log("Opening Checklists...");
    // TODO: Implementare apertura vista checklists
  });

  router.register("tasks", "templates", () => {
    console.log("Opening Templates...");
    // TODO: Implementare apertura vista templates
  });

  router.register("tasks", "completed", () => {
    console.log("Opening Completed Tasks...");
    // TODO: Implementare apertura vista completed tasks
  });

  // =========================================================
  // NAVIGATION LISTENER
  // =========================================================

  navbar.addEventListener("navigate", (e) => {
    const { section, action } = e.detail;
    router.navigate(section, action);
  });
});
