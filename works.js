(()=>{
'use strict';
const tabs=document.querySelector('[role="tablist"]'),grid=document.querySelector('._gridWrap_13ser_59');
if(!tabs||!grid)return;
const original=[...grid.querySelectorAll('._cardWrap_13ser_84')];
const source=original.find(card=>card.textContent.includes('结合初中语文'));
const panel=document.createElement('section');panel.className='my-collaborations';panel.hidden=true;panel.id='my-collaborations';panel.setAttribute('aria-label','我的协作课件');grid.after(panel);
const cards=document.createElement('div');cards.className='collaboration-grid';panel.append(cards);
if(source){
 const card=source.cloneNode(true);
 card.style.cursor='pointer';
 card.onclick=e=>{if(!e.target.closest('button'))location.href='./share.html';};
 const title=card.querySelector('._title_2zgrp_143');
 if(title){title.tabIndex=0;title.setAttribute('role','link');title.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();location.href='./share.html';}};}
 cards.append(card);
}
const tab=document.createElement('button');tab.type='button';tab.role='tab';tab.className='_categoryTab_13ser_43';tab.textContent='我的协作';tab.setAttribute('aria-selected','false');tab.setAttribute('aria-controls',panel.id);tabs.append(tab);
function activate(button){const collab=button===tab;[...tabs.children].forEach(t=>{const active=t===button;t.classList.toggle('_categoryTabActive_13ser_55',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});grid.hidden=collab;panel.hidden=!collab;history.replaceState(null,'',collab?'?tab=collaboration':location.pathname);}
[...tabs.children].forEach(button=>button.onclick=()=>activate(button));tabs.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const all=[...tabs.children],index=all.indexOf(document.activeElement),next=all[(index+(e.key==='ArrowRight'?1:-1)+all.length)%all.length];activate(next);next.focus();});
if(new URLSearchParams(location.search).get('tab')==='collaboration')activate(tab);
for(const card of original){if(card===source){card.style.cursor='pointer';card.onclick=e=>{if(!e.target.closest('button'))location.href='./share.html';};}}
document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='新对话'||b.textContent.trim()==='首页')b.onclick=()=>location.href='./';});
})();
