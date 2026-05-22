const DATA_URL = '/web_data/us-lame-duck/latest.json';

const ZONE_COLORS = {
  'Full Power': 'var(--blue)',
  'Waning':     'oklch(0.62 0.12 170)',
  'Quacking':   'var(--duck-deep)',
  'Fully Lame': 'var(--red)',
};

function fmtDate(str) {
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateShort(str) {
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function duckSVG(size, bobbing = false) {
  const cls = bobbing ? 'duck-bob' : '';
  const w = size, h = Math.round(size * 0.95);
  return '<svg class="' + cls + '" width="' + w + '" height="' + h + '" viewBox="0 0 200 190" style="overflow:visible" aria-hidden="true">'
    + '<ellipse cx="100" cy="178" rx="70" ry="6" fill="rgba(40,30,20,.12)"/>'
    + '<ellipse cx="100" cy="130" rx="72" ry="48" fill="url(#duckBody)"/>'
    + '<ellipse cx="35" cy="108" rx="18" ry="12" fill="url(#duckBody)" transform="rotate(-18 35 108)"/>'
    + '<ellipse cx="110" cy="132" rx="38" ry="22" fill="oklch(0.80 0.17 85)" opacity=".55"/>'
    + '<path d="M 75 138 Q 95 128 140 138" stroke="oklch(0.65 0.18 70)" stroke-width="1.2" fill="none" opacity=".5"/>'
    + '<circle cx="138" cy="74" r="42" fill="url(#duckHead)"/>'
    + '<ellipse cx="124" cy="58" rx="14" ry="10" fill="oklch(0.98 0.06 95)" opacity=".55"/>'
    + '<ellipse cx="88" cy="108" rx="18" ry="10" fill="oklch(0.98 0.06 95)" opacity=".35"/>'
    + '<ellipse cx="174" cy="80" rx="18" ry="10" fill="url(#beakGrad)"/>'
    + '<path d="M 158 82 Q 172 86 188 82" stroke="oklch(0.52 0.18 40)" stroke-width=".8" fill="none" opacity=".4"/>'
    + '<circle cx="148" cy="62" r="5.5" fill="#1a1814"/>'
    + '<circle cx="149.5" cy="60" r="1.8" fill="#fff"/>'
    + '</svg>';
}

function buildGaugeMeter(value) {
  const cx = 200, cy = 190, r = 150, ri = 122;
  const segs = [
    { from: 0,  to: 25,  color: 'var(--blue-soft)',     label: 'FULL POWER' },
    { from: 25, to: 50,  color: 'oklch(0.62 0.12 170)', label: 'WANING'     },
    { from: 50, to: 75,  color: 'var(--duck-deep)',      label: 'QUACKING'   },
    { from: 75, to: 100, color: 'var(--red)',            label: 'FULLY LAME' },
  ];
  function toRad(v) { return (180 - v / 100 * 180) * Math.PI / 180; }
  function pt(ang, radius) { return [cx + Math.cos(ang) * radius, cy - Math.sin(ang) * radius]; }
  function arc(from, to, R) {
    const a1 = toRad(from), a2 = toRad(to);
    const [x1,y1] = pt(a1, R), [x2,y2] = pt(a2, R);
    const large = Math.abs(from - to) > 50 ? 1 : 0;
    return { x1,y1,x2,y2, large };
  }
  const segPaths = segs.map(seg => {
    const outer = arc(seg.from, seg.to, r);
    const inner = arc(seg.from, seg.to, ri);
    const active = value >= seg.from && value < seg.to;
    const tt = seg.label === 'FULL POWER' ? 'Presidential agenda advancing; approval strong; Congress aligned.'
             : seg.label === 'WANING'     ? 'Legislative friction increasing; polling slipping.'
             : seg.label === 'QUACKING'   ? 'Clear lame-duck signals: approval declining, generic ballot adverse.'
             : 'Effectively sidelined; attention has moved to midterms.';
    return '<path d="M ' + outer.x1 + ' ' + outer.y1 + ' A ' + r + ' ' + r + ' 0 ' + outer.large + ' 1 ' + outer.x2 + ' ' + outer.y2 + ' L ' + inner.x2 + ' ' + inner.y2 + ' A ' + ri + ' ' + ri + ' 0 ' + inner.large + ' 0 ' + inner.x1 + ' ' + inner.y1 + ' Z"'
      + ' fill="' + seg.color + '" opacity="' + (active ? 1 : 0.22) + '"'
      + ' data-tooltip="' + seg.label + '|' + tt + '"'
      + ' style="cursor:pointer;transition:opacity .2s"/>';
  });
  const ticks = [0,25,50,75,100].map(t => {
    const a = toRad(t);
    const [x1,y1] = pt(a, r+6), [x2,y2] = pt(a, r+14), [xt,yt] = pt(a, r+28);
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="var(--ink-3)" stroke-width="1"/>'
      + '<text x="' + xt + '" y="' + (yt+3) + '" font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="middle">' + t + '</text>';
  });
  const needleAngle = toRad(value);
  const [nx,ny] = pt(needleAngle, r-20);
  const duckLeft = (nx / 400 * 100).toFixed(2);
  const duckTop  = (ny / 240 * 100 * 0.90).toFixed(2);
  const activeSeg = segs.find(s => value >= s.from && value < s.to) || segs[3];
  return '<div style="position:relative;width:100%;max-width:420px;margin:0 auto">'
    + '<svg viewBox="0 0 400 240" style="width:100%;overflow:visible">'
    + segPaths.join('') + ticks.join('')
    + '<line x1="' + cx + '" y1="' + cy + '" x2="' + nx + '" y2="' + ny + '" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="var(--ink)"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="var(--paper-3)"/>'
    + '</svg>'
    + '<div style="position:absolute;left:' + duckLeft + '%;top:' + duckTop + '%;transform:translate(-50%,-80%);pointer-events:none">' + duckSVG(72, true) + '</div>'
    + '<div class="meter-readout" style="margin-top:-8px">'
    + '<div class="eyebrow" style="color:var(--ink-3)">Current reading</div>'
    + '<div class="score">' + value + '<span style="font-size:22px;color:var(--ink-3)">/100</span></div>'
    + '<div class="label" style="color:' + activeSeg.color + '">' + activeSeg.label + '</div>'
    + '</div></div>';
}

function buildBathtubMeter(value) {
  const wY = 70 + (1 - value/100) * 240;
  const tickLines = [0,25,50,75,100].map(t => {
    const y = 50 + (1-t/100)*250+20;
    return '<line x1="18" y1="' + y + '" x2="28" y2="' + y + '" stroke="var(--ink-3)"/>'
      + '<text x="14" y="' + (y+3) + '" font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">' + t + '</text>';
  }).join('');
  const lameLine  = 50 + (1-75/100)*250+20;
  return '<div style="display:flex;justify-content:center;padding:8px 0">'
    + '<div style="position:relative;width:300px;height:340px">'
    + '<svg viewBox="-30 0 300 340" width="300" height="340" style="position:absolute;inset:0;overflow:visible">'
    + '<defs><clipPath id="tubClip"><path d="M 30 50 L 30 300 Q 30 320 50 320 L 210 320 Q 230 320 230 300 L 230 50 Z"/></clipPath></defs>'
    + '<path d="M 30 50 L 30 300 Q 30 320 50 320 L 210 320 Q 230 320 230 300 L 230 50 Z" fill="var(--paper-3)" stroke="var(--ink)" stroke-width="2"/>'
    + tickLines
    + '<g clip-path="url(#tubClip)"><rect x="30" y="' + wY + '" width="200" height="260" fill="var(--water)" opacity=".85"/></g>'
    + '<line x1="30" y1="' + lameLine + '" x2="230" y2="' + lameLine + '" stroke="var(--red)" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>'
    + '<text x="232" y="' + (lameLine+4) + '" font-size="9" font-family="var(--mono)" fill="var(--red)">FULLY LAME</text>'
    + '</svg>'
    + '<div style="position:absolute;left:50%;top:' + (wY-42) + 'px;transform:translateX(-50%);animation:duckBob 3.2s ease-in-out infinite;pointer-events:none">' + duckSVG(84) + '</div>'
    + '</div></div>'
    + '<div class="meter-readout" style="margin-top:8px">'
    + '<div class="eyebrow" style="color:var(--ink-3)">Current reading</div>'
    + '<div class="score">' + value + '<span style="font-size:22px;color:var(--ink-3)">/100</span></div>'
    + '</div>';
}

function buildWaterlineMeter(value) {
  const colorBands = [[0,25,'var(--blue-soft)'],[25,50,'oklch(0.62 0.12 170)'],[50,75,'var(--duck-deep)'],[75,100,'var(--red)']];
  const bandRects  = colorBands.map(([f,t,c]) => '<rect x="' + (f*6) + '" y="124" width="' + ((t-f)*6) + '" height="6" fill="' + c + '" opacity=".85"/>').join('');
  const scaleTicks = [0,25,50,75,100].map(t =>
    '<line x1="' + (t*6) + '" y1="120" x2="' + (t*6) + '" y2="134" stroke="var(--ink)" stroke-width="1"/>'
    + '<text x="' + (t*6) + '" y="118" font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="middle">' + t + '</text>'
  ).join('');
  return '<div style="padding:16px 0">'
    + '<div style="position:relative;height:140px">'
    + '<svg viewBox="0 0 600 140" width="100%" height="140" preserveAspectRatio="none" style="position:absolute;inset:0">'
    + '<defs><linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0%" stop-color="oklch(0.97 0.02 90)"/><stop offset="100%" stop-color="oklch(0.93 0.04 80)"/>'
    + '</linearGradient></defs>'
    + '<rect x="0" y="0" width="600" height="80" fill="url(#skyGrad)"/>'
    + '<rect x="0" y="80" width="600" height="60" fill="var(--water)" opacity=".8"/>'
    + '<path d="M 0 80 Q 75 74 150 80 T 300 80 T 450 80 T 600 80" stroke="var(--water-deep)" stroke-width="1.5" fill="none" opacity=".7"/>'
    + bandRects + scaleTicks
    + '<line x1="' + (value*6) + '" y1="20" x2="' + (value*6) + '" y2="134" stroke="var(--ink)" stroke-width="1" stroke-dasharray="2 3" opacity=".4"/>'
    + '</svg>'
    + '<div style="position:absolute;left:' + value + '%;top:24px;transform:translateX(-50%);animation:duckBob 3.2s ease-in-out infinite;pointer-events:none">' + duckSVG(68) + '</div>'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;margin-top:10px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--ink-3)">'
    + '<span>FULL POWER</span><span>WANING</span><span>QUACKING</span><span>FULLY LAME</span>'
    + '</div></div>'
    + '<div class="meter-readout" style="margin-top:4px">'
    + '<div class="eyebrow" style="color:var(--ink-3)">Current reading</div>'
    + '<div class="score">' + value + '<span style="font-size:22px;color:var(--ink-3)">/100</span></div>'
    + '</div>';
}

function buildComponentsGrid(components) {
  const COMP_COLORS = {
    net_approval:       'var(--red)',
    generic_ballot:     'var(--blue)',
    congressional_ctrl: 'var(--duck-deep)',
    economic_sentiment: 'oklch(0.62 0.12 170)',
  };
  function dragLabel(score) {
    if (score == null) return { text: '—', color: 'var(--ink-3)' };
    if (score >= 66)   return { text: '↑ Strong drag on LDI', color: 'var(--red-soft)' };
    if (score >= 40)   return { text: '↑ Moderate drag',      color: 'var(--duck-deep)' };
    return                    { text: '↓ Supportive',          color: 'oklch(0.55 0.12 150)' };
  }
  const grid = document.getElementById('comp-grid');
  if (!grid) return;
  grid.innerHTML = components.map(c => {
    const score = c.score != null ? c.score : null;
    const color = COMP_COLORS[c.id] || 'var(--ink-3)';
    const deltaStr = c.delta_30d != null
      ? '<span class="comp-delta delta-' + c.trend + '">' + (c.delta_30d > 0 ? '+' : '') + c.delta_30d.toFixed(1) + ' · 30d</span>'
      : '';
    const qBadge = c.data_quality ? '<span class="quality-badge quality-' + c.data_quality + '">' + c.data_quality + '</span>' : '';
    const drag = dragLabel(score);
    return '<div class="comp-cell" data-tooltip="' + (c.tooltip_en ? c.name_en + '|' + c.tooltip_en : '') + '">'
      + qBadge
      + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">'
      + '<span class="comp-weight" style="font-size:9px;letter-spacing:.12em">' + deltaStr + '</span>'
      + '</div>'
      + '<div class="comp-name">' + (c.name_en || c.id) + '</div>'
      + '<div style="font-family:var(--serif);font-size:42px;line-height:1;letter-spacing:-0.02em;margin-top:12px">' + (c.raw_label || '—') + '</div>'
      + '<div style="font-family:var(--mono);font-size:11px;margin-top:6px;color:' + drag.color + '">' + drag.text + '</div>'
      + '<div class="comp-bar" style="margin-top:12px"><div class="comp-bar-fill" style="width:' + (score || 0) + '%;background:' + color + '"></div></div>'
      + '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-3);margin-top:5px;letter-spacing:.06em">INDEX SCORE ' + (score != null ? score.toFixed(0)+'/100' : '—') + '</div>'
      + '</div>';
  }).join('');
}

let _chartData = [];

function buildChart(history) {
  _chartData = history.filter(h => h.ldi != null);
  if (!_chartData.length) return;
  const W = 900, H = 300, pL = 52, pR = 40, pT = 20, pB = 40;
  const n = _chartData.length;
  const xS   = i => pL + (i / (n-1)) * (W - pL - pR);
  const yLDI  = v => pT + (1 - v/100)     * (H - pT - pB);
  const yAppr = v => pT + (1 - (v+30)/60) * (H - pT - pB);
  const pathLDI = _chartData.map((p,i) => (i===0?'M':'L') + ' ' + xS(i).toFixed(1) + ' ' + yLDI(p.ldi).toFixed(1)).join(' ');
  let _apprFirst = true;
  const pathAppr = _chartData
    .map((p,i) => p.net_approval != null ? {p,i} : null).filter(Boolean)
    .map(function(obj) {
      const cmd = _apprFirst ? (_apprFirst = false, 'M') : 'L';
      return cmd + ' ' + xS(obj.i).toFixed(1) + ' ' + yAppr(obj.p.net_approval).toFixed(1);
    }).join(' ');
  const xLabels = [0,0.25,0.5,0.75,1].map(f => {
    const i = Math.floor(f*(n-1));
    return '<text x="' + xS(i) + '" y="' + (H-pB+18) + '" font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="middle">' + fmtDateShort(_chartData[i].date) + '</text>';
  });
  const gridLines = [0,25,50,75,100].map(v =>
    '<line x1="' + pL + '" y1="' + yLDI(v) + '" x2="' + (W-pR) + '" y2="' + yLDI(v) + '" stroke="var(--rule-2)" stroke-dasharray="2 3"/>'
    + '<text x="' + (pL-8) + '" y="' + (yLDI(v)+3) + '" font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">' + v + '</text>');
  const svg = document.getElementById('main-chart');
  svg.innerHTML = gridLines.join('') + xLabels.join('')
    + '<line x1="' + pL + '" y1="' + yAppr(0) + '" x2="' + (W-pR) + '" y2="' + yAppr(0) + '" stroke="var(--blue)" stroke-width=".8" opacity=".25" stroke-dasharray="4 4"/>'
    + '<path d="' + pathAppr + '" stroke="var(--blue)" stroke-width="2" fill="none" opacity=".9"/>'
    + '<path d="' + pathLDI + '" stroke="var(--duck-deep)" stroke-width="2.5" fill="none" stroke-linejoin="round"/>'
    + '<g id="chart-marker">'
    + '<line id="cm-line" x1="0" y1="' + pT + '" x2="0" y2="' + (H-pB) + '" stroke="var(--ink)" stroke-width="1.5"/>'
    + '<circle id="cm-ldi"  cx="0" cy="0" r="5" fill="var(--duck)" stroke="var(--ink)" stroke-width="1.5"/>'
    + '<circle id="cm-appr" cx="0" cy="0" r="4" fill="var(--paper-3)" stroke="var(--blue)" stroke-width="1.5"/>'
    + '</g>';
  const scrub = document.getElementById('chart-scrub');
  scrub.max = n-1; scrub.value = n-1;
  updateScrub(n-1, xS, yLDI, yAppr, H, pT, pB);
  scrub.addEventListener('input', function(e) { updateScrub(+e.target.value, xS, yLDI, yAppr, H, pT, pB); });
}

function updateScrub(idx, xS, yLDI, yAppr, H, pT, pB) {
  const p = _chartData[idx];
  if (!p) return;
  const x = xS(idx);
  document.getElementById('chart-date').textContent     = fmtDate(p.date);
  document.getElementById('chart-ldi-val').textContent  = p.ldi != null ? p.ldi.toFixed(1) : '—';
  document.getElementById('chart-appr-val').textContent = p.net_approval != null ? (p.net_approval>=0?'+':'') + p.net_approval.toFixed(1)+'pp' : '—';
  const line = document.getElementById('cm-line');
  if (line) { line.setAttribute('x1',x); line.setAttribute('x2',x); }
  const dotLDI = document.getElementById('cm-ldi');
  if (dotLDI) { dotLDI.setAttribute('cx',x); dotLDI.setAttribute('cy',yLDI(p.ldi||50)); }
  const dotAppr = document.getElementById('cm-appr');
  if (dotAppr && p.net_approval != null) { dotAppr.setAttribute('cx',x); dotAppr.setAttribute('cy',yAppr(p.net_approval)); }
}

function buildHistoricalPresidents(presidents, currentLDI) {
  const grid = document.getElementById('history-grid');
  if (!grid) return;
  function sparkPath(vals) {
    const W = 130, H = 40;
    return vals.map(function(v,i) { return (i===0?'M':'L') + ' ' + ((i/(vals.length-1))*W) + ' ' + (H-(v/100)*H); }).join(' ');
  }
  const cells = presidents.map(function(p) {
    const sp = p.sparkline && p.sparkline.length ? sparkPath(p.sparkline) : '';
    const partyColor = p.party === 'D' ? 'var(--blue)' : 'var(--red)';
    const dataStr = JSON.stringify(p).replace(/'/g, '&#39;');
    const endY = (40-(p.final_ldi/100)*40).toFixed(1);
    return '<div class="history-cell" data-pres=\'' + dataStr + '\' onclick="openPresModal(this)" title="Click for details">'
      + '<div class="history-pres">' + p.name + '</div>'
      + '<div class="history-term">' + p.term + '</div>'
      + (sp ? '<svg viewBox="0 0 130 40" width="100%" height="40" style="display:block" preserveAspectRatio="none">'
          + '<path d="' + sp + ' L 130 40 L 0 40 Z" fill="var(--duck)" opacity=".18"/>'
          + '<path d="' + sp + '" stroke="' + partyColor + '" stroke-width="1.6" fill="none"/>'
          + '<circle cx="130" cy="' + endY + '" r="2.5" fill="' + partyColor + '"/>'
          + '</svg>'
        : '<div style="height:40px"></div>')
      + '<div class="history-final">' + (p.final_ldi != null ? p.final_ldi : '—') + '</div>'
      + '<div class="history-label">Term-end LDI</div>'
      + '</div>';
  });
  const trumpPath = _chartData.length > 1 ? (function() {
    const W = 130, H = 40;
    return _chartData.map(function(d,i) { return (i===0?'M':'L') + ' ' + ((i/(_chartData.length-1))*W) + ' ' + (H-(d.ldi/100)*H); }).join(' ');
  })() : '';
  const trumpEndY = (40-(currentLDI/100)*40).toFixed(1);
  cells.push('<div class="history-cell" style="background:oklch(0.95 0.05 90 / 0.4);border-left:3px solid var(--duck-deep)">'
    + '<div class="history-pres">Trump</div>'
    + '<div class="history-term">2025–</div>'
    + (trumpPath ? '<svg viewBox="0 0 130 40" width="100%" height="40" style="display:block" preserveAspectRatio="none">'
        + '<path d="' + trumpPath + ' L 130 ' + trumpEndY + ' L 0 40 Z" fill="var(--duck)" opacity=".25"/>'
        + '<path d="' + trumpPath + '" stroke="var(--duck-deep)" stroke-width="2" fill="none"/>'
        + '<circle cx="130" cy="' + trumpEndY + '" r="3" fill="var(--duck-deep)"/>'
        + '</svg>' : '')
    + '<div class="history-final" style="color:var(--duck-deep)">' + currentLDI.toFixed(1) + '</div>'
    + '<div class="history-label">Current LDI</div>'
    + '</div>');
  grid.innerHTML = cells.join('');
}

function buildMidterms(midterms) {
  const grid = document.getElementById('midterms-grid');
  if (!grid) return;
  const pHouse  = midterms.house_dem_prob   || 0;
  const pSenate = midterms.senate_dem_prob  || 0;
  const hSeats  = midterms.house_seats_dem  || 0;
  const sSeats  = midterms.senate_seats_dem || 0;
  const hMaj = midterms.house_majority  || 218;
  const sMaj = midterms.senate_majority || 51;
  const hGOP = 435 - hSeats, sGOP = 100 - sSeats;
  function chamberCard(chamber, demSeats, gopSeats, totalSeats, maj, pDem) {
    const demPct = (demSeats/totalSeats*100).toFixed(1);
    const demFav = pDem > 0.55, gopFav = pDem < 0.45;
    const badgeClass = demFav ? 'badge-dem' : gopFav ? 'badge-gop' : 'badge-toss';
    const badgeText  = demFav ? 'Dem favored' : gopFav ? 'GOP favored' : 'Toss-up';
    const over = demSeats > maj ? '(+' + (demSeats-maj) + ')' : '';
    return '<div class="chamber-card">'
      + '<div class="chamber-title-row">'
      + '<h3 class="chamber-title">U.S. ' + chamber + '</h3>'
      + '<span class="chamber-badge ' + badgeClass + '">' + badgeText + '</span>'
      + '</div>'
      + '<div>'
      + '<div class="seat-bar-labels">'
      + '<span style="color:var(--blue)">Dems ' + demSeats + ' ' + over + '</span>'
      + '<span style="color:var(--red)">GOP ' + gopSeats + '</span>'
      + '</div>'
      + '<div class="seat-bar"><div class="b-dem" style="width:' + demPct + '%"></div><div class="b-gop" style="flex:1"></div></div>'
      + '<div class="seat-bar-legend"><span>0</span><span>' + maj + ' ← majority</span><span>' + totalSeats + '</span></div>'
      + '</div>'
      + '<div class="prob-row">'
      + '<div><div class="prob-label">Dem majority</div><div class="prob-value c-dem">' + Math.round(pDem*100) + '%</div></div>'
      + '<div><div class="prob-label">GOP majority</div><div class="prob-value c-gop">' + Math.round((1-pDem)*100) + '%</div></div>'
      + '</div></div>';
  }
  grid.innerHTML = chamberCard('House',  hSeats, hGOP, 435, hMaj, pHouse) +
                   chamberCard('Senate', sSeats, sGOP, 100, sMaj, pSenate);
}

function setupTooltip() {
  const tip = document.getElementById('tooltip');
  const ttLabel = document.getElementById('tt-label');
  const ttBody  = document.getElementById('tt-body');
  document.addEventListener('mousemove', function(e) {
    const el = e.target.closest('[data-tooltip]');
    if (el) {
      const parts = el.getAttribute('data-tooltip').split('|');
      ttLabel.textContent = parts[0] || '';
      ttBody.textContent  = parts[1] || '';
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX, window.innerWidth-260) + 'px';
      tip.style.top  = (e.clientY - 8) + 'px';
      tip.style.transform = 'translate(-50%, -100%)';
    } else {
      tip.style.display = 'none';
    }
  });
}

function setupMeterSwitcher() {
  document.querySelectorAll('.meter-switch button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const target = btn.dataset.meter;
      document.querySelectorAll('.meter-view').forEach(function(v) { v.classList.remove('active'); });
      document.getElementById(target).classList.add('active');
      document.querySelectorAll('.meter-switch button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
}

function openPresModal(el) {
  const p = JSON.parse(el.getAttribute('data-pres'));
  const dialog  = document.getElementById('pres-dialog');
  const content = document.getElementById('pres-modal-content');
  const partyColor = p.party === 'D' ? 'var(--blue)' : 'var(--red)';
  const partyName  = p.party === 'D' ? 'Democrat' : 'Republican';
  const n = p.sparkline.length;
  const W = 560, H = 180;
  const xs = function(i) { return 16 + (i/(n-1)) * (W-32); };
  const ys = function(v) { return H - 16 - (v/100) * (H-32); };
  const path = p.sparkline.map(function(v,i) { return (i===0?'M':'L') + ' ' + xs(i).toFixed(1) + ' ' + ys(v).toFixed(1); }).join(' ');
  const area = path + ' L ' + xs(n-1).toFixed(1) + ' ' + H + ' L ' + xs(0).toFixed(1) + ' ' + H + ' Z';
  const gridLines = [0,25,50,75,100].map(function(v) {
    return '<line x1="16" y1="' + ys(v) + '" x2="' + (W-16) + '" y2="' + ys(v) + '" stroke="var(--rule-2)" stroke-dasharray="2 3"/>'
      + '<text x="10" y="' + (ys(v)+4) + '" font-size="9" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">' + v + '</text>';
  });
  const dots = p.sparkline.map(function(v,i) {
    if (i !== 0 && i !== n-1) return '';
    return '<circle cx="' + xs(i).toFixed(1) + '" cy="' + ys(v).toFixed(1) + '" r="4" fill="' + partyColor + '"/>';
  }).join('');
  function zone(v) { return v >= 75 ? 'Fully Lame' : v >= 50 ? 'Quacking' : v >= 25 ? 'Waning' : 'Full Power'; }
  const startLDI = p.sparkline[0], endLDI = p.sparkline[n-1];
  const diff = endLDI - startLDI;
  content.innerHTML =
    '<div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--rule-2)">'
    + '<div class="eyebrow" style="color:var(--ink-3);margin-bottom:6px">' + partyName + ' · ' + p.term + '</div>'
    + '<div style="font-family:var(--serif);font-size:32px;letter-spacing:-0.02em">' + p.name + '</div>'
    + '</div>'
    + '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;margin-bottom:12px">'
    + gridLines.join('')
    + '<path d="' + area + '" fill="var(--duck)" opacity=".12"/>'
    + '<path d="' + path + '" stroke="' + partyColor + '" stroke-width="2" fill="none"/>'
    + dots
    + '</svg>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding-top:16px;border-top:1px solid var(--rule-2)">'
    + '<div><div class="eyebrow" style="color:var(--ink-3);font-size:9px;margin-bottom:4px">Start of term</div>'
    + '<div style="font-family:var(--serif);font-size:28px">' + startLDI.toFixed(0) + '</div>'
    + '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">' + zone(startLDI) + '</div></div>'
    + '<div><div class="eyebrow" style="color:var(--ink-3);font-size:9px;margin-bottom:4px">End of term</div>'
    + '<div style="font-family:var(--serif);font-size:28px;color:' + partyColor + '">' + endLDI.toFixed(0) + '</div>'
    + '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">' + zone(endLDI) + '</div></div>'
    + '<div><div class="eyebrow" style="color:var(--ink-3);font-size:9px;margin-bottom:4px">Change</div>'
    + '<div style="font-family:var(--serif);font-size:28px">' + (diff>=0?'+':'') + diff.toFixed(0) + '</div>'
    + '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">over term</div></div>'
    + '</div>'
    + '<p style="font-size:12px;color:var(--ink-3);margin-top:16px;font-family:var(--mono);line-height:1.6">'
    + 'Retroactive LDI computed from real historical data: approval (Gallup archive), generic ballot (ANES estimates), congressional control (historical record), and UMCSENT (FRED).'
    + '</p>';
  dialog.showModal();
}

async function initPage() {
  let data;
  try {
    const resp = await fetch(DATA_URL);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    data = await resp.json();
  } catch(err) {
    console.error('Failed to load LDI data:', err);
    const sub = document.querySelector('.hero-sub');
    if (sub) sub.textContent += ' (data unavailable — check back later)';
    return;
  }
  const ldi        = data.ldi;
  const components = data.components || [];
  const history    = data.history    || [];
  const meta       = data.meta       || {};
  const midterms   = data.midterms   || {};
  const presidents = data.historical_presidents || [];

  const updEl = document.getElementById('hero-updated');
  if (updEl) updEl.textContent = meta.as_of_date
    ? new Date(meta.as_of_date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
    : '—';

  const scoreEl = document.getElementById('stat-ldi');
  if (scoreEl) scoreEl.innerHTML = ldi.score + '<span style="font-size:18px;color:var(--ink-3)">/100</span>';

  const deltaEl = document.getElementById('stat-delta');
  if (deltaEl && ldi.delta_7d != null) {
    const d = ldi.delta_7d;
    deltaEl.className = 'stat-delta ' + (d>0?'delta-up':d<0?'delta-down':'delta-flat');
    deltaEl.textContent = (d>0?'▲':d<0?'▼':'—') + ' ' + Math.abs(d).toFixed(1) + ' · 7-day';
  }

  const apprComp = components.find(function(c) { return c.id === 'net_approval'; });
  if (apprComp) {
    const el = document.getElementById('stat-approval');
    if (el) el.textContent = apprComp.raw_label || '—';
  }

  const daysEl = document.getElementById('stat-days');
  if (daysEl) daysEl.textContent = meta.days_to_midterms != null ? meta.days_to_midterms : '—';

  const qualNote = document.getElementById('meter-quality-note');
  if (qualNote) qualNote.textContent = ldi.data_quality === 'real' ? '✓ All real data' : '⚠ Mixed (some estimates)';

  const v = ldi.score;
  document.getElementById('meter-gauge').innerHTML = buildGaugeMeter(v);
  document.getElementById('meter-tub').innerHTML   = buildBathtubMeter(v);
  document.getElementById('meter-water').innerHTML = buildWaterlineMeter(v);
  setupMeterSwitcher();
  buildComponentsGrid(components);
  buildChart(history);
  buildHistoricalPresidents(presidents, v);
  buildMidterms(midterms);
  setupTooltip();

  const fv = document.getElementById('footer-version');
  if (fv) fv.textContent = 'LDI v' + (meta.version||'1.0') + ' · ' + (meta.as_of_date||'');
}

document.addEventListener('DOMContentLoaded', initPage);
