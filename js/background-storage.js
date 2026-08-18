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
    return resizeImageFile(file);
  }

  function resizeImageFile(file,maxSide=1600,quality=0.88){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(reader.error);
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error("画像を読み込めませんでした"));
        img.onload=()=>{
          const srcW=img.naturalWidth || img.width;
          const srcH=img.naturalHeight || img.height;
          if(!srcW || !srcH){
            reject(new Error("画像サイズを取得できませんでした"));
            return;
          }

          const scale=Math.min(1,maxSide/Math.max(srcW,srcH));
          const width=Math.max(1,Math.round(srcW*scale));
          const height=Math.max(1,Math.round(srcH*scale));

          const canvas=document.createElement("canvas");
          canvas.width=width;
          canvas.height=height;

          const ctx=canvas.getContext("2d",{alpha:false});
          ctx.imageSmoothingEnabled=true;
          ctx.imageSmoothingQuality="high";
          ctx.fillStyle="#ffffff";
          ctx.fillRect(0,0,width,height);
          ctx.drawImage(img,0,0,width,height);

          let output;
          try{
            output=canvas.toDataURL("image/jpeg",quality);
          }catch(error){
            reject(error);
            return;
          }
          resolve(output);
        };
        img.src=reader.result;
      };
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
    loadAll,getCache,setCacheItem,removeCacheItem,fileToDataUrl,resizeImageFile,importPayload,exportPayload
  };
})();
