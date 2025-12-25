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
    // MENUS: hover open + close on outside click + ESC
    // =========================================================
    const menus = Array.from(root.querySelectorAll(".nav-menu"));

    const closeAllMenus = () => {
      menus.forEach((m) => {
        const dd = m.querySelector(".add-dropdown");
        const tg = m.querySelector("[data-add-toggle]");
        if (dd) dd.hidden = true;
        if (tg) tg.setAttribute("aria-expanded", "false");
      });
    };

    const openMenu = (menuEl) => {
      // chiudi gli altri
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
    };

    const closeMenu = (menuEl) => {
      const dd = menuEl.querySelector(".add-dropdown");
      const tg = menuEl.querySelector("[data-add-toggle]");
      if (dd) dd.hidden = true;
      if (tg) tg.setAttribute("aria-expanded", "false");
    };

    // Hover behavior (con un piccolo delay per evitare flicker)
    menus.forEach((menuEl) => {
      let closeTimer = null;

      const clearCloseTimer = () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      };

      menuEl.addEventListener("mouseenter", () => {
        clearCloseTimer();
        openMenu(menuEl);
      });

      menuEl.addEventListener("mouseleave", () => {
        clearCloseTimer();
        closeTimer = setTimeout(() => closeMenu(menuEl), 140);
      });

      // (opzionale) click sul toggle: utile per touch/trackpad
      const toggle = menuEl.querySelector("[data-add-toggle]");
      toggle?.addEventListener("click", (e) => {
        e.stopPropagation();
        const dd = menuEl.querySelector(".add-dropdown");
        if (!dd) return;
        if (dd.hidden) openMenu(menuEl);
        else closeMenu(menuEl);
      });

      // Click su item -> dispatch evento
      const dd = menuEl.querySelector(".add-dropdown");
      dd?.addEventListener("click", (e) => {
        const item = e.target.closest("[data-add]");
        if (!item) return;

        const action = item.dataset.add;

        // section: se hai data-add-toggle="dashboard" ecc.
        const section =
          toggle?.getAttribute("data-add-toggle") ||
          dd.getAttribute("data-nav-menu") ||
          "menu";

        closeAllMenus();

        this.dispatchEvent(
          new CustomEvent("navigate", {
            detail: { section, action },
            bubbles: true,
          })
        );
      });
    });

    // Close on outside click (document-level, fuori dallo shadow)
    this._onDocPointerDown = (e) => {
      // composedPath include l'host e lo shadow content
      const path = e.composedPath?.() || [];
      if (path.includes(this)) return; // click dentro il componente
      closeAllMenus();
    };
    document.addEventListener("pointerdown", this._onDocPointerDown, true);

    // ESC chiude
    this._onDocKeyDown = (e) => {
      if (e.key === "Escape") closeAllMenus();
    };
    document.addEventListener("keydown", this._onDocKeyDown, true);

    // =========================================================
    // DRAG + DOUBLE CLICK (exclude .ad-no-drag + interactive)
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

        // delay per non rompere il doppio click
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
    }
  }

  disconnectedCallback() {
    if (this._onDocPointerDown) {
      document.removeEventListener("pointerdown", this._onDocPointerDown, true);
      this._onDocPointerDown = null;
    }
    if (this._onDocKeyDown) {
      document.removeEventListener("keydown", this._onDocKeyDown, true);
      this._onDocKeyDown = null;
    }
  }
}

customElements.define("ad-navbar", AdNavbar);
