const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
const machines = [
{id:'PC-01',zone:'Lab A',status:'online',cpu:12,ram:34,procs:142},
{id:'PC-02',zone:'Lab A',status:'online',cpu:8,ram:28,procs:120},
{id:'PC-03',zone:'Lab A',status:'critical',cpu:96,ram:78,procs:210},
{id:'PC-04',zone:'Lab B',status:'warning',cpu:24,ram:92,procs:188},
{id:'PC-05',zone:'Lab B',status:'online',cpu:18,ram:36,procs:110},
{id:'PC-06',zone:'Lab B',status:'online',cpu:6,ram:22,procs:98},
{id:'PC-07',zone:'Lab C',status:'offline',cpu:null,ram:null,procs:0},
{id:'PC-08',zone:'Lab C',status:'online',cpu:32,ram:48,procs:176},
{id:'PC-09',zone:'Lab C',status:'online',cpu:14,ram:30,procs:132},
{id:'PC-10',zone:'Lab A',status:'critical',cpu:68,ram:54,procs:190}
];
const processes = [
{pid:2840,name:'python.exe',cpu:62.4,ram:'1,245 MB',user:'user1',risk:'High CPU'},
{pid:4120,name:'chrome.exe',cpu:12.8,ram:'856 MB',user:'user1',risk:''},
{pid:5524,name:'code.exe',cpu:5.2,ram:'420 MB',user:'user1',risk:''},
{pid:6632,name:'unity.exe',cpu:4.8,ram:'1,120 MB',user:'user1',risk:''},
{pid:7716,name:'discord.exe',cpu:3.1,ram:'320 MB',user:'user1',risk:''},
{pid:9020,name:'steam.exe',cpu:1.6,ram:'210 MB',user:'user1',risk:'Blacklisted'},
{pid:1044,name:'notepad.exe',cpu:1.2,ram:'48 MB',user:'user1',risk:''},
{pid:2210,name:'explorer.exe',cpu:.8,ram:'180 MB',user:'user1',risk:''}
];
const alerts = [
{level:'high',icon:'cpu',title:'CPU threshold exceeded',desc:'PC-03 is running at 96% CPU usage.',time:'Just now',machine:'PC-03'},
{level:'high',icon:'shield-ban',title:'Blacklisted application detected',desc:'steam.exe detected on PC-10.',time:'2 min ago',machine:'PC-10'},
{level:'medium',icon:'memory-stick',title:'Memory pressure warning',desc:'PC-04 memory usage reached 92%.',time:'5 min ago',machine:'PC-04'},
{level:'medium',icon:'activity',title:'Unusual process activity',desc:'High CPU process requires review on PC-03.',time:'8 min ago',machine:'PC-03'}
];
const activities = [
{color:'red',title:'High CPU usage detected on PC-03',meta:'Rule: CPU > 90% · Threshold alert',time:'10:24'},
{color:'amber',title:'Blacklisted app found on PC-10',meta:'steam.exe · Policy match',time:'10:22'},
{color:'blue',title:'PC-07 stopped reporting telemetry',meta:'Endpoint disconnected',time:'10:19'},
{color:'green',title:'PC-04 memory warning generated',meta:'Memory usage above 85%',time:'10:15'}
];
let activeView='dashboard', filter='all', listMode=false, selectedMachine='PC-03', searchTerm='';
const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2600);}
function renderIcons(root=document){if(window.lucide&&typeof window.lucide.createIcons==='function')window.lucide.createIcons({root,attrs:{'stroke-width':1.9}});}
function renderStats(){
const items=[
{label:'Total endpoints',value:'16',foot:'<b>12 online</b> · 2 offline',icon:'monitor',tone:'blue',bar:75},
{label:'Average CPU',value:'28%',foot:'<span class="good">↓ 12%</span> vs. last period',icon:'cpu',tone:'',bar:28},
{label:'Average memory',value:'42%',foot:'<span class="good">↓ 8%</span> vs. last period',icon:'memory-stick',tone:'purple',bar:42},
{label:'Active processes',value:'1,842',foot:'Across connected endpoints',icon:'workflow',tone:'green',bar:68},
{label:'Alerts today',value:'7',foot:'<span class="bad">3 high</span> · 4 medium',icon:'shield-alert',tone:'red',bar:48}
];
$('#statsGrid').innerHTML=items.map(x=>'<article class="stat-card"><div class="stat-top"><div class="stat-icon '+x.tone+'"><i data-lucide="'+x.icon+'"></i></div><div><div class="stat-label">'+x.label+'</div><div class="stat-value">'+x.value+'</div></div></div><div class="stat-foot">'+x.foot+'</div><div class="mini-track"><span style="width:'+x.bar+'%"></span></div></article>').join('');renderIcons($('#statsGrid'));
}
function statusLabel(m){if(m.status==='critical')return '<span class="status-badge status-critical">High CPU</span>';if(m.status==='warning')return '<span class="status-badge status-warning">High memory</span>';if(m.status==='offline')return '<span class="status-badge status-offline">Offline</span>';return '<span class="status-badge status-online">Online</span>';}
function renderMachines(){
let list=machines.filter(m=>(filter==='all'||(filter==='online'?m.status!=='offline':m.status==='critical'||m.status==='warning'))&& (m.id+' '+m.zone).toLowerCase().includes(searchTerm.toLowerCase()));
if(activeView==='machines')list=machines.filter(m=>(filter==='all'||(filter==='online'?m.status!=='offline':m.status==='critical'||m.status==='warning'))&&(m.id+' '+m.zone).toLowerCase().includes(searchTerm.toLowerCase()));
$('#machineGrid').classList.toggle('list-mode',listMode);
$('#machineGrid').innerHTML=list.map((m,index)=>{
const cpu=m.cpu===null?'—':m.cpu+'%',ram=m.ram===null?'—':m.ram+'%';
const cpuClass=m.cpu===null?'':m.cpu>=90?'cpu-hot':m.cpu>=65?'cpu-warn':'cpu-good';
return '<article class="machine-card '+(m.status==='critical'?'critical':m.status==='warning'?'warning':m.status==='offline'?'offline':'')+'" style="--card-index:'+Math.min(index,12)+'" data-machine="'+m.id+'" tabindex="0" role="button" aria-label="Inspect '+m.id+'"><div class="machine-head"><div class="pc-icon"><i data-lucide="monitor"></i></div><div class="machine-name"><strong>'+m.id+'</strong><small>'+m.zone+'</small></div>'+statusLabel(m)+'</div><div class="metric-row"><span>CPU</span><strong>'+cpu+'</strong><div class="metric-track"><span class="'+cpuClass+'" style="width:'+(m.cpu||0)+'%"></span></div></div><div class="metric-row"><span>RAM</span><strong>'+ram+'</strong><div class="metric-track"><span style="width:'+(m.ram||0)+'%;background:#3985f7"></span></div></div><div class="machine-foot"><span>'+(m.status==='offline'?'No telemetry':m.procs+' processes')+'</span><b>›</b></div></article>';
}).join('')||'<div class="empty-state">No endpoints match your filters.</div>';
renderIcons($('#machineGrid'));$('#machineCount').textContent='Showing '+list.length+' of '+(activeView==='machines'?16:10)+' endpoints';
$$('.machine-card').forEach(card=>{card.addEventListener('click',()=>openMachine(card.dataset.machine));card.addEventListener('keydown',e=>{if(e.key==='Enter')openMachine(card.dataset.machine);});});
}
function renderAlerts(){
$('#alertList').innerHTML=alerts.slice(0,3).map(a=>'<div class="alert-item"><div class="alert-symbol '+a.level+'"><i data-lucide="'+a.icon+'"></i></div><div class="alert-copy"><strong>'+a.title+'</strong><p>'+a.desc+'</p><div class="alert-meta"><small>'+a.time+'</small><span class="severity '+a.level+'">'+a.level.toUpperCase()+'</span></div></div></div>').join('');
$('#activityList').innerHTML=activities.map(a=>'<div class="activity-row"><span class="activity-icon '+a.color+'"><i data-lucide="'+(a.color==='red'?'alert-triangle':a.color==='amber'?'shield-alert':a.color==='blue'?'wifi-off':'memory-stick')+'"></i></span><div class="activity-copy"><strong>'+a.title+'</strong><small>'+a.meta+'</small></div><span class="activity-time">'+a.time+'</span></div>').join('');renderIcons($('#alertList'));renderIcons($('#activityList'));
}
let resourceChart=null,chartRange=30,chartMetric='both';
const chartHistory={cpu:[34,31,36,29,33,27,30,25,28,32,26,29,24,31,27,35,30,26,28,24,32,27,29,28],memory:[46,45,47,44,46,43,45,42,44,46,43,45,41,44,42,46,44,43,45,42,44,43,41,42]};
function chartLabels(count){const now=new Date();return Array.from({length:count},(_,i)=>{const d=new Date(now.getTime()-(count-1-i)*(chartRange*60000/(count-1)));return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});});}
function renderChart(){
if(!window.Chart||!$('#trendChart'))return;
const count=chartRange===15?8:chartRange===30?12:24;
const cpu=chartHistory.cpu.slice(-count),memory=chartHistory.memory.slice(-count),labels=chartLabels(count),ctx=$('#trendChart').getContext('2d');
const cpuFill=ctx.createLinearGradient(0,0,0,240);cpuFill.addColorStop(0,'rgba(52,120,246,.22)');cpuFill.addColorStop(1,'rgba(52,120,246,0)');
const datasets=[{label:'CPU usage',data:cpu,borderColor:'#3478f6',backgroundColor:cpuFill,fill:true,tension:.38,cubicInterpolationMode:'monotone',borderWidth:2.5,pointRadius:0,pointHoverRadius:5,pointHitRadius:12,pointHoverBackgroundColor:'#fff',pointHoverBorderWidth:3,pointHoverBorderColor:'#3478f6'},{label:'Memory usage',data:memory,borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,.04)',fill:false,tension:.38,cubicInterpolationMode:'monotone',borderWidth:2.5,pointRadius:0,pointHoverRadius:5,pointHitRadius:12,pointHoverBackgroundColor:'#fff',pointHoverBorderWidth:3,pointHoverBorderColor:'#8b5cf6'}].filter(d=>chartMetric==='both'||(chartMetric==='cpu'&&d.label==='CPU usage')||(chartMetric==='memory'&&d.label==='Memory usage'));
const options={responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},animation:{duration:650,easing:'easeOutQuart'},transitions:{active:{animation:{duration:180}}},plugins:{legend:{display:false},tooltip:{enabled:true,backgroundColor:'#10213d',titleColor:'#c9d9f4',bodyColor:'#fff',padding:12,cornerRadius:9,displayColors:true,boxPadding:4,usePointStyle:true,callbacks:{label:c=>' '+c.dataset.label+': '+c.parsed.y+'%'}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:'#95a3ba',maxTicksLimit:6,maxRotation:0,font:{size:9}}},y:{min:0,max:100,border:{display:false,dash:[3,4]},grid:{color:'rgba(139,157,184,.16)',drawTicks:false},ticks:{stepSize:25,color:'#95a3ba',padding:8,font:{size:9},callback:v=>v+'%'}}}};
if(resourceChart){resourceChart.data.labels=labels;resourceChart.data.datasets=datasets;resourceChart.options=options;resourceChart.update();}
else resourceChart=new Chart(ctx,{type:'line',data:{labels,datasets},options});
$('#chartSubtitle').textContent='Fleet average · last '+(chartRange===60?'60 minutes':chartRange+' minutes');
$('#chartCurrent').innerHTML=(chartMetric==='memory'?'Memory': 'CPU')+' '+(chartMetric==='memory'?memory[memory.length-1]:cpu[cpu.length-1])+'% <em>DEMO</em>';
$('#chartUpdated').textContent='Updated '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
renderIcons($('.trend-panel'));
}
function pushDemoReading(){
const lastCpu=chartHistory.cpu.at(-1),lastMem=chartHistory.memory.at(-1);
chartHistory.cpu.push(Math.max(8,Math.min(96,Math.round(lastCpu+(Math.random()*12-6)))));
chartHistory.memory.push(Math.max(20,Math.min(92,Math.round(lastMem+(Math.random()*6-3)))));
if(chartHistory.cpu.length>60)chartHistory.cpu.shift();if(chartHistory.memory.length>60)chartHistory.memory.shift();
if(resourceChart){renderChart();$('#lastSync').textContent='just now';}
}
function openMachine(id){
selectedMachine=id;const m=machines.find(x=>x.id===id);if(!m)return;
$('#modalTitle').textContent=id+' · Process explorer';
const rows=id==='PC-03'?processes:processes.slice(0,5).map((p,i)=>({...p,cpu:Math.max(.4,p.cpu/2-i)}));
$('#modalBody').innerHTML='<div class="modal-machine-metrics"><div class="modal-metric"><small>CPU usage</small><strong style="color:'+(m.cpu>=90?'var(--red)':'var(--text)')+'">'+(m.cpu===null?'—':m.cpu+'%')+'</strong></div><div class="modal-metric"><small>Memory usage</small><strong>'+(m.ram===null?'—':m.ram+'%')+'</strong></div><div class="modal-metric"><small>Running processes</small><strong>'+m.procs+'</strong></div></div><div class="panel-heading"><div><h2>Running processes</h2><p>Sample process data · '+id+'</p></div><div class="inline-search" style="max-width:170px"><span>⌕</span><input id="processSearch" placeholder="Search process…"></div></div><div class="table-scroll"><table class="process-table"><thead><tr><th>PID</th><th>PROCESS</th><th>CPU</th><th>MEMORY</th><th>POLICY</th><th>ACTION</th></tr></thead><tbody id="processRows">'+rows.map(p=>processRow(p)).join('')+'</tbody></table></div><p style="font-size:9px;color:var(--muted);margin-top:13px">Demo mode: termination actions are simulated and do not affect your computer.</p>';
$('#processModal').hidden=false;renderIcons($('#modalBody'));
$('#processSearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase();$('#processRows').innerHTML=rows.filter(p=>(p.name+' '+p.pid).toLowerCase().includes(q)).map(processRow).join('')||'<tr><td colspan="6">No matching processes.</td></tr>';wireKillButtons();});
wireKillButtons();
}
function processRow(p){return '<tr><td>'+p.pid+'</td><td class="process-name">'+esc(p.name)+'</td><td style="color:'+(p.cpu>50?'var(--red)':'var(--text)')+'">'+p.cpu+'%</td><td>'+p.ram+'</td><td>'+(p.risk?'<span class="severity '+(p.risk==='High CPU'?'high':'medium')+'">'+p.risk+'</span>':'<span style="color:var(--muted)">—</span>')+'</td><td><button class="kill-button" data-kill="'+p.pid+'" data-name="'+esc(p.name)+'">Terminate</button></td></tr>';}
function wireKillButtons(){$$('[data-kill]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.name;const pid=btn.dataset.kill;if(confirm('Demo action only: simulate terminating '+name+' (PID '+pid+') on '+selectedMachine+'?'))showToast('Demo response queued for '+name+' · PID '+pid+'. No process was terminated.');}));}
function setView(view){
activeView=view;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
const titles={dashboard:['Command Center','A real-time view of your lab’s endpoint health and security posture.'],machines:['Endpoint fleet','Inspect and filter every registered lab computer.'],processes:['Process explorer','Review running applications and their resource footprint.'],alerts:['Alert center','Investigate resource anomalies and policy violations.'],reports:['Reports & analytics','Review endpoint trends and operational summaries.'],blacklist:['Application blacklist','Manage applications that require administrator review.'],settings:['Workspace settings','Configure monitoring thresholds and lab preferences.']};
$('#pageTitle').textContent=titles[view][0];$('#pageSubtitle').textContent=titles[view][1];
const fleet=$('.fleet-panel'),right=$('.right-column');
if(view==='dashboard'){fleet.style.display='';right.style.display='';renderMachines();}
else if(view==='machines'){fleet.style.display='';right.style.display='none';renderMachines();}
else if(view==='processes'){fleet.style.display='';right.style.display='none';renderMachines();showToast('Select any endpoint to inspect its process list.');}
else{fleet.style.display='none';right.style.display='none';renderPlaceholder(view);}
}
function renderPlaceholder(view){
let p=$('.page-placeholder');if(!p){p=document.createElement('section');p.className='panel page-placeholder';$('.page-content').appendChild(p);}
const content={
alerts:['♧','Alert center','Review the latest security and resource events.','<button class="btn btn-secondary" id="ackAlerts">Acknowledge visible alerts</button>'],
reports:['▤','Reports are being prepared','Historical reports will become available once endpoint telemetry is connected.','<button class="btn btn-primary" id="exportReport">Export demo report</button>'],
blacklist:['◉','Application policy','Manage blocked executable names and policy rules for your lab.','<div class="inline-search" style="max-width:280px"><input id="newBlockedApp" placeholder="e.g. unauthorized-game.exe"><button class="text-button" id="addBlockedApp">Add</button></div><div id="blockedList" style="margin-top:15px;font-size:11px">steam.exe · torrent.exe · cryptominer.exe</div>'],
settings:['⚙','Monitoring preferences','Demo thresholds: CPU warning 75%, critical 90%, memory warning 85%.','<button class="btn btn-secondary" id="editThresholds">Review thresholds</button>']
};
const x=content[view]||content.reports;
p.innerHTML='<div><div class="placeholder-icon"><i data-lucide="'+({alerts:'shield-alert',reports:'chart-no-axes-combined',blacklist:'shield-ban',settings:'settings-2'}[view]||'layout-dashboard')+'"></i></div><h2>'+x[1]+'</h2><p>'+x[2]+'</p><div style="margin-top:18px;display:flex;justify-content:center">'+x[3]+'</div><p style="font-size:9px;margin-top:15px">This screen uses prototype data. Live endpoint integrations are the next development phase.</p></div>';renderIcons(p);
if(view==='alerts')$('#ackAlerts').onclick=()=>showToast('Demo: visible alerts marked for review.');
if(view==='reports')$('#exportReport').onclick=exportReport;
if(view==='settings')$('#editThresholds').onclick=()=>showToast('Threshold editor will be connected to saved settings in the next phase.');
if(view==='blacklist')$('#addBlockedApp').onclick=()=>{const input=$('#newBlockedApp'),v=input.value.trim();if(!v)return showToast('Enter an executable name first.');$('#blockedList').textContent+=' · '+v;input.value='';showToast('Added to demo blacklist.');};
}
function exportReport(){
const rows=[['Endpoint','Zone','Status','CPU %','RAM %','Processes'],...machines.map(m=>[m.id,m.zone,m.status,m.cpu??'',m.ram??'',m.procs])];
const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='netos-monitor-demo-report.csv';a.click();URL.revokeObjectURL(url);showToast('Endpoint report exported.');
}
$('#mainNav').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b&&!$('#mainNav').contains(b))setView(b.dataset.view);});
$('#machineSearch').addEventListener('input',e=>{searchTerm=e.target.value;renderMachines();});
$('#globalSearch').addEventListener('input',e=>{searchTerm=e.target.value;$('#machineSearch').value=searchTerm;setView('machines');});
$$('.filter-pill').forEach(b=>b.addEventListener('click',()=>{$$('.filter-pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;renderMachines();}));
$('#fleetMode').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;listMode=b.dataset.mode==='list';$$('#fleetMode button').forEach(x=>x.classList.toggle('selected',x===b));renderMachines();});
$('#statusFilterBtn').addEventListener('click',()=>{filter=filter==='all'?'critical':'all';$$('.filter-pill').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));renderMachines();showToast(filter==='critical'?'Showing endpoints needing attention.':'Showing all endpoints.');});
$('#refreshBtn').addEventListener('click',()=>{const b=$('#refreshBtn');b.classList.add('is-refreshing');$('#lastSync').textContent='just now';renderStats();renderMachines();pushDemoReading();setTimeout(()=>b.classList.remove('is-refreshing'),850);showToast('Demo telemetry refreshed. No live agents connected.');});
$('#exportBtn').addEventListener('click',exportReport);
$('#closeModal').addEventListener('click',()=>$('#processModal').hidden=true);
$('#processModal').addEventListener('click',e=>{if(e.target.id==='processModal')$('#processModal').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#processModal').hidden=true;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus();}});
$('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('dark-mode');showToast(document.body.classList.contains('dark-mode')?'Dark theme enabled.':'Light theme enabled.');if(resourceChart){resourceChart.options.scales.x.ticks.color=document.body.classList.contains('dark-mode')?'#9aacc6':'#95a3ba';resourceChart.options.scales.y.ticks.color=document.body.classList.contains('dark-mode')?'#9aacc6':'#95a3ba';resourceChart.options.scales.y.grid.color=document.body.classList.contains('dark-mode')?'rgba(154,172,198,.16)':'rgba(139,157,184,.16)';resourceChart.update('none');}});
$('#chartRanges').addEventListener('click',e=>{const b=e.target.closest('[data-range]');if(!b)return;chartRange=Number(b.dataset.range);$$('#chartRanges button').forEach(x=>x.classList.toggle('selected',x===b));renderChart();showToast('Showing '+chartRange+' minutes of demo telemetry.');});
$('#chartMetric').addEventListener('change',e=>{chartMetric=e.target.value;renderChart();});
function tick(){const d=new Date();$('#clock').textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});}
renderStats();renderMachines();renderAlerts();renderChart();renderIcons();tick();setInterval(tick,1000);setInterval(pushDemoReading,5000);