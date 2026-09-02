(function(){
  var coarse=window.matchMedia&&window.matchMedia('(pointer: coarse)').matches;
  var narrow=window.innerWidth<=900;
  if(!coarse&&!narrow)return;
  document.documentElement.classList.add('mobile-mode');
  function setKey(code,on){var g=window.game;if(g&&g.input)g.input.keys[code]=on}
  function setMouse(on){var g=window.game;if(g&&g.input)g.input.keys.Mouse0=on}
  var stick=document.getElementById('touch-stick');
  var knob=document.getElementById('touch-knob');
  var stickId=null,cx=0,cy=0;
  function moveStick(x,y){
    var dx=x-cx,dy=y-cy,max=47,len=Math.sqrt(dx*dx+dy*dy);
    if(len>max){dx=dx/len*max;dy=dy/len*max}
    knob.style.transform='translate('+dx+'px,'+dy+'px)';
    setKey('KeyA',dx<-14);setKey('KeyD',dx>14);setKey('KeyW',dy<-14);setKey('KeyS',dy>14);
  }
  function resetStick(){knob.style.transform='translate(0,0)';setKey('KeyA',false);setKey('KeyD',false);setKey('KeyW',false);setKey('KeyS',false)}
  if(stick){
    stick.addEventListener('touchstart',function(e){e.preventDefault();var t=e.changedTouches[0];stickId=t.identifier;var r=stick.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;moveStick(t.clientX,t.clientY)},{passive:false});
    stick.addEventListener('touchmove',function(e){e.preventDefault();for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];if(t.identifier===stickId)moveStick(t.clientX,t.clientY)}},{passive:false});
    stick.addEventListener('touchend',function(e){for(var i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===stickId){stickId=null;resetStick()}},{passive:false});
    stick.addEventListener('touchcancel',resetStick,{passive:true});
  }
  document.querySelectorAll('[data-touch-key]').forEach(function(b){
    var code=b.getAttribute('data-touch-key');
    function down(e){e.preventDefault();setKey(code,true)}
    function up(e){e.preventDefault();setKey(code,false)}
    b.addEventListener('touchstart',down,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});
  });
  document.querySelectorAll('[data-touch-fire]').forEach(function(b){
    function down(e){e.preventDefault();setMouse(true)}function up(e){e.preventDefault();setMouse(false)}
    b.addEventListener('touchstart',down,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});
  });
  var look=document.getElementById('touch-look');var lookId=null,lx=0,ly=0;
  if(look){
    look.addEventListener('touchstart',function(e){var t=e.changedTouches[0];lookId=t.identifier;lx=t.clientX;ly=t.clientY},{passive:true});
    look.addEventListener('touchmove',function(e){
      for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];if(t.identifier!==lookId)continue;
        var g=window.game;if(g&&g.input){g.input.lookX+=(t.clientX-lx)*1.7;g.input.lookY+=(t.clientY-ly)*1.7}lx=t.clientX;ly=t.clientY;
      }
    },{passive:true});
    look.addEventListener('touchend',function(e){for(var i=0;i<e.changedTouches.length;i++)if(e.changedTouches[i].identifier===lookId)lookId=null},{passive:true});
  }
  window.addEventListener('resize',function(){if(window.innerWidth>900&&!window.matchMedia('(pointer: coarse)').matches)document.documentElement.classList.remove('mobile-mode')});
})();