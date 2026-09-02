const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function start(){
  for(let i=0;i<200;i++){
    const g=window.game;
    if(g?.player?.world){
      const p=g.player;
      const spawn=p.world.getSpawn();
      const floorY=Number.isFinite(spawn.y)?spawn.y:1.2;
      p.groundY=floorY;
      const originalUpdate=p.update.bind(p);
      p.update=(dt,input,camera)=>{
        if(!p.inCar){
          if(!Number.isFinite(p.group.position.y)||p.group.position.y<floorY-0.05)p.group.position.y=floorY;
          originalUpdate(dt,input,camera);
          p.group.position.y=floorY;
        }else{
          originalUpdate(dt,input,camera);
        }
        if(!Number.isFinite(camera.position.y)||camera.position.y<floorY+0.8)camera.position.y=floorY+3;
      };
      const oldRetry=document.getElementById('retry');
      oldRetry?.addEventListener('click',()=>{p.group.position.y=floorY},{passive:true});
      window.__NEON_FLOORFIX=true;
      return;
    }
    await sleep(100);
  }
}
start();
