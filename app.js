/* InkShelf — local-first manga library. No framework, no account, no build step. */
(() => {
  'use strict';
  const KEY = 'inkshelf-library-v1';
  const STATUSES = [
    ['reading','Reading'], ['plan','Plan to read'], ['completed','Completed'],
    ['onhold','On hold'], ['dropped','Dropped']
  ];
  const COLORS = ['#b6a0ff','#7dd8d4','#ff9eae','#f4bf7b','#8de3b2','#84b9f6'];
  const DEFAULT = () => ({version:1,manga:[],collections:[],activity:[]});
  const uid = () => (window.crypto?.randomUUID ? crypto.randomUUID() : 'id-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  const raw = v => String(v ?? '');
  const esc = v => raw(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => {try {let x=new URL(raw(u).trim()); return ['https:','http:'].includes(x.protocol) ? x.href : ''} catch {return ''}};
  const clamp = (v,min,max) => Math.max(min,Math.min(max,Number.isFinite(+v)?+v:min));
  const txt = (v,len=2000) => raw(v).trim().slice(0,len);
  const arr = a => Array.isArray(a)?a:[];
  const statusName = s => (STATUSES.find(x=>x[0]===s)||['','Plan to read'])[1];
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const icons = {
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    layout:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    layers:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    compass:'<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.9 5.5-5.5 2.9 2.9-5.5z"/>',
    settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M4.9 9.1 3.4 7.8l2.4-4.1 1.9.5 1.4-1.1h5.8l1.4 1.1 1.9-.5 2.4 4.1-1.5 1.3.2 3.5 1.3 1.4-2.4 4.1-1.9-.5-1.4 1.1H9.1l-1.4-1.1-1.9.5-2.4-4.1 1.3-1.4z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',chevron:'<path d="m9 18 6-6-6-6"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>', heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    check:'<path d="m5 12 4 4L19 6"/>', star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.7 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    fire:'<path d="M12 22c4.4 0 8-3.6 8-8 0-4-3-6-4-7-1 4-4 4-4 4s-3-3-1-9C7 5 4 9 4 14c0 4.4 3.6 8 8 8z"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>', upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 17v4h16v-4"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>', edit:'<path d="M12 20h9M3 17.5V21h3.5L18.8 8.7l-3.5-3.5L3 17.5zM14 6l3.5 3.5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', sparkle:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8zM20 18l.7 1.3L22 20l-1.3.7L20 22l-.7-1.3L18 20l1.3-.7z"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-8v.01"/>',
    external:'<path d="M14 3h7v7M10 14 21 3M21 13v8H3V3h8"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    bookmark:'<path d="M5 3h14v18l-7-5-7 5z"/>',
    shield:'<path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/>',
    chart:'<path d="M4 21V10m6 11V3m6 18v-8m5 8H2"/>',
    refresh:'<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>'
  };
  const icon=(n,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]||icons.book}</svg>`;
  const normalizeManga=(m={})=>({
    id:txt(m.id,90)||uid(),anilistId:m.anilistId?Number(m.anilistId):null,malId:m.malId?Number(m.malId):null,
    title:txt(m.title,180)||'Untitled manga',author:txt(m.author,150),year:m.year?clamp(m.year,1900,2100):'',
    cover:safeUrl(m.cover),description:txt(m.description,3500),
    genres:arr(m.genres).map(g=>txt(g,45)).filter(Boolean).slice(0,20),
    status:STATUSES.some(x=>x[0]===m.status)?m.status:'plan',
    read:Math.round(clamp(m.read,0,100000)),total:Math.round(clamp(m.total,0,100000)),
    rating:clamp(m.rating,0,10),favorite:!!m.favorite,
    collectionIds:arr(m.collectionIds).map(x=>txt(x,90)).slice(0,30),
    addedAt:txt(m.addedAt,40)||new Date().toISOString(),
    updatedAt:txt(m.updatedAt,40)||new Date().toISOString()
  });
  const normalizeCollection=(c={})=>({id:txt(c.id,90)||uid(),name:txt(c.name,70)||'Unnamed',color:COLORS.includes(c.color)?c.color:COLORS[0],createdAt:txt(c.createdAt,40)||new Date().toISOString()});
  function load(){try{let s=JSON.parse(localStorage.getItem(KEY)); if(!s||!Array.isArray(s.manga))return DEFAULT();return {version:1,manga:s.manga.slice(0,7000).map(normalizeManga),collections:arr(s.collections).slice(0,500).map(normalizeCollection),activity:arr(s.activity).slice(-3000).filter(a=>a&&a.at&&a.change).map(a=>({at:txt(a.at,40),mangaId:txt(a.mangaId,90),title:txt(a.title,180),change:Math.round(clamp(a.change,0,100000))}))}}catch{return DEFAULT()}}
  let data=load();
  let ui={view:'dashboard',q:'',status:'all',sort:'recent',collectionId:'all',favorites:false,discoverQ:'',discoverSource:'anilist',discoverResults:[],discoverLoading:false,discoverError:'',discoverRequest:0,modal:null};
  let toastTimer;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch{toast('Storage is full or unavailable. Export your library as a backup.');return false}}
  function toast(msg){let el=document.getElementById('toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2900)}
  function mangaBy(id){return data.manga.find(m=>m.id===id)}
  function collectionBy(id){return data.collections.find(c=>c.id===id)}
  function initials(title){return txt(title).split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase()||'M'}
  function tone(title){return 1+[...raw(title)].reduce((h,c)=>h+c.charCodeAt(0),0)%5}
  function cover(m,addClass=''){let url=safeUrl(m.cover);return `<div class="card-cover tone-${tone(m.title)} ${addClass}"><div class="cover-art"><span>${esc(initials(m.title))}</span></div>${url?`<img src="${esc(url)}" loading="lazy" alt="Cover of ${esc(m.title)}" onerror="this.style.display='none'">`:''}</div>`}
  function progress(m){return m.total>0?Math.round(Math.min(100,100*m.read/m.total)):0}
  function count(s){return data.manga.filter(m=>m.status===s).length}
  function recent(){return [...data.manga].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))}
  function chapterText(m){return `Ch. ${m.read}${m.total?' / '+m.total:''}`}
  function formatRating(n){return n?Number(n).toFixed(1):'—'}
  function navItem(v,n,title,countVal){return `<button class="nav-item ${ui.view===v?'active':''}" data-action="view" data-view="${v}" aria-label="${esc(title)}">${icon(n)}<span>${esc(title)}</span>${countVal!=null?`<span class="count">${countVal}</span>`:''}</button>`}
  function shell(inner){const crumbs={dashboard:'Overview',library:'My Library',collections:'Collections',discover:'Discover Manga',settings:'Settings'};return `<a class="skip-link" href="#main">Skip to content</a><div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-symbol">${icon('book',21)}</div><span>ink<span class="dot">shelf.</span></span></div><div class="sidebar-label">MENU</div><div class="nav-stack">${navItem('dashboard','layout','Dashboard')}${navItem('library','book','My Library',data.manga.length)}${navItem('collections','layers','Collections')}${navItem('discover','compass','Discover')}${navItem('settings','settings','Settings')}</div><div class="sidebar-spacer"></div><div class="sidebar-label">QUICK FILTERS</div><div class="nav-stack">${[['reading','Reading'],['plan','Plan to read'],['completed','Completed']].map(([s,n])=>`<button class="nav-item" data-action="quick-filter" data-status="${s}">${icon(s==='reading'?'bookmark':s==='plan'?'clock':'check')}<span>${n}</span><span class="count">${count(s)}</span></button>`).join('')}</div><div class="sidebar-bottom"><div class="profile-row"><div class="mini-avatar">I</div><div><strong>My collection</strong><small>Private · saved locally</small></div></div><div class="privacy-note">A little home for every story you love.</div></div></aside><main class="main" id="main"><header class="topbar"><div class="crumb">My Space ${icon('chevron',13)} <b>${crumbs[ui.view]}</b></div><div class="top-actions"><button class="search-shortcut" data-action="go-search">${icon('search',16)} <span>Search your manga...</span><kbd>/</kbd></button><button class="button primary" data-action="new-manga">${icon('plus',15)}<span> Add manga</span></button></div></header><div class="content">${inner}</div></main></div><nav class="mobile-nav" aria-label="Mobile navigation">${[['dashboard','layout','Home'],['library','book','Library'],['collections','layers','Lists'],['discover','compass','Discover'],['settings','settings','Settings']].map(([v,i,label])=>`<button class="${ui.view===v?'active':''}" data-action="view" data-view="${v}">${icon(i)}${label}</button>`).join('')}</nav>`}
  function sectionTitle(title,action,actionLabel){return `<div class="section-heading"><h2>${esc(title)}</h2>${action?`<button class="inline-link" data-action="${action}">${esc(actionLabel||'View all')} ${icon('arrow',14)}</button>`:''}</div>`}
  function header(kicker,title,subtitle,button=''){return `<div class="page-heading"><div><div class="eyebrow">${esc(kicker)}</div><h1 class="page-title">${esc(title)}</h1><p class="page-subtitle">${esc(subtitle)}</p></div>${button}</div>`}
  function stat(iconName,label,n,note,cls=''){return `<div class="stat"><div class="stat-top">${esc(label)}<span class="stat-icon ${cls}">${icon(iconName,16)}</span></div><div><div class="stat-number">${esc(n)}</div><div class="stat-bottom">${esc(note)}</div></div></div>`}
  function getWeekly(){return Array.from({length:7},(_,i)=>{let d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(6-i));const key=dateKey(d);return {name:d.toLocaleDateString('en',{weekday:'short'}),key,ch: data.activity.filter(a=>dateKey(new Date(a.at))===key).reduce((s,a)=>s+a.change,0),today:i===6}})}
  function weeklyPanel(){let days=getWeekly(),max=Math.max(1,...days.map(x=>x.ch));return `<div class="panel"><div class="panel-header"><h3>Reading activity</h3><span class="helper">Chapters · past 7 days</span></div><p>Your little steps add up.</p><div class="weekly-chart">${days.map(d=>`<div class="weekly-day ${d.today?'today':''}" title="${d.ch} chapters"><div class="bar-outer"><div class="bar" style="height:${Math.max(4,(d.ch/max)*100)}%"></div></div><b>${d.ch}</b><span>${d.name}</span></div>`).join('')}</div></div>`}
  function distributionPanel(){let s=STATUSES.map(([id,name])=>({id,name,n:count(id)}));return `<div class="panel"><div class="panel-header"><h3>Reading breakdown</h3><span class="helper">${data.manga.length} titles</span></div><p>How your shelf is shaping up.</p><div class="distribution">${s.map(x=>`<div class="dist-row"><span><i class="tiny-dot"></i>${esc(x.name)}</span><div class="dist-track"><div class="dist-fill" style="width:${data.manga.length?100*x.n/data.manga.length:0}%"></div></div><b>${x.n}</b></div>`).join('')}</div></div>`}
  function emptyState(title,description,btnLabel,btnAction){return `<div class="empty"><div class="empty-icon">${icon('book',22)}</div><strong>${esc(title)}</strong><p>${esc(description)}</p>${btnAction?`<button class="button primary small" data-action="${btnAction}">${icon('plus',14)} ${esc(btnLabel)}</button>`:''}</div>`}
  function mangaCard(m){return `<article class="manga-card"><div style="position:relative"><div role="button" tabindex="0" data-action="detail" data-id="${esc(m.id)}" aria-label="Open ${esc(m.title)} details">${cover(m)}</div><span class="cover-status">${esc(statusName(m.status))}</span><button class="cover-fav ${m.favorite?'active':''}" data-action="favorite" data-id="${esc(m.id)}" aria-label="${m.favorite?'Remove from':'Add to'} favorites">${icon('heart',14)}</button></div><div class="card-title" title="${esc(m.title)}">${esc(m.title)}</div><div class="card-meta"><span>${esc(chapterText(m))}</span><span>${m.rating?`<span style="color:#ffc980">★</span> ${formatRating(m.rating)}`:''}</span></div><div class="progress-track"><div class="progress-fill" style="width:${progress(m)}%"></div></div><div class="card-foot"><span class="helper">${m.total?progress(m)+'% complete':m.read?'Progress saved':'Not started'}</span><div class="mini-stepper"><button data-action="progress" data-id="${esc(m.id)}" data-delta="-1" aria-label="Previous chapter of ${esc(m.title)}">${icon('minus',13)}</button><button data-action="progress" data-id="${esc(m.id)}" data-delta="1" aria-label="Next chapter of ${esc(m.title)}">${icon('plus',13)}</button></div></div></article>`}
  function hero(){let candidate=recent().find(m=>m.status==='reading')||recent().find(m=>m.status==='plan'),reading=!!candidate;let arts=recent().slice(0,3);return `<section class="hero"><div class="hero-copy"><div class="hero-kicker">${icon('sparkle',15)} YOUR PERSONAL MANGA CORNER</div><h2>${reading?'Your next chapter<br>starts here.':'Every great story<br>needs a shelf.'}</h2><p>${reading?`Pick up where you left off${candidate?` with ${esc(candidate.title)}`:''}. Your next favorite moment is a chapter away.`:'Collect your favorites, keep track of every chapter, and build a library that feels like you.'}</p><button class="button primary" data-action="${reading?'detail':'new-manga'}" ${reading?`data-id="${esc(candidate.id)}"`:''}>${reading?'Continue reading':'Add your first manga'} ${icon('arrow',16)}</button></div><div class="hero-art" aria-hidden="true">${Array.from({length:3},(_,i)=>{let m=arts[i];let src=m?safeUrl(m.cover):'';return `<div class="hero-book"><span>${m?esc(initials(m.title)):['読','漫','画'][i]}</span>${src?`<img src="${esc(src)}" alt="" onerror="this.style.display='none'">`:''}</div>`}).join('')}<div class="hero-sparkle">${icon('sparkle',35)}</div></div></section>`}
  function dashboard(){let read=data.manga.reduce((sum,m)=>sum+m.read,0),ratings=data.manga.filter(m=>m.rating).map(m=>m.rating);let latest=recent().slice(0,6);return header('WELCOME BACK','Your reading dashboard','One cozy place for everything you’re reading, loving, and planning.')+hero()+`<div class="stats-grid">${stat('book','Total manga',data.manga.length,'Titles on your shelves')}${stat('bookmark','Chapters read',read.toLocaleString(),'Across your whole library','cyan')}${stat('check','Completed',count('completed'),'Stories finished','pink')}${stat('star','Average rating',ratings.length?(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1):'—',ratings.length?ratings.length+' rated titles':'Rate your favorites','yellow')}</div>`+sectionTitle('Recently added & updated','go-library','Browse library')+(latest.length?`<div class="shelf-grid">${latest.map(mangaCard).join('')}</div>`:emptyState('A blank shelf, full of possibilities','Add a manga manually, or search AniList or MyAnimeList to find titles and their covers.','Find a manga','view-discover'))+`<div class="lower-panels">${weeklyPanel()}${distributionPanel()}</div>`}
  function filteredManga(){let a=[...data.manga],q=ui.q.trim().toLowerCase();if(q)a=a.filter(m=>[m.title,m.author,m.description,...m.genres].join(' ').toLowerCase().includes(q));if(ui.status!=='all')a=a.filter(m=>m.status===ui.status);if(ui.collectionId!=='all')a=a.filter(m=>m.collectionIds.includes(ui.collectionId));if(ui.favorites)a=a.filter(m=>m.favorite);switch(ui.sort){case'title':a.sort((x,y)=>x.title.localeCompare(y.title));break;case'rating':a.sort((x,y)=>y.rating-x.rating||x.title.localeCompare(y.title));break;case'progress':a.sort((x,y)=>progress(y)-progress(x));break;case'added':a.sort((x,y)=>new Date(y.addedAt)-new Date(x.addedAt));break;default:a.sort((x,y)=>new Date(y.updatedAt)-new Date(x.updatedAt))}return a}
  function library(){let filtered=filteredManga();return header('YOUR BOOKSHELF','My manga library','Your stories, all organized in one place.',`<button class="button primary" data-action="new-manga">${icon('plus',15)} Add a title</button>`)+`<div class="library-tools"><label class="field-search">${icon('search',17)}<input id="library-search" type="search" placeholder="Search titles, authors, genres..." value="${esc(ui.q)}" autocomplete="off" aria-label="Search your manga"></label><select class="select" id="collection-filter" aria-label="Filter by collection"><option value="all">All collections</option>${data.collections.map(c=>`<option value="${esc(c.id)}" ${ui.collectionId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><select class="select" id="sort-filter" aria-label="Sort manga">${[['recent','Recently updated'],['added','Recently added'],['title','Title A–Z'],['rating','Highest rated'],['progress','Most progress']].map(([v,n])=>`<option value="${v}" ${ui.sort===v?'selected':''}>${n}</option>`).join('')}</select><button class="button ${ui.favorites?'primary':'ghost'} small" data-action="toggle-favorites">${icon('heart',15)} Favorites</button></div><div class="filter-pills">${[['all','All manga'],...STATUSES].map(([id,n])=>`<button class="pill ${ui.status===id?'active':''}" data-action="set-status" data-status="${id}">${esc(n)} <span style="opacity:.65">${id==='all'?data.manga.length:count(id)}</span></button>`).join('')}</div><div class="results-count"><strong>${filtered.length}</strong> ${filtered.length===1?'manga':'manga'} found</div>${filtered.length?`<div class="shelf-grid">${filtered.map(mangaCard).join('')}</div>`:emptyState(data.manga.length?'No manga match these filters':'Your manga library is empty',data.manga.length?'Try a different search or clear your filters.':'Add a manga to start building your personal bookshelf.',data.manga.length?'Clear filters':'Add manga',data.manga.length?'reset-filters':'new-manga')}`}
  function collectionCard(c){let members=data.manga.filter(m=>m.collectionIds.includes(c.id));return `<div class="collection-card" style="--c:${c.color}"><div class="collection-top"><div class="collection-icon">${icon('layers',19)}</div><button class="icon-button" style="width:29px;height:29px;z-index:1" data-action="edit-collection" data-id="${esc(c.id)}" aria-label="Edit collection ${esc(c.name)}">${icon('edit',14)}</button></div><div><button data-action="open-collection" data-id="${esc(c.id)}" style="border:0;background:none;padding:0;text-align:left;color:inherit"><h3>${esc(c.name)}</h3><p>${members.length} ${members.length===1?'title':'titles'} · Open collection ${icon('arrow',12)}</p></button><div class="collection-avatars">${members.slice(0,5).map(m=>`<span class="tone-${tone(m.title)}">${safeUrl(m.cover)?`<img src="${esc(m.cover)}" alt="" onerror="this.style.display='none'">`:esc(initials(m.title))}</span>`).join('')}${!members.length?'<span>✦</span><span>✦</span>':''}</div></div></div>`}
  function collections(){return header('CURATE YOUR OWN','Collections','Create custom shelves for your favorites, genres, or anything else.',`<button class="button primary" data-action="new-collection">${icon('plus',15)} New collection</button>`)+`<div class="collections-grid">${data.collections.map(collectionCard).join('')}<button class="collection-card create" data-action="new-collection">${icon('plus',25)}<strong>Create a collection</strong><span class="helper">Make room for more stories</span></button></div>`+`<div class="note" style="margin-top:20px">Tip: Open a manga and choose “Edit details” to add it to one or more collections.</div>`}
  function isInLibrary(result){
    return data.manga.some(m => (result.malId && m.malId===result.malId) ||
      (result.anilistId && m.anilistId===result.anilistId) ||
      (m.title.toLocaleLowerCase().trim()===result.title.toLocaleLowerCase().trim()));
  }
  function discoverCard(m){
    let exists=isInLibrary(m),temp={title:m.title,cover:m.cover};
    return `<article class="discover-card">${cover(temp)}<div class="card-title" title="${esc(m.title)}">${esc(m.title)}</div><div class="card-meta"><span>${esc(m.year||'Year unknown')}</span><span>${m.total?m.total+' chapters':'Ongoing / unknown'}</span></div><div class="source-note">${esc(m.source==='mal'?'MyAnimeList':'AniList')}${m.malId?` · <a target="_blank" rel="noopener noreferrer" href="https://myanimelist.net/manga/${m.malId}" title="View on MyAnimeList">MAL ↗</a>`:''}</div><button class="button ${exists?'ghost':'primary'} small" data-action="add-discover" data-id="${esc(m.source+':'+m.catalogId)}" ${exists?'disabled':''}>${icon(exists?'check':'plus',14)} ${exists?'On your shelf':'Add to library'}</button></article>`;
  }
  function discover(){
    const provider=ui.discoverSource==='mal'?'MyAnimeList':'AniList';
    let body;
    if(ui.discoverLoading) body=`<div class="loader" aria-label="Searching manga"></div><p class="page-subtitle" style="text-align:center">Searching ${provider}...</p>`;
    else if(ui.discoverError) body=emptyState('Could not reach manga search',ui.discoverError,'Add manually','new-manga');
    else if(ui.discoverResults.length) body=`<div class="results-count"><strong>${ui.discoverResults.length}</strong> results from ${provider}</div><div class="discover-grid">${ui.discoverResults.map(discoverCard).join('')}</div>`;
    else body=emptyState(ui.discoverQ?'Nothing found yet':'Discover your next favorite',`Search by manga title for real covers and details from ${provider}.`,'Add manually','new-manga');
    return header('FIND SOMETHING NEW','Discover manga','Search manga on AniList or MyAnimeList, then add them to your personal library.')+
      `<div class="discover-hero"><span class="icon-big">${icon('compass',30)}</span><div><h3>Search the world of manga</h3><p>Choose AniList or MyAnimeList below. Your saved titles and chapter progress remain on this Mac.</p></div></div>`+
      `<form id="discover-form" class="discover-form"><select class="select discover-provider" id="discover-source" name="source" aria-label="Manga data source"><option value="anilist" ${ui.discoverSource==='anilist'?'selected':''}>AniList</option><option value="mal" ${ui.discoverSource==='mal'?'selected':''}>MyAnimeList (MAL)</option></select><label class="field-search">${icon('search',17)}<input type="search" id="discover-search" name="q" value="${esc(ui.discoverQ)}" placeholder="Try: One Piece, Frieren, Vagabond..." aria-label="Search manga catalog" required></label><button class="button primary" type="submit">${icon('search',16)} Search manga</button></form>`+
      `<div class="search-note">${ui.discoverSource==='mal'?'MAL metadata provided by Tenrai (with Jikan-Edge fallback), unofficial public services. No MAL login needed.':'AniList public catalog. Switch to MAL for MyAnimeList entries and scores.'} Online search needs internet; manual entry works offline.</div>${body}`;
  }
  function settings(){return header('YOUR DATA, YOUR RULES','Settings & backups','Keep your library safely in your hands.')+
    `<div class="settings-stack"><section class="settings-card"><h3>${icon('download',18)} Export library</h3><p>Download all your manga, progress, ratings, custom collections and reading activity as a JSON backup.</p><button class="button primary" data-action="export">${icon('download',16)} Download backup</button><div class="note">Back up your library before changing browsers or clearing site data.</div></section>`+
    `<section class="settings-card"><h3>${icon('upload',18)} Restore InkShelf backup</h3><p>Restore from an InkShelf JSON backup. <strong>This replaces</strong> the current library on this browser.</p><label class="button" for="import-file">${icon('upload',16)} Choose JSON backup</label><input id="import-file" type="file" accept=".json,application/json" class="hide"><div class="note">Imported data is kept on this device only.</div></section>`+
    `<section class="settings-card"><h3>${icon('book',18)} Import from MyAnimeList</h3><p>Bring over your MAL manga titles, ratings, reading statuses and chapter progress from your MAL export file (.xml or .xml.gz). Your existing InkShelf manga are kept; matches are skipped to avoid overwriting progress.</p><label class="button primary" for="mal-import-file">${icon('upload',16)} Choose MAL manga export</label><input id="mal-import-file" type="file" accept=".xml,.gz,.xml.gz,text/xml,application/xml,application/gzip" class="hide"><div class="note"><a href="https://myanimelist.net/panel.php?go=export" target="_blank" rel="noopener noreferrer">Export your manga list from MyAnimeList ↗</a> (MAL login may be required). Processing happens locally; no account link or automatic sync.</div></section>`+
    `<section class="settings-card"><h3>${icon('shield',18)} Local-first privacy</h3><p>Your library is in this browser’s local storage. There is no InkShelf account or server database. Online searches send search terms to the selected catalog service and load remote covers; MAL XML imports stay on your Mac.</p><div class="note"><strong>Important:</strong> A different browser or device does not automatically sync. Keep JSON backups, especially after a Mac restart or before moving the app.</div></section>`+
    `<section class="settings-card"><h3>${icon('trash',18)} Reset library</h3><p>Remove your manga, collections and reading activity from this browser. This cannot be undone without a backup.</p><button class="button danger" data-action="clear-data">${icon('trash',15)} Delete all library data</button></section></div>`;
  }
  function render(opts={}){let focused=document.activeElement,focusId=focused?.id,sel=null;try{if(focused&&typeof focused.selectionStart==='number')sel=[focused.selectionStart,focused.selectionEnd]}catch{}let body={dashboard,library,collections,discover,settings}[ui.view]();document.getElementById('app').innerHTML=shell(body);document.title=`${({dashboard:'Dashboard',library:'Library',collections:'Collections',discover:'Discover',settings:'Settings'})[ui.view]} · InkShelf`;if(opts.preserveFocus&&focusId){let t=document.getElementById(focusId);if(t){t.focus();if(sel)try{t.setSelectionRange(...sel)}catch{}}}}
  function navigate(v){if(!['dashboard','library','collections','discover','settings'].includes(v))return;ui.view=v;closeModal();render();window.scrollTo({top:0,behavior:'instant'})}
  function resetFilters(){ui.q='';ui.status='all';ui.collectionId='all';ui.favorites=false;ui.sort='recent';render()}
  function updateManga(m){m.updatedAt=new Date().toISOString();save();render();if(ui.modal?.type==='detail'&&ui.modal.id===m.id)showDetail(m.id)}
  function changeProgress(id,d){let m=mangaBy(id);if(!m)return;let prev=m.read,limit=m.total||100000;m.read=Math.round(clamp(prev+d,0,limit));if(m.read===prev){toast(m.total&&m.read>=m.total?'You have reached the final chapter.':'Already at chapter 0.');return}if(d>0){data.activity.push({mangaId:m.id,title:m.title,change:m.read-prev,at:new Date().toISOString()});data.activity=data.activity.slice(-3000)}if(m.total&&m.read>=m.total)m.status='completed';else if(m.read>0&&(m.status==='plan'||m.status==='completed'))m.status='reading';updateManga(m);toast(`Updated ${m.title}: ${chapterText(m)}`)}
  function setProgressDirect(id,v){let m=mangaBy(id);if(!m)return;let newVal=Math.round(clamp(v,0,m.total||100000)),delta=newVal-m.read;m.read=newVal;if(delta>0){data.activity.push({mangaId:m.id,title:m.title,change:delta,at:new Date().toISOString()});data.activity=data.activity.slice(-3000)}if(m.total&&m.read>=m.total)m.status='completed';else if(m.read>0&&(m.status==='plan'||m.status==='completed'))m.status='reading';updateManga(m);toast('Chapter progress saved')}
  function toggleFavorite(id){let m=mangaBy(id);if(!m)return;m.favorite=!m.favorite;updateManga(m);toast(m.favorite?'Added to favorites':'Removed from favorites')}
  function modal(content,wide=false){document.getElementById('modal-root').innerHTML=`<div class="modal-layer" data-action="backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${content}</section></div>`;document.body.style.overflow='hidden';let first=document.querySelector('#modal-root input:not([type="hidden"]),#modal-root button');if(first)first.focus()}
  function closeModal(){document.getElementById('modal-root').innerHTML='';document.body.style.overflow='';ui.modal=null}
  function modalHeader(title,sub){return `<div class="modal-header"><div><h2 id="modal-title">${esc(title)}</h2><p>${esc(sub||'')}</p></div><button class="modal-close" data-action="close-modal" aria-label="Close">${icon('x',17)}</button></div>`}
  function editor(id=null,prefill=null){let isEdit=!!id,m=isEdit?mangaBy(id):prefill;if(isEdit&&!m)return;m=m||{title:'',author:'',year:'',cover:'',description:'',genres:[],status:'plan',read:0,total:0,rating:0,collectionIds:[]};ui.modal={type:'editor',id};modal(`${modalHeader(isEdit?'Edit manga':'Add manga',isEdit?'Make changes to your manga.':'Build your own bookshelf, one title at a time.')}<form id="manga-form"><div class="form-grid"><div class="form-field span2"><label for="m-title">Manga title *</label><input id="m-title" name="title" value="${esc(m.title)}" placeholder="Enter manga title" required maxlength="180"></div><div class="form-field"><label for="m-author">Author / Artist</label><input id="m-author" name="author" value="${esc(m.author)}" placeholder="Optional"></div><div class="form-field"><label for="m-year">Release year</label><input id="m-year" name="year" type="number" min="1900" max="2100" value="${esc(m.year)}" placeholder="e.g. 2020"></div><div class="form-field span2"><label for="m-cover">Cover image URL</label><input id="m-cover" name="cover" type="url" value="${esc(m.cover)}" placeholder="https://example.com/cover.jpg"><small>Optional. Paste an image link or find a cover using Discover.</small></div><div class="form-field"><label for="m-status">Reading status</label><select id="m-status" name="status">${STATUSES.map(([s,n])=>`<option value="${s}" ${m.status===s?'selected':''}>${n}</option>`).join('')}</select></div><div class="form-field"><label for="m-rating">My rating</label><select id="m-rating" name="rating"><option value="0">Not rated</option>${Array.from({length:10},(_,i)=>i+1).map(n=>`<option value="${n}" ${m.rating===n?'selected':''}>${n} / 10</option>`).join('')}</select></div><div class="form-field"><label for="m-read">Chapters read</label><input id="m-read" name="read" type="number" min="0" step="1" value="${m.read}"></div><div class="form-field"><label for="m-total">Total chapters (if known)</label><input id="m-total" name="total" type="number" min="0" step="1" value="${m.total}"><small>0 = unknown or ongoing.</small></div><div class="form-field span2"><label for="m-genres">Genres</label><input id="m-genres" name="genres" value="${esc(arr(m.genres).join(', '))}" placeholder="Action, Romance, Slice of Life"></div><div class="form-field span2"><label for="m-description">Description / personal notes</label><textarea id="m-description" name="description" placeholder="Write about this series...">${esc(m.description)}</textarea></div>${data.collections.length?`<div class="form-field span2"><label>My collections</label><div class="checkbox-list">${data.collections.map(c=>`<label><input type="checkbox" name="collectionIds" value="${esc(c.id)}" ${arr(m.collectionIds).includes(c.id)?'checked':''}> ${esc(c.name)}</label>`).join('')}</div></div>`:''}<div class="form-field span2"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="favorite" ${m.favorite?'checked':''} style="width:auto;accent-color:#b18bff"> Add to favorites ♡</label></div></div><div class="modal-actions">${isEdit?`<button type="button" class="button danger small" data-action="delete-manga" data-id="${esc(id)}">${icon('trash',14)} Delete</button>`:'<span></span>'}<div class="right"><button type="button" class="button ghost" data-action="close-modal">Cancel</button><button type="submit" class="button primary">${icon('check',16)} ${isEdit?'Save changes':'Add to library'}</button></div></div></form>`,true)}
  function showDetail(id){let m=mangaBy(id);if(!m)return;ui.modal={type:'detail',id};modal(`${modalHeader('Manga details','Your own reading record')}<div class="detail-layout">${cover(m)}<div><div class="detail-title">${esc(m.title)}</div><div class="detail-meta">${m.author?esc(m.author)+' · ':''}${m.year?esc(m.year)+' · ':''}${m.total?m.total+' chapters':'Total chapters unknown'}<div class="tag-row">${m.genres.slice(0,6).map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div></div><div class="detail-description">${esc(m.description||'No description yet. Add notes by editing this title.')}</div><div class="tag-row"><span class="tag">${esc(statusName(m.status))}</span>${m.rating?`<span class="tag">★ ${formatRating(m.rating)} / 10</span>`:''}${m.favorite?'<span class="tag">♥ Favorite</span>':''}</div></div></div><div class="detail-progress"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:12px">Chapter progress</b><span class="helper">${m.total?progress(m)+'% completed':'Ongoing / unknown length'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${progress(m)}%"></div></div><div class="detail-status"><div class="mini-stepper"><button data-action="progress" data-id="${esc(m.id)}" data-delta="-1" aria-label="Decrease chapters">${icon('minus',16)}</button><span>${esc(chapterText(m))}</span><button data-action="progress" data-id="${esc(m.id)}" data-delta="1" aria-label="Increase chapters">${icon('plus',16)}</button></div><form id="chapter-form" style="display:flex;gap:7px;align-items:center"><input name="chapter" type="number" min="0" max="${m.total||100000}" value="${m.read}" aria-label="Set current chapter"><button class="button small" type="submit">Set</button></form></div><div class="detail-status"><span class="helper">Reading status</span><select class="select" id="detail-status" aria-label="Update reading status">${STATUSES.map(([s,n])=>`<option value="${s}" ${m.status===s?'selected':''}>${n}</option>`).join('')}</select></div></div><div class="modal-utility"><button class="button" data-action="edit-manga" data-id="${esc(m.id)}">${icon('edit',15)} Edit details</button><button class="button" data-action="favorite" data-id="${esc(m.id)}">${icon('heart',15)} ${m.favorite?'Unfavorite':'Favorite'}</button><button class="button danger" data-action="delete-manga" data-id="${esc(m.id)}">${icon('trash',15)} Delete</button></div>`,true)}
  function editCollection(id=null){let c=id?collectionBy(id):null;if(id&&!c)return;ui.modal={type:'collection',id};modal(`${modalHeader(c?'Edit collection':'New collection','Give your shelf its own personality.')}<form id="collection-form"><div class="form-grid"><div class="form-field span2"><label for="c-name">Collection name *</label><input id="c-name" name="name" value="${esc(c?.name||'')}" placeholder="e.g. Comfort reads, Favorite romance" required maxlength="70"></div><div class="form-field span2"><label for="c-color">Accent color</label><select id="c-color" name="color">${COLORS.map((color,i)=>`<option value="${color}" ${color===(c?.color||COLORS[0])?'selected':''}>${['Lavender','Aqua','Rose','Golden','Mint','Blue'][i]}</option>`).join('')}</select></div></div><div class="modal-actions">${c?`<button type="button" class="button danger" data-action="delete-collection" data-id="${esc(id)}">${icon('trash',14)} Delete</button>`:'<span></span>'}<div class="right"><button type="button" class="button ghost" data-action="close-modal">Cancel</button><button type="submit" class="button primary">${icon('check',15)} Save collection</button></div></div></form>`)}
  function addDiscovery(id){
    let m=ui.discoverResults.find(x=>x.source+':'+x.catalogId===id);
    if(!m)return;
    if(isInLibrary(m)){toast('Already in your library');return}
    data.manga.unshift(normalizeManga({anilistId:m.anilistId,malId:m.malId,title:m.title,author:m.author,cover:m.cover,year:m.year,genres:m.genres,description:m.description,total:m.total,status:'plan'}));
    if(save()){render();toast('Added to your library!')}
  }
  function plainDescription(s){
    return txt(raw(s).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/(?:p|div|li)>/gi,'\n')
      .replace(/<[^>]*>/g,'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
      .replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>'),3500);
  }
  async function fetchWithTimeout(url,opts={},timeout=14000){
    const controller=new AbortController();const t=setTimeout(()=>controller.abort(),timeout);
    try {let res=await fetch(url,{...opts,signal:controller.signal,credentials:'omit'});if(!res.ok)throw Error(res.status===429?'Manga data service is rate-limiting searches. Try again shortly.':`Search service returned HTTP ${res.status}.`);return await res.json()}
    finally{clearTimeout(t)}
  }
  function normalAniList(m){return {
    source:'anilist',catalogId:Number(m.id),anilistId:Number(m.id),malId:m.idMal?Number(m.idMal):null,
    title:m.title?.english||m.title?.romaji||m.title?.native||'Unknown manga',
    cover:m.coverImage?.large||'',year:m.startDate?.year||'',total:Number(m.chapters)||0,
    description:plainDescription(m.description),genres:arr(m.genres),author:''
  }}
  function normalMAL(m){
    const v=m.published?.prop?.from?.year||m.published?.from?.slice?.(0,4)||'';
    return {source:'mal',catalogId:Number(m.mal_id||m.malId),anilistId:null,malId:Number(m.mal_id||m.malId),
      title:m.title_english||m.titleEnglish||m.title||'Unknown manga',
      cover:m.images?.jpg?.large_image_url||m.images?.webp?.large_image_url||m.images?.large||m.imageUrl||'',
      year:v||'',total:Number(m.chapters)||0,description:plainDescription(m.synopsis||''),
      genres:arr(m.genres).map(g=>g.name).filter(Boolean),author:arr(m.authors).map(a=>a.name).join(', ')
    };
  }
  async function searchMAL(q){
    const params='?q='+encodeURIComponent(q)+'&limit=18';let failures=[];
    for(const service of ['https://api.tenrai.org/v1/manga','https://jikan.lucashdo.com/v1/manga']){
      try{
        const json=await fetchWithTimeout(service+params);
        if(!Array.isArray(json.data))throw Error('Unexpected catalog response');
        return json.data.map(normalMAL).filter(x=>Number.isInteger(x.malId)&&x.malId>0);
      }catch(e){failures.push(e.message||'Connection failed')}
    }
    throw Error('MAL catalog search is currently unavailable ('+failures.join(' / ')+').');
  }
  async function searchCatalog(q,source=ui.discoverSource){
    q=txt(q,120);if(!q){toast('Enter a manga title to search');return}
    let request=++ui.discoverRequest;ui.discoverQ=q;ui.discoverSource=source==='mal'?'mal':'anilist';ui.discoverLoading=true;ui.discoverError='';ui.discoverResults=[];render();
    try{
      let found;
      if(ui.discoverSource==='mal')found=await searchMAL(q);
      else {
        const query=`query($search:String){Page(page:1,perPage:18){media(search:$search,type:MANGA,sort:POPULARITY_DESC){id idMal title{english romaji native} coverImage{large} chapters genres description(asHtml:false) startDate{year}}}}`;
        const json=await fetchWithTimeout('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query,variables:{search:q}})});
        if(json.errors?.length)throw Error(json.errors[0].message||'AniList search failed');
        found=arr(json.data?.Page?.media).map(normalAniList);
      }
      if(request===ui.discoverRequest)ui.discoverResults=found;
    }catch(e){if(request===ui.discoverRequest)ui.discoverError=(e.message||'Search failed')+' Check your internet and try again, or add manga manually.'}
    finally{if(request===ui.discoverRequest){ui.discoverLoading=false;render()}}
  }
  const malStatus = value => {
    const v=raw(value).trim().toLowerCase();
    return ({'1':'reading','2':'completed','3':'onhold','4':'dropped','6':'plan',
      'reading':'reading','completed':'completed','on-hold':'onhold','on hold':'onhold',
      'dropped':'dropped','plan to read':'plan','plan_to_read':'plan','0':'plan'})[v]||'plan';
  };
  async function importMAL(file){
    if(!file)return;
    try{
      let xml;
      const gzip=file.name.toLowerCase().endsWith('.gz');
      if(gzip){
        if(typeof DecompressionStream==='undefined')throw Error('Your browser cannot open .gz files. Double-click the export in Finder to extract the .xml, then import that XML file.');
        xml=await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text();
      }else xml=await file.text();
      if(xml.length>15000000)throw Error('The export file is too large to import safely.');
      if(/<!DOCTYPE/i.test(xml))throw Error('This XML contains a document definition, which is not supported.');
      const doc=new DOMParser().parseFromString(xml,'application/xml');
      if(doc.querySelector('parsererror'))throw Error('This is not valid XML. Use your MAL manga export file.');
      const entries=Array.from(doc.querySelectorAll('manga'));
      if(!entries.length)throw Error('No manga were found. Make sure you exported your MAL manga list, not the anime list.');
      const field=(entry,name)=>entry.getElementsByTagName(name)[0]?.textContent?.trim()||'';
      const existingIds=new Set(data.manga.map(m=>m.malId).filter(Boolean));
      const existingNames=new Set(data.manga.map(m=>m.title.trim().toLocaleLowerCase()));
      let additions=[],skipped=0;
      for(const entry of entries.slice(0,7000)){
        let malId=Number(field(entry,'manga_mangadb_id'))||null,title=txt(field(entry,'manga_title'),180);
        if(!title){skipped++;continue}
        if((malId&&existingIds.has(malId))||existingNames.has(title.toLocaleLowerCase())){skipped++;continue}
        let total=Math.round(clamp(field(entry,'manga_chapters'),0,100000));
        let read=Math.round(clamp(field(entry,'my_read_chapters'),0,total||100000));
        let record=normalizeManga({malId,title,total,read,rating:clamp(field(entry,'my_score'),0,10),status:malStatus(field(entry,'my_status')),description:field(entry,'my_comments')});
        additions.push(record);
        if(malId)existingIds.add(malId);
        existingNames.add(title.toLocaleLowerCase());
      }
      if(!additions.length){toast(`Nothing new to import (${skipped} already present or skipped)`);return}
      if(!confirm(`Import ${additions.length} new manga from MyAnimeList? ${skipped} matching/invalid entries will be skipped. Your existing InkShelf entries will NOT be overwritten.`))return;
      if(data.manga.length+additions.length>7000)throw Error('InkShelf has a 7,000-title safety limit. Export a backup before proceeding.');
      data.manga.push(...additions);
      if(!save()){data.manga.splice(data.manga.length-additions.length,additions.length);throw Error('Browser storage is full. Export your library as a backup before trying again.');}
      resetFilters();navigate('library');toast(`Imported ${additions.length} manga from MAL! ${skipped} skipped.`);
    }catch(e){toast(e.message||'Could not import MAL export');}
  }
  function exportData(){let blob=new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`inkshelf-backup-${dateKey(new Date())}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Library backup downloaded')}
  async function importFile(file){if(!file)return;try{let source=JSON.parse(await file.text());if(!Array.isArray(source.manga)||!Array.isArray(source.collections)||!Array.isArray(source.activity))throw Error('This is not a valid InkShelf backup.');if(!window.confirm(`Import ${source.manga.length} manga and ${source.collections.length} collections? Your existing library will be replaced.`))return;data={version:1,manga:source.manga.slice(0,7000).map(normalizeManga),collections:source.collections.slice(0,500).map(normalizeCollection),activity:source.activity.slice(-3000).filter(a=>a&&a.at&&a.change).map(a=>({at:txt(a.at,40),mangaId:txt(a.mangaId,90),title:txt(a.title,180),change:Math.round(clamp(a.change,0,100000))}))};save();resetFilters();navigate('dashboard');toast('Backup successfully imported')}catch(e){toast(e.message||'Could not read backup file')}}
  // Event delegation keeps UI controls working after each render.
  document.addEventListener('click',e=>{
    if(e.target.classList.contains('modal-layer')){closeModal();return}
    let b=e.target.closest('[data-action]');if(!b)return;
    let a=b.dataset.action,id=b.dataset.id;
    if(a==='view')navigate(b.dataset.view);
    else if(a==='go-library')navigate('library');
    else if(a==='view-discover')navigate('discover');
    else if(a==='go-search'){ui.status='all';ui.collectionId='all';navigate('library');document.getElementById('library-search')?.focus()}
    else if(a==='quick-filter'){ui.status=b.dataset.status;ui.collectionId='all';navigate('library')}
    else if(a==='new-manga')editor();
    else if(a==='edit-manga')editor(id);
    else if(a==='detail')showDetail(id);
    else if(a==='close-modal')closeModal();
    else if(a==='progress')changeProgress(id,Number(b.dataset.delta));
    else if(a==='favorite')toggleFavorite(id);
    else if(a==='set-status'){ui.status=b.dataset.status;render()}
    else if(a==='toggle-favorites'){ui.favorites=!ui.favorites;render()}
    else if(a==='reset-filters')resetFilters();
    else if(a==='new-collection')editCollection();
    else if(a==='edit-collection')editCollection(id);
    else if(a==='open-collection'){ui.collectionId=id;ui.status='all';navigate('library')}
    else if(a==='add-discover')addDiscovery(id);
    else if(a==='export')exportData();
    else if(a==='clear-data'){if(confirm('Delete all manga, collections and reading history from this browser? This cannot be undone.')){data=DEFAULT();save();resetFilters();navigate('dashboard');toast('Library cleared')}}
    else if(a==='delete-manga'){let m=mangaBy(id);if(m&&confirm(`Delete "${m.title}" from your library?`)){data.manga=data.manga.filter(x=>x.id!==id);save();closeModal();render();toast('Manga removed')}}
    else if(a==='delete-collection'){let c=collectionBy(id);if(c&&confirm(`Delete collection "${c.name}"? The manga inside will stay in your library.`)){data.collections=data.collections.filter(x=>x.id!==id);data.manga.forEach(m=>m.collectionIds=m.collectionIds.filter(v=>v!==id));if(ui.collectionId===id)ui.collectionId='all';save();closeModal();render();toast('Collection removed')}}
  });
  document.addEventListener('input',e=>{if(e.target.id==='library-search'){ui.q=e.target.value;render({preserveFocus:true})}});
  document.addEventListener('change',e=>{let t=e.target;if(t.id==='collection-filter'){ui.collectionId=t.value;render()}else if(t.id==='sort-filter'){ui.sort=t.value;render()}else if(t.id==='detail-status'){let m=mangaBy(ui.modal?.id);if(m){m.status=t.value;updateManga(m);toast('Status updated')}}else if(t.id==='import-file'){importFile(t.files[0])}else if(t.id==='mal-import-file'){importMAL(t.files[0])}else if(t.id==='discover-source'){ui.discoverRequest++;ui.discoverSource=t.value==='mal'?'mal':'anilist';ui.discoverResults=[];ui.discoverError='';ui.discoverLoading=false;render()}});
  document.addEventListener('submit',e=>{
    let f=e.target;if(!['manga-form','chapter-form','collection-form','discover-form'].includes(f.id))return;e.preventDefault();let vals=new FormData(f);
    if(f.id==='discover-form'){searchCatalog(vals.get('q'),vals.get('source'));return}
    if(f.id==='chapter-form'){setProgressDirect(ui.modal?.id,vals.get('chapter'));return}
    if(f.id==='collection-form'){let name=txt(vals.get('name'),70);if(!name)return;let existing=ui.modal?.id?collectionBy(ui.modal.id):null;if(existing){existing.name=name;existing.color=COLORS.includes(vals.get('color'))?vals.get('color'):COLORS[0]}else data.collections.push(normalizeCollection({name,color:vals.get('color')}));save();closeModal();render();toast(existing?'Collection updated':'Collection created');return}
    if(f.id==='manga-form'){
      let id=ui.modal?.id,old=id?mangaBy(id):null;
      let total=Math.round(clamp(vals.get('total'),0,100000)),read=Math.round(clamp(vals.get('read'),0,total||100000));
      let name=txt(vals.get('title'),180);if(!name){toast('Please enter a title');return}
      let m=normalizeManga({...(old||{}),title:name,author:vals.get('author'),year:vals.get('year'),cover:vals.get('cover'),status:vals.get('status'),rating:vals.get('rating'),read,total,genres:raw(vals.get('genres')).split(',').map(x=>x.trim()).filter(Boolean),description:vals.get('description'),favorite:vals.has('favorite'),collectionIds:vals.getAll('collectionIds'),updatedAt:new Date().toISOString()});
      if(m.total&&m.read>=m.total)m.status='completed';
      if(old){if(m.read>old.read){data.activity.push({mangaId:old.id,title:m.title,change:m.read-old.read,at:new Date().toISOString()})}Object.assign(old,m)}else{data.manga.unshift(m);if(m.read>0)data.activity.push({mangaId:m.id,title:m.title,change:m.read,at:new Date().toISOString()})}
      data.activity=data.activity.slice(-3000);save();closeModal();render();toast(old?'Manga updated':'Manga added to your shelf!')
    }
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.modal)closeModal();if((e.key==='/'||((e.metaKey||e.ctrlKey)&&e.key==='k'))&&!ui.modal&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();ui.status='all';ui.collectionId='all';navigate('library');document.getElementById('library-search')?.focus()}if(e.key==='Enter'&&e.target.matches('[role="button"][data-action="detail"]')){e.preventDefault();showDetail(e.target.dataset.id)}});
  // Seed-free: the library starts genuinely empty and belongs to the user.
  render();
})();
