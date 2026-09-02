export const WEAPONS={pistol:{name:'SIDEARM',damage:24,rate:360,mag:12,reload:900,spread:.018,range:90,price:0},smg:{name:'VOLT SMG',damage:14,rate:95,mag:32,reload:1100,spread:.035,range:75,price:3200},shotgun:{name:'BREACHER',damage:70,rate:760,mag:6,reload:1200,spread:.18,range:35,price:6800},rifle:{name:'AR-9',damage:31,rate:150,mag:30,reload:1300,spread:.012,range:130,price:12500},rail:{name:'RAIL DRIVER',damage:160,rate:1300,mag:4,reload:1800,spread:.004,range:240,price:28000}};
export const VEHICLES={runner:{name:'NOVA RUNNER',price:0,topSpeed:42,accel:18,brake:28,handling:3.2,health:800,color:0x20eaff},viper:{name:'VIPER GT',price:9000,topSpeed:58,accel:24,brake:34,handling:3.8,health:850,color:0xff267e},phantom:{name:'PHANTOM XR',price:24000,topSpeed:72,accel:30,brake:38,handling:4.4,health:1000,color:0x9b5cff},titan:{name:'TITAN ARMORED',price:50000,topSpeed:43,accel:15,brake:25,handling:2.5,health:2400,color:0x657080},specter:{name:'SPECTER',price:85000,topSpeed:84,accel:36,brake:45,handling:5.2,health:1100,color:0x65ffb3}};
export const DISTRICTS=[
{id:'dock',name:'BLACKWATER DOCKS',center:[-220,0,-180],radius:250,level:1,color:0x00b9d8},
{id:'market',name:'NEON MARKET',center:[0,0,-180],radius:240,level:2,color:0xff2bc2},
{id:'midtown',name:'MIDTOWN',center:[220,0,-80],radius:280,level:3,color:0x9b5cff},
{id:'old',name:'OLD QUARTER',center:[-210,0,190],radius:260,level:4,color:0xff8d36},
{id:'corporate',name:'ZENITH DISTRICT',center:[190,0,190],radius:300,level:5,color:0x63ffb4},
{id:'outskirts',name:'THE OUTSKIRTS',center:[0,0,390],radius:340,level:6,color:0xffd43d}];
export const MISSIONS=[
{id:'m01',chapter:1,title:'FIRST NIGHT',district:'dock',type:'drive',brief:'Meet Jax in the city square.',reward:900,xp:100,unlock:0,target:'Jax',distance:80},
{id:'m02',chapter:1,title:'NO QUESTIONS',district:'dock',type:'combat',brief:'Clear the nearby warehouse before the shipment moves.',reward:1600,xp:180,unlock:1,target:'Enemies',kills:8},
{id:'m03',chapter:1,title:'HOT PACKAGE',district:'market',type:'delivery',brief:'Steal the runner and deliver it to the safehouse.',reward:2100,xp:240,unlock:2,target:'Safehouse'},
{id:'m04',chapter:1,title:'TIDE TURNER',district:'dock',type:'combat',brief:'Take the docks from the Red Vultures.',reward:2800,xp:300,unlock:3,target:'Enemies',kills:14},
{id:'m05',chapter:1,title:'NIGHT SHIFT',district:'market',type:'drive',brief:'Get across Neon Market before the gates close.',reward:3200,xp:360,unlock:4,target:'Checkpoint',distance:260},
{id:'m06',chapter:1,title:'STATIC',district:'market',type:'combat',brief:'Disable the surveillance vans.',reward:4000,xp:450,unlock:5,target:'Vans',kills:6},
{id:'m07',chapter:1,title:'DEBT COLLECTOR',district:'market',type:'combat',brief:'Convince three collectors to stop working.',reward:4700,xp:500,unlock:6,target:'Collectors',kills:10},
{id:'m08',chapter:1,title:'REDLINE',district:'market',type:'race',brief:'Beat the Vultures to the elevated highway.',reward:5200,xp:600,unlock:7,target:'Race',distance:700},
{id:'m09',chapter:2,title:'CITY OF GLASS',district:'midtown',type:'combat',brief:'Crash the Meridian security operation.',reward:7000,xp:750,unlock:8,target:'Security',kills:18},
{id:'m10',chapter:2,title:'CLEAN EXIT',district:'midtown',type:'escape',brief:'Lose the police after the Midtown robbery.',reward:7800,xp:820,unlock:9,target:'Wanted',stars:3,distance:600},
{id:'m11',chapter:2,title:'BLACK LEDGER',district:'midtown',type:'delivery',brief:'Take the ledger to the fixer without being scanned.',reward:9000,xp:950,unlock:10,target:'Fixer'},
{id:'m12',chapter:2,title:'BURN NOTICE',district:'midtown',type:'combat',brief:'Destroy the corporate relay towers.',reward:10500,xp:1100,unlock:11,target:'Relays',kills:12},
{id:'m13',chapter:2,title:'GLASS JAW',district:'old',type:'combat',brief:'Fight through the underground arena.',reward:12000,xp:1250,unlock:12,target:'Arena',kills:24},
{id:'m14',chapter:2,title:'OLD BLOOD',district:'old',type:'drive',brief:'Find the original safehouse in the Old Quarter.',reward:13500,xp:1350,unlock:13,target:'Safehouse',distance:600},
{id:'m15',chapter:2,title:'FAMILY BUSINESS',district:'old',type:'combat',brief:'End the feud with the Kings.',reward:16000,xp:1500,unlock:14,target:'Kings',kills:28},
{id:'m16',chapter:3,title:'VERTIGO',district:'corporate',type:'drive',brief:'Reach Zenith Tower before sunrise.',reward:18000,xp:1700,unlock:15,target:'Tower',distance:900},
{id:'m17',chapter:3,title:'THE BOARD',district:'corporate',type:'combat',brief:'Break the private security ring.',reward:21000,xp:1900,unlock:16,target:'Guards',kills:35},
{id:'m18',chapter:3,title:'FIREWALL',district:'corporate',type:'delivery',brief:'Get the stolen access key to the tower hacker.',reward:23000,xp:2100,unlock:17,target:'Hacker'},
{id:'m19',chapter:3,title:'BLACKOUT',district:'corporate',type:'combat',brief:'Take down the city power relays.',reward:27000,xp:2400,unlock:18,target:'Relays',kills:30},
{id:'m20',chapter:3,title:'NO GODS',district:'corporate',type:'boss',brief:'Confront Director Vale at Zenith Tower.',reward:45000,xp:4000,unlock:19,target:'Vale',kills:1},
{id:'m21',chapter:4,title:'AFTERSHOCK',district:'outskirts',type:'escape',brief:'Survive the citywide manhunt.',reward:30000,xp:2600,unlock:20,target:'Wanted',stars:5,distance:1300},
{id:'m22',chapter:4,title:'GHOST ROAD',district:'outskirts',type:'race',brief:'Cross the freight highway in record time.',reward:33000,xp:2900,unlock:21,target:'Race',distance:1500},
{id:'m23',chapter:4,title:'LAST TRAIN',district:'outskirts',type:'combat',brief:'Hold the station until the train arrives.',reward:37000,xp:3200,unlock:22,target:'Waves',kills:45},
{id:'m24',chapter:4,title:'THE OUTLAW',district:'outskirts',type:'boss',brief:'Settle the score beneath the floodlights.',reward:60000,xp:5000,unlock:23,target:'Warden',kills:1},
{id:'m25',chapter:5,title:'CITY NEVER SLEEPS',district:'midtown',type:'endgame',brief:'Take control of every district.',reward:100000,xp:10000,unlock:24,target:'Districts',kills:100}];
export const DIALOGUE={Jax:['You look lost.','Good. Lost people ask fewer questions.','The city is changing. We change faster.'],Vale:['You mistake noise for power.','Every street has a price.','You cannot buy the whole city.','But I can make you pay for it.'],Warden:['Run.','That is what outlaws do.','Let us see how far you get.']};
export const LOOT=[{name:'Cash Roll',value:250,weight:50},{name:'Encrypted Chip',value:600,weight:24},{name:'Gold Watch',value:1200,weight:12},{name:'Prototype Cell',value:3000,weight:7},{name:'Black Diamond',value:7500,weight:3},{name:'Unknown Key',value:15000,weight:1}];
export function getMission(id){return MISSIONS.find(m=>m.id===id)||MISSIONS[0]}
export function districtFor(x,z){let best=DISTRICTS[0],bd=Infinity;for(const d of DISTRICTS){const dx=x-d.center[0],dz=z-d.center[2],v=dx*dx+dz*dz;if(v<bd){bd=v;best=d}}return best}
export function weightedLoot(){let total=LOOT.reduce((s,x)=>s+x.weight,0),r=Math.random()*total;for(const x of LOOT){r-=x.weight;if(r<=0)return x}return LOOT[0]}
