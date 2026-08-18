(() => {
  const State=CrossCounter.State;
  const Rules=CrossCounter.GameRules;
  const Board=CrossCounter.BoardUI;
  const Menu=CrossCounter.MenuUI;
  const Bg=CrossCounter.BackgroundStorage;

  let state=State.load();

  function saveAndRender(){
    State.save(state);
    Board.render(state);
  }

  function zoneFromEventTarget(target){
    const zoneEl=target.closest(".zone");
    if(!zoneEl) return null;
    const index=Number(zoneEl.dataset.zone);
    return {index,zone:state.zones[index]};
  }

  function bindBoardControls(){
    const app=document.getElementById("app");

    app.addEventListener("click",event=>{
      const button=event.target.closest("[data-action]");
      if(!button) return;

      const info=zoneFromEventTarget(button);
      if(!info) return;

      const {index,zone}=info;
      switch(button.dataset.action){
        case "plus": Rules.addDamage(zone); break;
        case "minus": Rules.subtractDamage(zone); break;
        case "awake": zone.awakened=!zone.awakened; break;
        case "basehp": Rules.toggleBaseHp(zone); break;
        case "armor":
          Menu.openArmor(index,button,state);
          return;
      }
      saveAndRender();
    });

    app.addEventListener("contextmenu",event=>event.preventDefault());
    app.addEventListener("selectstart",event=>event.preventDefault());

    let holdTimer=null,startX=0,startY=0;
    app.addEventListener("pointerdown",event=>{
      if(event.target.closest("button")) return;
      startX=event.clientX; startY=event.clientY;
      holdTimer=setTimeout(()=>{
        navigator.vibrate?.(30);
        Menu.openMenu();
      },650);
    });
    app.addEventListener("pointermove",event=>{
      if(Math.hypot(event.clientX-startX,event.clientY-startY)>12){
        clearTimeout(holdTimer);holdTimer=null;
      }
    });
    ["pointerup","pointercancel","pointerleave"].forEach(type=>{
      app.addEventListener(type,()=>{
        clearTimeout(holdTimer);holdTimer=null;
      });
    });
  }

  function bindArmorControls(){
    ["cyberChk","lightChk","bodyChk"].forEach(id=>{
      document.getElementById(id).addEventListener("change",()=>{
        const index=Menu.currentArmorZone();
        if(index===null) return;
        const zone=state.zones[index];
        zone.cyber=document.getElementById("cyberChk").checked;
        zone.light=document.getElementById("lightChk").checked;
        zone.body=document.getElementById("bodyChk").checked;
        saveAndRender();
      });
    });

    document.getElementById("armorClose").addEventListener("click",Menu.closeArmor);
    document.addEventListener("pointerdown",event=>{
      if(!event.target.closest("#armorPop") && !event.target.closest('[data-action="armor"]')){
        Menu.closeArmor();
      }
    });
  }

  function bindMenuControls(){
    const overlay=document.getElementById("menuOverlay");
    const confirm=document.getElementById("resetConfirm");
    const options=document.getElementById("optionsPanel");
    const backgrounds=document.getElementById("backgroundPanel");

    document.getElementById("nextBtn").addEventListener("click",()=>{
      Rules.nextRound(state);
      Menu.closeMenu();
      saveAndRender();
    });

    document.getElementById("flipBtn").addEventListener("click",()=>{
      state.flipTop=!state.flipTop;
      saveAndRender();
    });

    document.getElementById("resetBtn").addEventListener("click",()=>{
      confirm.classList.add("show");
    });
    document.getElementById("resetNo").addEventListener("click",()=>{
      confirm.classList.remove("show");
    });
    document.getElementById("resetYes").addEventListener("click",()=>{
      state=Rules.resetGameKeepingPreferences(state);
      Menu.closeMenu();
      saveAndRender();
    });

    document.getElementById("optionsBtn").addEventListener("click",()=>{
      confirm.classList.remove("show");
      backgrounds.classList.remove("show");
      options.classList.toggle("show");
    });
    document.getElementById("optionsCloseBtn").addEventListener("click",()=>{
      options.classList.remove("show");
    });

    document.getElementById("backgroundBtn").addEventListener("click",()=>{
      confirm.classList.remove("show");
      options.classList.remove("show");
      backgrounds.classList.toggle("show");
      Menu.syncBackgroundOpacity(state);
      Menu.renderBackgroundGrid();
    });

    document.getElementById("closeBtn").addEventListener("click",Menu.closeMenu);
    overlay.addEventListener("click",event=>{
      if(event.target===overlay) Menu.closeMenu();
    });
  }

  function bindTextSizeControls(){
    const damage=document.getElementById("damageSize");
    const life=document.getElementById("lifeSize");

    function update(){
      state.damageSize=Number(damage.value);
      state.lifeSize=Number(life.value);
      saveAndRender();
    }

    damage.addEventListener("input",update);
    life.addEventListener("input",update);

    document.getElementById("sizeDefaultBtn").addEventListener("click",()=>{
      damage.value=100; life.value=100; update();
    });

    window.addEventListener("resize",()=>Board.applyTextSizes(state));
    window.addEventListener("orientationchange",()=>{
      setTimeout(()=>Board.applyTextSizes(state),100);
    });
  }

  function bindBackgroundControls(){
    const panel=document.getElementById("backgroundPanel");
    const imageInput=document.getElementById("bgImageInput");
    const importInput=document.getElementById("bgImportInput");
    const opacity=document.getElementById("bgOpacity");

    panel.addEventListener("click",async event=>{
      const select=event.target.closest("[data-bg-select]");
      const remove=event.target.closest("[data-bg-remove]");

      if(select){
        Menu.setSelectedBackgroundZone(Number(select.dataset.bgSelect));
        imageInput.value="";
        imageInput.click();
      }

      if(remove){
        const index=Number(remove.dataset.bgRemove);
        await Bg.removeCacheItem(index);
        Board.render(state);
        Menu.renderBackgroundGrid();
      }
    });

    imageInput.addEventListener("change",async()=>{
      const file=imageInput.files?.[0];
      const index=Menu.getSelectedBackgroundZone();
      if(!file || index===null || !file.type.startsWith("image/")) return;
      const data=await Bg.fileToDataUrl(file);
      await Bg.setCacheItem(index,data);
      Board.render(state);
      Menu.renderBackgroundGrid();
    });

    opacity.addEventListener("input",()=>{
      state.bgOpacity=Number(opacity.value);
      document.getElementById("bgOpacityValue").textContent=`${state.bgOpacity}%`;
      saveAndRender();
    });

    document.getElementById("bgExportBtn").addEventListener("click",()=>{
      const payload=Bg.exportPayload(state.bgOpacity);
      const blob=new Blob([JSON.stringify(payload)],{type:"application/json"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download="crossstars-backgrounds.json";
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    });

    document.getElementById("bgImportBtn").addEventListener("click",()=>{
      importInput.value="";
      importInput.click();
    });

    importInput.addEventListener("change",async()=>{
      const file=importInput.files?.[0];
      if(!file) return;
      try{
        const payload=JSON.parse(await file.text());
        await Bg.importPayload(payload);
        if(Number.isFinite(Number(payload.bgOpacity))){
          state.bgOpacity=Math.min(100,Math.max(10,Number(payload.bgOpacity)));
        }
        saveAndRender();
        Menu.renderBackgroundGrid();
        Menu.syncBackgroundOpacity(state);
      }catch{
        alert("背景設定ファイルを読み込めませんでした。");
      }
    });
  }

  async function start(){
    bindBoardControls();
    bindArmorControls();
    bindMenuControls();
    bindTextSizeControls();
    bindBackgroundControls();

    saveAndRender();

    try{
      await Bg.loadAll();
      Board.render(state);
      Menu.renderBackgroundGrid();
    }catch(error){
      console.warn("背景画像の読込に失敗しました",error);
    }
  }

  document.addEventListener("DOMContentLoaded",start);
})();
