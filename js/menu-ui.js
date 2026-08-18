(() => {
  let armorZone=null;
  let selectedBgZone=null;

  const byId=id=>document.getElementById(id);

  function openMenu(){
    document.body.classList.add("menu-open");
    byId("menuOverlay").classList.add("show");
  }

  function closeMenu(){
    byId("resetConfirm").classList.remove("show");
    byId("optionsPanel").classList.remove("show");
    byId("backgroundPanel").classList.remove("show");
    byId("menuOverlay").classList.remove("show");
    document.body.classList.remove("menu-open");
  }

  function openArmor(index,anchor,state){
    armorZone=index;
    const zone=state.zones[index];
    byId("cyberChk").checked=zone.cyber;
    byId("lightChk").checked=zone.light;
    byId("bodyChk").checked=zone.body;

    const r=anchor.getBoundingClientRect();
    const popup=byId("armorPop");
    popup.classList.add("show");

    const w=240,h=205;
    popup.style.left=`${Math.min(window.innerWidth-w-8,Math.max(8,r.left))}px`;
    popup.style.top=`${Math.min(window.innerHeight-h-8,Math.max(8,r.bottom+6))}px`;
  }

  function closeArmor(){
    byId("armorPop").classList.remove("show");
    armorZone=null;
  }

  function currentArmorZone(){ return armorZone; }

  function renderBackgroundGrid(){
    const cache=CrossCounter.BackgroundStorage.getCache();
    byId("bgGrid").innerHTML=Array.from({length:CrossCounter.CONFIG.zoneCount},(_,i)=>`
      <div class="bg-slot">
        <div class="bg-slot-title">${i<4?"上":"下"} ${i%4+1}</div>
        <div class="bg-preview" style="${cache[i]?`background-image:url('${cache[i]}')`:''}">
          ${cache[i]?"":"画像なし"}
        </div>
        <div class="bg-slot-actions">
          <button data-bg-select="${i}">選択</button>
          <button class="bg-remove" data-bg-remove="${i}">削除</button>
        </div>
      </div>`).join("");
  }

  function setSelectedBackgroundZone(index){ selectedBgZone=index; }
  function getSelectedBackgroundZone(){ return selectedBgZone; }

  function syncBackgroundOpacity(state){
    byId("bgOpacity").value=state.bgOpacity;
    byId("bgOpacityValue").textContent=`${state.bgOpacity}%`;
  }

  CrossCounter.MenuUI = {
    openMenu,closeMenu,openArmor,closeArmor,currentArmorZone,
    renderBackgroundGrid,setSelectedBackgroundZone,getSelectedBackgroundZone,
    syncBackgroundOpacity
  };
})();
