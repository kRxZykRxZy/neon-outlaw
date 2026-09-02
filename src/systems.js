import * as THREE from 'three';
import {WEAPONS,VEHICLES,MISSIONS,getMission,districtFor} from './content.js';
const merge=(a,b)=>({...a,...b,settings:{...(a.settings||{}),...(b.settings||{})}});
export class SaveSystem{
 constructor(){this.key='neon-outlaw-save-v1';this.data=this.load();this.backend=null;this.usingCrazyData=false}
 defaults(){return{cash:2500,bank:0,xp:0,level:1,health:100,armor:25,weapon:'pistol',weapons:['pistol'],vehicle:'runner',vehicles:['runner'],completed:[],kills:0,wanted:0,properties:[],upgrades:{health:0,armor:0,sprint:0,driving:0,shooting:0},stats:{distance:0,shots:0,hits:0,vehicles:0},settings:{quality:'high',music:true,sfx:true}}}
 load(){try{return merge(this.defaults(),JSON.parse(localStorage.getItem(this.key)||'{}'))}catch{return this.defaults()}}
 save(){try{const raw=JSON.stringify(this.data);if(this.backend)this.backend.setItem(this.key,raw);else localStorage.setItem(this.key,raw)}catch(e){console.warn('save failed',e)}}
 reset(){this.data=this.defaults();this.save()}
 addCash(n){this.data.cash=Math.max(0,this.data.cash+n);this.save()}
 addXP(n){this.data.xp+=n;while(this.data.xp>=this.data.level*1000){this.data.xp-=this.data.level*1000;this.data.level++}this.save()}
 complete(id,reward,xp){if(!this.data.completed.includes(id))this.data.completed.push(id);this.addCash(reward);this.addXP(xp);this.save()}
 buyWeapon(id){const w=WEAPONS[id];if(!w||this.data.weapons.includes(id)||this.data.cash<w.price)return false;this.data.cash-=w.price;this.data.weapons.push(id);this.data.weapon=id;this.save();return true}
 buyVehicle(id){const v=VEHICLES[id];if(!v||this.data.vehicles.includes(id)||this.data.cash<v.price)return false;this.data.cash-=v.price;this.data.vehicles.push(id);this.data.vehicle=id;this.save();return true}
}
function meshBox(c,sx,sy,sz){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:c,roughness:.42,metalness:.5}));m.castShadow=true;return m}
export class Player{
 constructor(scene,world,save){this.scene=scene;this.world=world;this.save=save;this.group=new THREE.Group();scene.add(this.group);this.body=meshBox(0x1c2230,1.1,1.8,.75);this.body.position.y=1;this.group.add(this.body);const head=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),new THREE.MeshStandardMaterial({color:0xd49b7d,roughness:.7}));head.position.y=2.15;this.group.add(head);const jacket=meshBox(0x11131d,1.25,1.1,.82);jacket.position.y=1.3;this.group.add(jacket);this.group.position.copy(world.getSpawn());this.velocity=new THREE.Vector3();this.yaw=0;this.pitch=0;this.speed=7;this.inCar=false;this.car=null;this.cooldown=0;this.reloading=false;this.ammo=this.weapon().mag;this.reserve=this.ammo*5;this.invuln=0}
 weapon(){return WEAPONS[this.save.data.weapon]||WEAPONS.pistol}
 update(dt,input,camera){if(this.invuln>0)this.invuln-=dt;if(this.inCar){this.updateCar(dt,input,camera);return}const f=new THREE.Vector3(Math.sin(this.yaw),0,Math.cos(this.yaw)),r=new THREE.Vector3(Math.cos(this.yaw),0,-Math.sin(this.yaw));const move=f.clone().multiplyScalar(input.forward).add(r.multiplyScalar(input.strafe));if(move.lengthSq()>1)move.normalize();const mult=input.sprint?1.55+this.save.data.upgrades.sprint*.08:1;this.velocity.lerp(move.multiplyScalar(this.speed*mult),1-Math.pow(.001,dt));const next=this.group.position.clone().addScaledVector(this.velocity,dt);if(!this.world.isBlocked(next,.55))this.group.position.copy(next);else this.velocity.multiplyScalar(.12);this.yaw-=input.lookX*dt*1.8;this.pitch=THREE.MathUtils.clamp(this.pitch-input.lookY*dt*1.4,-1.25,1.25);this.body.rotation.y=this.yaw;this.cooldown=Math.max(0,this.cooldown-dt);this.updateCamera(camera);if(input.fire)this.shoot(camera);if(input.reload)this.reload()}
 updateCamera(camera){const target=this.group.position.clone().add(new THREE.Vector3(0,1.55,0));const dir=new THREE.Vector3(Math.sin(this.yaw),0,Math.cos(this.yaw));camera.position.lerp(target.clone().add(dir.multiplyScalar(-7)).add(new THREE.Vector3(0,3.3,0)),.18);camera.lookAt(target.clone().add(dir.multiplyScalar(25)).add(new THREE.Vector3(0,this.pitch*5,0)))}
 shoot(camera){if(this.reloading||this.cooldown>0)return;const w=this.weapon();if(this.ammo<=0){this.reload();return}this.ammo--;this.cooldown=w.rate/1000;this.save.data.stats.shots++;const origin=camera.position.clone(),dir=new THREE.Vector3();camera.getWorldDirection(dir);dir.x+=(Math.random()-.5)*w.spread;dir.y+=(Math.random()-.5)*w.spread;dir.z+=(Math.random()-.5)*w.spread;dir.normalize();const hits=new THREE.Raycaster(origin,dir,0,w.range).intersectObjects(this.scene.userData.enemyMeshes||[],true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.enemy)o=o.parent;if(o?.userData.enemy){this.save.data.stats.hits++;o.userData.enemy.takeDamage(w.damage)}}this.scene.userData.effects?.muzzle(origin,dir)}
 reload(){if(this.reloading||this.ammo>=this.weapon().mag||this.reserve<=0)return;this.reloading=true;setTimeout(()=>{const need=this.weapon().mag-this.ammo,take=Math.min(need,this.reserve);this.ammo+=take;this.reserve-=take;this.reloading=false},this.weapon().reload)}
 damage(amount){if(this.invuln>0)return;const absorbed=Math.min(this.armor,amount*.55);this.armor-=absorbed;this.health-=amount-absorbed;this.invuln=.25;if(this.health<=0)this.die()}
 die(){this.health=0;this.scene.userData.events?.emit('playerDead')}
 enterCar(car){if(this.inCar)return;this.inCar=true;this.car=car;this.group.visible=false;car.occupied=true;this.scene.userData.events?.emit('enterCar',car)}
 exitCar(){if(!this.inCar)return;const p=this.car.group.position.clone();p.x+=2.5;this.group.position.copy(p);this.group.visible=true;this.car.occupied=false;this.inCar=false;this.car=null}
 updateCar(dt,input,camera){const car=this.car;if(input.exit){this.exitCar();return}car.drive(dt,input);camera.position.lerp(car.group.position.clone().add(new THREE.Vector3(0,4,-9).applyAxisAngle(new THREE.Vector3(0,1,0),car.heading)),.1);camera.lookAt(car.group.position.clone().add(new THREE.Vector3(0,1,5)));if(input.fire)this.shoot(camera)}
}
export class Vehicle{
 constructor(scene,world,type,x,z){this.scene=scene;this.world=world;this.type=type;this.spec=VEHICLES[type];this.group=new THREE.Group();this.group.position.set(x,.8,z);scene.add(this.group);this.body=meshBox(this.spec.color,2.1,.65,4.1);this.body.position.y=.75;this.group.add(this.body);const cabin=meshBox(0x10141f,1.65,.7,1.9);cabin.position.set(0,1.25,-.15);this.group.add(cabin);for(const sx of[-1,1])for(const sz of[-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.22,12),new THREE.MeshStandardMaterial({color:0x050507,roughness:.8}));w.rotation.z=Math.PI/2;w.position.set(sx*1.08,.45,sz*1.35);this.group.add(w)}this.heading=0;this.velocity=0;this.health=this.spec.health;this.occupied=false;this.group.userData.vehicle=this}
 drive(dt,input){const s=this.spec;this.velocity+=input.forward*s.accel*dt;this.velocity-=input.brake*s.brake*dt;this.velocity*=Math.pow(.22,dt);this.velocity=THREE.MathUtils.clamp(this.velocity,-s.topSpeed*.35,s.topSpeed);const steer=input.strafe*(1-Math.min(Math.abs(this.velocity)/s.topSpeed,.8))*s.handling;this.heading+=steer*dt*(this.velocity>=0?1:-1);const dir=new THREE.Vector3(Math.sin(this.heading),0,Math.cos(this.heading));const next=this.group.position.clone().addScaledVector(dir,this.velocity*dt);if(!this.world.isBlocked(next,1.3))this.group.position.copy(next);else this.velocity*=-.25;this.group.rotation.y=this.heading}
 damage(n){this.health-=n;if(this.health<=0)this.destroy()}
 destroy(){this.health=0;this.occupied=false;this.scene.userData.events?.emit('vehicleDestroyed',this)}
}
export class Enemy{
 constructor(scene,world,player,x,z,kind='gang'){this.scene=scene;this.world=world;this.player=player;this.kind=kind;this.group=new THREE.Group();scene.add(this.group);this.group.position.set(x,0,z);const color=kind==='boss'?0x9b173f:kind==='police'?0x315cff:0x7d173b;const body=meshBox(color,.9,1.6,.7);body.position.y=.85;body.userData.enemy=this;this.group.add(body);this.mesh=body;this.hp=kind==='boss'?650:kind==='police'?120:90;this.maxHp=this.hp;this.speed=kind==='boss'?3.5:kind==='police'?3.4:2.5+Math.random()*1.4;this.fire=0;this.state='idle';this.dead=false;this.cover=this.group.position.clone()}
 update(dt){if(this.dead)return;const p=this.player.inCar?this.player.car.group.position:this.player.group.position;const d=this.group.position.distanceTo(p);if(d<85)this.state='chase';if(this.state!=='chase')return;const dir=p.clone().sub(this.group.position);dir.y=0;if(dir.length()>11){dir.normalize();const next=this.group.position.clone().addScaledVector(dir,this.speed*dt);if(!this.world.isBlocked(next,.6))this.group.position.copy(next)}this.group.lookAt(p.x,this.group.position.y,p.z);this.fire-=dt;if(d<42&&this.fire<=0){this.fire=this.kind==='police'?.65:.8+Math.random()*.7;this.player.damage(this.kind==='boss'?15:this.kind==='police'?7:5)}}
 takeDamage(n){if(this.dead)return;this.hp-=n;this.scene.userData.effects?.hit(this.group.position);if(this.hp<=0)this.kill()}
 kill(){if(this.dead)return;this.dead=true;this.group.visible=false;this.scene.userData.events?.emit('enemyKilled',this);this.scene.userData.enemyMeshes=(this.scene.userData.enemyMeshes||[]).filter(m=>m!==this.mesh)}
}
export class EnemyManager{
 constructor(scene,world,player){this.scene=scene;this.world=world;this.player=player;this.enemies=[]}
 spawn(x,z,kind='gang'){const e=new Enemy(this.scene,this.world,this.player,x,z,kind);this.enemies.push(e);return e}
 spawnWave(n,center,spread=45,boss=false){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=12+Math.random()*spread;this.spawn(center.x+Math.cos(a)*r,center.z+Math.sin(a)*r,boss&&i===n-1?'boss':'gang')}}
 spawnPolice(n,center){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=55+Math.random()*35;this.spawn(center.x+Math.cos(a)*r,center.z+Math.sin(a)*r,'police')}}
 update(dt){for(const e of this.enemies)e.update(dt);this.enemies=this.enemies.filter(e=>!e.dead)}
 clear(){for(const e of this.enemies)e.group.removeFromParent();this.enemies=[];this.scene.userData.enemyMeshes=[]}
}
export class MissionSystem{
 constructor(scene,world,player,save,enemies){this.scene=scene;this.world=world;this.player=player;this.save=save;this.enemies=enemies;this.active=null;this.kills=0;this.distance=0;this.startPos=new THREE.Vector3();this.lastPos=new THREE.Vector3()}
 canStart(m){return this.save.data.completed.length>=m.unlock}
 start(id){const m=getMission(id);if(!this.canStart(m))return false;this.active=m;this.kills=0;this.distance=0;this.startPos.copy(this.player.inCar?this.player.car.group.position:this.player.group.position);this.lastPos.copy(this.startPos);this.enemies.clear();if(['combat','boss'].includes(m.type))this.enemies.spawnWave(m.kills||12,this.startPos,45,m.type==='boss');if(m.type==='escape')this.player.save.data.wanted=m.stars||3;this.scene.userData.events?.emit('missionStarted',m);return true}
 update(dt){if(!this.active)return;const p=this.player.inCar?this.player.car.group.position:this.player.group.position;this.distance+=p.distanceTo(this.lastPos);this.lastPos.copy(p);this.save.data.stats.distance+=p.distanceTo(this.lastPos);const m=this.active;let done=false;if(['drive','delivery','race','escape'].includes(m.type))done=this.distance>=m.distance;if(['combat','boss'].includes(m.type))done=this.kills>=m.kills;if(m.type==='escape')done=this.distance>=m.distance&&this.player.save.data.wanted<=0;if(m.type==='endgame')done=this.save.data.completed.length>=6;if(done)this.complete()}
 onKill(){this.kills++}
 complete(){const m=this.active;this.save.complete(m.id,m.reward,m.xp);this.active=null;this.player.save.data.wanted=0;this.scene.userData.events?.emit('missionComplete',m)}
}
export class WantedSystem{
 constructor(player){this.player=player;this.stars=0;this.cool=0}
 add(n=1){this.stars=Math.min(5,this.stars+n);this.player.save.data.wanted=this.stars;this.cool=0}
 update(dt,enemies){this.cool-=dt;if(this.stars>0&&this.cool<=0&&enemies.length===0){this.stars=Math.max(0,this.stars-1);this.cool=12;this.player.save.data.wanted=this.stars}}
}
export class Effects{
 constructor(scene){this.scene=scene;this.particles=[]}
 burst(pos,color=0xff2bc2,count=20){for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.045,5,4),new THREE.MeshBasicMaterial({color}));m.position.copy(pos);m.userData.v=new THREE.Vector3((Math.random()-.5)*8,Math.random()*8,(Math.random()-.5)*8);m.userData.life=.35+Math.random()*.7;this.scene.add(m);this.particles.push(m)}}
 muzzle(pos,dir){this.burst(pos.clone().addScaledVector(dir,.5),0xffd34d,8)}
 hit(pos){this.burst(pos,0xff365e,7)}
 explosion(pos){this.burst(pos,0xff7b22,45);const l=new THREE.PointLight(0xff7b22,8,35);l.position.copy(pos);this.scene.add(l);setTimeout(()=>l.removeFromParent(),180)}
 update(dt){for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.userData.life-=dt;p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=14*dt;p.scale.multiplyScalar(.97);if(p.userData.life<=0){p.removeFromParent();this.particles.splice(i,1)}}}
}
