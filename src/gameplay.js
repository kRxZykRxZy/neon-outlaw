import * as THREE from 'three';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function mat(c,r=.65,m=.05){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m})}
function box(c,w,h,d){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c))}

function addVillageNPC(game,name,pos,guide=false){
  const g=new THREE.Group();g.position.set(pos[0],0,pos[1]);
  const body=box(guide?0x2f72d8:0x7a4f36,.72,1.05,.48);body.position.y=1.0;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,12,10),mat(0xc98f72,.8));head.position.y=1.72;g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8,0,Math.PI*2,0,Math.PI*.48),mat(0x241810,.9));hair.position.y=1.83;g.add(hair);
  for(const x of[-.23,.23]){const leg=box(0x27303a,.22,.72,.25);leg.position.set(x,.36,0);g.add(leg)}
  g.userData.npc=true;g.userData.name=name;g.userData.guide=guide;game.scene.add(g);
  return {group:g,name,guide,home:g.position.clone(),phase:Math.random()*6}
}

async function setupVillage(game){
  if(game.__villageReady)return;game.__villageReady=true;
  game.villageNPCs=[];
  game.villageNPCs.push(addVillageNPC(game,'Jax',[0,35],true));
  game.villageNPCs.push(addVillageNPC(game,'Maya',[-65,105]));
  game.villageNPCs.push(addVillageNPC(game,'Theo',[70,110]));
  game.villageNPCs.push(addVillageNPC(game,'Rina',[-55,245]));
  game.villageNPCs.push(addVillageNPC(game,'Sam',[65,265]));
  game.villageNPCs.push(addVillageNPC(game,'Leo',[0,330]));
  game.guideNPC=game.villageNPCs[0];
  game.guideTarget=new THREE.Vector3(0,0,220);
  game.guideStep=0;
  game.showToast('JAX IS WAITING — FOLLOW THE BLUE GUIDE');
}

function addStarterCar(game){
  if(game.__starterCarReady)return;game.__starterCarReady=true;
  const car=new game.vehicles[0].constructor(game.scene,game.world,'runner',6,-60);
  car.spec={...car.spec,topSpeed:31.3};
  car.health=car.spec.health;
  game.vehicles.push(car);game.starterCar=car;
  game.showToast('STARTER CAR READY — F TO ENTER');
}

function addWeapons(game){
  const p=game.player;if(p.__weaponsReady)return;p.__weaponsReady=true;
  p.weaponMode='gun';p.weaponAnim=0;p.meleeCooldown=0;
  const gun=new THREE.Group();
  const slide=box(0x252a32,.16,.16,.72);slide.position.set(0,0,.25);gun.add(slide);
  const grip=box(0x15171b,.14,.3,.22);grip.position.set(0,-.18,-.02);grip.rotation.x=-.18;gun.add(grip);
  const barrel=box(0x111317,.09,.09,.28);barrel.position.set(0,.02,.68);gun.add(barrel);
  gun.position.set(.69,.96,.48);p.group.add(gun);p.gunMesh=gun;
  const knife=new THREE.Group();
  const handle=box(0x17191c,.12,.28,.12);handle.position.z=-.05;knife.add(handle);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.62),mat(0xd6dbe2,.25,.8));blade.position.z=.31;knife.add(blade);
  knife.position.set(-.69,1.02,.42);knife.rotation.x=-.15;p.group.add(knife);knife.visible=false;p.knifeMesh=knife;
  p.switchWeapon=function(mode){this.weaponMode=mode==='knife'?'knife':'gun';this.gunMesh.visible=this.weaponMode==='gun';this.knifeMesh.visible=this.weaponMode==='knife';game.showToast(this.weaponMode==='gun'?'PISTOL EQUIPPED':'KNIFE EQUIPPED')};
  p.melee=function(){if(this.weaponMode!=='knife'||this.meleeCooldown>0||this.inCar)return;this.meleeCooldown=.65;this.weaponAnim=.34;const origin=this.group.position.clone().add(new THREE.Vector3(0,1.25,0));const dir=new THREE.Vector3(Math.sin(this.yaw),0,Math.cos(this.yaw));const hits=new THREE.Raycaster(origin,dir,0,3).intersectObjects(game.scene.userData.enemyMeshes||[],true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.enemy)o=o.parent;if(o?.userData.enemy){o.userData.enemy.takeDamage(65);game.showToast('KNIFE HIT')}}};
  const originalShoot=p.shoot.bind(p);
  p.shoot=function(camera){if(this.weaponMode==='knife'){this.melee();return}if(this.reloading||this.cooldown>0)return;const w=this.weapon();if(this.ammo<=0){this.reload();return}this.ammo--;this.cooldown=w.rate/1000;this.weaponAnim=.16;this.save.data.stats.shots++;
    const muzzle=this.gunMesh.getWorldPosition(new THREE.Vector3());const dir=new THREE.Vector3();camera.getWorldDirection(dir);const hits=new THREE.Raycaster(muzzle,dir,0,w.range).intersectObjects(game.scene.userData.enemyMeshes||[],true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.enemy)o=o.parent;if(o?.userData.enemy){this.save.data.stats.hits++;o.userData.enemy.takeDamage(w.damage)}}if(game.scene.userData.effects)game.scene.userData.effects.muzzle(muzzle,dir);
    game.save.data.wanted=Math.min(5,(game.save.data.wanted||0)+.03);game.wanted.stars=Number(game.save.data.wanted);game.save.save();
  };
  p.update=(function(orig){return function(dt,input,camera){this.meleeCooldown=Math.max(0,this.meleeCooldown-dt);const oldMode=this.weaponMode;orig.call(this,dt,input,camera);if(input.reload)this.reload();if(input.fire&&this.weaponMode==='knife')this.melee();if(this.weaponAnim>0){this.weaponAnim-=dt;if(this.weaponMode==='gun'){this.gunMesh.rotation.x=-Math.sin((.16-this.weaponAnim)/.16*Math.PI)*.35}else{this.knifeMesh.rotation.x=-.15-Math.sin((.34-this.weaponAnim)/.34*Math.PI)*1.15}}else{this.gunMesh.rotation.x=0;this.knifeMesh.rotation.x=-.15}if(input.lookX||input.lookY)this.group.rotation.y=this.yaw;if(oldMode!==this.weaponMode)this.switchWeapon(this.weaponMode)}})(p.update);
  window.addEventListener('keydown',e=>{if(e.code==='Digit1')p.switchWeapon('gun');if(e.code==='Digit2'||e.code==='KeyV')p.switchWeapon('knife')});
  const controls=document.getElementById('touch-controls');if(controls){const make=(txt,fn)=>{const b=document.createElement('button');b.className='touch-button touch-small';b.textContent=txt;b.dataset.featureWeapon='1';b.addEventListener('touchstart',e=>{e.preventDefault();fn()},{passive:false});controls.appendChild(b)};make('GUN',()=>p.switchWeapon('gun'));make('KNIFE',()=>p.switchWeapon('knife'))}
}

function animateVillage(game,dt){if(!game.villageNPCs)return;const playerPos=game.player.inCar?game.player.car.group.position:game.player.group.position;
  for(const n of game.villageNPCs){n.phase+=dt;const target=n.guide?game.guideTarget:n.home;let desired=target.clone();if(n.guide){const d=desired.distanceTo(n.group.position);if(d<3){game.guideStep++;if(game.guideStep===1)game.showToast('JAX: FOLLOW ME TO THE VILLAGE');game.guideTarget=new THREE.Vector3(0,0,330)}else{desired.y=0;const dir=desired.sub(n.group.position);dir.y=0;if(dir.length()>2)dir.normalize();n.group.position.addScaledVector(dir,Math.min(2.2*dt,dir.length()));if(dir.lengthSq()>0.01)n.group.rotation.y=Math.atan2(dir.x,dir.z)}}else{n.group.position.y=0.03+Math.sin(n.phase)*.015}}
  }
  if(game.guideNPC){const d=playerPos.distanceTo(game.guideNPC.group.position);if(d<12&&game.guideStep===0){game.guideTarget=playerPos.clone().add(new THREE.Vector3(0,0,160));game.showToast('FOLLOW JAX — HE WILL LEAD YOU INTO THE VILLAGE')}}
}

function start(){
  const game=window.game;if(!game||!game.player||!game.world||!game.vehicles)return false;
  setupVillage(game);addStarterCar(game);addWeapons(game);
  if(!game.__wantedUpgrade){game.__wantedUpgrade=true;const oldUpdate=game.enemies.update.bind(game.enemies);game.enemies.update=(dt)=>{oldUpdate(dt);if(game.wanted.stars>0&&game.enemies.enemies.filter(e=>e.kind==='police').length<Math.min(8,Math.max(1,Math.ceil(game.wanted.stars)*2))&&(!game.__policeNext||game.__policeNext<=0)){const p=game.player.inCar?game.player.car.group.position:game.player.group.position;game.enemies.spawnPolice(Math.min(2,Math.ceil(game.wanted.stars)),p);game.__policeNext=4}game.__policeNext=(game.__policeNext||0)-dt}};
  if(!game.__featureLoop){game.__featureLoop=true;let last=performance.now();const tick=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;animateVillage(game,dt);requestAnimationFrame(tick)};requestAnimationFrame(tick)}
  return true;
}
(async()=>{for(let i=0;i<200;i++){if(start())break;await sleep(100)}})();
