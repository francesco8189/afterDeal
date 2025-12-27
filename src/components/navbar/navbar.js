const { window: tauriWindow } = window.__TAURI__;
const appWindow = tauriWindow.getCurrentWindow();

export class AdNavbar extends HTMLElement {
  async connectedCallback() {
    const root = this.attachShadow({ mode: "open" });

    const [html, css] = await Promise.all([
      fetch(new URL("./navbar.html", import.meta.url)).then((r) => r.text()),
      fetch(new URL("./navbar.css", import.meta.url)).then((r) => r.text()),
    ]);

    root.innerHTML = `<style>${css}</style>${html}`;

    // -------------------------
    // Refs
    // -------------------------
    const btnMax = root.querySelector('button[data-action="max"]');
    const dragArea = root.querySelector(".navbar.ad-drag");
    const gradientBar = root.querySelector(".gradient-bar");

    // Overlay (fuori dallo shadow)
    const dimEl = document.getElementById("app-dim");
    const setDim = (on) => dimEl?.classList.toggle("is-on", !!on);

    // -------------------------
    // Gradient segments (15)
    // -------------------------
    if (gradientBar && !gradientBar.querySelector("span")) {
      const colors = [
        "#2ecc71", "#52ce6d", "#69cf6d", "#7ccf72", "#8ccf7a",
        "#9acf84", "#a6ce90", "#afcc9d", "#b6caaa", "#b9c6b7",
        "#adc0c2", "#96b3be", "#7ba2b8", "#5d8eb1", "#415a77",
      ];

      gradientBar.replaceChildren(
        ...colors.map((c) => {
          const s = document.createElement("span");
          s.style.background = c;
          return s;
        })
      );
    }

    // -------------------------
    // Max/Restore icon sync
    // -------------------------
    const setMaxIcon = (isMax) => {
      if (!btnMax) return;
      btnMax.dataset.state = isMax ? "restore" : "max";
      btnMax.title = isMax ? "Restore" : "Maximize";
      btnMax.setAttribute("aria-label", btnMax.title);
    };

    const syncMaxIcon = async () => {
      try {
        setMaxIcon(await appWindow.isMaximized());
      } catch (e) {
        console.warn("syncMaxIcon:", e);
      }
    };

    await syncMaxIcon();

    // -------------------------
    // Window controls
    // -------------------------
    root.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const a = btn.dataset.action;
      if (a === "min") return appWindow.minimize();
      if (a === "close") return appWindow.close();

      if (a === "max") {
        await appWindow.toggleMaximize();
        return syncMaxIcon();
      }
    });

    // =========================================================
    // MENUS: click-to-activate + hover-switch while active
    // close on outside click + ESC + pointer move outside => back to click
    // + overlay scuro su app-container quando attivo
    // =========================================================

    const toggles = Array.from(root.querySelectorAll("[data-add-toggle]"));
    const menus = Array.from(
      new Set(toggles.map((t) => t.closest(".nav-menu")).filter(Boolean))
    );

    let menuMode = false;
    let openMenuEl = null;
    let closeTimer = null;

    const clearCloseTimer = () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const closeAllMenus = () => {
      menus.forEach((m) => {
        const dd = m.querySelector(".add-dropdown");
        const tg = m.querySelector("[data-add-toggle]");
        if (dd) dd.hidden = true;
        if (tg) tg.setAttribute("aria-expanded", "false");
      });
      openMenuEl = null;
    };

    const deactivateMenuMode = () => {
      clearCloseTimer();
      closeAllMenus();
      menuMode = false;
      setDim(false);
    };

    const openMenu = (menuEl) => {
      if (!menuEl) return;

      // chiudi gli altri (switch)
      menus.forEach((m) => {
        if (m !== menuEl) {
          const dd = m.querySelector(".add-dropdown");
          const tg = m.querySelector("[data-add-toggle]");
          if (dd) dd.hidden = true;
          if (tg) tg.setAttribute("aria-expanded", "false");
        }
      });

      const dd = menuEl.querySelector(".add-dropdown");
      const tg = menuEl.querySelector("[data-add-toggle]");
      if (!dd || !tg) return;

      dd.hidden = false;
      tg.setAttribute("aria-expanded", "true");
      openMenuEl = menuEl;

      setDim(true);
    };

    const scheduleDeactivate = () => {
      clearCloseTimer();
      closeTimer = setTimeout(() => {
        if (menuMode) deactivateMenuMode();
      }, 160);
    };

    menus.forEach((menuEl) => {
      const toggle = menuEl.querySelector("[data-add-toggle]");
      const dd = menuEl.querySelector(".add-dropdown");

      toggle?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearCloseTimer();

        // se clicchi lo stesso menu già aperto => chiude e torna click-only
        if (openMenuEl === menuEl) return deactivateMenuMode();

        menuMode = true;
        openMenu(menuEl);
      });

      // hover switch solo quando menuMode è attivo
      menuEl.addEventListener("mouseenter", () => {
        if (!menuMode) return;
        clearCloseTimer();
        if (openMenuEl !== menuEl) openMenu(menuEl);
      });

      // click su item -> dispatch evento + chiudi
      dd?.addEventListener("click", (e) => {
        const item = e.target.closest("[data-add]");
        if (!item) return;

        const action = item.dataset.add;
        const section =
          toggle?.getAttribute("data-add-toggle") ||
          dd.getAttribute("data-nav-menu") ||
          "menu";

        deactivateMenuMode();

        this.dispatchEvent(
          new CustomEvent("navigate", {
            detail: { section, action },
            bubbles: true,
          })
        );
      });
    });

    // Click fuori (overlay incluso, perché è fuori dal componente)
    this._onDocPointerDown = (e) => {
      const path = e.composedPath?.() || [];
      if (path.includes(this)) return; // click dentro navbar
      if (!menuMode && !openMenuEl) return;
      deactivateMenuMode();
    };
    document.addEventListener("pointerdown", this._onDocPointerDown, true);

    // ESC chiude
    this._onDocKeyDown = (e) => {
      if (e.key === "Escape" && (menuMode || openMenuEl)) deactivateMenuMode();
    };
    document.addEventListener("keydown", this._onDocKeyDown, true);

    // Disattiva menu-mode anche solo spostando il mouse fuori (senza click)
    this._onDocPointerMove = (e) => {
      if (!menuMode && !openMenuEl) return;

      const path = e.composedPath?.() || [];
      const insideNavbar = path.includes(this);

      if (insideNavbar) clearCloseTimer();
      else scheduleDeactivate();
    };
    document.addEventListener("pointermove", this._onDocPointerMove, true);

    // =========================================================
    // DRAG + DOUBLE CLICK
    // =========================================================
    const isNoDrag = (t) =>
      !!t.closest(".ad-no-drag, button, a, input, textarea, select, [role='button']");

    if (dragArea) {
      let dragTimer = null;

      const clearDragTimer = () => {
        if (dragTimer) {
          clearTimeout(dragTimer);
          dragTimer = null;
        }
      };

      dragArea.addEventListener("pointerdown", (e) => {
        if (!e.isPrimary || e.button !== 0) return;
        if (isNoDrag(e.target)) return;

        e.preventDefault();
        clearDragTimer();

        dragTimer = setTimeout(async () => {
          try {
            await appWindow.startDragging();
          } catch (err) {
            console.warn("startDragging:", err);
          } finally {
            dragTimer = null;
          }
        }, 180);
      });

      dragArea.addEventListener("dblclick", async (e) => {
        if (isNoDrag(e.target)) return;
        clearDragTimer();
        await appWindow.toggleMaximize();
        await syncMaxIcon();
      });

      dragArea.addEventListener("pointerup", clearDragTimer);
      dragArea.addEventListener("pointercancel", clearDragTimer);
    }
  }

  disconnectedCallback() {
    // spegni overlay se rimasto acceso
    document.getElementById("app-dim")?.classList.remove("is-on");

    if (this._onDocPointerDown) {
      document.removeEventListener("pointerdown", this._onDocPointerDown, true);
      this._onDocPointerDown = null;
    }
    if (this._onDocKeyDown) {
      document.removeEventListener("keydown", this._onDocKeyDown, true);
      this._onDocKeyDown = null;
    }
    if (this._onDocPointerMove) {
      document.removeEventListener("pointermove", this._onDocPointerMove, true);
      this._onDocPointerMove = null;
    }
  }
}

customElements.define("ad-navbar", AdNavbar);
