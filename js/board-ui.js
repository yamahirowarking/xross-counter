(() => {
  const Rules = CrossCounter.GameRules;

  function clampNumber(value,min,max){
    return Math.min(max,Math.max(min,value));
  }

  function applyTextSizes(state){
    const portrait = window.matchMedia("(orientation: portrait)").matches;
    const h = portrait ? window.innerWidth : window.innerHeight;
    const shortLandscape = portrait
      ? window.innerWidth <= 500
      : window.matchMedia("(orientation: landscape) and (max-height: 500px)").matches;

    const damageBase = shortLandscape
      ? clampNumber(h * 0.12,40,70)
      : clampNumber(h * 0.09,44,108);

    const lifeBase = shortLandscape
      ? clampNumber(h * 0.085,28,52)
      : clampNumber(h * 0.067,32,80);

    document.documentElement.style.setProperty("--damage-font-px",`${damageBase * state.damageSize / 100}px`);
    document.documentElement.style.setProperty("--life-font-px",`${lifeBase * state.lifeSize / 100}px`);
  }

  function backgroundStyle(index,state){
    const image = CrossCounter.BackgroundStorage.getCache()[index];
    const safeImage = image ? `url("${String(image).replace(/"/g,'%22')}")` : "none";
    return `--zone-bg:${safeImage};--bg-opacity:${state.bgOpacity/100}`;
  }

  function zoneHtml(zone,index,state){
    const remaining=Rules.remainingHp(zone);
    const maximum=Rules.maxHp(zone);
    const down=Rules.isDown(zone);
    return `
      <article class="zone ${zone.awakened?'awakened-bg':''} ${down?'down-bg':''}"
               data-zone="${index}" style='${backgroundStyle(index,state)}'>
        <div class="zone-inner">
          <div class="zone-header">
            <button class="icon-btn awake ${zone.awakened?'active':''}" data-action="awake" aria-label="覚醒切替">
              <span class="icon"></span><span class="label">覚醒</span>
            </button>
            <button class="equip equip-top ${(zone.cyber||zone.light||zone.body)?'active':''}"
                    data-action="armor" aria-label="装備設定">
              ${Rules.equipmentText(zone)}
            </button>
          </div>

          <div class="damage-area">
            <button class="damage-hit" data-action="minus" aria-label="ダメージを10減らす">−</button>
            <div class="damage-center">
              <div class="damage">${zone.damage}</div>
              <div class="damage-label">ダメージ</div>
            </div>
            <button class="damage-hit" data-action="plus" aria-label="ダメージを10増やす">＋</button>
          </div>

          <div class="zone-footer">
            <button class="life-wrap" data-action="basehp"
                    style="border:0;background:transparent;text-align:left;padding:0;cursor:pointer;width:100%"
                    aria-label="基礎HPを110と100で切替">
              <div class="life-label">残りライフ</div>
              <div class="life ${down?'down':''}">${down ? 'DOWN' : `${remaining} / ${maximum}`}</div>
            </button>
          </div>
        </div>
      </article>`;
  }

  function render(state){
    applyTextSizes(state);

    const damageSlider=document.getElementById("damageSize");
    const lifeSlider=document.getElementById("lifeSize");
    if(damageSlider){
      damageSlider.value=state.damageSize;
      document.getElementById("damageSizeValue").textContent=`${state.damageSize}%`;
    }
    if(lifeSlider){
      lifeSlider.value=state.lifeSize;
      document.getElementById("lifeSizeValue").textContent=`${state.lifeSize}%`;
    }

    document.getElementById("topRow").innerHTML =
      state.zones.slice(0,4).map((zone,i)=>zoneHtml(zone,i,state)).join("");
    document.getElementById("bottomRow").innerHTML =
      state.zones.slice(4).map((zone,i)=>zoneHtml(zone,i+4,state)).join("");

    document.getElementById("topRow").classList.toggle("flip",state.flipTop);
    document.getElementById("flipBtn").firstChild.textContent=`上半分 反転：${state.flipTop?'ON':'OFF'}`;
  }

  CrossCounter.BoardUI = { render, applyTextSizes };
})();
