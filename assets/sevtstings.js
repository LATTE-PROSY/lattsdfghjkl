if(!localStorage.getItem("panicKey")) localStorage.setItem("panicKey","p");
if(!localStorage.getItem("panicUrl")) localStorage.setItem("panicUrl","https://google.com");
if(!localStorage.getItem("desktopBg")) localStorage.setItem("desktopBg","");

document.addEventListener("DOMContentLoaded", ()=>{
  const panicKeyInput = document.getElementById("panicKey");
  const panicUrlInput = document.getElementById("panicUrl");
  const bgUpload = document.getElementById("bgUpload");
  const saveBtn = document.getElementById("saveSettings");
  const resetBtn = document.getElementById("resetSettings");
  const testBtn = document.getElementById("testPanic");

  if(panicKeyInput && panicUrlInput){
    panicKeyInput.value = localStorage.getItem("panicKey");
    panicUrlInput.value = localStorage.getItem("panicUrl");

    saveBtn?.addEventListener("click", ()=>{
      localStorage.setItem("panicKey", panicKeyInput.value || "p");
      localStorage.setItem("panicUrl", panicUrlInput.value || "https://google.com");
      alert("✅ Settings saved! The page will now refresh.");
      location.reload(); // Refresh after saving
    });

    resetBtn?.addEventListener("click", ()=>{
      localStorage.setItem("panicKey", "p");
      localStorage.setItem("panicUrl", "https://google.com");
      localStorage.setItem("desktopBg", "");
      panicKeyInput.value="p";
      panicUrlInput.value="https://google.com";
      alert("🔄 Settings reset! The page will now refresh.");
      location.reload(); // Refresh after resetting
    });

    testBtn?.addEventListener("click", ()=>{
      const testUrl = panicUrlInput.value || "/sneakpeek";
      const newTab = window.open("about:blank","_blank");
      newTab.document.write(`<iframe src="${testUrl}" style="border:none;width:100%;height:100%"></iframe>`);
    });

    bgUpload?.addEventListener("change", e=>{
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const imgUrl = ev.target.result;
        localStorage.setItem("desktopBg", imgUrl);

        if(window.opener && window.opener.document.getElementById("desktop")){
          window.opener.document.getElementById("desktop").style.backgroundImage = `url('${imgUrl}')`;
        }
        alert("🖼️ Background updated! Please refresh to see changes.");
      };
      reader.readAsDataURL(file);
    });
  }
})();

(function(){
  const panicKey = (localStorage.getItem("panicKey") || "p").toLowerCase();
  const panicUrl = localStorage.getItem("panicUrl") || "https://google.com";
  window.addEventListener("keydown", e=>{
    if(e.key.toLowerCase()===panicKey){
      window.location.href=panicUrl;
    }
  });
})();
