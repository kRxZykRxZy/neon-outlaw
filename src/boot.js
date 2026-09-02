window.__NEON_OUTLAW_SCRIPT_STARTED=true;
const loadText=document.getElementById('load-text');
const showError=(label,error)=>{console.error('Neon Outlaw load error:',label,error);if(loadText)loadText.textContent='MODULE LOAD ERROR — '+label+' — '+(error?.message||error||'CHECK CONSOLE')};
const modules=[['Three.js','https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'],['content','./content.js?v=20260902-3'],['world','./world.js?v=20260902-3'],['systems','./systems.js?v=20260902-3'],['traffic','./traffic.js?v=20260902-3']];
(async()=>{for(const [name,url] of modules){try{await import(url)}catch(e){showError(name,e);return}}try{await import('./main.js?v=20260902-3')}catch(e){showError('main.js',e)}})();
