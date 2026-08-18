(() => {
  const C = CrossCounter.CONFIG;

  function createZone(){
    return {
      baseHp:C.defaultBaseHp,
      damage:0,
      awakened:false,
      cyber:false,
      light:false,
      body:false
    };
  }

  function defaultState(){
    return {
      flipTop:false,
      damageSize:100,
      lifeSize:100,
      bgOpacity:35,
      zones:Array.from({length:C.zoneCount}, createZone)
    };
  }

  function normalizeZone(zone={}){
    return {
      baseHp: zone.baseHp===C.alternateBaseHp ? C.alternateBaseHp : C.defaultBaseHp,
      damage: Math.max(0, Number(zone.damage)||0),
      awakened: !!zone.awakened,
      cyber: !!zone.cyber,
      light: !!zone.light,
      body: !!zone.body
    };
  }

  function normalizeState(raw){
    const base = defaultState();
    if(!raw || !Array.isArray(raw.zones) || raw.zones.length!==C.zoneCount) return base;
    return {
      flipTop: !!raw.flipTop,
      damageSize: Number.isFinite(Number(raw.damageSize)) ? Number(raw.damageSize) : 100,
      lifeSize: Number.isFinite(Number(raw.lifeSize)) ? Number(raw.lifeSize) : 100,
      bgOpacity: Number.isFinite(Number(raw.bgOpacity)) ? Number(raw.bgOpacity) : 35,
      zones: raw.zones.map(normalizeZone)
    };
  }

  function load(){
    try{
      return normalizeState(JSON.parse(localStorage.getItem(C.stateStorageKey)));
    }catch{
      return defaultState();
    }
  }

  function save(state){
    localStorage.setItem(C.stateStorageKey, JSON.stringify(state));
  }

  CrossCounter.State = { createZone, defaultState, normalizeState, load, save };
})();
