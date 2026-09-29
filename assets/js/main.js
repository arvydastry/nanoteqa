/* Nanoteqa maketas v4 „Spalvų kodas“: el. parduotuvės pradžios puslapio logika (vanilla JS).
   WordPress'e tai atliks WooCommerce ir Salient elementai; šis failas į temą nekeliamas. */
(function () {
  'use strict';

  var P = window.NQ_PRODUCTS || [];
  var byId = {};
  P.forEach(function (p) { byId[p.id] = p; });
  var IMG = 'shared/img/produktai/';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOP = ['apc-cleaner', 'degreaser', 'active-bath', 'pet-stain-odour-remover', 'kitchen-surface-cleaner', 'glass-coating', 'window-cleaner', 'daily-floor'];
  var KIND = { buitis: 'Namams', dangos: 'Nano danga', auto: 'Automobiliams', pramone: 'Verslui', rinkinys: 'Rinkinys', nanosidabras: 'Nanosidabras' };
  var SUBNAME = { virtuve: 'Virtuvė', vonia: 'Vonia', grindys: 'Grindys ir kilimai', stiklas: 'Stiklas ir ekranai', baldai: 'Baldai ir tekstilė', lauke: 'Terasa ir lauke' };
  var AREANAME = { auto: 'Automobiliams', biuras: 'Biurams', komercija: 'Restoranams ir viešbučiams' };
  var KINDNAME = { dangos: 'Nano dangos', nanosidabras: 'Nanosidabras', rinkinys: 'Rinkiniai', pramone: 'Pramonei 20 l / 220 l', auto: 'Automobilių linija' };
  var NEW_SINCE = '2026-01-01';

  function eur(n) { return n == null ? '' : n.toFixed(2).replace('.', ',') + ' €'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function priced(p) { return p.variants.filter(function (v) { return v.p; }); }
  function realSale(v) { return !!(v && v.c && v.p && (1 - v.p / v.c) >= 0.05); }
  function isSale(p) { return p.variants.some(realSale); }
  function lt(n, one, few, many) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : (a >= 2 && (b < 10 || b >= 20) ? few : many); }
  function tint(p) {
    var s = p.subs || [];
    if (p.kind === 'dangos') return 'var(--t-dangos)';
    if (p.kind === 'auto') return 'var(--t-auto)';
    if (p.kind === 'pramone') return 'var(--t-pramone)';
    if (p.kind === 'rinkinys') return 'var(--t-rinkinys)';
    if (p.kind === 'nanosidabras') return 'var(--t-sidabras)';
    if (/virtuv|riebal|indų/i.test(p.name)) return 'var(--t-virtuve)';
    if (/vonios|plytel/i.test(p.name)) return 'var(--t-vonia)';
    if (/grind|kilim/i.test(p.name)) return 'var(--t-grindys)';
    if (/langų|stikl|ekran/i.test(p.name)) return 'var(--t-stiklas)';
    if (/apmuš|audin|odos|oda|baldų|skalb/i.test(p.name)) return 'var(--t-tekstile)';
    if (/gyvūn/i.test(p.name)) return 'var(--t-gyvunai)';
    if (s.indexOf('lauke') > -1 || /universal|trinkel|dumbl/i.test(p.name)) return 'var(--t-lauke)';
    return 'var(--t-sidabras)';
  }
  function useLine(p) { var d = (p.desc || '').split(/(?<=[.!?])\s/)[0]; return d.length > 110 ? d.slice(0, 107).replace(/\s\S*$/, '') + '…' : d; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privatus režimas */ } }
  };

  /* ---------- Filtrai ir skaičiai ---------- */
  function filter(key) {
    if (!key || key === 'all') return P.slice();
    var i = key.indexOf(':'), t = key.slice(0, i), v = key.slice(i + 1);
    if (t === 'sub') return P.filter(function (p) { return (p.subs || []).indexOf(v) > -1 && p.kind !== 'rinkinys'; });
    if (t === 'area') return P.filter(function (p) { return p.areas.indexOf(v) > -1 && p.kind !== 'rinkinys'; });
    if (t === 'kind') return P.filter(function (p) { return p.kind === v; });
    if (t === 'size') return P.filter(function (p) { return p.variants.some(function (x) { return x.t === v && x.p; }); });
    if (t === 'tab') return TABS[v] ? TABS[v].list() : [];
    return P.slice();
  }
  var TABS = {
    top: { kicker: 'Klientų pasirinkimas', title: 'Perkamiausi produktai', list: function () { return TOP.map(function (id) { return byId[id]; }).filter(Boolean); } },
    sale: { kicker: 'Akcijos', title: 'Dabar pigiau', list: function () { return P.filter(isSale); } },
    new: { kicker: 'Naujienos', title: 'Nauja automobilių linija', list: function () { return P.filter(function (p) { return p.created >= NEW_SINCE; }); } },
    kits: { kicker: 'Rinkiniai ir nanosidabras', title: 'Rinkiniai ir nanosidabras', list: function () { return P.filter(function (p) { return p.kind === 'rinkinys' || p.kind === 'nanosidabras'; }); } }
  };
  $$('[data-count]').forEach(function (el) { el.textContent = filter(el.getAttribute('data-count')).length; });
  $$('[data-price]').forEach(function (el) { var p = byId[el.getAttribute('data-price')]; if (p) el.textContent = (priced(p).length > 1 ? 'nuo ' : '') + eur(p.from); });

  /* ---------- Antraštė ---------- */
  var hdr = $('[data-hdr]');
  function onHdr() { hdr.classList.toggle('is-scrolled', window.scrollY > 10); }

  /* ---------- Mega meniu ---------- */
  var mw = $('[data-mega]'), mp = $('[data-mega-panel]'), mb = mw && $('button', mw), mt;
  if (mw && mp) {
    var openM = function () { clearTimeout(mt); mw.classList.add('is-open'); mp.parentNode.classList.add('mega-open'); mp.style.opacity = '1'; mp.style.visibility = 'visible'; mp.style.transform = 'none'; mb.setAttribute('aria-expanded', 'true'); };
    var closeM = function (now) { clearTimeout(mt); mt = setTimeout(function () { mw.classList.remove('is-open'); mp.style.opacity = ''; mp.style.visibility = ''; mp.style.transform = ''; mb.setAttribute('aria-expanded', 'false'); }, now ? 0 : 200); };
    [mw, mp].forEach(function (el) { el.addEventListener('mouseenter', openM); el.addEventListener('mouseleave', function () { closeM(); }); });
    mb.addEventListener('click', function () { mw.classList.contains('is-open') ? closeM(true) : openM(); });
    mp.addEventListener('click', function (e) { if (e.target.closest('a')) closeM(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeM(true); });
  }

  /* ---------- Sluoksniai ---------- */
  var lastFocus = null;
  function openL(el, sel) { lastFocus = document.activeElement; el.classList.add('is-open'); document.documentElement.style.overflow = 'hidden'; setTimeout(function () { var f = $(sel || 'button, a', el); if (f) f.focus({ preventScroll: true }); }, 80); }
  function closeL(el) { el.classList.remove('is-open'); if (!$('.oc.is-open, .drawer.is-open, .qv.is-open')) document.documentElement.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  var oc = $('#oc'), drawer = $('#krepselis'), qv = $('#qv');
  function bind(sel, fn) { $$(sel).forEach(function (b) { b.addEventListener('click', fn); }); }
  bind('[data-oc-open]', function () { openL(oc); });
  bind('[data-oc-close]', function () { closeL(oc); });
  bind('[data-cart-open]', function () { openL(drawer, '.x'); });
  bind('[data-cart-close]', function () { closeL(drawer); });
  bind('[data-qv-close]', function () { closeL(qv); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') [qv, drawer, oc].some(function (el) { if (el.classList.contains('is-open')) { closeL(el); return true; } return false; }); });

  /* ---------- Paieška su pasiūlymais (autocomplete) ---------- */
  var find = $('[data-find]'), fIn = $('#q4'), fDrop = $('[data-find-drop]'), fIdx = -1;
  function hi(txt, q) { if (!q) return esc(txt); var i = txt.toLowerCase().indexOf(q); return i < 0 ? esc(txt) : esc(txt.slice(0, i)) + '<mark>' + esc(txt.slice(i, i + q.length)) + '</mark>' + esc(txt.slice(i + q.length)); }
  function renderFind() {
    var q = fIn.value.trim().toLowerCase();
    var list = q ? P.filter(function (p) { return (p.name + ' ' + p.orig + ' ' + p.desc).toLowerCase().indexOf(q) > -1; }) : TOP.slice(0, 4).map(function (id) { return byId[id]; });
    fIdx = -1;
    fDrop.innerHTML = '<p>' + (q ? 'Rasta: ' + list.length : 'Populiaru') + '</p>' + list.slice(0, 6).map(function (p) {
      return '<a href="#produktai" role="option" data-qv="' + p.id + '"><span class="th" style="--tint:' + tint(p) + '"><img src="' + IMG + p.img[0] + '" alt=""></span><strong>' + hi(p.name, q) + '</strong><span>' + (p.from ? eur(p.from) : 'Užklausa') + '</span></a>';
    }).join('') + (q && !list.length ? '<p style="text-transform:none;letter-spacing:0">Nieko nerasta. Pabandykite „stiklas“ ar „riebalai“.</p>' : '') + (q && list.length > 6 ? '<a class="find__all" href="#produktai" data-find-all>Rodyti visus ' + list.length + ' rezultatus</a>' : '');
    find.classList.add('is-open');
  }
  if (find) {
    fIn.addEventListener('focus', renderFind);
    fIn.addEventListener('input', renderFind);
    fIn.addEventListener('keydown', function (e) {
      var items = $$('a[role="option"]', fDrop);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); fIdx = (fIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach(function (a, i) { a.classList.toggle('is-active', i === fIdx); }); }
      else if (e.key === 'Enter' && fIdx > -1) { e.preventDefault(); items[fIdx].click(); }
      else if (e.key === 'Escape') { find.classList.remove('is-open'); }
    });
    find.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = fIn.value.trim().toLowerCase();
      if (!q) return;
      showList('Paieška', '„' + fIn.value.trim() + '“', P.filter(function (p) { return (p.name + ' ' + p.orig + ' ' + p.desc).toLowerCase().indexOf(q) > -1; }), true);
      find.classList.remove('is-open'); fIn.blur();
    });
    fDrop.addEventListener('click', function (e) { if (e.target.closest('[data-find-all]')) { e.preventDefault(); find.dispatchEvent(new Event('submit', { cancelable: true })); } find.classList.remove('is-open'); });
    document.addEventListener('click', function (e) { if (!find.contains(e.target)) find.classList.remove('is-open'); });
  }

  /* ---------- Produktų kortelės su talpos pasirinkimu ---------- */
  var grid = $('[data-grid]');
  function priceHtml(v, multiFrom) {
    if (!v || !v.p) return '<strong>Užklausa</strong><small>kaina pagal kiekį</small>';
    return (realSale(v) ? '<del>' + eur(v.c) + '</del>' : '') + '<strong class="' + (realSale(v) ? 'is-sale' : '') + '">' + eur(v.p) + '</strong>' + (v.t ? '<small>' + v.t + (v.t === '5 l' ? ' · ' + eur(v.p / 5) + '/l' : '') + '</small>' : '');
  }
  function card(p, i) {
    var vs = p.variants.filter(function (v) { return v.t; });
    var v0 = priced(p)[0] || p.variants[0];
    var badges = [];
    if (isSale(p)) { var best = 0; p.variants.forEach(function (v) { if (realSale(v)) best = Math.max(best, Math.round((1 - v.p / v.c) * 100)); }); badges.push('<span class="tag tag--sale">−' + best + ' %</span>'); }
    if (p.created >= NEW_SINCE) badges.push('<span class="tag tag--new">Naujiena</span>');
    if (TOP.indexOf(p.id) > -1 && TOP.indexOf(p.id) < 3) badges.push('<span class="tag">Perkamiausias</span>');
    return '<article class="pc" style="--i:' + (i % 8) + ';--tint:' + tint(p) + '" data-pid="' + p.id + '">' +
      '<a class="pc__img" href="#produktai" data-qv="' + p.id + '" aria-label="' + esc(p.name) + '"><img src="' + IMG + p.img[0] + '" alt="' + esc(p.name) + '" loading="lazy"></a>' +
      '<span class="pc__badges">' + badges.join('') + '</span>' +
      '<button class="pc__qv" type="button" data-qv="' + p.id + '" aria-label="Greita peržiūra: ' + esc(p.name) + '"><i class="ph ph-eye" aria-hidden="true"></i></button>' +
      '<div class="pc__body">' +
        '<p class="pc__cat">' + (KIND[p.kind] || '') + '</p>' +
        '<h3 class="pc__name"><a href="#produktai" data-qv="' + p.id + '">' + esc(p.name) + '</a></h3>' +
        '<p class="pc__use">' + esc(useLine(p)) + '</p>' +
        (vs.length > 1 ? '<div class="pc__sizes" role="group" aria-label="Talpa">' + vs.map(function (v, k) { return '<button type="button" aria-pressed="' + (k === 0) + '" data-size="' + k + '">' + v.t + '</button>'; }).join('') + '</div>' : '') +
        '<div class="pc__foot"><div class="pc__price" data-pc-price>' + priceHtml(v0) + '</div>' +
          (p.from ? '<button class="pc__add" type="button" data-add="' + p.id + '" data-vi="0"><i class="ph ph-shopping-bag" aria-hidden="true"></i>Į krepšelį</button>' : '<a class="pc__add" href="#pagalba">Užklausa</a>') +
        '</div>' +
      '</div>' +
    '</article>';
  }
  var kick = $('[data-grid-kicker]'), gTitle = $('[data-grid-title]'), tabsEl = $('[data-tabs]'), moreBtn = $('[data-more]');
  function showList(k, title, list, scroll) {
    kick.textContent = k; gTitle.textContent = title;
    var paint = function () {
      grid.innerHTML = list.slice(0, 8).map(card).join('') || '<p class="muted">Produktų nerasta.</p>';
      moreBtn.innerHTML = list.length > 8 ? 'Rodyti visus ' + list.length + ' <i class="ph ph-arrow-right" aria-hidden="true"></i>' : 'Visi ' + P.length + ' produktai <i class="ph ph-arrow-right" aria-hidden="true"></i>';
      moreBtn.dataset.full = list.length > 8 ? '1' : '';
      grid._list = list;
      grid.classList.remove('is-loading');
    };
    if (reduce || !scroll) paint(); else { grid.classList.add('is-loading'); setTimeout(paint, 260); }
    if (scroll) $('#produktai').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  function setTab(key, scroll) {
    $$('[data-tab]', tabsEl).forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === key)); });
    var t = TABS[key]; showList(t.kicker, t.title, t.list(), scroll);
  }
  if (grid) {
    $$('[data-tab]', tabsEl).forEach(function (b) { b.addEventListener('click', function () { setTab(b.getAttribute('data-tab'), false); }); });
    setTab('top', false);
    grid.addEventListener('click', function (e) {
      var sb = e.target.closest('[data-size]'); if (!sb) return;
      var c = sb.closest('.pc'), p = byId[c.getAttribute('data-pid')], vs = p.variants.filter(function (v) { return v.t; }), k = +sb.getAttribute('data-size');
      $$('[data-size]', c).forEach(function (x) { x.setAttribute('aria-pressed', String(x === sb)); });
      $('[data-pc-price]', c).innerHTML = priceHtml(vs[k]);
      var add = $('[data-add]', c); if (add) add.setAttribute('data-vi', p.variants.indexOf(vs[k]));
    });
    moreBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (moreBtn.dataset.full && grid._list) { grid.innerHTML = grid._list.map(card).join(''); moreBtn.innerHTML = 'Visi ' + P.length + ' produktai <i class="ph ph-arrow-right" aria-hidden="true"></i>'; moreBtn.dataset.full = ''; }
      else { $$('[data-tab]', tabsEl).forEach(function (b) { b.setAttribute('aria-selected', 'false'); }); grid._list = P; showList('Katalogas', 'Visi produktai', P, false); grid.innerHTML = P.map(card).join(''); moreBtn.dataset.full = ''; }
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-set]');
    if (a) {
      e.preventDefault();
      var key = a.getAttribute('data-set'), t = key.split(':');
      var name = key === 'all' ? 'Visi produktai' : (t[0] === 'sub' ? SUBNAME[t[1]] : t[0] === 'area' ? AREANAME[t[1]] : t[0] === 'kind' ? KINDNAME[t[1]] : t[0] === 'size' ? '5 l papildymo talpos' : '');
      $$('[data-tab]', tabsEl).forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
      showList(key === 'all' ? 'Katalogas' : 'Kategorija', name, filter(key), true);
      if (key === 'all') setTimeout(function () { grid.innerHTML = P.map(card).join(''); moreBtn.dataset.full = ''; }, reduce ? 0 : 300);
      if (oc.classList.contains('is-open')) closeL(oc);
      return;
    }
    var tg = e.target.closest('[data-tab-go]');
    if (tg) { e.preventDefault(); setTab(tg.getAttribute('data-tab-go'), true); if (oc.classList.contains('is-open')) closeL(oc); }
  });

  /* ---------- Krepšelis ---------- */
  var cart = store.get('nq4-cart', []);
  function save() { store.set('nq4-cart', cart); renderCart(); }
  function add(id, vi, q) {
    var p = byId[id]; if (!p) return;
    var v = vi != null && p.variants[vi] && p.variants[vi].p ? p.variants[vi] : priced(p)[0]; if (!v) return;
    var k = id + '|' + v.t, l = cart.filter(function (x) { return x.k === k; })[0];
    if (l) l.q += q || 1; else cart.push({ k: k, id: id, t: v.t, p: v.p, q: q || 1 });
    save();
    var n = $('[data-cart-n]'); n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
    toast(p, v);
  }
  function renderCart() {
    var n = cart.reduce(function (s, l) { return s + l.q; }, 0), sum = cart.reduce(function (s, l) { return s + l.q * l.p; }, 0);
    var cn = $('[data-cart-n]'); cn.textContent = n; cn.classList.toggle('has', n > 0);
    $('[data-cart-sum]').textContent = eur(sum); $('[data-cart-sum-h]').textContent = eur(sum);
    var mbar = $('[data-mbar]'); mbar.classList.toggle('is-on', n > 0); $('[data-mbar-txt]').textContent = n + ' ' + lt(n, 'prekė', 'prekės', 'prekių') + ' · ' + eur(sum);
    $('[data-cart-items]').innerHTML = cart.length ? cart.map(function (l, i) {
      var p = byId[l.id]; if (!p) return '';
      return '<div class="ci"><span class="th" style="--tint:' + tint(p) + '"><img src="' + IMG + p.img[0] + '" alt=""></span><div><strong>' + esc(p.name) + '</strong><small>' + (l.t || '') + '</small><div class="qty"><button type="button" data-qm="' + i + '" aria-label="Mažinti">−</button><span>' + l.q + '</span><button type="button" data-qp="' + i + '" aria-label="Didinti">+</button></div></div><div class="ci__r"><span>' + eur(l.q * l.p) + '</span><button class="ci__rm" type="button" data-rm="' + i + '">Pašalinti</button></div></div>';
    }).join('') : '<div class="drawer__empty"><i class="ph ph-shopping-bag" style="font-size:42px"></i><p>Krepšelis tuščias</p><a class="btn btn--sm" href="#ka-valyti" data-cart-close>Rinktis produktus</a></div>';
    $$('[data-cart-close]', $('[data-cart-items]')).forEach(function (b) { b.addEventListener('click', function () { closeL(drawer); }); });
  }
  var toastEl = $('[data-toast]'), tt;
  function toast(p, v) {
    toastEl.innerHTML = '<img src="' + IMG + p.img[0] + '" alt=""><span>Įdėta: ' + esc(p.name) + (v.t ? ', ' + v.t : '') + '</span><button type="button" data-t-open>Krepšelis</button>';
    toastEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3000);
    $('[data-t-open]', toastEl).addEventListener('click', function () { toastEl.classList.remove('is-on'); openL(drawer, '.x'); });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-qv],[data-qm],[data-qp],[data-rm],[data-checkout]');
    if (!t) return;
    if (t.hasAttribute('data-add')) {
      e.preventDefault();
      add(t.getAttribute('data-add'), t.hasAttribute('data-vi') ? +t.getAttribute('data-vi') : null);
      if (t.classList.contains('pc__add')) { var h = t.innerHTML; t.classList.add('is-done'); t.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i>Įdėta'; setTimeout(function () { t.classList.remove('is-done'); t.innerHTML = h; }, 1400); }
    } else if (t.hasAttribute('data-qv')) { e.preventDefault(); openQV(t.getAttribute('data-qv')); }
    else if (t.hasAttribute('data-qp')) { cart[+t.getAttribute('data-qp')].q++; save(); }
    else if (t.hasAttribute('data-qm')) { var l = cart[+t.getAttribute('data-qm')]; l.q--; if (l.q < 1) cart.splice(cart.indexOf(l), 1); save(); }
    else if (t.hasAttribute('data-rm')) { cart.splice(+t.getAttribute('data-rm'), 1); save(); }
    else if (t.hasAttribute('data-checkout')) { var o = t.innerHTML; t.textContent = 'Makete apmokėjimas neveikia'; setTimeout(function () { t.innerHTML = o; }, 2200); }
  });
  renderCart();

  /* ---------- Greita peržiūra ---------- */
  function openQV(id) {
    var p = byId[id]; if (!p) return;
    var vs = p.variants.filter(function (v) { return v.t; }), sel = priced(p)[0] || p.variants[0];
    $('[data-qv-img]').style.setProperty('--tint', tint(p));
    $('[data-qv-img]').innerHTML = '<img src="' + IMG + p.img[0] + '" alt="' + esc(p.name) + '">';
    var body = $('[data-qv-body]');
    body.innerHTML = '<p class="pc__cat">' + (KIND[p.kind] || '') + '</p><h2 id="qv-title">' + esc(p.name) + '</h2><p class="qv__desc">' + esc(p.desc) + '</p>' +
      (vs.length > 1 ? '<div class="pc__sizes" role="group" aria-label="Talpa">' + vs.map(function (v, k) { return '<button type="button" aria-pressed="' + (k === 0) + '" data-qs="' + k + '">' + v.t + '</button>'; }).join('') + '</div>' : '') +
      '<div class="qv__row"><div class="pc__price" data-qv-price>' + priceHtml(sel) + '</div>' + (p.from ? '<button class="btn" type="button" data-qv-add>Į krepšelį <i class="ph ph-shopping-bag" aria-hidden="true"></i></button>' : '<a class="btn" href="#pagalba" data-qv-close>Gauti pasiūlymą</a>') + '</div>' +
      '<ul class="qv__list"><li><i class="ph-fill ph-check-circle"></i>Be chloro, agresyvių rūgščių ir šarmų</li><li><i class="ph-fill ph-check-circle"></i>Išsiunčiame per 1–2 darbo dienas</li><li><i class="ph-fill ph-check-circle"></i>Pakuotė iš 100 % perdirbto plastiko</li></ul>';
    $$('[data-qs]', body).forEach(function (b) { b.addEventListener('click', function () { sel = vs[+b.getAttribute('data-qs')]; $$('[data-qs]', body).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('[data-qv-price]', body).innerHTML = priceHtml(sel); }); });
    var qa = $('[data-qv-add]', body); if (qa) qa.addEventListener('click', function () { add(p.id, p.variants.indexOf(sel)); closeL(qv); });
    $$('[data-qv-close]', body).forEach(function (b) { b.addEventListener('click', function () { closeL(qv); }); });
    openL(qv, '.x');
  }

  /* ---------- Prieš / po (Image Comparison) ---------- */
  var ba = $('[data-ba]'), baR = $('[data-ba-range]');
  if (ba && baR) {
    baR.addEventListener('input', function () { ba.style.setProperty('--pos', baR.value + '%'); });
    if (!reduce && 'IntersectionObserver' in window) {
      var baIO = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; baIO.disconnect();
        var t0 = null; (function f(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400), v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k); ba.style.setProperty('--pos', v + '%'); baR.value = v; if (k < 1) requestAnimationFrame(f); })(performance.now());
      }, { threshold: 0.6 });
      baIO.observe(ba);
    }
  }

  /* ---------- Formos ---------- */
  $$('[data-demo-form]').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); var m = f.parentNode.querySelector('[data-form-msg]'); if (m) m.textContent = 'Ačiū! Makete duomenys nesiunčiami, WordPress’e čia veiks Contact Form 7.'; f.reset(); }); });

  /* ---------- Atsiradimas, skaitikliai, lazy video, parallax ---------- */
  function countUp(el) { var to = +el.getAttribute('data-count-to'); if (reduce) { el.textContent = to; return; } var t0 = null; (function f(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1300); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(performance.now()); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add('is-in'); $$('[data-count-to]', e.target).forEach(countUp); io.unobserve(e.target); }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    $$('[data-an]').forEach(function (el) { io.observe(el); });
    var vio = new IntersectionObserver(function (en) { en.forEach(function (e) { var v = e.target; if (e.isIntersecting) { if (!v.dataset.loaded) { $$('source[data-src]', v).forEach(function (s) { s.src = s.getAttribute('data-src'); }); v.load(); v.dataset.loaded = '1'; } if (!reduce) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } } else if (v.dataset.loaded) v.pause(); }); }, { rootMargin: '200px 0px' });
    $$('video[data-lazy]').forEach(function (v) { vio.observe(v); });
  } else $$('[data-an]').forEach(function (el) { el.classList.add('is-in'); });

  var vh = innerHeight, tick = false;
  function frame() {
    if (!reduce) $$('[data-px]').forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -parseFloat(el.getAttribute('data-px'))).toFixed(1) + 'px,0)'; });
    onHdr();
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { frame(); tick = false; }); } }, { passive: true });
  addEventListener('resize', function () { vh = innerHeight; frame(); });
  frame();
})();
