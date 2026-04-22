// ── API helper ────────────────────────────────────────────────
var API = {
  get: function(url, cb){
    fetch(url).then(function(r){ return r.json(); }).then(cb).catch(function(e){ console.error(e); });
  },
  put: function(url, body, cb){
    fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){ return r.json(); }).then(cb||function(){}).catch(function(e){ console.error(e); });
  },
  patch: function(url, cb){
    fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json'}})
      .then(function(r){ return r.json(); }).then(cb||function(){}).catch(function(e){ console.error(e); });
  },
  del: function(url, cb){
    fetch(url,{method:'DELETE'})
      .then(function(r){ return r.json(); }).then(cb||function(){}).catch(function(e){ console.error(e); });
  },
  post: function(url, body, cb){
    fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){ return r.json(); }).then(cb||function(){}).catch(function(e){ console.error(e); });
  }
};

// ── Estado ────────────────────────────────────────────────────
var rifaData = {}, sorteoHistory = [], currentNum = null;
var sorteoRunning = false, spinTO = null, lastWinner = null;
var currentFilter = 'all', isPaidSelected = true;

// ── Carga inicial ─────────────────────────────────────────────
function loadAll(cb){
  API.get('/api/tickets', function(data){
    rifaData = data;
    API.get('/api/sorteo', function(history){
      sorteoHistory = history.map(function(h){
        return { num: h.num, buyer: { name: h.buyer_name, phone: h.buyer_phone }, date: h.drawn_at };
      });
      if(cb) cb();
    });
  });
}

// ── Tabs ──────────────────────────────────────────────────────
function showTab(name, btn){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
  if(name === 'sorteo') renderHistory();
}

// ── Grilla ────────────────────────────────────────────────────
function buildGrid(){
  var g = document.getElementById('grid');
  g.innerHTML = '';
  for(var i = 1; i <= 100; i++){
    (function(num){
      var b = rifaData[num];
      var btn = document.createElement('button');
      btn.className = 'num-btn' + (b ? (b.paid ? ' paid' : ' unpaid') : '');
      if(lastWinner && lastWinner.num === num) btn.className += ' winner-hl';
      btn.textContent = num;
      btn.onclick = function(){ openModal(num); };
      g.appendChild(btn);
    })(i);
  }
  updateStats();
}

function updateStats(){
  var entries = Object.keys(rifaData).map(function(k){ return rifaData[k]; });
  var sold    = entries.length;
  var paid    = entries.filter(function(b){ return b.paid; }).length;
  document.getElementById('stat-free').textContent   = 100 - sold;
  document.getElementById('stat-sold').textContent   = sold;
  document.getElementById('stat-paid').textContent   = paid;
  document.getElementById('stat-unpaid').textContent = sold - paid;
  renderDebtors();
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(num){
  currentNum = num;
  var b = rifaData[num];
  document.getElementById('modal-num').textContent = '#' + String(num).padStart(2,'0');
  if(b){
    var bdg = document.getElementById('modal-badge');
    bdg.textContent = b.paid ? 'Pago' : 'Debe';
    bdg.className   = 'modal-badge ' + (b.paid ? 'badge-paid' : 'badge-unpaid');
    document.getElementById('view-name').textContent  = b.name  || '-';
    document.getElementById('view-phone').textContent = b.phone || '-';
    document.getElementById('view-note').textContent  = b.note  || '-';
    document.getElementById('view-pay').textContent   = b.paid  ? 'Pago' : 'Pendiente';
    document.getElementById('view-pay').style.color   = b.paid  ? 'var(--teal)' : 'var(--unpaid)';
    var pb = document.getElementById('btn-pay-toggle');
    pb.textContent = b.paid ? 'Marcar como pendiente' : 'Marcar como pago';
    pb.className   = 'btn-pay-toggle ' + (b.paid ? 'mark-unpaid' : 'mark-paid');
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('view-section').style.display = 'block';
  } else {
    document.getElementById('modal-badge').textContent = 'Disponible';
    document.getElementById('modal-badge').className   = 'modal-badge badge-free';
    ['inp-name','inp-phone','inp-note'].forEach(function(id){ document.getElementById(id).value = ''; });
    isPaidSelected = true;
    document.getElementById('opt-paid').className   = 'pay-opt sel-paid';
    document.getElementById('opt-unpaid').className = 'pay-opt';
    document.getElementById('form-section').style.display = 'block';
    document.getElementById('view-section').style.display = 'none';
    setTimeout(function(){ document.getElementById('inp-name').focus(); }, 300);
  }
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeModal(){
  document.getElementById('modal-backdrop').classList.remove('open');
  currentNum = null;
}
function handleBackdropClick(e){
  if(e.target === document.getElementById('modal-backdrop')) closeModal();
}
function selectPay(paid){
  isPaidSelected = paid;
  document.getElementById('opt-paid').className   = paid ? 'pay-opt sel-paid' : 'pay-opt';
  document.getElementById('opt-unpaid').className = paid ? 'pay-opt' : 'pay-opt sel-unpaid';
}

function saveBuyer(){
  var name = document.getElementById('inp-name').value.trim();
  if(!name){ showToast('Ingresa el nombre del comprador'); return; }
  var body = {
    name:  name,
    phone: document.getElementById('inp-phone').value.trim(),
    note:  document.getElementById('inp-note').value.trim(),
    paid:  isPaidSelected
  };
  API.put('/api/tickets/' + currentNum, body, function(){
    rifaData[currentNum] = Object.assign({ date: new Date().toLocaleDateString('es-AR') }, body);
    buildGrid(); renderList(); closeModal();
    showToast('Nro ' + String(currentNum).padStart(2,'0') + ' vendido a ' + name);
  });
}

function editBuyer(){
  var b = rifaData[currentNum];
  document.getElementById('inp-name').value  = b.name  || '';
  document.getElementById('inp-phone').value = b.phone || '';
  document.getElementById('inp-note').value  = b.note  || '';
  isPaidSelected = !!b.paid;
  document.getElementById('opt-paid').className   = b.paid ? 'pay-opt sel-paid' : 'pay-opt';
  document.getElementById('opt-unpaid').className = b.paid ? 'pay-opt' : 'pay-opt sel-unpaid';
  document.getElementById('modal-badge').textContent = 'Editando';
  document.getElementById('modal-badge').className   = 'modal-badge badge-free';
  document.getElementById('form-section').style.display = 'block';
  document.getElementById('view-section').style.display = 'none';
  setTimeout(function(){ document.getElementById('inp-name').focus(); }, 50);
}

function releaseBuyer(){
  if(!confirm('Liberar el numero #' + currentNum + '?')) return;
  API.del('/api/tickets/' + currentNum, function(){
    delete rifaData[currentNum];
    buildGrid(); renderList(); closeModal();
    showToast('Numero ' + currentNum + ' liberado');
  });
}

function togglePay(){
  var b = rifaData[currentNum];
  if(!b) return;
  API.patch('/api/tickets/' + currentNum + '/pay', function(res){
    b.paid = res.paid;
    buildGrid(); renderList();
    document.getElementById('view-pay').textContent = b.paid ? 'Pago' : 'Pendiente';
    document.getElementById('view-pay').style.color = b.paid ? 'var(--teal)' : 'var(--unpaid)';
    var bdg = document.getElementById('modal-badge');
    bdg.textContent = b.paid ? 'Pago' : 'Debe';
    bdg.className   = 'modal-badge ' + (b.paid ? 'badge-paid' : 'badge-unpaid');
    var pb = document.getElementById('btn-pay-toggle');
    pb.textContent = b.paid ? 'Marcar como pendiente' : 'Marcar como pago';
    pb.className   = 'btn-pay-toggle ' + (b.paid ? 'mark-unpaid' : 'mark-paid');
    showToast(b.paid ? b.name + ' marcado como pago' : b.name + ' pendiente');
  });
}

// ── Lista ─────────────────────────────────────────────────────
function setFilter(f, btn){
  currentFilter = f;
  document.querySelectorAll('.filter-pill').forEach(function(p){ p.className = 'filter-pill'; });
  btn.classList.add('active-' + f);
  renderList();
}

function renderList(){
  var sv = (document.querySelector('.search-input').value || '').toLowerCase();
  var list = document.getElementById('sold-list');
  var entries = Object.keys(rifaData).map(function(k){ return [k, rifaData[k]]; })
    .filter(function(e){
      var n = e[0], b = e[1];
      if(currentFilter === 'paid'   && !b.paid) return false;
      if(currentFilter === 'unpaid' &&  b.paid) return false;
      if(sv) return b.name.toLowerCase().indexOf(sv) > -1 || n.indexOf(sv) > -1 || (b.phone && b.phone.indexOf(sv) > -1);
      return true;
    })
    .sort(function(a,b){ return Number(a[0]) - Number(b[0]); });

  if(!entries.length){
    var msg = currentFilter === 'unpaid' ? 'Todos los compradores pagaron!' : (currentFilter === 'paid' ? 'No hay numeros pagos aun.' : 'Todavia no se vendieron numeros.');
    list.innerHTML = '<div class="empty-state"><div class="ei">' + (currentFilter==='unpaid'?'&#127881;':'&#127903;') + '</div><p>' + (sv ? 'Sin resultados.' : msg) + '</p></div>';
    return;
  }
  list.innerHTML = entries.map(function(e){
    var n = e[0], b = e[1];
    return '<div class="sold-item">' +
      '<div class="sold-num-badge ' + (b.paid ? 'is-paid' : 'is-unpaid') + '">' + n + '</div>' +
      '<div class="sold-details" onclick="openModal(' + n + ')">' +
        '<div class="sold-name">' + b.name + '</div>' +
        '<div class="sold-contact">' + ([b.phone, b.note].filter(Boolean).join(' · ') || b.date) + '</div>' +
      '</div>' +
      '<span class="pay-badge ' + (b.paid ? 'paid' : 'unpaid') + '">' + (b.paid ? 'Pago' : 'Debe') + '</span>' +
      '<button class="btn-toggle-pay ' + (b.paid ? 'is-paid' : '') + '" onclick="quickToggle(' + n + ')">' + (b.paid ? 'Pago' : 'Debe') + '</button>' +
    '</div>';
  }).join('');
}

function quickToggle(num){
  var b = rifaData[num];
  if(!b) return;
  API.patch('/api/tickets/' + num + '/pay', function(res){
    b.paid = res.paid;
    buildGrid(); renderList();
    showToast(b.name + (b.paid ? ' - pago' : ' - pendiente'));
  });
}

// ── Deudores ──────────────────────────────────────────────────
function renderDebtors(){
  var debtors = Object.keys(rifaData)
    .filter(function(k){ return !rifaData[k].paid; })
    .sort(function(a,b){ return Number(a)-Number(b); });
  var wrap = document.getElementById('debtors-wrapper');
  if(!debtors.length){ wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  document.getElementById('debtors-count').textContent = debtors.length + ' sin pagar';
  document.getElementById('debtors-list').innerHTML = debtors.map(function(k){
    var b = rifaData[k];
    return '<div class="debtor-item">' +
      '<div class="debtor-num">' + k + '</div>' +
      '<div class="debtor-details">' +
        '<div class="debtor-name">' + b.name + '</div>' +
        '<div class="debtor-contact">' + ([b.phone,b.note].filter(Boolean).join(' · ') || b.date) + '</div>' +
      '</div>' +
      '<button class="btn-cobrado" onclick="quickToggle(' + k + ')">Cobrado</button>' +
    '</div>';
  }).join('');
}

// ── Sorteo ────────────────────────────────────────────────────
function iniciarSorteo(){
  if(sorteoRunning) return;
  var sold = Object.keys(rifaData).map(Number);
  if(!sold.length){ showToast('No hay numeros vendidos'); return; }
  var won = sorteoHistory.map(function(h){ return h.num; });
  var candidates = sold.filter(function(n){ return won.indexOf(n) === -1; });
  if(!candidates.length){ showToast('Todos los numeros ya fueron sorteados'); return; }

  sorteoRunning = true;
  document.getElementById('btn-sortear').disabled = true;
  document.getElementById('winner-panel').classList.remove('show');

  var dn = document.getElementById('drum-number');
  var dm = document.getElementById('drum-name');
  dn.classList.add('spinning');
  dm.textContent = 'Sorteando…';

  var winner  = candidates[Math.floor(Math.random() * candidates.length)];
  var elapsed = 0, speed = 55, TOTAL = 4200;
  function tick(){
    dn.textContent = String(candidates[Math.floor(Math.random()*candidates.length)]).padStart(2,'0');
    elapsed += speed;
    if(elapsed > TOTAL * .6)  speed = 75 + (elapsed - TOTAL*.6) / 8;
    if(elapsed > TOTAL * .85) speed = 160;
    if(elapsed >= TOTAL){ revealWinner(winner); }
    else spinTO = setTimeout(tick, speed);
  }
  tick();
}

function revealWinner(num){
  var buyer = rifaData[num];
  var dn = document.getElementById('drum-number');
  var dm = document.getElementById('drum-name');
  dn.classList.remove('spinning');
  dn.textContent = String(num).padStart(2,'0');
  dm.textContent = buyer ? buyer.name : '(sin datos)';

  document.getElementById('winner-num-big').textContent  = '#' + String(num).padStart(2,'0');
  document.getElementById('winner-name-big').textContent = buyer ? buyer.name : 'Sin nombre';
  document.getElementById('winner-detail').textContent   = buyer && buyer.phone ? buyer.phone : (buyer && buyer.note ? buyer.note : '');
  document.getElementById('winner-panel').classList.add('show');

  lastWinner = { num: num };
  var entry = { num: num, buyer: buyer, date: new Date().toLocaleString('es-AR') };

  API.post('/api/sorteo', {
    num:         num,
    buyer_name:  buyer ? buyer.name  : '',
    buyer_phone: buyer ? buyer.phone : ''
  }, function(res){
    entry.date = res.drawn_at || entry.date;
  });

  sorteoHistory.push(entry);
  renderHistory(); buildGrid();
  launchBurst();
  sorteoRunning = false;
  document.getElementById('btn-sortear').disabled = false;
  showToast('Gano el #' + String(num).padStart(2,'0') + (buyer ? ' - ' + buyer.name : ''));
}

function resetSorteo(){
  if(sorteoRunning) return;
  if(!confirm('Reiniciar el historial de sorteos?')) return;
  API.del('/api/sorteo', function(){
    sorteoHistory = []; lastWinner = null;
    renderHistory();
    document.getElementById('winner-panel').classList.remove('show');
    document.getElementById('drum-number').textContent = '?';
    document.getElementById('drum-name').textContent   = 'Presiona SORTEAR';
    buildGrid(); showToast('Historial reiniciado');
  });
}

function renderHistory(){
  var list = document.getElementById('history-list');
  if(!sorteoHistory.length){ list.innerHTML = '<div class="history-empty">El historial aparece aca despues de cada sorteo.</div>'; return; }
  var medals = ['1ro','2do','3ro'];
  list.innerHTML = sorteoHistory.map(function(h,i){
    return '<div class="history-item">' +
      '<span class="history-pos">' + (medals[i]||'#'+(i+1)) + '</span>' +
      '<div class="history-num-b">' + h.num + '</div>' +
      '<div class="history-info">' +
        '<div class="history-name">' + (h.buyer ? h.buyer.name : '(sin datos)') + '</div>' +
        '<div class="history-meta">' + (h.buyer && h.buyer.phone ? h.buyer.phone + ' - ' : '') + h.date + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ── Confetti / burst ──────────────────────────────────────────
function launchBurst(){
  var colors = ['#FF4FA7','#9B5DE5','#FFE14D','#00C9B1','#FF8C42','#fff'];
  var cx = window.innerWidth/2, cy = window.innerHeight/3;
  for(var i=0;i<80;i++){
    (function(){
      var el  = document.createElement('div');
      el.className = 'burst';
      var ang = Math.random()*360, dist = 100+Math.random()*400, sz = 6+Math.random()*12, dur = .8+Math.random()*1.2;
      el.style.cssText = 'left:'+cx+'px;top:'+cy+'px;width:'+sz+'px;height:'+sz+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';border-radius:'+(Math.random()>.5?'50%':'3px')+';';
      document.body.appendChild(el);
      var rad = ang*Math.PI/180;
      el.animate([
        {transform:'translate(-50%,-50%) scale(0)',opacity:1},
        {transform:'translate(calc(-50% + '+Math.cos(rad)*dist+'px),calc(-50% + '+Math.sin(rad)*dist+'px)) scale(1) rotate('+(ang*3)+'deg)',opacity:0}
      ],{duration:dur*1000,easing:'cubic-bezier(0,.8,.6,1)',fill:'forwards'}).onfinish = function(){ el.remove(); };
    })();
  }
}
function makeConfetti(){
  var colors = ['#FF4FA7','#9B5DE5','#FFE14D','#00C9B1','#FF8C42'];
  var c = document.getElementById('confetti-bg');
  for(var i=0;i<25;i++){
    var s = document.createElement('span');
    s.style.left = Math.random()*100+'vw';
    s.style.background = colors[Math.floor(Math.random()*colors.length)];
    s.style.animationDuration = (4+Math.random()*6)+'s';
    s.style.animationDelay   = (Math.random()*8)+'s';
    var sz = 5+Math.random()*8;
    s.style.width = s.style.height = sz+'px';
    s.style.borderRadius = Math.random()>.5?'50%':'2px';
    c.appendChild(s);
  }
}
function showToast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 3000);
}

function resetApp(){
  if(!confirm('Reiniciar TODA la rifa? Se borran todos los números vendidos y el historial de sorteos.')) return;
  API.del('/api/reset', function(){
    rifaData = {}; sorteoHistory = []; lastWinner = null;
    buildGrid(); renderList();
    document.getElementById('winner-panel').classList.remove('show');
    document.getElementById('drum-number').textContent = '?';
    document.getElementById('drum-name').textContent   = 'Presiona SORTEAR';
    renderHistory();
    showToast('Rifa reiniciada — todos los números disponibles');
  });
}

document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });

// ── INIT ──────────────────────────────────────────────────────
loadAll(function(){
  buildGrid();
  renderList();
  makeConfetti();
  if(sorteoHistory.length){
    var last = sorteoHistory[sorteoHistory.length - 1];
    lastWinner = { num: last.num };
    document.getElementById('drum-number').textContent = String(last.num).padStart(2,'0');
    document.getElementById('drum-name').textContent   = last.buyer ? last.buyer.name : '-';
    document.getElementById('winner-num-big').textContent  = '#' + String(last.num).padStart(2,'0');
    document.getElementById('winner-name-big').textContent = last.buyer ? last.buyer.name : '-';
    document.getElementById('winner-detail').textContent   = last.buyer && last.buyer.phone ? last.buyer.phone : '';
    document.getElementById('winner-panel').classList.add('show');
  }
});
