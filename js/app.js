const BLUE = '#003399', BLUE_DARK = '#001f5b', YELLOW = '#ffcc00', RED = '#b42318', MUTED = '#657089', LINE = '#dce3ee';
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US');
const pct = v => v == null ? '—' : `${(v * 100).toFixed(1)}%`;
const signedPct = v => v == null ? '—' : `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
const fmt = v => v == null ? '—' : number.format(Math.round(v));

const layoutBase = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
  font: {family: 'Inter, Segoe UI, sans-serif', color: '#172033', size: 11},
  margin: {l: 54, r: 25, t: 20, b: 52},
  hoverlabel: {bgcolor:'#071d49', font:{color:'#fff'}},
  xaxis: {gridcolor:'#edf0f5', zeroline:false}, yaxis: {gridcolor:'#edf0f5', zeroline:false}
};
const config = {responsive:true, displaylogo:false, modeBarButtonsToRemove:['lasso2d','select2d']};
const $ = id => document.getElementById(id);
const heroApplications=$('heroApplications'), heroRank=$('heroRank'), heroGrowth=$('heroGrowth'), heroNotIssued=$('heroNotIssued'), heroMev=$('heroMev');
const kpiApplications=$('kpiApplications'), kpiApplicationsDelta=$('kpiApplicationsDelta'), kpiIssued=$('kpiIssued'), kpiNotIssued=$('kpiNotIssued'), kpiNotIssuedShare=$('kpiNotIssuedShare'), kpiMev=$('kpiMev'), kpiRank=$('kpiRank');
const mapYear=$('mapYear'), mapMetric=$('mapMetric'), countrySelect=$('countrySelect'), countryYear=$('countryYear');
const countryTrendTitle=$('countryTrendTitle'), countryCityTitle=$('countryCityTitle'), countryCityYearLabel=$('countryCityYearLabel'), countryKpis=$('countryKpis'), stateTableBody=$('stateTableBody');
const locationSummary=$('locationSummary'), stdBaghdad=$('stdBaghdad'), stdErbil=$('stdErbil'), stdExplanation=$('stdExplanation'), germanyErbilDecline=$('germanyErbilDecline'), navToggle=$('navToggle');
const DATA = window.DASHBOARD_DATA;
if (!DATA) { document.body.insertAdjacentHTML('afterbegin','<div style="padding:12px;background:#fff3cd;color:#664d03;text-align:center">Dashboard data could not load.</div>'); } else { init(); }

function init(){
  const latest = DATA.yearly.find(d=>d.year===DATA.meta.last_data_year);
  fillHero(latest); fillOverview(latest); fillSelectors(); drawTrends(); drawMap(); updateCountry(); drawStateTable(); drawLocations(); drawGermany();
  bindEvents();
}
function fillHero(d){
  heroApplications.textContent=fmt(d.applications); heroRank.textContent=`${d.rank}th`; heroGrowth.textContent=signedPct(d.yoy_applications); heroNotIssued.textContent=pct(d.not_issued_share); heroMev.textContent=pct(d.mev_share);
}
function fillOverview(d){
  kpiApplications.textContent=fmt(d.applications); kpiApplicationsDelta.textContent=`${signedPct(d.yoy_applications)} vs ${d.year-1}`;
  kpiIssued.textContent=fmt(d.issued); kpiNotIssued.textContent=fmt(d.not_issued); kpiNotIssuedShare.textContent=`${pct(d.not_issued_share)} of recorded decisions`;
  kpiMev.textContent=pct(d.mev_share); kpiRank.textContent=`${d.rank}th`;
}
function fillSelectors(){
  const years=[...new Set(DATA.yearly.map(d=>d.year))].sort((a,b)=>b-a); const states=[...new Set(DATA.state_year.map(d=>d.state))].sort();
  [mapYear,countryYear].forEach(el=>{el.innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join(''); el.value=2025;});
  countrySelect.innerHTML=states.map(s=>`<option value="${s}">${s}</option>`).join(''); countrySelect.value='France';
}
function drawTrends(){
  const y=DATA.yearly;
  Plotly.newPlot('trendChart',[
    {x:y.map(d=>d.year),y:y.map(d=>d.applications),name:'Applications',mode:'lines+markers',line:{color:BLUE,width:4},marker:{size:7}},
    {x:y.map(d=>d.year),y:y.map(d=>d.issued),name:'Uniform visas issued',mode:'lines+markers',line:{color:YELLOW,width:3},marker:{size:6}},
    {x:y.map(d=>d.year),y:y.map(d=>d.not_issued),name:'Cases not issued',mode:'lines+markers',line:{color:RED,width:3},marker:{size:6}}
  ],{...layoutBase,legend:{orientation:'h',y:-.22},yaxis:{...layoutBase.yaxis,tickformat:',d'},xaxis:{...layoutBase.xaxis,dtick:1}},config);
  const base=y.find(d=>d.year===2019), post=y.filter(d=>d.year>=2019);
  Plotly.newPlot('recoveryChart',[
    {x:post.map(d=>d.year),y:post.map(d=>d.applications/base.applications*100),name:'Iraq',mode:'lines+markers',line:{color:BLUE,width:4}},
    {x:post.map(d=>d.year),y:post.map(d=>d.global_applications/base.global_applications*100),name:'Worldwide',mode:'lines+markers',line:{color:YELLOW,width:4}}
  ],{...layoutBase,legend:{orientation:'h',y:-.22},yaxis:{...layoutBase.yaxis,ticksuffix:'',title:'Index (2019 = 100)'},shapes:[{type:'line',x0:2019,x1:2025,y0:100,y1:100,line:{color:'#9aa6bd',dash:'dot'}}],xaxis:{...layoutBase.xaxis,dtick:1}},config);
}
function drawMap(){
  const year=+mapYear.value, metric=mapMetric.value; const rows=DATA.state_year.filter(d=>d.year===year && d.iso3);
  const label={applications:'Applications',not_issued_share:'Cases not issued share',mev_share:'MEV share'}[metric];
  const z=rows.map(d=> metric==='applications'?d[metric]:d[metric]*100);
  const custom=rows.map(d=>[d.state,d.applications,d.issued,d.not_issued,pct(d.not_issued_share),pct(d.mev_share)]);
  Plotly.react('mapChart',[{type:'choropleth',locationmode:'ISO-3',locations:rows.map(d=>d.iso3),z,customdata:custom,
    colorscale:[[0,'#dce7ff'],[.3,'#91adea'],[.65,BLUE],[1,BLUE_DARK]],marker:{line:{color:'#fff',width:1}},colorbar:{title:metric==='applications'?'Applications':'%'},
    hovertemplate:'<b>%{customdata[0]}</b><br>Applications: %{customdata[1]:,}<br>Issued: %{customdata[2]:,}<br>Not issued: %{customdata[3]:,}<br>Not issued share: %{customdata[4]}<br>MEV share: %{customdata[5]}<extra></extra>'
  }],{...layoutBase,margin:{l:0,r:0,t:5,b:0},geo:{scope:'europe',projection:{type:'natural earth'},showframe:false,showcoastlines:false,showland:true,landcolor:'#eef1f5',bgcolor:'rgba(0,0,0,0)',fitbounds:'locations'},title:{text:`${label} · ${year}`,font:{size:13,color:MUTED},x:.01,xanchor:'left'}},config);
}
function updateCountry(){
  const state=countrySelect.value, year=+countryYear.value; const all=DATA.state_year.filter(d=>d.state===state).sort((a,b)=>a.year-b.year), snap=all.find(d=>d.year===year);
  countryTrendTitle.textContent=`${state} · 2015–2025`; countryCityTitle.textContent=`${state} · Baghdad / Erbil`; countryCityYearLabel.textContent=year;
  countryKpis.innerHTML = snap ? [
    ['Applications',fmt(snap.applications)],['Issued',fmt(snap.issued)],['Cases not issued',fmt(snap.not_issued)],['Not issued share',pct(snap.not_issued_share)],['MEV share',pct(snap.mev_share)]
  ].map(([a,b])=>`<div class="mini-kpi"><span>${a}</span><strong>${b}</strong></div>`).join('') : `<div class="mini-kpi"><span>No record</span><strong>—</strong></div>`;
  Plotly.react('countryTrendChart',[
    {x:all.map(d=>d.year),y:all.map(d=>d.applications),name:'Applications',type:'bar',marker:{color:BLUE},hovertemplate:'%{x}<br>Applications: %{y:,}<extra></extra>'},
    {x:all.map(d=>d.year),y:all.map(d=>d.not_issued_share*100),name:'Not issued share',type:'scatter',mode:'lines+markers',yaxis:'y2',line:{color:RED,width:3},hovertemplate:'%{x}<br>Not issued share: %{y:.1f}%<extra></extra>'}
  ],{...layoutBase,legend:{orientation:'h',y:-.22},xaxis:{...layoutBase.xaxis,dtick:1},yaxis:{...layoutBase.yaxis,title:'Applications'},yaxis2:{title:'Not issued share',ticksuffix:'%',overlaying:'y',side:'right',showgrid:false}},config);
  const cities=['Baghdad','Erbil']; const cr=cities.map(c=>DATA.post_year.find(d=>d.year===year&&d.state===state&&d.city===c));
  Plotly.react('countryCityChart',[
    {x:cities,y:cr.map(d=>d?d.applications:0),name:'Applications',type:'bar',marker:{color:BLUE}},
    {x:cities,y:cr.map(d=>d?d.not_issued:0),name:'Cases not issued',type:'bar',marker:{color:RED}}
  ],{...layoutBase,barmode:'group',legend:{orientation:'h',y:-.18},yaxis:{...layoutBase.yaxis,tickformat:',d'}},config);
}
function drawStateTable(){
  const rows=DATA.state_year.filter(d=>d.year===2025).sort((a,b)=>b.applications-a.applications);
  stateTableBody.innerHTML=rows.map(d=>`<tr><td>${d.state}</td><td>${fmt(d.applications)}</td><td>${fmt(d.issued)}</td><td>${fmt(d.not_issued)}</td><td>${pct(d.not_issued_share)}</td><td>${pct(d.mev_share)}</td></tr>`).join('');
}
function drawLocations(){
  const rows=DATA.city_year.filter(d=>d.year===2025).sort((a,b)=>b.applications-a.applications);
  locationSummary.innerHTML=rows.map(d=>`<div class="mini-kpi"><span>${d.city} applications</span><strong>${fmt(d.applications)}</strong></div><div class="mini-kpi"><span>${d.city} not issued share</span><strong>${pct(d.not_issued_share)}</strong></div>`).join('') + `<div class="mini-kpi"><span>Raw gap</span><strong>${((rows.find(d=>d.city==='Erbil').not_issued_share-rows.find(d=>d.city==='Baghdad').not_issued_share)*100).toFixed(1)} pp</strong></div>`;
  Plotly.newPlot('locationChart',[
    {x:rows.map(d=>d.city),y:rows.map(d=>d.issued+d.ltv),name:'Issued incl. LTV',type:'bar',marker:{color:BLUE}},
    {x:rows.map(d=>d.city),y:rows.map(d=>d.not_issued),name:'Cases not issued',type:'bar',marker:{color:RED}}
  ],{...layoutBase,barmode:'stack',legend:{orientation:'h',y:-.18},yaxis:{...layoutBase.yaxis,tickformat:',d'}},config);
  stdBaghdad.textContent=pct(DATA.standardised_2025.baghdad); stdErbil.textContent=pct(DATA.standardised_2025.erbil);
  stdExplanation.textContent=`Using a common destination mix for the seven states operating in both cities, the descriptive gap narrows to ${DATA.standardised_2025.gap_pp.toFixed(1)} percentage points.`;
}
function drawGermany(){
  const g=DATA.germany_case;
  Plotly.newPlot('germanyChart',[
    {x:['Baghdad','Erbil'],y:[g.baghdad['2024'],g.erbil['2024']],name:'2024',type:'bar',marker:{color:BLUE}},
    {x:['Baghdad','Erbil'],y:[g.baghdad['2025'],g.erbil['2025']],name:'2025',type:'bar',marker:{color:YELLOW,line:{color:BLUE_DARK,width:1}}}
  ],{...layoutBase,barmode:'group',legend:{orientation:'h',y:-.18},yaxis:{...layoutBase.yaxis,title:'Applications',tickformat:',d'},title:{text:`Germany applications · ${signedPct(g.total.pct_change)} overall`,font:{size:13,color:MUTED},x:.02}},config);
  germanyErbilDecline.textContent=signedPct(g.erbil.pct_change);
}
function bindEvents(){
  mapYear.addEventListener('change',drawMap); mapMetric.addEventListener('change',drawMap); countrySelect.addEventListener('change',updateCountry); countryYear.addEventListener('change',updateCountry);
  navToggle.addEventListener('click',()=>{const nav=document.getElementById('mainNav');nav.classList.toggle('open');navToggle.setAttribute('aria-expanded',nav.classList.contains('open'));});
  document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('mainNav').classList.remove('open')));
}
