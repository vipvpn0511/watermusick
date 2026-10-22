(()=>{'use strict';
const $=id=>document.getElementById(id),audio=$('audio'),file=$('file'),drop=$('drop'),bars=$('visualizer');
let playlist=[],index=-1,audioCtx=null,analyser=null,source=null,raf=0,objectUrl=null;
for(let i=0;i<37;i++){const b=document.createElement('i');bars.appendChild(b)}
const fmt=t=>{if(!Number.isFinite(t)||t<0)t=0;return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')};
function status(s){$('status').textContent=s}
function updateTrack(){const f=playlist[index];$('trackName').textContent=f?f.name.replace(/\.[^.]+$/,''):'آهنگی انتخاب نشده';$('trackArtist').textContent=f?'فایل محلی دستگاه':'یک فایل موسیقی انتخاب کن';}
function load(i,autoplay=false){if(!playlist.length)return;index=(i+playlist.length)%playlist.length;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(playlist[index]);audio.src=objectUrl;audio.load();updateTrack();$('seek').value=0;if(autoplay)audio.play().then(setPlaying).catch(()=>status('برای پخش دوباره لمس کن'))}
function setPlaying(){const p=!audio.paused;$('playSymbol').textContent=p?'Ⅱ':'▶';$('play').textContent=p?'Ⅱ':'▶';drop.classList.toggle('playing',p);status(p?'در حال پخش':'پخش متوقف است');if(p)startVisual()}
function choose(){file.click()}
file.addEventListener('change',()=>{const chosen=[...file.files].filter(f=>f.type.startsWith('audio/')||/\.(mp3|m4a|aac|wav|ogg|flac|opus)$/i.test(f.name));if(!chosen.length)return;playlist=chosen;load(0,true);status(playlist.length>1?`${playlist.length} آهنگ انتخاب شد`:'آهنگ انتخاب شد');file.value=''});
$('pick').onclick=choose;$('pickTop').onclick=choose;$('play').onclick=async()=>{if(!audio.src){choose();return}try{if(audio.paused)await audio.play();else audio.pause();setPlaying()}catch(e){status('امکان پخش این فایل وجود ندارد')}};
drop.addEventListener('click',()=>{drop.classList.add('touched');setTimeout(()=>drop.classList.remove('touched'),220);if(!audio.src){choose();return}if(audio.paused)audio.play().then(setPlaying).catch(()=>{});else{audio.pause();setPlaying()}});
$('next').onclick=()=>load(index+1,true);$('prev').onclick=()=>{if(audio.currentTime>3){audio.currentTime=0;return}load(index-1,true)};
audio.addEventListener('play',()=>{setPlaying();try{if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();analyser=audioCtx.createAnalyser();analyser.fftSize=128;source=audioCtx.createMediaElementSource(audio);source.connect(analyser);analyser.connect(audioCtx.destination)}if(audioCtx.state==='suspended')audioCtx.resume()}catch(e){}});
audio.addEventListener('pause',setPlaying);audio.addEventListener('ended',()=>{if(index<playlist.length-1)load(index+1,true);else setPlaying()});
audio.addEventListener('timeupdate',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)$('seek').value=audio.currentTime/audio.duration*1000;$('current').textContent=fmt(audio.currentTime);$('duration').textContent=fmt(audio.duration)});
$('seek').addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number($('seek').value)/1000*audio.duration});
function startVisual(){if(raf)cancelAnimationFrame(raf);const nodes=[...bars.children],data=new Uint8Array(analyser?analyser.frequencyBinCount:32);function frame(){if(audio.paused)return;if(analyser){analyser.getByteFrequencyData(data);nodes.forEach((n,i)=>n.style.height=(4+(data[Math.floor(i*data.length/nodes.length)]/255)*28)+'px');const avg=data.reduce((a,b)=>a+b,0)/data.length;drop.style.setProperty('--sound',avg/255)}else nodes.forEach((n,i)=>n.style.height=(5+Math.abs(Math.sin(Date.now()/190+i*.8))*19)+'px');raf=requestAnimationFrame(frame)}frame()}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();