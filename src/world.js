import * as THREE from 'three';
import {DISTRICTS} from './content.js';
const MOBILE=!!window.__NEON_MOBILE__;
const mat=(c,r=.75,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
export class World{
 constructor(scene){this.scene=scene;this.root=new THREE.Group();scene.add(this.root);this.colliders=[];this.buildings=[];this.lamps=[];this.roads=[];this.seed=71237;this.streaming=true;this.buildQueue=[];this.generate()}
 rnd(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296}
 noise(x,z){const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n)}
 generate(){this.makeGround();this.makeRoadGrid();this.makeVillage();this.makeWater();for(let x=-1800;x<=1800;x+=58)for(let z=-1800;z<=1800;z+=58)this.buildQueue.push([x,z])}
 box(w,h,d,c,x,y,z,rough=.78,metal=.02){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,rough,metal));m.castShadow=false;m.receiveShadow=true;this.root.add(m);return m}
 makeGround(){const g=new THREE.PlaneGeometry(12000,12000,2,2);g.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(g,mat(0x67a84d,.98));mesh.position.y=-.04;mesh.receiveShadow=true;this.root.add(mesh)}
 makeRoadGrid(){const road=mat(0x3f454c,.9,.02),side=mat(0x777b80,.92),line=mat(0xf3e5a5,.7);for(let x=-1850;x<=1850;x+=82){const r=new THREE.Mesh(new THREE.BoxGeometry(22,.1,7400),road);r.position.set(x,.015,0);this.root.add(r);const s1=new THREE.Mesh(new THREE.BoxGeometry(2.5,.11,7400),side);s1.position.set(x-13,.02,0);this.root.add(s1);const s2=s1.clone();s2.position.x=x+13;this.root.add(s2);if(!MOBILE)for(let z=-3600;z<=3600;z+=45){const l=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,15),line);l.position.set(x,.08,z);this.root.add(l)}this.roads.push({x,z:0,angle:0,type:'vertical'})}for(let z=-1850;z<=1850;z+=82){const r=new THREE.Mesh(new THREE.BoxGeometry(7400,.1,22),road);r.position.set(0,.015,z);this.root.add(r);this.roads.push({x:0,z,angle:Math.PI/2,type:'horizontal'})}}
 makeVillage(){const houses=[[-38,-38,14,15,0xd9c49a,0xb95735],[38,-38,14,15,0xf0d5a2,0x4b78b9],[-38,38,14,15,0xc7d9a5,0x8b4d38],[38,38,14,15,0xe8cfae,0x6b4936],[-10,-48,12,13,0xd5c3a4,0x4f6b88],[10,48,12,13,0xe0cfad,0x80503b],[-55,0,12,13,0xc6d5df,0x3c607b],[55,0,12,13,0xd8bfa7,0x754738]];for(const [x,z,w,d,c,r] of houses){const h=6.5+this.rnd()*2.5,b=this.box(w,h,d,c,x,h/2,z,.85);this.colliders.push(new THREE.Box3().setFromObject(b));const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.7,3.6,4),mat(r,.9));roof.position.set(x,h+1.7,z);roof.rotation.y=Math.PI/4;this.root.add(roof)}}
 makeBuildings(limit=MOBILE?6:16){let made=0;while(this.buildQueue.length&&made<limit){const [x,z]=this.buildQueue.shift();const rx=Math.round(x/58)*58,rz=Math.round(z/58)*58;if(Math.abs(rx%82)<3||Math.abs(rz%82)<3)continue;if(Math.hypot(rx,rz)<75)continue;const d=this.closestDistrict(rx,rz);const h=5.5+Math.pow(this.rnd(),.78)*(d.level>=4?26:18);const w=34+this.rnd()*12,dep=34+this.rnd()*12;const colors=[0xd7dce3,0xc8d3d8,0xe0cdb5,0xb8c8d0,0xd9c3ce,0xcbd7c0];const c=colors[Math.floor(this.rnd()*colors.length)];const b=this.box(w,h,dep,c,rx,h/2,rz,.82,.03);this.buildings.push(b);this.colliders.push(new THREE.Box3().setFromObject(b));if(this.rnd()<.2){const sign=this.box(3,.75,.1,d.color,rx,h*.55,rz+dep/2+.07,.45,.25);sign.userData.shop=true}made++}}
 closestDistrict(x,z){let best=DISTRICTS[0],bd=Infinity;for(const d of DISTRICTS){const dx=x-d.center[0],dz=z-d.center[2],q=dx*dx+dz*dz;if(q<bd){bd=q;best=d}}return best}
 makeWater(){const g=new THREE.PlaneGeometry(350,300);g.rotateX(-Math.PI/2);const w=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x4c9bd1,roughness:.18,metalness:.25}));w.position.set(-720,-.03,-760);this.root.add(w)}
 getSpawn(){return new THREE.Vector3(0,1.2,0)}
 isBlocked(pos,r=1){const p=new THREE.Vector3(pos.x,1.2,pos.z);for(const b of this.colliders){const q=b.clone().expandByScalar(r);if(q.min.y>2.1||q.max.y<0)continue;if(q.containsPoint(p))return true}return false}
 districtAt(pos){return this.closestDistrict(pos.x,pos.z)}
 update(){if(this.buildQueue.length)this.makeBuildings(MOBILE?6:16);else this.streaming=false}
}
export function createSky(scene){const sky=new THREE.Mesh(new THREE.SphereGeometry(1800,MOBILE?8:16,MOBILE?4:8),new THREE.MeshBasicMaterial({color:0x9ed6ff,side:THREE.BackSide}));scene.add(sky);return sky}
