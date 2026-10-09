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
{pid:2840,name:'python.exe',machineId:'PC-03',cpu:62.4,ram:'1,245 MB',ramMb:1245,user:'user1',risk:'High CPU'},
{pid:4120,name:'chrome.exe',machineId:'PC-03',cpu:12.8,ram:'856 MB',ramMb:856,user:'user1',risk:''},
{pid:5524,name:'code.exe',machineId:'PC-03',cpu:5.2,ram:'420 MB',ramMb:420,user:'user1',risk:''},
{pid:6632,name:'unity.exe',machineId:'PC-03',cpu:4.8,ram:'1,120 MB',ramMb:1120,user:'user1',risk:''},
{pid:7716,name:'discord.exe',machineId:'PC-03',cpu:3.1,ram:'320 MB',ramMb:320,user:'user1',risk:''},
{pid:9020,name:'steam.exe',machineId:'PC-10',cpu:1.6,ram:'210 MB',ramMb:210,user:'user1',risk:'Blacklisted'},
{pid:1044,name:'notepad.exe',machineId:'PC-03',cpu:1.2,ram:'48 MB',ramMb:48,user:'user1',risk:''},
{pid:2210,name:'explorer.exe',machineId:'PC-03',cpu:.8,ram:'180 MB',ramMb:180,user:'user1',risk:''}
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
const online=machines.filter(m=>m.status!=='offline');
const avgCpu=Math.round(online.reduce((n,m)=>n+(m.cpu||0),0)/Math.max(1,online.length));
const avgRam=Math.round(online.reduce((n,m)=>n+(m.ram||0),0)/Math.max(1,online.length));
const activeCount=machines.reduce((n,m)=>n+(m.procs||0),0);
const highCount=alerts.filter(a=>a.level==='high').length,mediumCount=alerts.filter(a=>a.level==='medium').length;
const items=[
{label:'Total endpoints',value:'16',foot:'<b>'+online.length+' reporting</b> · demo inventory',icon:'monitor',tone:'blue',bar:75},
{label:'Average CPU',value:avgCpu+'%',foot:'Live demo simulation average',icon:'cpu',tone:'',bar:avgCpu},
{label:'Average memory',value:avgRam+'%',foot:'Live demo simulation average',icon:'memory-stick',tone:'purple',bar:avgRam},
{label:'Active processes',value:activeCount.toLocaleString(),foot:'Process count across sample fleet',icon:'workflow',tone:'green',bar:Math.min(100,activeCount/20)},
{label:'Alerts today',value:String(alerts.length+3),foot:'<span class="bad">'+highCount+' high</span> · '+mediumCount+' medium active',icon:'shield-alert',tone:'red',bar:Math.min(100,alerts.length*10)}
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
const fleet=machines.filter(m=>m.status!=='offline');
const avgCpu=fleet.reduce((n,m)=>n+(m.cpu||0),0)/Math.max(1,fleet.length),avgRam=fleet.reduce((n,m)=>n+(m.ram||0),0)/Math.max(1,fleet.length);
chartHistory.cpu.push(Math.max(0,Math.min(100,Math.round(avgCpu+(Math.random()*4-2)))));
chartHistory.memory.push(Math.max(0,Math.min(100,Math.round(avgRam+(Math.random()*3-1.5)))));
if(chartHistory.cpu.length>60)chartHistory.cpu.shift();if(chartHistory.memory.length>60)chartHistory.memory.shift();
if(resourceChart){renderChart();$('#lastSync').textContent='just now';}
}
function openMachine(id){
selectedMachine=id;const m=machines.find(x=>x.id===id);if(!m)return;
$('#modalTitle').textContent=id+' · Process explorer';
const rows=processes.filter(p=>p.machineId===id);
$('#modalBody').innerHTML='<div class="modal-machine-metrics"><div class="modal-metric"><small>CPU usage</small><strong style="color:'+(m.cpu>=90?'var(--red)':'var(--text)')+'">'+(m.cpu===null?'—':m.cpu+'%')+'</strong></div><div class="modal-metric"><small>Memory usage</small><strong>'+(m.ram===null?'—':m.ram+'%')+'</strong></div><div class="modal-metric"><small>Running processes</small><strong>'+m.procs+'</strong></div></div><div class="panel-heading"><div><h2>Running processes</h2><p>Sample process data · '+id+'</p></div><div class="inline-search" style="max-width:170px"><span>⌕</span><input id="processSearch" placeholder="Search process…"></div></div><div class="table-scroll"><table class="process-table"><thead><tr><th>PID</th><th>PROCESS</th><th>CPU</th><th>MEMORY</th><th>POLICY</th><th>ACTION</th></tr></thead><tbody id="processRows">'+rows.map(p=>processRow(p)).join('')+'</tbody></table></div><p style="font-size:9px;color:var(--muted);margin-top:13px">Demo mode: termination actions are simulated and do not affect your computer.</p>';
$('#processModal').hidden=false;renderIcons($('#modalBody'));
$('#processSearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase();$('#processRows').innerHTML=rows.filter(p=>(p.name+' '+p.pid).toLowerCase().includes(q)).map(processRow).join('')||'<tr><td colspan="6">No matching processes.</td></tr>';wireKillButtons();});
wireKillButtons();
}
function processRow(p){return '<tr><td>'+p.pid+'</td><td class="process-name">'+esc(p.name)+'</td><td style="color:'+(p.cpu>50?'var(--red)':'var(--text)')+'">'+p.cpu+'%</td><td>'+p.ram+'</td><td>'+(p.risk?'<span class="severity '+(p.risk==='High CPU'?'high':'medium')+'">'+p.risk+'</span>':'<span style="color:var(--muted)">—</span>')+'</td><td><button class="kill-button" data-kill="'+p.pid+'" data-name="'+esc(p.name)+'">Terminate</button></td></tr>';}
function wireKillButtons(){$$('[data-kill]').forEach(btn=>btn.addEventListener('click',()=>simulateTermination(Number(btn.dataset.kill))));}
function applyProcessGridFilter(){if(processGridApi&&processGridApi.setGridOption)processGridApi.setGridOption('quickFilterText',processQuery);}
function applyProcessGridSort(){if(!processGridApi||!processGridApi.applyColumnState)return;const field=processSort==='ram'?'ramSort':processSort==='name'?'name':'cpu';processGridApi.applyColumnState({defaultState:{sort:null},state:[{colId:field,sort:'desc'}]});}
function simulateTermination(pid){
 const idx=processes.findIndex(p=>p.pid===Number(pid));if(idx<0)return showToast('Process is no longer running in this demo.');
 const proc=processes[idx],machine=machines.find(m=>m.id===proc.machineId);if(!machine)return showToast('No endpoint is associated with this sample process.');
 if(!confirm('Simulate terminating '+proc.name+' (PID '+proc.pid+') on '+machine.id+'? This only changes demo data; no real process is touched.'))return;
 const cpuBefore=Number(machine.cpu)||0,ramBefore=Number(machine.ram)||0;
 const cpuReleased=Math.min(cpuBefore,Number(proc.cpu)||0),ramReleased=Math.min(ramBefore,Math.round((Number(proc.ramMb)||0)/8192*100*10)/10);
 processes.splice(idx,1);machine.cpu=Math.max(0,Math.round((cpuBefore-cpuReleased)*10)/10);machine.ram=Math.max(0,Math.round((ramBefore-ramReleased)*10)/10);machine.procs=Math.max(0,(machine.procs||0)-1);
 const threshold=pageState?.settings||{cpuWarn:75,cpuCritical:90,ramWarn:85};
 machine.status=machine.cpu>=threshold.cpuCritical?'critical':machine.ram>=threshold.ramWarn?'warning':'online';
 const audit={time:new Date().toLocaleTimeString(),pid:proc.pid,name:proc.name,endpoint:machine.id,cpuReleased:Math.round(cpuReleased*10)/10,ramReleased:Math.round(ramReleased*10)/10};terminationAudit.unshift(audit);
 const risk=proc.risk==='Blacklisted';alerts.unshift({level:risk?'high':'medium',icon:risk?'shield-ban':'activity',title:risk?'Blacklisted process terminated (demo)':'Process termination simulated',desc:proc.name+' (PID '+proc.pid+') removed from '+machine.id+'. CPU −'+audit.cpuReleased+' points; memory −'+audit.ramReleased+' points.',time:'Just now',machine:machine.id});
 activities.unshift({color:risk?'amber':'green',title:'Demo termination: '+proc.name+' on '+machine.id,meta:'PID '+proc.pid+' · CPU −'+audit.cpuReleased+' · RAM −'+audit.ramReleased+' points',time:audit.time});
 const fleet=machines.filter(m=>m.status!=='offline');const avgCpu=Math.round(fleet.reduce((n,m)=>n+(m.cpu||0),0)/Math.max(1,fleet.length));const avgRam=Math.round(fleet.reduce((n,m)=>n+(m.ram||0),0)/Math.max(1,fleet.length));
 chartHistory.cpu.push(avgCpu);chartHistory.memory.push(avgRam);if(chartHistory.cpu.length>60)chartHistory.cpu.shift();if(chartHistory.memory.length>60)chartHistory.memory.shift();
 renderStats();renderMachines();renderAlerts();if(resourceChart)renderChart();
 if($('#processModal')&&!$('#processModal').hidden&&selectedMachine===machine.id)openMachine(machine.id);
 if(activeView==='processes'){const mount=$('#dedicatedView');if(mount)renderDedicatedView('processes',mount);}
 showToast('Demo termination complete · '+machine.id+' CPU '+cpuBefore+'% → '+machine.cpu+'% · memory '+ramBefore+'% → '+machine.ram+'%.');
}
const pageState={
 blacklist:[
  {type:'Process name',value:'steam.exe',reason:'Unapproved gaming software',scope:'All endpoints',status:'Active'},
  {type:'Process name',value:'torrent.exe',reason:'Peer-to-peer transfer utility',scope:'All endpoints',status:'Active'},
  {type:'Process name',value:'cryptominer.exe',reason:'Potential cryptominer',scope:'All endpoints',status:'Active'},
  {type:'SHA-256 hash',value:'9f2a…c81d',reason:'Sample threat indicator',scope:'Lab A',status:'Active'},
  {type:'Domain',value:'updates-suspicious.test',reason:'Training indicator only',scope:'Lab B',status:'Review'}
 ],
 alertStatus:{},
 settings:{cpuWarn:75,cpuCritical:90,ramWarn:85,refresh:5,notifyHigh:true,notifyOffline:true,autoRefresh:true}
};
let processQuery='',processSort='cpu',alertFilter='all',reportRange='24h',blacklistFilter='all';
let processGridApi=null;const terminationAudit=[];
function setView(view){
 activeView=view;
 $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 const titles={dashboard:['Command Center','A real-time view of your lab’s endpoint health and security posture.'],machines:['Endpoint fleet','Inspect endpoint health, zone, resource usage and availability.'],processes:['Process explorer','Search, sort and review process activity across the lab.'],alerts:['Alert center','Triage events, inspect context and track investigation status.'],reports:['Reports & analytics','Explore fleet health, resource patterns and export a demo report.'],blacklist:['Blacklist & policy','Maintain deny-list indicators and review policy coverage.'],settings:['Workspace settings','Configure thresholds, refresh behavior and alert preferences.']};
 $('#pageTitle').textContent=titles[view][0];$('#pageSubtitle').textContent=titles[view][1];
 const dashboard= view==='dashboard';
 $('.stats-grid').style.display=dashboard?'':'none';
 $('.dashboard-grid').style.display=dashboard?'':'none';
 let mount=$('#dedicatedView');
 if(!mount){mount=document.createElement('div');mount.id='dedicatedView';mount.className='dedicated-view';const note=$('.bottom-note');note.parentNode.insertBefore(mount,note);}
 mount.style.display=dashboard?'none':'';
 if(dashboard){renderMachines();renderAlerts();return;}
 renderDedicatedView(view,mount);
}
function pagePanel(title,sub,content,icon='activity'){return '<section class="panel page-table-panel"><div class="panel-heading"><div><h2>'+title+'</h2><p>'+sub+'</p></div><span class="page-panel-icon"><i data-lucide="'+icon+'"></i></span></div>'+content+'</section>';}
function renderDedicatedView(view,mount){
 if(view==='machines'){
  const list=machines.filter(m=>(filter==='all'||(filter==='online'?m.status!=='offline':m.status==='critical'||m.status==='warning'))&&(m.id+' '+m.zone).toLowerCase().includes(searchTerm.toLowerCase()));
  mount.innerHTML='<div class="page-kpi-grid">'+[['Registered endpoints','16','monitor'],['Reporting in','9','wifi'],['Needs attention','3','shield-alert'],['Zones','3','map-pin']].map(x=>'<article class="stat-card"><div class="stat-top"><div class="stat-icon blue"><i data-lucide="'+x[2]+'"></i></div><div><div class="stat-label">'+x[0]+'</div><div class="stat-value">'+x[1]+'</div></div></div><div class="stat-foot">Sample lab inventory</div></article>').join('')+'</div>'+pagePanel('Endpoint inventory','Select a machine to inspect its process list and resource summary.','<div class="page-toolbar"><div class="inline-search"><span><i data-lucide="search"></i></span><input id="pageMachineSearch" value="'+esc(searchTerm)+'" placeholder="Search ID or lab zone"></div><select id="pageMachineFilter" class="page-select"><option value="all">All statuses</option><option value="online">Online / reporting</option><option value="critical">Needs attention</option></select><span class="muted-note">'+list.length+' shown · demo inventory</span></div><div class="table-scroll"><table class="generic-table"><thead><tr><th>ENDPOINT</th><th>ZONE</th><th>STATUS</th><th>CPU</th><th>MEMORY</th><th>PROCESSES</th><th></th></tr></thead><tbody>'+list.map(m=>'<tr><td><strong>'+m.id+'</strong></td><td>'+m.zone+'</td><td>'+statusLabel(m)+'</td><td>'+ (m.cpu===null?'—':m.cpu+'%')+'</td><td>'+(m.ram===null?'—':m.ram+'%')+'</td><td>'+m.procs+'</td><td><button class="text-button" data-inspect="'+m.id+'">Inspect →</button></td></tr>').join('')+'</tbody></table></div>');
  $('#pageMachineSearch').addEventListener('input',e=>{searchTerm=e.target.value;renderDedicatedView('machines',mount);});
  $('#pageMachineFilter').value=filter;$('#pageMachineFilter').addEventListener('change',e=>{filter=e.target.value;renderDedicatedView('machines',mount);});
  $$('[data-inspect]',mount).forEach(b=>b.onclick=()=>openMachine(b.dataset.inspect));
 }else if(view==='processes'){
  window.__processGrid?.destroy?.();window.__processGrid=null;processGridApi=null;
  const online=machines.filter(m=>m.status!=='offline');
  const avgCpu=Math.round(online.reduce((n,m)=>n+(m.cpu||0),0)/Math.max(1,online.length));
  const avgRam=Math.round(online.reduce((n,m)=>n+(m.ram||0),0)/Math.max(1,online.length));
  mount.innerHTML='<div class="page-kpi-grid">'+[['Visible processes',processes.length,'workflow'],['Avg. endpoint CPU',avgCpu+'%','cpu'],['Avg. endpoint memory',avgRam+'%','memory-stick'],['Released resource events',terminationAudit.length,'activity']].map(x=>'<article class="stat-card"><div class="stat-top"><div class="stat-icon blue"><i data-lucide="'+x[2]+'"></i></div><div><div class="stat-label">'+x[0]+'</div><div class="stat-value">'+x[1]+'</div></div></div><div class="stat-foot">Shared demo simulation state</div></article>').join('')+'</div>'+pagePanel('Process explorer','Sortable, filterable AG Grid table. Termination updates endpoint metrics and the dashboard.','<div class="page-toolbar"><div class="inline-search"><span><i data-lucide="search"></i></span><input id="pageProcessSearch" value="'+esc(processQuery)+'" placeholder="Search name, PID, user or endpoint"></div><select id="processSort" class="page-select"><option value="cpu">Sort: CPU usage</option><option value="ram">Sort: memory</option><option value="name">Sort: process name</option></select><span class="demo-inline"><i data-lucide="activity"></i> SIMULATED TELEMETRY</span></div><div class="process-resource-strip"><div><small>Available CPU capacity</small><strong id="freeCpu">'+(100-avgCpu)+'%</strong><span>fleet average headroom</span></div><div><small>Available memory</small><strong id="freeMemory">'+(100-avgRam)+'%</strong><span>fleet average headroom</span></div><div><small>Termination audit</small><strong id="auditCount">'+terminationAudit.length+'</strong><span>simulated actions recorded</span></div></div><div id="processAgGrid" class="ag-theme-quartz netos-ag-grid"></div><p class="page-footnote"><i data-lucide="shield-check"></i> Demo only: no operating-system process is terminated. Resource values are illustrative and reset on page reload.</p>');
  const rows=processes.map(p=>({...p,endpoint:p.machineId,ramSort:p.ramMb||parseInt(String(p.ram).replace(/[^0-9]/g,''),10)||0,policy:p.risk||'None'}));
  const gridOptions={theme:'legacy',rowData:rows,defaultColDef:{sortable:true,filter:true,resizable:true,flex:1,minWidth:100,tooltipValueGetter:params=>String(params.value??'')},pagination:true,paginationPageSize:8,animateRows:true,domLayout:'normal',rowHeight:48,headerHeight:42,overlayNoRowsTemplate:'<span class="muted-note">No processes match this search.</span>',columnDefs:[
   {headerName:'PROCESS',field:'name',minWidth:155,flex:1.4,cellRenderer:params=>{const el=document.createElement('div');el.className='ag-process-cell';el.innerHTML='<span class="ag-process-glyph"><i data-lucide="cpu"></i></span><span><strong>'+esc(params.value)+'</strong><small>PID '+params.data.pid+'</small></span>';return el;}},
   {headerName:'ENDPOINT',field:'endpoint',minWidth:105},
   {headerName:'USER',field:'user',minWidth:90},
   {headerName:'CPU',field:'cpu',minWidth:100,filter:'agNumberColumnFilter',valueFormatter:p=>Number(p.value).toFixed(1)+'%',cellClassRules:{'ag-resource-hot':p=>Number(p.value)>=50,'ag-resource-warn':p=>Number(p.value)>=20&&Number(p.value)<50}},
   {headerName:'MEMORY',field:'ramSort',minWidth:120,filter:'agNumberColumnFilter',valueFormatter:p=>Number(p.value).toLocaleString()+' MB'},
   {headerName:'POLICY',field:'policy',minWidth:120,cellRenderer:p=>{const el=document.createElement('span');if(p.value==='None'){el.className='muted-note';el.textContent='No match';}else{el.className='severity '+(p.value==='High CPU'?'high':'medium');el.textContent=p.value;}return el;}},
   {headerName:'ACTION',field:'action',minWidth:115,maxWidth:125,sortable:false,filter:false,cellRenderer:()=>{const b=document.createElement('button');b.className='kill-button ag-terminate';b.type='button';b.textContent='Terminate';return b;}}
  ],onCellClicked:params=>{if(params.colDef.field==='action')simulateTermination(params.data.pid);},onGridReady:params=>{processGridApi=params.api;applyProcessGridFilter();applyProcessGridSort();renderIcons(mount);}};
  const gridEl=$('#processAgGrid',mount);if(window.agGrid&&window.agGrid.createGrid){processGridApi=null;window.__processGrid?.destroy?.();window.__processGrid=window.agGrid.createGrid(gridEl,gridOptions);}else gridEl.innerHTML='<div class="empty-state">AG Grid could not load. Check your network connection and reload.</div>';
  $('#pageProcessSearch').addEventListener('input',e=>{processQuery=e.target.value;applyProcessGridFilter();});
  $('#processSort').value=processSort;$('#processSort').addEventListener('change',e=>{processSort=e.target.value;applyProcessGridSort();});
 }else if(view==='alerts'){
  const filtered=alerts.filter((a,i)=>(alertFilter==='all'||a.level===alertFilter)&&!pageState.alertStatus[i]?.resolved);
  mount.innerHTML='<div class="page-kpi-grid">'+[['Open alerts',alerts.filter((a,i)=>!pageState.alertStatus[i]?.resolved).length,'bell-ring'],['High severity',alerts.filter(a=>a.level==='high').length,'shield-alert'],['Acknowledged',Object.values(pageState.alertStatus).filter(x=>x.ack).length,'check-check'],['Resolved',Object.values(pageState.alertStatus).filter(x=>x.resolved).length,'shield-check']].map(x=>'<article class="stat-card"><div class="stat-top"><div class="stat-icon '+(x[2]==='shield-alert'?'red':'blue')+'"><i data-lucide="'+x[2]+'"></i></div><div><div class="stat-label">'+x[0]+'</div><div class="stat-value">'+x[1]+'</div></div></div><div class="stat-foot">Local demo alert queue</div></article>').join('')+'</div>'+pagePanel('Investigation queue','Acknowledge events as you investigate; resolve them to remove them from the open queue.','<div class="page-toolbar"><select id="alertFilter" class="page-select"><option value="all">All severities</option><option value="high">High</option><option value="medium">Medium</option></select><span class="muted-note">'+filtered.length+' open event(s)</span><button class="btn btn-secondary" id="ackAllAlerts">Acknowledge all</button></div><div class="table-scroll"><table class="generic-table"><thead><tr><th>SEVERITY</th><th>EVENT</th><th>ENDPOINT</th><th>TIME</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>'+filtered.map(a=>{const i=alerts.indexOf(a),st=pageState.alertStatus[i]||{};return '<tr><td><span class="severity '+a.level+'">'+a.level.toUpperCase()+'</span></td><td><strong>'+a.title+'</strong><small class="cell-sub">'+a.desc+'</small></td><td>'+a.machine+'</td><td>'+a.time+'</td><td>'+(st.ack?'<span class="status-badge status-online">Acknowledged</span>':'<span class="status-badge status-warning">New</span>')+'</td><td><button class="text-button" data-ack="'+i+'">'+(st.ack?'Acknowledged':'Acknowledge')+'</button> <button class="text-button" data-resolve="'+i+'">Resolve</button></td></tr>';}).join('')+'</tbody></table></div>');
  $('#alertFilter').value=alertFilter;$('#alertFilter').onchange=e=>{alertFilter=e.target.value;renderDedicatedView('alerts',mount);};
  $('#ackAllAlerts').onclick=()=>{alerts.forEach((a,i)=>pageState.alertStatus[i]={...(pageState.alertStatus[i]||{}),ack:true});renderDedicatedView('alerts',mount);showToast('All demo alerts acknowledged.');};
  $$('[data-ack]',mount).forEach(b=>b.onclick=()=>{const i=b.dataset.ack;pageState.alertStatus[i]={...(pageState.alertStatus[i]||{}),ack:true};renderDedicatedView('alerts',mount);showToast('Alert acknowledged in demo queue.');});
  $$('[data-resolve]',mount).forEach(b=>b.onclick=()=>{const i=b.dataset.resolve;pageState.alertStatus[i]={...(pageState.alertStatus[i]||{}),ack:true,resolved:true};renderDedicatedView('alerts',mount);showToast('Alert resolved in demo queue.');});
 }else if(view==='reports'){
  const online=machines.filter(m=>m.status!=='offline').length,critical=machines.filter(m=>m.status==='critical'||m.status==='warning').length;
  mount.innerHTML='<div class="page-toolbar report-toolbar"><label>Reporting window <select id="reportRange" class="page-select"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></label><button class="btn btn-primary" id="downloadReport"><i data-lucide="download"></i> Export CSV</button></div><div class="page-kpi-grid">'+[['Endpoint availability',Math.round(online/ machines.length*100)+'%','activity'],['Needs attention',critical,'shield-alert'],['Alerts recorded',alerts.length,'bell-ring'],['Sample window',reportRange,'calendar-clock']].map(x=>'<article class="stat-card"><div class="stat-top"><div class="stat-icon blue"><i data-lucide="'+x[2]+'"></i></div><div><div class="stat-label">'+x[0]+'</div><div class="stat-value">'+x[1]+'</div></div></div><div class="stat-foot">Illustrative demo summary</div></article>').join('')+'</div>'+pagePanel('Endpoint health distribution','Current sample inventory by status.','<div class="report-bars">'+[['Online',machines.filter(m=>m.status==='online').length,'#20b783'],['Critical',machines.filter(m=>m.status==='critical').length,'#e34d5b'],['Warning',machines.filter(m=>m.status==='warning').length,'#e6a32b'],['Offline',machines.filter(m=>m.status==='offline').length,'#9aa7bb']].map(x=>'<div class="report-bar-row"><span>'+x[0]+'</span><div class="report-track"><span style="width:'+(x[1]/machines.length*100)+'%;background:'+x[2]+'"></span></div><strong>'+x[1]+'</strong></div>').join('')+'</div>','chart-no-axes-combined')+pagePanel('Resource snapshot','CPU and memory values from the current synthetic endpoint inventory.','<div class="table-scroll"><table class="generic-table"><thead><tr><th>ENDPOINT</th><th>ZONE</th><th>CPU</th><th>MEMORY</th><th>STATUS</th></tr></thead><tbody>'+machines.map(m=>'<tr><td>'+m.id+'</td><td>'+m.zone+'</td><td>'+(m.cpu===null?'—':m.cpu+'%')+'</td><td>'+(m.ram===null?'—':m.ram+'%')+'</td><td>'+statusLabel(m)+'</td></tr>').join('')+'</tbody></table></div>','chart-no-axes-combined');
  $('#reportRange').value=reportRange;$('#reportRange').onchange=e=>{reportRange=e.target.value;renderDedicatedView('reports',mount);};
  $('#downloadReport').onclick=exportReport;
 }else if(view==='blacklist'){
  const entries=pageState.blacklist.filter(x=>(blacklistFilter==='all'||x.type===blacklistFilter));
  mount.innerHTML='<div class="page-kpi-grid">'+[['Policy entries',pageState.blacklist.length,'list-check'],['Active rules',pageState.blacklist.filter(x=>x.status==='Active').length,'shield-ban'],['Under review',pageState.blacklist.filter(x=>x.status==='Review').length,'scan-search'],['Coverage','Demo','monitor']].map(x=>'<article class="stat-card"><div class="stat-top"><div class="stat-icon blue"><i data-lucide="'+x[2]+'"></i></div><div><div class="stat-label">'+x[0]+'</div><div class="stat-value">'+x[1]+'</div></div></div><div class="stat-foot">Local policy simulation</div></article>').join('')+'</div>'+pagePanel('Add policy indicator','Add process names, hashes, domains or IP addresses to the local demo policy list.','<form id="blacklistForm" class="policy-form"><label>Indicator type<select id="blockType" class="page-select"><option>Process name</option><option>SHA-256 hash</option><option>IP address</option><option>Domain</option></select></label><label>Indicator value<input id="blockValue" required placeholder="e.g. unwanted-app.exe"></label><label>Reason<input id="blockReason" placeholder="Why should this be blocked?"></label><label>Scope<select id="blockScope" class="page-select"><option>All endpoints</option><option>Lab A</option><option>Lab B</option><option>Lab C</option></select></label><button class="btn btn-primary" type="submit"><i data-lucide="plus"></i> Add indicator</button></form>','shield-ban')+pagePanel('Policy list','Manage local entries. Removing an entry changes this browser demo only.','<div class="page-toolbar"><select id="blacklistFilter" class="page-select"><option value="all">All indicator types</option><option>Process name</option><option>SHA-256 hash</option><option>IP address</option><option>Domain</option></select><span class="muted-note">'+entries.length+' entries</span></div><div class="table-scroll"><table class="generic-table"><thead><tr><th>TYPE</th><th>INDICATOR</th><th>REASON</th><th>SCOPE</th><th>STATUS</th><th></th></tr></thead><tbody>'+entries.map(x=>'<tr><td>'+x.type+'</td><td><strong>'+esc(x.value)+'</strong></td><td>'+esc(x.reason)+'</td><td>'+x.scope+'</td><td><span class="status-badge '+(x.status==='Active'?'status-critical':'status-warning')+'">'+x.status+'</span></td><td><button class="text-button" data-remove-block="'+esc(x.value)+'">Remove</button></td></tr>').join('')+'</tbody></table></div>');
  $('#blacklistForm').onsubmit=e=>{e.preventDefault();const value=$('#blockValue').value.trim();if(!value)return;const type=$('#blockType').value;if(pageState.blacklist.some(x=>x.value.toLowerCase()===value.toLowerCase()))return showToast('That indicator already exists.');pageState.blacklist.unshift({type,value,reason:$('#blockReason').value.trim()||'Administrator-added demo rule',scope:$('#blockScope').value,status:'Active'});renderDedicatedView('blacklist',mount);showToast('Indicator added to local demo policy.');};
  $('#blacklistFilter').value=blacklistFilter;$('#blacklistFilter').onchange=e=>{blacklistFilter=e.target.value;renderDedicatedView('blacklist',mount);};
  $$('[data-remove-block]',mount).forEach(b=>b.onclick=()=>{pageState.blacklist=pageState.blacklist.filter(x=>x.value!==b.dataset.removeBlock);renderDedicatedView('blacklist',mount);showToast('Removed from local demo policy.');});
 }else if(view==='settings'){
  const s=pageState.settings;
  mount.innerHTML=pagePanel('Monitoring thresholds','Configure when demo telemetry should raise warning and critical states.','<form id="thresholdForm" class="settings-grid"><label>CPU warning (%)<input type="number" id="cpuWarn" min="1" max="99" value="'+s.cpuWarn+'"></label><label>CPU critical (%)<input type="number" id="cpuCritical" min="2" max="100" value="'+s.cpuCritical+'"></label><label>Memory warning (%)<input type="number" id="ramWarn" min="1" max="99" value="'+s.ramWarn+'"></label><div class="settings-help"><i data-lucide="info"></i> Values apply to this demo interface only.</div><button class="btn btn-primary" type="submit"><i data-lucide="save"></i> Save thresholds</button></form>','sliders-horizontal')+pagePanel('Workspace preferences','Tune the interface behavior and alert preferences.','<div class="settings-preference"><div><strong>Auto-refresh demo telemetry</strong><small>Generate sample chart readings periodically.</small></div><label class="switch"><input id="autoRefreshSetting" type="checkbox" '+(s.autoRefresh?'checked':'')+'><span></span></label></div><div class="settings-preference"><div><strong>Notify on high-severity alerts</strong><small>Show a toast when demo high-severity events are surfaced.</small></div><label class="switch"><input id="notifyHighSetting" type="checkbox" '+(s.notifyHigh?'checked':'')+'><span></span></label></div><div class="settings-preference"><div><strong>Notify when endpoint goes offline</strong><small>Preference only; no external notifications are sent.</small></div><label class="switch"><input id="notifyOfflineSetting" type="checkbox" '+(s.notifyOffline?'checked':'')+'><span></span></label></div><div class="settings-preference"><div><strong>Refresh interval</strong><small>Choose how often the sample trend chart updates.</small></div><select id="refreshSetting" class="page-select"><option value="5">5 seconds</option><option value="10">10 seconds</option><option value="30">30 seconds</option></select></div><div class="settings-footer"><button class="btn btn-secondary" id="resetSettings">Reset defaults</button><span class="muted-note">Theme can also be changed from the top bar.</span></div>','settings-2');
  $('#thresholdForm').onsubmit=e=>{e.preventDefault();s.cpuWarn=Number($('#cpuWarn').value);s.cpuCritical=Number($('#cpuCritical').value);s.ramWarn=Number($('#ramWarn').value);if(s.cpuWarn>=s.cpuCritical)return showToast('CPU warning must be lower than critical.');showToast('Threshold preferences saved locally.');};
  $('#autoRefreshSetting').onchange=e=>{s.autoRefresh=e.target.checked;window.clearInterval(window.__demoTimer);if(s.autoRefresh)window.__demoTimer=window.setInterval(pushDemoReading,s.refresh*1000);showToast('Auto-refresh '+(s.autoRefresh?'enabled':'disabled')+'.');};
  $('#notifyHighSetting').onchange=e=>s.notifyHigh=e.target.checked;
  $('#notifyOfflineSetting').onchange=e=>s.notifyOffline=e.target.checked;
  $('#refreshSetting').value=String(s.refresh);$('#refreshSetting').onchange=e=>{s.refresh=Number(e.target.value);window.clearInterval(window.__demoTimer);if(s.autoRefresh)window.__demoTimer=window.setInterval(pushDemoReading,s.refresh*1000);showToast('Refresh interval set to '+s.refresh+' seconds.');};
  $('#resetSettings').onclick=()=>{pageState.settings={cpuWarn:75,cpuCritical:90,ramWarn:85,refresh:5,notifyHigh:true,notifyOffline:true,autoRefresh:true};renderDedicatedView('settings',mount);showToast('Settings reset to defaults.');};
 }
 renderIcons(mount);
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
renderStats();renderMachines();renderAlerts();renderChart();renderIcons();tick();setInterval(tick,1000);window.__demoTimer=window.setInterval(pushDemoReading,pageState.settings.refresh*1000);