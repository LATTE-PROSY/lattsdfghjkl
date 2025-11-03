// Shared system script for Latte OS + Market
window.System = {
  getApps() {
    return JSON.parse(localStorage.getItem("latteApps") || "[]");
  },
  saveApps(apps) {
    localStorage.setItem("latteApps", JSON.stringify(apps));
  },
  addApp(app) {
    const apps = this.getApps();
    if (!apps.some(a => a.id === app.id)) {
      apps.push(app);
      this.saveApps(apps);
    }
  },
  removeApp(id) {
    const apps = this.getApps().filter(a => a.id !== id);
    this.saveApps(apps);
  },
};

// if we're on the desktop
if (document.getElementById("iconGrid")) {
  const iconGrid = document.getElementById("iconGrid");
  const contextMenu = document.getElementById("contextMenu");
  let targetApp = null;

  function renderApps() {
    iconGrid.innerHTML = "";
    System.getApps().forEach(app => {
      const div = document.createElement("div");
      div.className = "app-icon";
      div.dataset.id = app.id;
      div.innerHTML = `
        <div class="glyph"><i class="${app.icon}"></i></div>
        <div class="app-label">${app.title}</div>
      `;
      iconGrid.appendChild(div);

      div.addEventListener("dblclick", () => {
        window.open(app.url, "_blank");
      });

      div.addEventListener("contextmenu", e => {
        e.preventDefault();
        targetApp = app.id;
        contextMenu.style.display = "block";
        contextMenu.style.left = e.pageX + "px";
        contextMenu.style.top = e.pageY + "px";
      });
    });
  }

  document.body.addEventListener("click", () => {
    contextMenu.style.display = "none";
  });

  document.getElementById("deleteApp").addEventListener("click", () => {
    if (targetApp) {
      System.removeApp(targetApp);
      renderApps();
      contextMenu.style.display = "none";
    }
  });

  renderApps();
}
