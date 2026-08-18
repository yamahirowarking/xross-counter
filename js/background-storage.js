(() => {
  const C = CrossCounter.CONFIG;
  let cache = Array(C.zoneCount).fill(null);

  function openDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(C.backgroundDbName,1);
      req.onupgradeneeded=()=>{
        if(!req.result.objectStoreNames.contains(C.backgroundStore)){
          req.result.createObjectStore(C.backgroundStore);
        }
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }

  async function get(index){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(C.backgroundStore,"readonly");
      const req=tx.objectStore(C.backgroundStore).get(index);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }

  async function set(index,data){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(C.backgroundStore,"readwrite");
      tx.objectStore(C.backgroundStore).put(data,index);
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error);
    });
  }

  async function remove(index){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(C.backgroundStore,"readwrite");
      tx.objectStore(C.backgroundStore).delete(index);
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error);
    });
  }

  async function loadAll(){
    cache = await Promise.all(Array.from({length:C.zoneCount},(_,i)=>get(i)));
    return cache;
  }

  function getCache(){ return cache; }

  async function setCacheItem(index,data){
    await set(index,data);
    cache[index]=data;
  }

  async function removeCacheItem(index){
    await remove(index);
    cache[index]=null;
  }

  function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function importPayload(payload){
    if(!payload || !Array.isArray(payload.images) || payload.images.length!==C.zoneCount){
      throw new Error("invalid background payload");
    }
    for(let i=0;i<C.zoneCount;i++){
      if(payload.images[i]) await set(i,payload.images[i]);
      else await remove(i);
    }
    cache=payload.images.slice(0,C.zoneCount);
    return cache;
  }

  function exportPayload(opacity){
    return {version:1,bgOpacity:opacity,images:cache};
  }

  CrossCounter.BackgroundStorage = {
    loadAll,getCache,setCacheItem,removeCacheItem,fileToDataUrl,importPayload,exportPayload
  };
})();
