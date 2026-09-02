import * as THREE from 'three';
import {DISTRICTS} from './content.js';
const MOBILE=!!window.__NEON_MOBILE__;
const mat=(c,r=.75,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
export class World{
 constructor(scene){this.scene=scene;this.root=new THREE.Group();scene.add(this.root);this.colliders=[];this.buildings=[];this.lamps=[];this.roads=[];this.seed=71237;this.buildQueue=[];this.generate()}
 rnd(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296}
 noise(x,z){const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n)}
 generate(){this.makeGround();this.makeRoadGrid();this.makeVillage();this.makeWater();for(let x=-900;x<=900;x+=42)for(let z=-900;z<=900;z+=42)this.buildQueue.push([x,z])}
 box(w,h,d,c,x,y,z,rough=.78,metal=.02){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,rough,metal));m.receiveShadow=true;this.root.add(m);return m}
 makeGround(){const g=new THREE.PlaneGeometry(7000,7000);g.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(g,mat(0x526a4b,.99));mesh.position.y=-.08;mesh.receiveShadow=true;this.root.add(mesh)}
 makeRoadGrid(){const road=mat(0x25282d,.94,.04),side=mat(0x6f7478,.96),line=mat(0xd8d8c8,.75);for(let x=-900;x<=900;x+=84){const r=new THREE.Mesh(new THREE.BoxGeometry(24,.16,1900),road);r.position.set(x,.03,0);this.root.add(r);for(const sx of [x-14,x+14]){const s=new THREE.Mesh(new THREE.BoxGeometry(2.2,.18,1900),side);s.position.set(sx,.05,0);this.root.add(s)}if(!MOBILE)for(let z=-900;z<=900;z+=48){const l=new THREE.Mesh(new THREE.BoxGeometry(.5,.19,14),line);l.position.set(x,.11,z);this.root.add(l)}this.roads.push({x,z:0,angle:0,type:'vertical'})}for(let z=-900;z<=900;z+=84){const r=new THREE.Mesh(new THREE.BoxGeometry(1900,.16,24),road);r.position.set(0,.03,z);this.root.add(r);for(const sz of [z-14,z+14]){const s=new THREE.Mesh(new THREE.BoxGeometry(1900,.18,2.2),side);s.position.set(0,.05,sz);this.root.add(s)}if(!MOBILE)for(let x=-900;x<=900;x+=48){const l=new THREE.Mesh(new THREE.BoxGeometry(14,.19,.5),line);l.position.set(x,.11,z);this.root.add(l)}this.roads.push({x:0,z,angle:Math.PI/2,type:'horizontal'})}}
 makeVillage(){const houses=[[-27,-27,20,20,0xd9c49a,0xb95735],[27,-27,20,20,0xf0d5a2,0x4b78b9],[-27,27,20,20,0xc7d9a5,0x8b4d38],[27,27,20,20,0xe8cfae,0x6b4936]];for(const [x,z,w,d,c,r] of houses){const h=6.5+this.rnd()*2.5,b=this.box(w,h,d,c,x,h/2,z,.85);this.colliders.push(new THREE.Box3().setFromObject(b));const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.7,3.6,4),mat(r,.9));roof.position.set(x,h+1.7,z);roof.rotation.y=Math.PI/4;this.root.add(roof)}}
 makeBuildings(limit=MOBILE?5:18){let made=0;while(this.buildQueue.length&&made<limit){const [x,z]=this.buildQueue.shift();if(Math.abs(x)<55&&Math.abs(z)<55)continue;if(Math.abs(x%84)<5||Math.abs(z%84)<5)continue;const d=this.closestDistrict(x,z);const h=6+Math.pow(this.rnd(),.7)*(d.level>=4?30:20);const w=32+this.rnd()*8,dep=32+this.rnd()*8;const colors=[0xaeb8c0,0xc8c2b9,0x9eaab3,0xd2c7bb,0xb7c4cc,0x8f9ba4];const c=colors[Math.floor(this.rnd()*colors.length)];const b=this.box(w,h,dep,c,x,h/2,z,.82,.04);this.buildings.push(b);this.colliders.push(new THREE.Box3().setFromObject(b));if(this.rnd()<.12){const sign=this.box(3,.75,.1,d.color,x,h*.55,z+dep/2+.07,.45,.25);sign.userData.shop=true}made++}}
 closestDistrict(x,z){let best=DISTRICTS[0],bd=Infinity;for(const d of DISTRICTS){const dx=x-d.center[0],dz=z-d.center[2],q=dx*dx+dz*dz;if(q<bd){bd=q;best=d}}return best}
 makeWater(){const g=new THREE.PlaneGeometry(350,300);g.rotateX(-Math.PI/2);const w=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x4c9bd1,roughness:.18,metalness:.25}));w.position.set(-720,-.05,-760);this.root.add(w)}
 getSpawn(){return new THREE.Vector3(0,1.2,0)}
 isBlocked(pos,r=1){const p=new THREE.Vector3(pos.x,1.2,pos.z);for(const b of this.colliders){const q=b.clone().expandByScalar(r);if(q.min.y>2.1||q.max.y<0)continue;if(q.containsPoint(p))return true}return false}
 districtAt(pos){return this.closestDistrict(pos.x,pos.z)}
 update(){if(this.buildQueue.length)this.makeBuildings(MOBILE?5:18)}
}
export function createSky(scene){const sky=new THREE.Mesh(new THREE.SphereGeometry(1800,MOBILE?8:16,MOBILE?4:8),new THREE.MeshBasicMaterial({color:0x87bdf0,side:THREE.BackSide}));scene.add(sky);return sky}
