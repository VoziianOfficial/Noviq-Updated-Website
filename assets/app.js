const c=window.SITE_CONFIG;
const all=(s)=>Array.from(document.querySelectorAll(s));
all('[data-company]').forEach(x=>x.textContent=c.companyName);
all('[data-logo]').forEach(x=>x.src=c.logo);
all('[data-email]').forEach(x=>{x.textContent=c.email;x.href='mailto:'+c.email});
for(const [selector,value] of [['[data-footer]',c.footer],['[data-address]',c.address],['[data-disclaimer]',c.disclaimer],['[data-collab-title]',c.collaborationTitle],['[data-collab-text]',c.collaborationText],['[data-year]',new Date().getFullYear()]])all(selector).forEach(x=>x.textContent=value);
document.title=c.siteTitle;
all('a[href]').forEach(a=>{const raw=a.getAttribute('href');for(const [key,original] of Object.entries({home:'index.html',privacy:'privacy.html',terms:'terms.html',cookies:'cookies.html'})){if(raw===original||raw.startsWith(original+'#'))a.setAttribute('href',(c.links[key]||original)+raw.slice(original.length))}});
document.querySelector('link[rel="icon"]').href=c.favicon;
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
all('nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
document.querySelector('.services-toggle').addEventListener('click',e=>{const open=e.currentTarget.parentElement.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');all('.dropdown').forEach(x=>x.classList.remove('open'))}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window){document.body.classList.add('js-reveal');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.01,rootMargin:'80px 0px'});all('[data-reveal]').forEach((el,i)=>{el.style.transitionDelay=(i%3)*65+'ms';observer.observe(el)})}
all('[data-carousel]').forEach(root=>{const track=root.querySelector('.carousel-track');let busy=false;function move(direction){if(busy)return;busy=true;const width=track.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap||22);if(direction<0){track.style.transition='none';track.prepend(track.lastElementChild);track.style.transform=`translateX(-${width}px)`;track.getBoundingClientRect();track.style.transition='transform .6s cubic-bezier(.2,.75,.2,1)';track.style.transform='translateX(0)'}else{track.style.transform=`translateX(-${width}px)`}setTimeout(()=>{if(direction>0){track.style.transition='none';track.append(track.firstElementChild);track.style.transform='translateX(0)';track.getBoundingClientRect();track.style.transition='transform .6s cubic-bezier(.2,.75,.2,1)'}busy=false},reduced?0:620)}root.querySelector('[data-prev]').onclick=()=>move(-1);root.querySelector('[data-next]').onclick=()=>move(1);let start=0;let swiped=false;track.addEventListener('pointerdown',e=>{start=e.clientX;swiped=false});track.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-start)>40){swiped=true;move(e.clientX<start?1:-1)}});track.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopPropagation();swiped=false}},true);track.addEventListener('dragstart',e=>e.preventDefault());let timer;const run=()=>{clearInterval(timer);if(!reduced)timer=setInterval(()=>{if(!document.hidden&&root.getBoundingClientRect().top<innerHeight&&root.getBoundingClientRect().bottom>0)move(1)},5500)};run();root.addEventListener('mouseenter',()=>clearInterval(timer));root.addEventListener('mouseleave',run);root.addEventListener('focusin',()=>clearInterval(timer));root.addEventListener('focusout',()=>{clearInterval(timer);run()})});
all('.project-panels').forEach(root=>{
  const panels=Array.from(root.querySelectorAll('.project-panel'));
  let hoverTimer;
  const cancelHover=()=>clearTimeout(hoverTimer);
  const activate=panel=>{
    cancelHover();
    if(panel.classList.contains('active'))return;
    panels.forEach(item=>item.classList.toggle('active',item===panel));
  };
  panels.forEach(panel=>{
    panel.addEventListener('mouseenter',()=>{
      cancelHover();
      hoverTimer=setTimeout(()=>activate(panel),120);
    });
    panel.addEventListener('mouseleave',cancelHover);
    panel.addEventListener('focus',()=>activate(panel));
    panel.addEventListener('click',e=>{
      if(matchMedia('(hover:none)').matches&&!panel.classList.contains('active')){
        e.preventDefault();
        activate(panel);
      }
    });
  });
  root.addEventListener('mouseleave',cancelHover);
});
all('[data-billing]').forEach(b=>b.onclick=()=>{all('[data-billing]').forEach(x=>x.classList.toggle('active',x===b));const quarterly=b.dataset.billing==='quarterly';all('[data-price]').forEach(x=>x.textContent='$'+(Number(x.dataset.price)*(quarterly?3:1)).toLocaleString('en-US'));all('[data-period]').forEach(x=>x.textContent=quarterly?' / quarter':' / month')});
const cookie=document.querySelector('.cookie-banner');try{cookie.hidden=!!localStorage.getItem('noviq-consent')}catch{}
all('[data-cookie]').forEach(b=>b.onclick=()=>{try{localStorage.setItem('noviq-consent',b.dataset.cookie)}catch{}cookie.hidden=true});all('.cookie-settings').forEach(b=>b.onclick=()=>{cookie.hidden=false});
const form=document.querySelector('#contact-form');if(form)form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const status=form.querySelector('.form-status'),submit=form.querySelector('[type="submit"]');status.textContent='';if(!c.form.enabled){status.textContent='The enquiry service is not connected yet. Please try again after launch.';return}submit.disabled=true;status.textContent='Sending your request…';try{const response=await fetch(c.form.endpoint,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const data=await response.json();if(!response.ok||data.success!==true)throw new Error(data.message||'Your request could not be sent. Please try again.');status.textContent=c.form.successMessage;form.reset()}catch(error){status.textContent=error.message==='Failed to fetch'?'Connection unavailable. Please try again.':error.message.includes('JSON')?'The enquiry service is unavailable. Please try again later.':error.message}finally{submit.disabled=false}});
all('a[href]').forEach(a=>a.addEventListener('click',e=>{const u=new URL(a.href,location.href);if(!reduced&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&u.origin===location.origin&&u.pathname!==location.pathname&&!a.target){e.preventDefault();document.querySelector('.page-transition').classList.add('active');setTimeout(()=>location.href=a.href,210)}}));
window.addEventListener('pageshow',()=>document.querySelector('.page-transition').classList.remove('active'));

const aboutCopy=[['We connect the dots between what your customers search for, what catches their eye and what makes them choose you.','From Google Ads and Search to YouTube and Meta, our approach brings creative thinking and practical measurement into the same room.'],['Give every impression a reason to become a connection. We shape messages around your audience, your brand and the moments that matter.','From a YouTube opening frame to a Meta campaign, creative direction and testing work together to make the next idea more relevant.']];
all('[data-about-tab]').forEach((b,i)=>{b.onclick=()=>{all('[data-about-tab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));const p=document.querySelector('#about-panel');p.innerHTML=aboutCopy[i].map(t=>'<p>'+t+'</p>').join('');p.style.animation='none';void p.offsetWidth;p.style.animation='reveal .4s'};b.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=all('[data-about-tab]')[1-i];next.focus();next.click()}}});
const counters=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;counters.unobserve(e.target);const target=Number(e.target.dataset.count);if(reduced){e.target.textContent=target;return}const start=performance.now();function frame(now){const t=Math.min((now-start)/1600,1);e.target.textContent=Math.round(10+(target-10)*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(frame)}requestAnimationFrame(frame)}),{threshold:.5});all('[data-count]').forEach(x=>counters.observe(x));
all('[data-coverflow]').forEach(root=>{
  let index=0,start=0,moved=false,pointerActive=false,timer;
  const cards=Array.from(root.querySelectorAll('.coverflow-stage>a'));
  const dots=Array.from(root.querySelectorAll('[data-cover-index]'));
  function render(){
    cards.forEach((card,i)=>{
      let offset=(i-index+cards.length)%cards.length;
      if(offset>Math.floor(cards.length/2))offset-=cards.length;
      card.style.setProperty('--offset',offset);
      card.style.setProperty('--distance',Math.abs(offset));
      card.tabIndex=offset===0?0:-1;
      card.setAttribute('aria-hidden',String(offset!==0));
    });
    dots.forEach((dot,i)=>{
      dot.classList.toggle('active',i===index);
      dot.setAttribute('aria-pressed',String(i===index));
    });
  }
  function startAutoplay(){
    clearInterval(timer);
    if(reduced||cards.length<2)return;
    timer=setInterval(()=>{
      const bounds=root.getBoundingClientRect();
      if(document.hidden||pointerActive||root.matches(':hover')||root.contains(document.activeElement)||bounds.top>=innerHeight||bounds.bottom<=0)return;
      move(1);
    },4500);
  }
  function move(direction){
    index=(index+direction+cards.length)%cards.length;
    render();
    startAutoplay();
  }
  root.querySelector('[data-cover-prev]').onclick=()=>move(-1);
  root.querySelector('[data-cover-next]').onclick=()=>move(1);
  dots.forEach((dot,i)=>dot.onclick=()=>{index=i;render();startAutoplay()});
  root.addEventListener('pointerdown',e=>{start=e.clientX;moved=false;pointerActive=true});
  root.addEventListener('pointerup',e=>{
    pointerActive=false;
    if(Math.abs(e.clientX-start)>40){moved=true;move(e.clientX<start?1:-1)}
    else startAutoplay();
  });
  root.addEventListener('pointercancel',()=>{pointerActive=false;startAutoplay()});
  root.addEventListener('pointerleave',()=>{pointerActive=false;startAutoplay()});
  root.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false}},true);
  root.addEventListener('dragstart',e=>e.preventDefault());
  render();
  startAutoplay();
});

if('IntersectionObserver' in window&&!reduced){const motionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add(e.target.hasAttribute('data-heading')?'heading-visible':'puzzle-visible');motionObserver.unobserve(e.target)}}),{threshold:.01,rootMargin:'60px 0px'});all('[data-heading],[data-puzzle]').forEach((el,i)=>{el.classList.add(el.hasAttribute('data-heading')?'heading-ready':'puzzle-ready');if(el.hasAttribute('data-puzzle')){el.style.setProperty('--reveal-delay',(Array.from(el.parentElement.children).indexOf(el)%4)*140+'ms');el.style.setProperty('--puzzle-x',i%2?'-1':'1')}motionObserver.observe(el)})}
all('[data-slideshow]').forEach(root=>{const slides=Array.from(root.querySelectorAll('.quote-slide'));let index=0;const next=()=>{if(document.hidden||root.matches(':hover')||root.contains(document.activeElement))return;slides[index].classList.remove('is-current');slides[index].setAttribute('aria-hidden','true');index=(index+1)%slides.length;slides[index].classList.add('is-current');slides[index].setAttribute('aria-hidden','false')};if(!reduced)setInterval(next,6500)});
if(document.querySelector('.legal-toc')&&'IntersectionObserver' in window){const legalObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){all('.legal-toc>a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}}),{rootMargin:'-20% 0px -60% 0px'});all('.legal-content>section').forEach(x=>legalObserver.observe(x))}
