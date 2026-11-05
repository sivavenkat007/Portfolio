
(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // India clock is fixed to IST. Visitor clock follows their browser timezone. Both are 24-hour.
  const ist=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
  const istDate=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",weekday:"short",day:"2-digit",month:"short",year:"numeric"});
  const local=new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
  const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||"Your device timezone";
  if($("#visitorZone"))$("#visitorZone").textContent=zone;
  function clocks(){const now=new Date();if($("#istClock"))$("#istClock").textContent=ist.format(now);if($("#istDate"))$("#istDate").textContent=istDate.format(now);if($("#visitorClock"))$("#visitorClock").textContent=local.format(now);}
  clocks();window.setInterval(clocks,1000);

  // Seasonal ambience follows the Indian calendar, not live weather or visitor location.
  function monthIST(){const p=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",month:"numeric"}).formatToParts(new Date());return Number(p.find(x=>x.type==="month")?.value||new Date().getMonth()+1);}
  let currentSeason="autumn";
  function season(){const m=monthIST();const s=m>=3&&m<=5?"summer":m>=6&&m<=9?"monsoon":m===12||m<=2?"winter":"autumn";currentSeason=s;document.body.dataset.season=s;
    const labels={summer:"Summer light",monsoon:"Monsoon showers",winter:"Winter sparkle",autumn:"Autumn breeze"};
    const moods={summer:"A little warm. Toffee is looking for some shade.",monsoon:"A drizzle! Toffee found a leaf for shelter.",winter:"Brrr! Toffee is shaking off a few snowflakes.",autumn:"A few leaves are falling. Shall we explore?"};
    if($("#seasonText"))$("#seasonText").textContent=labels[s]+" · India";
    if($("#seasonBadge"))$("#seasonBadge").textContent=s.toUpperCase()+" / GARDEN";
    if($("#toffeeMood"))$("#toffeeMood").textContent=moods[s];
  }
  season();window.setInterval(season,60000);
  // Page-wide character movement is initialized after section anchors are collected.
  const toffeeSprite=$("#toffeeSprite");
  const sivaRoamer=$("#sivaRoamer");
  const toffeeRoamer=$("#monkeyGuide");
  let currentToffeePose=0;
  const toffeePoses=["walk","climb","swing","curious","idle"];
  const seasonalToffeePose={summer:"summer",monsoon:"rain",winter:"winter",autumn:"curious"};
  let sivaWanderStep=0;
  let toffeeWanderStep=0;

  // Scroll progress, current navigation highlight and Toffee's branch route.
  const ids=["home","about","highlights","experience","skills","projects","garage","arcade","education","contact"];
  const sections=ids.map(id=>document.getElementById(id)).filter(Boolean);
  // The characters travel between section waypoints across the entire site, not inside the hero.
  const sivaWaypoints=[
    {x:.075,y:.78},{x:.91,y:.79},{x:.075,y:.80},{x:.91,y:.79},{x:.075,y:.78},
    {x:.91,y:.80},{x:.075,y:.79},{x:.91,y:.78},{x:.075,y:.79},{x:.91,y:.78}
  ];
  const toffeeWaypoints=[
    {x:.91,y:.24},{x:.075,y:.30},{x:.91,y:.36},{x:.075,y:.25},{x:.91,y:.33},
    {x:.075,y:.40},{x:.91,y:.27},{x:.075,y:.34},{x:.91,y:.42},{x:.075,y:.29}
  ];
  const sivaDrift=[0,42,-22,34,-8];
  const toffeeDrift=[0,36,-32,23,-15];
  const toffeeLift=[0,-38,26,-24,18];
  function sectionRoute(waypoints, scrollY){
    if(!sections.length) return {x:waypoints[0].x,y:waypoints[0].y,dx:0};
    const tops=sections.map(section=>section.getBoundingClientRect().top+window.scrollY);
    const reference=scrollY+Math.min(window.innerHeight*.34,240);
    let index=0;
    while(index<tops.length-2 && reference>tops[index+1]) index++;
    const next=Math.min(index+1,waypoints.length-1);
    const span=Math.max(1,(tops[next]??(tops[index]+1))-tops[index]);
    const amount=Math.max(0,Math.min(1,(reference-tops[index])/span));
    const a=waypoints[Math.min(index,waypoints.length-1)];
    const b=waypoints[next]||a;
    return {x:a.x+(b.x-a.x)*amount,y:a.y+(b.y-a.y)*amount,dx:b.x-a.x};
  }
  function setWorldPosition(element, point, driftX, driftY, minY, maxY, size){
    if(!element) return;
    const width=window.innerWidth,height=window.innerHeight;
    const x=Math.max(size*.52,Math.min(width-size*.52,point.x*width+driftX));
    const y=Math.max(minY,Math.min(height-maxY,point.y*height+driftY));
    element.style.left=x+"px";
    element.style.top=y+"px";
  }
  function updateCharacterWorld(){
    const scrollY=window.scrollY||window.pageYOffset||0;
    const siva=sectionRoute(sivaWaypoints,scrollY);
    const toffee=sectionRoute(toffeeWaypoints,scrollY);
    const mobile=window.innerWidth<=640;
    setWorldPosition(sivaRoamer,siva,sivaDrift[sivaWanderStep],0,mobile?115:125,mobile?85:105,mobile?78:130);
    setWorldPosition(toffeeRoamer,toffee,toffeeDrift[toffeeWanderStep],toffeeLift[toffeeWanderStep],mobile?100:105,mobile?90:100,mobile?70:96);
    if(sivaRoamer) sivaRoamer.classList.toggle("faces-left",siva.dx<0);
    if(toffeeRoamer) toffeeRoamer.classList.toggle("faces-left",toffee.dx<0);
  }
  function animateToffee(){
    if(!toffeeSprite)return;
    const pose=currentToffeePose%6===5?seasonalToffeePose[currentSeason]:toffeePoses[currentToffeePose%5];
    toffeeSprite.className="toffee-sprite pose-"+pose;
    currentToffeePose++;
  }
  function wanderCharacters(){
    sivaWanderStep=(sivaWanderStep+1)%sivaDrift.length;
    toffeeWanderStep=(toffeeWanderStep+1)%toffeeDrift.length;
    updateCharacterWorld();
    animateToffee();
  }
  animateToffee();
  updateCharacterWorld();
  window.setInterval(wanderCharacters,2600);

  const links=$$("#primary-navigation a[href^='#']");
  let active="home";
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){active=entry.target.id;links.forEach(a=>a.classList.toggle("is-current",a.getAttribute("href")==="#"+active));}}),{rootMargin:"-28% 0px -58% 0px",threshold:0});
    sections.forEach(s=>observer.observe(s));
  }
  const fill=$(".reading-progress span");
  let characterScrollPending=false;
  function requestCharacterUpdate(){
    if(characterScrollPending)return;
    characterScrollPending=true;
    window.requestAnimationFrame(()=>{updateCharacterWorld();characterScrollPending=false;});
  }
  window.addEventListener("scroll",requestCharacterUpdate,{passive:true});
  window.addEventListener("resize",requestCharacterUpdate);
  window.addEventListener("load",requestCharacterUpdate);
  window.addEventListener("pageshow",requestCharacterUpdate);

  let pending=false;
  function updateScroll(){const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight),pct=Math.max(0,Math.min(1,window.scrollY/max));if(fill)fill.style.width=(pct*100)+"%";pending=false;}
  window.addEventListener("scroll",()=>{if(!pending){requestAnimationFrame(updateScroll);pending=true;}},{passive:true});
  window.addEventListener("resize",updateScroll);window.addEventListener("load",updateScroll);updateScroll();
  const monkey=$("#monkeyGuide");
  const bubble=$("#monkeyBubble");
  function nextSection(){const i=sections.findIndex(s=>s.id===active),target=sections[Math.min(Math.max(0,i)+1,sections.length-1)];if(target)target.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});}
  if(monkey&&bubble){monkey.addEventListener("click",()=>{bubble.hidden=!bubble.hidden;});$("#monkeyNext")?.addEventListener("click",()=>{bubble.hidden=true;nextSection();});document.addEventListener("click",e=>{if(!bubble.hidden&&!bubble.contains(e.target)&&!monkey.contains(e.target))bubble.hidden=true;});}

  // Skill group highlighting.
  const cards=$$(".skills-grid .skill-card"),filters=$$(".skill-filter");
  function category(card){const t=card.innerText.toLowerCase();if(/claude|mcp|ai-assisted/.test(t))return"ai";if(/jenkins|github actions|gitlab ci|artifactory/.test(t)||t.includes("ci/cd"))return"cicd";if(/pytest|playwright|robot framework|appium|selenium|automation/.test(t))return"automation";if(/docker|podman|linux|windows|macos|vmware|operating systems/.test(t))return"platforms";if(/rest api|backend|database|mysql|mongodb|api integration/.test(t))return"backend";return"python";}
  cards.forEach(c=>c.dataset.skillCategory=category(c));
  filters.forEach(btn=>btn.addEventListener("click",()=>{const f=btn.dataset.skillFilter;filters.forEach(b=>b.classList.toggle("is-active",b===btn));cards.forEach(c=>{const match=f==="all"||c.dataset.skillCategory===f;c.classList.toggle("is-dimmed",!match);c.classList.toggle("is-highlighted",match&&f!=="all");});}));

  // Counter badge fallback: other features don't depend on the counter provider.
  $("#visitCounter")?.addEventListener("error",()=>{const fallback=$("#visitCounterFallback");if(fallback)fallback.hidden=false;},{once:true});

  // Tic Tac Toe — two-player local game.
  const board=$("#ticBoard"),status=$("#ticStatus"),wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let cells=Array(9).fill(""),turn="X",finished=false;
  function result(){for(const line of wins){const a=line[0],b=line[1],c=line[2];if(cells[a]&&cells[a]===cells[b]&&cells[a]===cells[c])return cells[a];}return cells.every(Boolean)?"draw":null;}
  function drawBoard(){if(!board)return;board.innerHTML="";cells.forEach((v,i)=>{const b=document.createElement("button");b.type="button";b.className="tic-cell"+(v==="O"?" is-o":"");b.textContent=v;b.setAttribute("aria-label",v?("Cell "+(i+1)+", "+v):("Empty cell "+(i+1)));b.disabled=Boolean(v)||finished;b.addEventListener("click",()=>{if(finished||cells[i])return;cells[i]=turn;const r=result();if(r){finished=true;status.textContent=r==="draw"?"It's a draw. Nice game!":"Player "+r+" wins!";}else{turn=turn==="X"?"O":"X";status.textContent="Player "+turn+"'s turn";}drawBoard();});board.appendChild(b);});}
  function resetTic(){cells=Array(9).fill("");turn="X";finished=false;if(status)status.textContent="Player X's turn";drawBoard();}
  $("#ticReset")?.addEventListener("click",resetTic);resetTic();

  // Tetris Mini — lightweight 10 x 16 grid; its timer runs only while the game is active.
  const W=10,H=16,grid=$("#tetrisBoard"),scoreEl=$("#tetrisScore"),linesEl=$("#tetrisLines"),gameStatus=$("#tetrisStatus");
  const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
  let matrix=null,piece=null,timer=null,playing=false,score=0,lines=0,over=false;
  function empty(){return Array.from({length:H},()=>Array(W).fill(0));}
  function rotated(s){return s[0].map((_,i)=>s.map(row=>row[i]).reverse());}
  function hit(s,x,y){for(let r=0;r<s.length;r++)for(let c=0;c<s[r].length;c++)if(s[r][c]){const nx=x+c,ny=y+r;if(nx<0||nx>=W||ny>=H||(ny>=0&&matrix[ny][nx]))return true;}return false;}
  function stopGame(){playing=false;over=true;if(timer){clearInterval(timer);timer=null;}if(gameStatus)gameStatus.textContent="Game over — start a new round";}
  function spawn(){const s=shapes[Math.floor(Math.random()*shapes.length)].map(r=>r.slice());piece={s,x:Math.floor((W-s[0].length)/2),y:0};if(hit(s,piece.x,piece.y))stopGame();}
  function drawGrid(){if(!grid||!matrix)return;const d=matrix.map(r=>r.slice());if(piece)for(let r=0;r<piece.s.length;r++)for(let c=0;c<piece.s[r].length;c++)if(piece.s[r][c]){const y=piece.y+r,x=piece.x+c;if(y>=0&&y<H&&x>=0&&x<W)d[y][x]=2;}grid.innerHTML="";d.forEach(row=>row.forEach(v=>{const cell=document.createElement("span");cell.className="tetris-cell"+(v===1?" filled":v===2?" active-piece":"");grid.appendChild(cell);}));if(scoreEl)scoreEl.textContent=String(score);if(linesEl)linesEl.textContent=String(lines);}
  function resetTetris(){if(timer){clearInterval(timer);timer=null;}matrix=empty();piece=null;playing=false;over=false;score=0;lines=0;if(gameStatus)gameStatus.textContent="Ready when you are";drawGrid();}
  function lock(){for(let r=0;r<piece.s.length;r++)for(let c=0;c<piece.s[r].length;c++)if(piece.s[r][c]){const y=piece.y+r,x=piece.x+c;if(y>=0&&y<H)matrix[y][x]=1;}let count=0;matrix=matrix.filter(row=>{if(row.every(Boolean)){count++;return false;}return true;});while(matrix.length<H)matrix.unshift(Array(W).fill(0));if(count){lines+=count;score+=[0,100,300,500,800][count]||count*200;}spawn();drawGrid();}
  function move(dx,dy){if(!playing||!piece)return false;if(!hit(piece.s,piece.x+dx,piece.y+dy)){piece.x+=dx;piece.y+=dy;drawGrid();return true;}if(dy>0)lock();return false;}
  function rotate(){if(!playing||!piece)return;const s=rotated(piece.s);if(!hit(s,piece.x,piece.y))piece.s=s;else if(!hit(s,piece.x-1,piece.y)){piece.x--;piece.s=s;}else if(!hit(s,piece.x+1,piece.y)){piece.x++;piece.s=s;}drawGrid();}
  function drop(){if(!playing||!piece)return;while(!hit(piece.s,piece.x,piece.y+1))piece.y++;lock();}
  function tick(){if(playing)move(0,1);}
  function start(){if(playing)return;if(over||!matrix)resetTetris();if(!piece)spawn();playing=true;if(gameStatus)gameStatus.textContent="In play · arrows to move";drawGrid();if(timer)clearInterval(timer);timer=window.setInterval(tick,440);}
  function pause(){if(!playing)return;playing=false;if(timer){clearInterval(timer);timer=null;}if(gameStatus)gameStatus.textContent="Paused";}
  $("#tetrisStart")?.addEventListener("click",start);$("#tetrisPause")?.addEventListener("click",pause);
  $$("[data-tetris]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.tetris;if(a==="left")move(-1,0);else if(a==="right")move(1,0);else if(a==="down")move(0,1);else if(a==="rotate")rotate();else if(a==="drop")drop();}));
  document.addEventListener("keydown",e=>{if(!playing||$("#tetrisPanel")?.hidden)return;if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," "].includes(e.key))e.preventDefault();if(e.key==="ArrowLeft")move(-1,0);else if(e.key==="ArrowRight")move(1,0);else if(e.key==="ArrowDown")move(0,1);else if(e.key==="ArrowUp")rotate();else if(e.key===" ")drop();});
  resetTetris();

  // Open one game at a time. Tetris starts only after the visitor presses Start.
  const stage=$("#gameStage"),ticPanel=$("#ticPanel"),tetrisPanel=$("#tetrisPanel");
  function openGame(which){if(!stage)return;const tic=which==="tic";if(tic)pause();stage.hidden=false;ticPanel.hidden=!tic;tetrisPanel.hidden=tic;$("#gameTitle").textContent=tic?"Tic Tac Toe":"Tetris Mini";stage.scrollIntoView({behavior:reduced?"auto":"smooth",block:"nearest"});if(!tic)resetTetris();}
  $$("[data-open-game]").forEach(b=>b.addEventListener("click",()=>openGame(b.dataset.openGame)));
  $("#closeGame")?.addEventListener("click",()=>{stage.hidden=true;pause();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();});
})();
