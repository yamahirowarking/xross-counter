(() => {
  const C = CrossCounter.CONFIG;

  function maxHp(zone){
    let hp = zone.cyber ? C.cyberBaseHp : zone.baseHp;
    if(zone.awakened) hp += C.awakenBonus;
    if(zone.light) hp += C.lightShieldBonus;
    if(zone.body) hp += C.bodyArmorBonus;
    return hp;
  }

  function remainingHp(zone){
    return Math.max(0, maxHp(zone) - zone.damage);
  }

  function isDown(zone){
    return remainingHp(zone) <= 0;
  }

  function equipmentText(zone){
    const names=[];
    if(zone.cyber) names.push("サイバネ");
    if(zone.light) names.push("ライトシールド");
    if(zone.body) names.push("ボディーアーマー");
    return names.length ? names.join(" + ") : "装備なし";
  }

  function addDamage(zone){
    zone.damage += C.damageStep;
  }

  function subtractDamage(zone){
    zone.damage = Math.max(0, zone.damage - C.damageStep);
  }

  function toggleBaseHp(zone){
    zone.baseHp = zone.baseHp===C.defaultBaseHp ? C.alternateBaseHp : C.defaultBaseHp;
  }

  function nextRound(state){
    state.zones.forEach(zone => zone.damage = 0);
  }

  function resetGameKeepingPreferences(state){
    const fresh = CrossCounter.State.defaultState();
    fresh.flipTop = state.flipTop;
    fresh.damageSize = state.damageSize;
    fresh.lifeSize = state.lifeSize;
    fresh.bgOpacity = state.bgOpacity;
    return fresh;
  }

  CrossCounter.GameRules = {
    maxHp, remainingHp, isDown, equipmentText,
    addDamage, subtractDamage, toggleBaseHp,
    nextRound, resetGameKeepingPreferences
  };
})();
