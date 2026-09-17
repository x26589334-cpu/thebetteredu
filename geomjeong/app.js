/* 더나은에듀 · 검정고시 — 공용 스크립트 */
(function(){
  // 스크롤 시 헤더 배경 표시
  var hd=document.getElementById('hd');
  if(hd){
    var onScroll=function(){hd.classList.toggle('scrolled',window.scrollY>40)};
    addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }
  // 스크롤 등장 애니메이션
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  }else{
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')});
  }
  // 모바일 메뉴 (네비 카테고리를 상담신청 옆 ☰ 버튼으로)
  var links=document.querySelector('nav.links');
  var bar=document.querySelector('header .bar');
  if(links&&bar&&!document.querySelector('.nav-toggle')){
    var toggle=document.createElement('button');
    toggle.className='nav-toggle';
    toggle.setAttribute('aria-label','메뉴 열기');
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='☰';
    var cta=bar.querySelector('.btn');
    if(cta){bar.insertBefore(toggle,cta);}else{bar.appendChild(toggle);}
    var menu=document.createElement('nav');
    menu.className='mobile-menu';
    links.querySelectorAll('a').forEach(function(a){
      var c=document.createElement('a');
      c.href=a.getAttribute('href');
      c.textContent=a.textContent;
      menu.appendChild(c);
    });
    var applyBtn=document.createElement('a');
    applyBtn.href=(cta?cta.getAttribute('href'):'/#apply');
    applyBtn.className='mm-cta';
    applyBtn.textContent='무료 상담 신청';
    menu.appendChild(applyBtn);
    hd.appendChild(menu);
    toggle.addEventListener('click',function(){
      var open=menu.classList.toggle('open');
      toggle.classList.toggle('on',open);
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.innerHTML=open?'✕':'☰';
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){menu.classList.remove('open');toggle.classList.remove('on');toggle.innerHTML='☰';toggle.setAttribute('aria-expanded','false');});
    });
  }

  // 히어로 지역 검색 — 입력 시 자동완성 목록
  var hs=document.querySelector('.hero-search');
  if(hs&&window.REGION_INDEX&&window.REGION_INDEX.length){
    var hinput=hs.querySelector('input');
    var sug=document.createElement('div'); sug.className='hs-suggest'; document.body.appendChild(sug);
    function place(){var r=hinput.getBoundingClientRect();sug.style.left=r.left+'px';sug.style.top=(r.bottom+8)+'px';sug.style.width=r.width+'px';}
    // 띄어쓰기 무시 매칭 + 연관 검색어 (search-kit.js)
    SearchKit.style();
    var dHay=SearchKit.indexer(function(d){return d.s+'|'+d.d;}, function(d){return d.a+' '+d.d+' '+(d.gu||'');});
    var rHay=SearchKit.indexer(function(r){return r.s;}, function(r){return r.a+' '+r.n+' '+(r.g||'');});
    function relRow(items,label){
      if(!items.length) return null;
      var box=document.createElement('div');
      box.className='sk-rel';
      box.style.padding='10px 14px 12px';
      box.innerHTML='<span class="sk-rel-label">'+SearchKit.esc(label)+'</span>'
        +items.map(function(it){return '<button type="button" class="sk-chip" data-term="'+SearchKit.esc(it.term)+'">'+SearchKit.esc(it.label)+'</button>';}).join('');
      return box;
    }
    function draw(q){
      q=(q||'').trim();
      sug.innerHTML='';
      if(!q){sug.classList.remove('open');return;}
      // 동(洞) 매칭 — 더 구체적이라 위에 노출
      var dm=(window.DONG_INDEX||[]).filter(function(d){return SearchKit.match(dHay(d),q)});
      // 구/시 매칭
      var m=window.REGION_INDEX.filter(function(r){return SearchKit.match(rHay(r),q)});
      if(!dm.length && !m.length){
        var s0=SearchKit.suggest(window.REGION_INDEX, rHay, q, ['n','g'], {limit:5});
        var row0=relRow(s0,'이렇게 찾아보세요');
        if(!row0){sug.classList.remove('open');return;}
        sug.appendChild(row0); place(); sug.classList.add('open'); return;
      }
      var shown=0, cap=8;
      dm.slice(0,cap).forEach(function(d){
        var a=document.createElement('a');
        a.href='/geomjeong/region/'+d.s+'.html';
        a.innerHTML='<span><b>'+d.d+'</b> 검정고시 과외</span><span class="g">'+d.gu+'</span>';
        sug.appendChild(a); shown++;
      });
      m.slice(0,Math.max(0,cap-shown)).forEach(function(r){
        var a=document.createElement('a');
        a.href='/geomjeong/region/'+r.s+'.html';
        a.innerHTML='<span><b>'+r.n+'</b> 검정고시 과외</span><span class="g">'+r.g+'</span>';
        sug.appendChild(a); shown++;
      });
      var total=dm.length+m.length;
      if(total>shown){
        var more=document.createElement('div'); more.className='hs-more';
        more.textContent='그 외 '+(total-shown)+'곳 더… 지역 검색을 눌러 전체 보기';
        sug.appendChild(more);
      }
      var row=relRow(SearchKit.related(m.concat(dm.map(function(d){return {n:d.d,g:d.gu};})), q, ['n','g'], {limit:5}),'연관 검색어');
      if(row) sug.appendChild(row);
      place(); sug.classList.add('open');
    }
    sug.addEventListener('click',function(e){
      var c=e.target.closest&&e.target.closest('.sk-chip');
      if(!c)return; e.preventDefault();
      hinput.value=c.getAttribute('data-term'); hinput.focus(); draw(hinput.value);
    });
    hinput.addEventListener('input',function(){draw(hinput.value)});
    hinput.addEventListener('focus',function(){draw(hinput.value)});
    addEventListener('scroll',function(){sug.classList.remove('open')},{passive:true});
    addEventListener('resize',function(){if(sug.classList.contains('open'))place()});
    document.addEventListener('click',function(e){if(!hs.contains(e.target)&&!sug.contains(e.target))sug.classList.remove('open')});
  }

  // 상담 신청 폼 → 구글시트(웹문의: 검정고시 탭)
  var applyForm=document.querySelector('form.apply');
  if(applyForm){
    var APPLY_URL='https://script.google.com/macros/s/AKfycbznAb0ZOODlNp-ckR5fvkqtVQijwuJ9Gl0G4KxDrfp-K7zM4fcfMMp5qDhAbwNkvYQG/exec'; // 2026-09-18 전용 스크립트가 죽어 허브(sheet=검정고시)로 전환
    applyForm.addEventListener('submit',function(ev){
      ev.preventDefault();
      var btn=applyForm.querySelector('.btn-primary');
      if(btn.getAttribute('data-done'))return;
      var orig=btn.textContent; btn.disabled=true; btn.textContent='접수 중…';
      function v(id){var el=document.getElementById(id);return el?el.value:'';}
      var body=new URLSearchParams();
      body.append('이름',v('nm'));
      body.append('연락처',v('ph'));
      body.append('상담대상',v('tg'));
      body.append('문의내용',v('ms'));
      body.append('신청페이지',location.pathname||'/');
      body.append('_form','검정고시');
      body.append('sheet','검정고시');
      fetch(APPLY_URL,{method:'POST',mode:'no-cors',body:body}).then(function(){
        btn.setAttribute('data-done','1'); btn.disabled=false; btn.textContent='신청이 접수됐어요 ✓';
        applyForm.reset();
      }).catch(function(){
        btn.disabled=false; btn.textContent=orig;
        alert('전송에 실패했어요. 전화(010-6832-1994)로 문의해 주세요.');
      });
    });
  }

  // 합격후기 필터 탭
  var grid=document.getElementById('revGrid');
  if(grid){
    document.querySelectorAll('.rev-tab').forEach(function(tab){
      tab.addEventListener('click',function(){
        document.querySelectorAll('.rev-tab').forEach(function(t){t.classList.remove('on')});
        tab.classList.add('on');
        var f=tab.getAttribute('data-filter');
        grid.querySelectorAll('.rcard').forEach(function(c){
          c.style.display=(f==='all'||c.classList.contains(f))?'':'none';
        });
      });
    });
  }
})();
