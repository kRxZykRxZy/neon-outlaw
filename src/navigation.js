import * as THREE from 'three';

const $=id=>document.getElementById(id);
let game=null,marker=null,ring=null,arrow=null,lastMission=null,lastHint='';
const targetFor=(m)=>{
  if(!game||!m)return null;
  if(['combat','boss'].includes(m.type)){
    const e=game.enemies?.enemies?.find(x=>!x.dead);
    if(e)return e.group.position;
  }
  const d=game.world?.districtAt?.(game.player.group.position);
  const target=game.world?.closestDistrict?.bind(game.world);
  if(game.world&&m.district){
    const districts=game.world.scene.userData.districts;
  }
  const centers={dock:[-520,0,-420],market:[0,0,-420],midtown:[460,0,-80],old:[-430,0,340],corporate:[350,0,430],outskirts:[-20,0,850]};
  const p=centers[m.district]||[0,0,0];
  return new THREE.Vector3(p[0],1.2,p[2]);
};
function setup(){
 if(!game||marker)return;
 marker=new THREE.Group();
 const mat=new THREE.MeshBasicMaterial({color:0xffd43d,transparent:true,opacity:.9,depthWrite:false});
 const geo=new THREE.TorusGeometry(3.5,.35,8,20);
 ring=new THREE.Mesh(geo,mat);ring.rotation.x=Math.PI/2;marker.add(ring);
 arrow=new THREE.Mesh(new THREE.ConeGeometry(1.5,3.5,4),mat);arrow.position.y=4;marker.add(arrow);
 game.scene.add(marker);
}
function ensureUI(){
 if($('nav-hint'))return;
 const hint=document.createElement('div');hint.id='nav-hint';hint.className='nav-hint';document.body.appendChild(hint);
 const arrowUI=document.createElement('div');arrowUI.id='nav-arrow';arrowUI.className='nav-arrow';arrowUI.textContent='➤';document.body.appendChild(arrowUI);
}
function update(){
 game=window.game;if(!game||!game.ready||!game.player||!game.missions)return;
 setup();ensureUI();
 const m=game.missions.active;
 if(!m){marker.visible=false;$('nav-hint').textContent='FREE ROAM — explore Neon City';$('nav-arrow').style.display='none';return}
 const t=targetFor(m);if(!t)return;
 marker.visible=true;marker.position.copy(t);marker.position.y=0.15;marker.rotation.y+=.025;
 const p=game.player.inCar?game.player.car.group.position:game.player.group.position;
 const dist=p.distanceTo(t);
 const dx=t.x-p.x,dz=t.z-p.z;
 const worldAngle=Math.atan2(dx,dz);
 const rel=worldAngle-game.player.yaw;
 const deg=((rel*180/Math.PI+540)%360)-180;
 const a=$('nav-arrow');a.style.display='block';a.style.transform='translateX(-50%) rotate('+deg+'deg)';
 let hint='Follow the yellow checkpoint';
 if(dist<8)hint=m.type==='combat'||m.type==='boss'?'TARGET AREA — take them down':'CHECKPOINT REACHED';
 else if(Math.abs(deg)>115)hint='Turn around — checkpoint is behind you';
 else if(Math.abs(deg)>35)hint=deg<0?'Turn left toward the arrow':'Turn right toward the arrow';
 else hint='Go straight — follow the arrow';
 if(m.type==='combat'||m.type==='boss')hint=dist<8?'TARGET AREA — eliminate the enemies':'Follow the arrow to the target area';
 $('nav-hint').textContent=hint+(dist>=8?' • '+Math.round(dist)+'m':'');
}
setInterval(update,120);
