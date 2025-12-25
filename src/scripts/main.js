window.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector("ad-navbar");
  if (!navbar) return;

  navbar.addEventListener("navigate", (e) => {
    const { section, action } = e.detail;

    // esempi:
    // if (section === "dashboard" && action === "riskoverview") openRiskOverview();
    // if (section === "contracts" && action === "newcontract") openNewContractModal();
  });
});
