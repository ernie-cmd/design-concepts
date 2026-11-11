/* ОВАЛ — демо-ассортимент, карточка товара, корзина и избранное (общие для главной и каталога) */
(function(){
  var COLORS = {
    milk:{n:'Молочный',h:'#EFE6D6'}, sand:{n:'Песочный',h:'#D2B994'}, terra:{n:'Терракота',h:'#B65A37'},
    choc:{n:'Шоколад',h:'#4A3226'}, graph:{n:'Графит',h:'#4E4C4A'}, olive:{n:'Олива',h:'#7A7B4C'},
    powder:{n:'Пудра',h:'#D7AFA2'}, lilac:{n:'Сирень',h:'#B7A3F2'}
  };
  var TYPES = {straight:'Прямые диваны', corner:'Угловые диваны', modular:'Модульные диваны', bed:'Диваны-кровати', chair:'Кресла', pouf:'Пуфы'};
  var NOUN = {straight:'Диван', corner:'Угловой диван', modular:'Модульный диван', bed:'Диван-кровать', chair:'Кресло', pouf:'Пуф'};
  var MECH = {none:'Без механизма', euro:'Еврокнижка', dolphin:'Дельфин', accord:'Аккордеон'};
  var MATS = ['Букле','Бархат','Рогожка','Велюр','Лён'];
  var IMG = {straight:['milk','terra','graph','olive'], corner:['sand','choc'], modular:['olive','milk'], bed:['graph','sand'], chair:['milk','terra','powder','lilac'], pouf:['powder','choc']};
  var MAT_BY = {milk:'Букле', terra:'Бархат', graph:'Рогожка', olive:'Велюр', sand:'Лён', choc:'Бархат', powder:'Велюр', lilac:'Бархат'};

  var names = ['Облако','Дюна','Ракушка','Лукум','Бриошь','Кокон','Пломбир','Сота','Терра','Ирис','Орбита','Плато','Бархан','Мокко','Зефир','Каштан','Гавань','Кедр','Полдень','Сумрак','Тмин','Вельвет','Нуга','Шале','Фьорд','Пастила','Мираж','Остров','Кварц','Миндаль'];
  var plan = ['straight','corner','chair','straight','modular','bed','pouf','corner','straight','chair','modular','straight','bed','corner','chair','pouf','straight','modular','corner','bed','chair','straight','pouf','corner','modular','straight','chair','bed','straight','chair'];
  var seed = 11; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(a){ return a[Math.floor(rnd()*a.length)]; }
  var used = {};
  var keys = Object.keys(COLORS).filter(function(k){ return k !== 'lilac'; });
  var P = plan.map(function(t, i){
    used[t] = (used[t] || 0);
    var img = IMG[t][used[t]++ % IMG[t].length];
    var base = {straight:[59,139], corner:[89,199], modular:[109,239], bed:[54,129], chair:[24,74], pouf:[9,29]}[t];
    var price = Math.round(base[0] + rnd()*(base[1]-base[0])) * 1000 - 10;
    var sale = rnd() < 0.28 ? Math.round(10 + rnd()*20) : 0;
    var width = {straight:[180,250], corner:[240,320], modular:[230,340], bed:[150,210], chair:[72,96], pouf:[45,80]}[t];
    var w = Math.round((width[0] + rnd()*(width[1]-width[0]))/10)*10;
    var cols = [img]; while (cols.length < 1 + Math.floor(rnd()*4)) { var c = pick(keys); if (cols.indexOf(c) < 0) cols.push(c); }
    var mech = t==='bed' ? pick(['euro','dolphin','accord']) : t==='corner' ? pick(['none','euro','dolphin']) : t==='straight' ? pick(['none','none','euro']) : 'none';
    var days = pick([1,1,3,3,7,7,21,28]);
    return {id:i, name: NOUN[t]+' «'+names[i]+'»', type:t, img:'img/p/'+t+'_'+img+'.jpg', price:price,
      old: sale ? Math.round(price/(1-sale/100)/10)*10 : 0, sale:sale, w:w,
      d: t==='chair' ? Math.round(72+rnd()*18) : t==='pouf' ? w : Math.round(90+rnd()*20),
      h: t==='pouf' ? 45 : Math.round(76+rnd()*14), cols:cols, mat: MAT_BY[img] || pick(MATS), mech:mech,
      days:days, stock: days <= 7, isNew: rnd() < 0.22, pop: rnd()};
  });

  function rub(n){ return n.toLocaleString('ru-RU').replace(/ /g,' ') + ' ₽'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function plural(n, a){ var m=n%10, h=n%100; return a[(m===1&&h!==11)?0:(m>=2&&m<=4&&(h<10||h>=20))?1:2]; }
  function deliv(p){ return p.days===1 ? 'Доставим <b>завтра</b>' : p.days<=7 ? 'Доставка <b>за '+p.days+' '+plural(p.days,['день','дня','дней'])+'</b>' : 'Под заказ, <b>'+Math.round(p.days/7)+' '+plural(Math.round(p.days/7),['неделя','недели','недель'])+'</b>'; }

  // корзина и избранное: сохраняются в браузере, работают на обеих страницах
  var store = {cart:{}, fav:{}};
  try { var s = JSON.parse(localStorage.getItem('oval-store') || '{}'); store.cart = s.cart || {}; store.fav = s.fav || {}; } catch(e) {}
  function save(){ try { localStorage.setItem('oval-store', JSON.stringify(store)); } catch(e) {} }
  function badges(){
    [['cartN', store.cart], ['favN', store.fav]].forEach(function(x){
      var el = document.getElementById(x[0]); if (!el) return;
      var n = Object.keys(x[1]).length; el.textContent = n; el.hidden = !n;
    });
  }
  var tt;
  function toast(m){ var el = document.getElementById('toast'); if (!el) return; el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(function(){ el.classList.remove('on'); }, 1600); }

  function card(p){
    var b = '';
    if (p.sale) b += '<span class="badge sale">−'+p.sale+'%</span>';
    if (p.isNew) b += '<span class="badge new">Новинка</span>';
    if (!p.stock) b += '<span class="badge light">Под заказ</span>';
    var spec = p.type==='pouf' ? p.mat+' · Ø '+p.w+' см' : p.mat+' · '+p.w+'×'+p.d+'×'+p.h+' см' + (p.mech!=='none' ? ' · '+MECH[p.mech] : '');
    var vars = p.cols.slice(0,4).map(function(k){ return '<i style="background:'+COLORS[k].h+'" title="'+COLORS[k].n+'"></i>'; }).join('') + ' <span>'+p.cols.length+' '+plural(p.cols.length,['цвет','цвета','цветов'])+'</span>';
    var inCart = !!store.cart[p.id];
    return '<article class="pcard"><div class="pimg"><img src="'+p.img+'" alt="'+esc(p.name)+', '+COLORS[p.cols[0]].n.toLowerCase()+'" loading="lazy">'+
      '<div class="badges">'+b+'</div><button class="fav" data-fav="'+p.id+'" aria-pressed="'+(!!store.fav[p.id])+'" aria-label="В избранное: '+esc(p.name)+'"><svg width="20" height="20" viewBox="0 0 24 24" stroke="#2B1D16" stroke-width="1.6" aria-hidden="true"><path fill="none" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button></div>'+
      '<div class="price"><b>'+rub(p.price)+'</b>'+(p.old ? '<s>'+rub(p.old)+'</s>' : '')+'</div>'+
      '<h3 class="pname"><a href="#">'+esc(p.name)+'</a></h3><div class="pspec">'+spec+'</div><div class="vars">'+vars+'</div>'+
      '<div class="deliv">'+deliv(p)+'</div>'+
      '<button class="btn '+(inCart ? 'in' : 'btn-dark')+'" data-cart="'+p.id+'">'+(inCart ? 'В корзине' : 'В корзину')+'</button></article>';
  }

  // общие клики: корзина и избранное
  document.addEventListener('click', function(e){
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-cart')){
      var id = t.getAttribute('data-cart');
      if (store.cart[id]) { delete store.cart[id]; t.className = 'btn btn-dark'; t.textContent = 'В корзину'; }
      else { store.cart[id] = 1; t.className = 'btn in'; t.textContent = 'В корзине'; toast('Добавлено в корзину'); }
      save(); badges();
    } else if (t.hasAttribute('data-fav')){
      var f = t.getAttribute('data-fav');
      if (store.fav[f]) delete store.fav[f]; else { store.fav[f] = 1; toast('Добавлено в избранное'); }
      t.setAttribute('aria-pressed', String(!!store.fav[f])); save(); badges();
    }
  });
  document.addEventListener('DOMContentLoaded', badges);

  window.OVAL = {COLORS:COLORS, TYPES:TYPES, MECH:MECH, MATS:MATS, P:P, card:card, rub:rub, esc:esc, plural:plural, toast:toast, badges:badges};
})();
