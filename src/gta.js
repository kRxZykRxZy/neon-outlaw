import * as THREE from 'three';

const MOBILE=!!window.__NEON_MOBILE__;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const C={road:0x202328,sidewalk:0x8c9094,concrete:0x70757b,glass:0x182735,window:0x9fd7ff,windowNight:0xffd56a,brick:0x9b6252,stone:0xb6b0a4,steel:0x59636c,tree:0x2d6b3c,grass:0x4d7548,yellow:0xf2c62f,red:0xd62d3b,blue:0x1f63d5};
function mat(c,r=.75,m=.05,e=0){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e?c:0,emissiveIntensity:e?0.22:0})}
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=true;return o}
function sign(text,color=0xffffff){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='#101318';x.fillRect(0,0,c.width,c.height);x.fillStyle='#'+color.toString(16).padStart(6,'0');x.font='bold 46px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,c.height/2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(5,.95),new THREE.MeshBasicMaterial({map:t,transparent:true}))}

function decorateCity(game){
 if(game.__gtaCity)return; game.__gtaCity=true;
 const root=new THREE.Group();root.name='GTA_CITY_DETAIL';game.scene.add(root);
 const buildingGeo=new THREE.BoxGeometry(1,1,1), windowGeo=new THREE.BoxGeometry(.75,.08,.22), lampPole=new THREE.CylinderGeometry(.055,.07,4.8,6), lampHead=new THREE.BoxGeometry(.45,.12,.22);
 const buildingMats=[mat(C.brick),mat(C.stone),mat(0x59636b),mat(0x7d858a),mat(0x3e4850),mat(0xc2b6a3)];
 const windowMat=mat(C.window,.25,.05,C.window), warmMat=mat(C.windowNight,.28,.03,C.windowNight);
 const windows=[]; const windowsWarm=[];
 const winInst=new THREE.InstancedMesh(windowGeo,windowMat, MOBILE?900:2600);winInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(winInst);
 const warmInst=new THREE.InstancedMesh(windowGeo,warmMat,MOBILE?250:750);root.add(warmInst);
 let wi=0,ww=0;const dummy=new THREE.Object3D();
 const blocks=[];
 for(let x=-504;x<=504;x+=84)for(let z=-504;z<=504;z+=84)blocks.push([x,z]);
 for(const [bx,bz] of blocks){
   if(Math.abs(bx)<42&&Math.abs(bz)<42)continue;
   const h=12+Math.random()*34+(Math.abs(bx)<260&&Math.abs(bz)<260?10:0);
   const w=26+Math.random()*13,d=26+Math.random()*13;
   const b=mesh(buildingGeo,buildingMats[Math.floor(Math.random()*buildingMats.length)],bx,h/2,bz);b.scale.set(w,h,d);root.add(b);
   // rooftop equipment
   if(Math.random()<.65){const tank=mesh(new THREE.CylinderGeometry(1.3,1.3,2.4,10),mat(0x424950,.65,.3),bx+(Math.random()-.5)*w*.6,h+1.2,bz+(Math.random()-.5)*d*.6);root.add(tank)}
   const cols=Math.max(2,Math.floor(w/3.3)),rows=Math.max(3,Math.floor(h/3.2));
   for(let ix=0;ix<cols;ix++)for(let iz=1;iz<rows;iz++){
     const xx=bx-w/2+2.0+ix*(w-4)/(cols-1), yy=iz*3.0;
     if(wi<winInst.count){dummy.position.set(xx,yy,bz-d/2-.045);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();winInst.setMatrixAt(wi++,dummy.matrix)}
     if(ww<warmInst.count&&Math.random()<.25){dummy.position.set(xx,yy,bz+d/2+.045);dummy.rotation.set(0,Math.PI,0);dummy.scale.set(1,1,1);dummy.updateMatrix();warmInst.setMatrixAt(ww++,dummy.matrix)}
   }
 }
 winInst.count=wi;warmInst.count=ww;winInst.instanceMatrix.needsUpdate=true;warmInst.instanceMatrix.needsUpdate=true;

 // Sidewalk slabs and zebra crossings around the dense core.
 const slabGeo=new THREE.BoxGeometry(70,.16,6), crossGeo=new THREE.BoxGeometry(4,.03,18), slabMat=mat(C.sidewalk,.96);
 for(let x=-504;x<=504;x+=84){for(const z of[-15,15])root.add(mesh(slabGeo,slabMat,x,.1,z))}
 for(let z=-504;z<=504;z+=84){for(const x of[-15,15]){const s=mesh(new THREE.BoxGeometry(6,.16,70),slabMat,x,.1,z);root.add(s)}}
 const stripeMat=mat(0xf1f1e9,.7);
 for(let x=-504;x<=504;x+=84)for(let z=-504;z<=504;z+=84)for(let i=-2;i<=2;i++){root.add(mesh(crossGeo,stripeMat,x+i*5,.12,z-13));root.add(mesh(new THREE.BoxGeometry(18,.03,4),stripeMat,x-13,.12,z+i*5))}

 // NYC-style street furniture.
 const poleMat=mat(0x343a40,.55,.55), lightMat=mat(0xffd36a,.22,.05,C.windowNight);
 for(let x=-504;x<=504;x+=42)for(const z of[-20,20]){const p=mesh(lampPole,poleMat,x,2.4,z);root.add(p);const h=mesh(lampHead,lightMat,x,4.8,z);root.add(h)}
 for(let z=-504;z<=504;z+=42)for(const x of[-20,20]){const p=mesh(lampPole,poleMat,x,2.4,z);root.add(p);const h=mesh(lampHead,lightMat,x,4.8,z);root.add(h)}

 // Traffic signals at intersections.
 const signalGeo=new THREE.BoxGeometry(.32,.32,.32);const signalM=mat(0x15181b,.4,.3);
 for(let x=-504;x<=504;x+=84)for(let z=-504;z<=504;z+=84){const pole=mesh(new THREE.CylinderGeometry(.06,.06,4.5,6),poleMat,x+13,2.25,z+13);root.add(pole);for(let i=0;i<3;i++){const s=mesh(signalGeo,mat([C.red,C.yellow,0x22a64a][i],.25,.05,[C.red,C.yellow,0x22a64a][i]),x+13,4.15-i*.43,z+13);root.add(s)}}

 // Trees in occasional sidewalk corners/parks.
 if(!MOBILE){for(let x=-462;x<=462;x+=84)for(let z=-462;z<=462;z+=84)if((Math.abs(x+z)%168)===0){const trunk=mesh(new THREE.CylinderGeometry(.28,.4,3,7),mat(0x5b3d27),x,1.5,z);root.add(trunk);const crown=mesh(new THREE.SphereGeometry(2.0,9,7),mat(C.tree,.95),x,4,z);root.add(crown)}}

 // Landmark buildings and services around spawn.
 const landmarks=[
  ['METRO BANK',-126,-126,0x31485b,18],['LOS SANTOS MEDICAL',126,-126,0x6b7981,15],['POLICE HQ',126,126,0x314f76,14],['AUTO WORKS',-126,126,0x76543e,10]
 ];
 for(const [name,x,z,color,h] of landmarks){const g=new THREE.Group();g.position.set(x,0,z);const b=mesh(new THREE.BoxGeometry(38,h,30),mat(color,.72,.12),0,h/2,0);g.add(b);const s=sign(name,name==='POLICE HQ'?0x75a9ff:name==='METRO BANK'?0x7ff0c9:0xffffff);s.position.set(0,h*.7,-15.2);g.add(s);root.add(g)}

 // A central park makes the dense city feel lived-in rather than a grid of boxes.
 const park=mesh(new THREE.BoxGeometry(56,.08,56),mat(C.grass,.98),0,.03,168);root.add(park);
 for(let i=0;i<(MOBILE?8:16);i++){const a=Math.random()*Math.PI*2,r=6+Math.random()*22;const t=mesh(new THREE.CylinderGeometry(.2,.3,2.4,7),mat(0x5b3d27),Math.cos(a)*r,1.2,168+Math.sin(a)*r);root.add(t);const c=mesh(new THREE.SphereGeometry(1.7,8,6),mat(C.tree,.95),Math.cos(a)*r,3.5,168+Math.sin(a)*r);root.add(c)}

 // Branded storefronts close to the spawn area.
 const stores=[['24/7 MARKET',-38,-38,0xe2b53b],['PAWN & GOLD',38,-38,0x9a673c],['MODERN AUTO',-38,38,0x4d687c],['BARBER',38,38,0x9c4a59]];
 for(const [name,x,z,color] of stores){const g=new THREE.Group();g.position.set(x,0,z);const b=mesh(new THREE.BoxGeometry(20,6,12),mat(color,.75,.05),0,3,0);g.add(b);const s=sign(name,0xffffff);s.position.set(0,4.4,-6.1);g.add(s);root.add(g)}
}

function installInteractions(game){
 if(game.__gtaInteractions)return;game.__gtaInteractions=true;
 const services=[
  {name:'METRO BANK',p:new THREE.Vector3(-126,0,-126),fn:()=>{game.showToast('BANK — CASH: $'+game.save.data.cash.toLocaleString()+' • BANK: $'+game.save.data.bank.toLocaleString())}},
  {name:'MEDICAL',p:new THREE.Vector3(126,0,-126),fn:()=>{if(game.save.data.cash>=300){game.save.addCash(-300);game.player.health=100;game.player.armor=25;game.showToast('MEDICAL — FULL HEALTH + ARMOR')}else game.showToast('MEDICAL — $300 REQUIRED')}},
  {name:'AUTO WORKS',p:new THREE.Vector3(-126,0,126),fn:()=>{if(game.player.inCar){game.player.car.health=game.player.car.spec.health;game.player.car.velocity=0;game.showToast('AUTO WORKS — VEHICLE REPAIRED')}else game.showToast('AUTO WORKS — ENTER A VEHICLE FIRST')}},
 ];
 let cool=0;
 game.__gtaServiceTick=dt=>{cool=Math.max(0,cool-dt);if(cool>0)return;const pos=game.player.inCar?game.player.car.group.position:game.player.group.position;for(const s of services)if(pos.distanceTo(s.p)<15){game.showToast(s.name+' — press E');if(game.input.keys.KeyE&&!game.player.inCar){game.input.keys.KeyE=false;s.fn();cool=1;break}}};
 const old=game.update.bind(game);game.update=(dt)=>{old(dt);game.__gtaServiceTick(dt)};
}

async function start(){for(let i=0;i<200;i++){const game=window.game;if(game?.scene&&game?.world&&game?.player&&game?.vehicles){decorateCity(game);installInteractions(game);return}await sleep(100)}}
start();
