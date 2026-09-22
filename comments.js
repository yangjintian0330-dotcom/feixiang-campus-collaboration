(() => {
'use strict';
const $=id=>document.getElementById(id), key='feixiang-course-comments-v1'+(window.fileFormat!=='html'?'-'+window.fileFormat:'');
const people={owner:{name:'杨金田',role:'owner'},chen:{name:'陈思远',role:'edit'},li:{name:'李文静',role:'comment'},zhou:{name:'周明',role:'view'}};
const user=Object.hasOwn(people,document.body.dataset.currentUser)?document.body.dataset.currentUser:'zhou';
// Local page context; production must supply authenticated identity and enforce permissions on the server.
function currentRole(){if(user==='owner')return 'owner';try{const config=JSON.parse(localStorage.getItem('feixiang-collab-demo-v1'+(window.fileFormat!=='html'?'-'+window.fileFormat:'')));const member=config?.members?.find(m=>m.id===user);return ['comment','edit'].includes(member?.role)?member.role:'view';}catch{return 'view';}}
let floatingId=null;
let mode=false, editMode=false, filter='open', threads=[], target=null, active=null, frameDoc=null, timer;
try{const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved))threads=saved.filter(t=>t&&people[t.author]&&typeof t.text==='string'&&t.anchor&&Array.isArray(t.replies));}catch{}
const canComment=()=>currentRole()!=='view';
const canEdit=()=>['owner','edit'].includes(currentRole());
const icons={edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m14 5 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14v6Z"/><path d="M13 21H5a3 3 0 0 1-3-3v-7"/></svg>',comment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z"/><path d="M7 9h8M7 13h5"/></svg>',add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.7A9 9 0 1 1 21 11.5Z"/><path d="M12 8v7m-3.5-3.5h7"/></svg>'};
$('add-comment').innerHTML=icons.add+'<span>添加评论</span>';document.querySelector('.bubble-icon').innerHTML=icons.comment;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('toast').hidden=true,2600);}
function save(){try{localStorage.setItem(key,JSON.stringify(threads));return true;}catch{toast('浏览器无法保存评论，请复制内容后重试');return false;}}
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function action(label,fn){const b=el('button','',label);b.type='button';b.onclick=fn;return b;}
const clean=node=>(node.getAttribute('aria-label')||node.textContent).replace(/\s+/g,' ').trim();
function context(node){return node.ownerDocument===frameDoc&&node.closest('#quizArea')?frameDoc.querySelector('#questionPrompt')?.textContent:'';}
function anchor(node){return {scope:node.ownerDocument===frameDoc?'quiz':'cover',id:node.dataset.anchor,quote:clean(node),context:context(node)};}
function find(a){if(a.items)return a.items.every(item=>find(item))?find(a.items[0]):null;if((a.scope==='cover')!==!$('lesson').hidden)return null;const doc=a.scope==='quiz'?frameDoc:document;const n=doc?.querySelector(`[data-anchor="${CSS.escape(a.id)}"]`);return n&&clean(n)===a.quote&&context(n)===a.context&&n.getClientRects().length?n:null;}
function rect(n){const r=n.getBoundingClientRect();if(n.ownerDocument===frameDoc){const f=$('course-frame').getBoundingClientRect();return {left:r.left+f.left,top:r.top+f.top,right:r.right+f.left,bottom:r.bottom+f.top,width:r.width,height:r.height};}return r;}
function showHighlight(n){const r=rect(n);Object.assign($('highlight').style,{left:r.left-4+'px',top:r.top-4+'px',width:r.width+8+'px',height:r.height+8+'px'});$('highlight').hidden=false;}
function cancel(){floatingId=null;$('comment-card').hidden=true;$('selection-tools').hidden=true;$('ai-form').hidden=true;$('ai-input').value='';$('ai-feedback').hidden=true;$('ai-submit').disabled=true;target=null;$('composer').hidden=true;$('highlight').hidden=true;$('comment-input').value='';$('send').disabled=true;}
function discard(){return !($('comment-input').value.trim()||$('ai-input').value.trim())||confirm('尚未提交的内容将被清空，继续吗？');}
function setMode(value){if(!discard())return false;cancel();mode=Boolean(value)&&canComment();editMode=false;document.body.classList.toggle('commenting',mode);$('mode-tip').hidden=true;const btn=$('add-comment');btn.setAttribute('aria-pressed',String(mode));btn.setAttribute('aria-label','添加评论');btn.title=mode?'退出评论模式':'添加评论';btn.querySelector('span').textContent='添加评论';if(frameDoc)frameDoc.body.style.cursor=mode?'crosshair':'';if(window.parent!==window)window.parent.postMessage({type:'fx-annotation-state',active:mode},location.origin);if(mode)toast('点击或拖动框选内容，添加评论；Esc 退出');return true;}
function position(){if(target){const n=find(target);if(n){showHighlight(n);const r=target.items?selectionRect(target.items.map(find)):rect(n);if(target.items)Object.assign($('highlight').style,{left:r.left-4+'px',top:r.top-4+'px',width:r.width+8+'px',height:r.height+8+'px'});const box=$('composer').hidden?$('selection-tools'):$('composer');const left=Math.min(Math.max(12,r.right-80),innerWidth-box.offsetWidth-16);let top=box===$('selection-tools')?r.top-box.offsetHeight-12:r.bottom+16;if(top<66)top=r.bottom+16;top=Math.max(66,Math.min(top,innerHeight-box.offsetHeight-16));box.style.left=left+'px';box.style.top=top+'px';}else cancel();}renderMarkers();positionComment();}
function openComposer(n){cancel();target=anchor(n);$('quote').textContent=target.quote;$('composer-name').textContent=people[user].name;$('composer-avatar').textContent=people[user].name[0];$('composer').hidden=false;position();$('comment-input').focus();}
function compose(n){if(!canComment()||!discard())return;openComposer(n);}
function bind(doc,selector){bindMarquee(doc);doc.querySelectorAll(selector).forEach((n,i)=>{n.dataset.anchor=n.id||`content-${i}`;});doc.addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation();return;}if(!mode||!canComment())return;if(doc===document&&!e.target.closest('#lesson'))return;e.preventDefault();e.stopImmediatePropagation();const n=e.target.closest('[data-anchor]');if(n)compose(n);},true);doc.addEventListener('keydown',e=>{if(mode&&(e.key==='Enter'||e.key===' ')&&e.target.closest('[data-anchor]')){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Enter')compose(e.target.closest('[data-anchor]'));}if(e.key==='Escape'){if(!$('composer').hidden){if(discard())cancel();}else setMode(false);}},true);doc.addEventListener('pointerover',e=>{if(!mode||target)return;const n=e.target.closest('[data-anchor]');if(n)showHighlight(n);});doc.addEventListener('pointerout',()=>{if(!target)$('highlight').hidden=true;});}
let suppressClick=false;
function selectionRect(nodes){const boxes=nodes.map(rect);const left=Math.min(...boxes.map(r=>r.left)),top=Math.min(...boxes.map(r=>r.top)),right=Math.max(...boxes.map(r=>r.right)),bottom=Math.max(...boxes.map(r=>r.bottom));return {left,top,right,bottom,width:right-left,height:bottom-top};}
function bindMarquee(doc){let drag=null;const coords=e=>{const f=doc===document?{left:0,top:0}:$('course-frame').getBoundingClientRect();return {x:e.clientX+f.left,y:e.clientY+f.top};};
 doc.addEventListener('pointerdown',e=>{if(!mode||!canComment()||e.button!==0||(doc===document&&!e.target.closest('#lesson')))return;const p=coords(e);drag={start:p,end:p,active:false};},true);
 doc.addEventListener('pointermove',e=>{if(!drag)return;drag.end=coords(e);if(Math.hypot(drag.end.x-drag.start.x,drag.end.y-drag.start.y)<8)return;drag.active=true;doc.getSelection()?.removeAllRanges();const r={left:Math.min(drag.start.x,drag.end.x),top:Math.min(drag.start.y,drag.end.y),width:Math.abs(drag.start.x-drag.end.x),height:Math.abs(drag.start.y-drag.end.y)};$('marquee').hidden=false;Object.assign($('marquee').style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});},true);
 doc.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;$('marquee').hidden=true;if(!d.active)return;suppressClick=true;setTimeout(()=>suppressClick=false,100);if(!discard())return;const left=Math.min(d.start.x,d.end.x),right=Math.max(d.start.x,d.end.x),top=Math.min(d.start.y,d.end.y),bottom=Math.max(d.start.y,d.end.y);const nodes=[...doc.querySelectorAll(doc===document?'#lesson [data-anchor]':'[data-anchor]')].filter(n=>{if(!n.getClientRects().length)return false;const r=rect(n);return r.width&&r.height&&r.right>left&&r.left<right&&r.bottom>top&&r.top<bottom;});const picked=nodes.filter(n=>!nodes.some(other=>other!==n&&other.contains(n)));if(!picked.length)return;openComposer(picked[0]);if(picked.length>1){const items=picked.map(anchor);target={...items[0],quote:items.map(a=>a.quote).join(' / '),items};$('quote').textContent=target.quote;position();}},true);
 doc.addEventListener('pointercancel',()=>{drag=null;$('marquee').hidden=true;},true);
}
bind(document,'[data-commentable]');
function initFrame(){frameDoc=$('course-frame').contentDocument;if(!frameDoc?.body)return;const scan=()=>{frameDoc.querySelectorAll('h1,h2,h3,p,.passage,button,.word-chip,li').forEach((n,i)=>{if(!n.dataset.anchor)n.dataset.anchor=n.id||`quiz-${i}`;});position();};scan();bind(frameDoc,'h1,h2,h3,p,.passage,button,.word-chip,li');frameDoc.addEventListener('scroll',position,true);new MutationObserver(scan).observe(frameDoc.body,{childList:true,subtree:true,characterData:true});}
$('course-frame').addEventListener('load',initFrame);if($('course-frame').contentDocument?.readyState==='complete')initFrame();
function openPanel(){if(!canComment())return;$('panel').hidden=false;render();requestAnimationFrame(position);}
function focusThread(t){if(find(t.anchor)){showComment(t);return;}active=t.id;filter=t.resolved?'resolved':'open';openPanel();const n=find(t.anchor);if(n){n.scrollIntoView({block:'center',behavior:'smooth'});showHighlight(n);setTimeout(()=>{if(!target)$('highlight').hidden=true;},1800);}else toast('请先回到对应的课件页面或题目，再查看评论位置');$('thread-list').querySelector(`[data-thread="${CSS.escape(t.id)}"]`)?.scrollIntoView({block:'nearest'});}
function renderMarkers(){const root=$('markers');root.replaceChildren();if(!canComment())return;const groups=new Map();threads.filter(t=>!t.resolved).forEach(t=>{const n=find(t.anchor);if(n){const group=groups.get(n)||[];group.push(t);groups.set(n,group);}});const c=$('canvas').getBoundingClientRect();for(const [n,group]of groups){const r=rect(n);if(r.bottom<c.top||r.top>c.bottom||r.right>c.right+4)continue;const pin=action(people[group[0].author].name[0],()=>focusThread(group[0]));pin.className='comment-pin';pin.setAttribute('aria-label',`查看「${group[0].anchor.quote.slice(0,22)}」的评论`);pin.style.left=Math.min(c.right-30,r.right-8)+'px';pin.style.top=Math.max(c.top+4,Math.min(c.bottom-30,r.bottom-12))+'px';root.append(pin);}}
function showComment(t){if(!canComment()||!discard())return;cancel();floatingId=t.id;renderComment();positionComment();}
function positionComment(){if(!floatingId)return;const t=threads.find(t=>t.id===floatingId),n=t&&find(t.anchor);if(!t||!n||!canComment()){$('comment-card').hidden=true;return;}const card=$('comment-card');card.hidden=false;const r=t.anchor.items?selectionRect(t.anchor.items.map(find)):rect(n);showHighlight(n);const left=Math.max(12,Math.min(r.left,innerWidth-card.offsetWidth-16)),top=Math.max(64,Math.min(r.bottom+12,innerHeight-card.offsetHeight-16));Object.assign(card.style,{left:left+'px',top:top+'px'});}
function renderComment(){const t=threads.find(t=>t.id===floatingId);const card=$('comment-card');card.replaceChildren();if(!t||!canComment()){card.hidden=true;return;}
 const head=el('div','saved-comment-head');head.append(el('blockquote','',t.anchor.quote));const close=action('×',()=>{floatingId=null;card.hidden=true;$('highlight').hidden=true;});close.setAttribute('aria-label','关闭评论详情');head.append(close);card.append(head);
 const body=messageBlock(t,t);const menu=body.querySelector('.comment-more');if(menu)head.insertBefore(menu,close);card.append(body);
 if(canEdit()){const revise=action('按照评论修改',()=>{if(canEdit())openEditChat({id:t.id,anchor:structuredClone(t.anchor),text:t.text,author:t.author});});revise.className='revise-comment';card.append(revise);}card.hidden=false;
}
function messageBlock(message,parent,isReply=false){
 const wrap=el('div','comment-message'),person=el('div','person');
 person.append(el('span','avatar',people[message.author].name[0]),el('strong','',people[message.author].name),el('small','',new Date(message.time).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})+(message.editedAt?' · 已编辑':'')));
 const content=el('p','message',message.text);wrap.append(person,content);
 if(message.author===user&&canComment()){
  const menu=el('details','comment-more'),toggle=el('summary','','•••'),actions=el('div','comment-menu');toggle.setAttribute('aria-label',isReply?'回复操作':'评论操作');menu.append(toggle,actions);menu.addEventListener('toggle',()=>{if(menu.open)document.querySelectorAll('.comment-more[open]').forEach(other=>{if(other!==menu)other.open=false;});});
  actions.append(action('编辑',()=>{
   if(!canComment()||message.author!==user)return;
   menu.open=false;if(wrap.querySelector('.comment-edit-form'))return;
   const form=el('form','comment-edit-form'),input=el('textarea'),buttons=el('div','comment-edit-actions');
   input.value=message.text;input.maxLength=2000;input.setAttribute('aria-label',isReply?'编辑回复内容':'编辑评论内容');
   const cancelEdit=action('取消',()=>{form.remove();content.hidden=false;menu.hidden=false;positionComment();});
   const submit=el('button','primary','保存');submit.type='submit';input.oninput=()=>submit.disabled=!input.value.trim();
   buttons.append(cancelEdit,submit);form.append(input,buttons);content.hidden=true;menu.hidden=true;wrap.append(form);
   form.onsubmit=e=>{e.preventDefault();if(!canComment()||message.author!==user||!input.value.trim())return;
    const previous=message.text,previousEdit=message.editedAt;message.text=input.value.trim();message.editedAt=Date.now();
    if(!save()){message.text=previous;message.editedAt=previousEdit;return;}
    render();toast('修改已保存');
   };
   input.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();cancelEdit.click();}else if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();form.requestSubmit();}};
   positionComment();input.focus();input.setSelectionRange(input.value.length,input.value.length);
  }),action('删除',()=>{
   if(!canComment()||message.author!==user)return;
   menu.open=false;if(!confirm(isReply?'删除这条回复？':'删除这条评论？'))return;
   const before=structuredClone(threads);
   if(isReply)parent.replies=parent.replies.filter(r=>r.id!==message.id);else threads=threads.filter(t=>t.id!==parent.id);
   if(!save()){threads=before;render();return;}
   if(!isReply&&floatingId===parent.id){floatingId=null;$('comment-card').hidden=true;$('highlight').hidden=true;}
   render();toast(isReply?'回复已删除':'评论已删除');
  }));wrap.append(menu);
 }
 return wrap;
}
document.addEventListener('click',e=>{document.querySelectorAll('.comment-more[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false;});});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.comment-more[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});
function render(){const visible=threads;$('panel-bulk').hidden=!canEdit()||!threads.length;$('count').textContent=threads.filter(t=>!t.resolved).length;$('panel-count').textContent=threads.length;$('thread-list').replaceChildren();document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));if(!visible.length){const empty=el('div','empty');empty.append(el('strong','',filter==='open'?'一起打磨这份课件':'暂无已解决评论'),el('span','',filter==='open'?'点击顶部「添加评论」，再选择课件中的具体内容。':'作者解决的讨论会保留在这里。'));$('thread-list').append(empty);}
visible.forEach(t=>{const card=el('article','thread'+(active===t.id?' selected':''));card.dataset.thread=t.id;card.tabIndex=0;card.setAttribute('aria-label',people[t.author].name+'的评论：'+t.text);const selectCard=()=>{active=t.id;document.querySelectorAll('#thread-list>.thread').forEach(n=>n.classList.toggle('selected',n===card));};card.onclick=e=>{if(!e.target.closest('button,textarea,input,summary,details'))selectCard();};card.onkeydown=e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectCard();}};const quote=action(t.anchor.quote,()=>focusThread(t));quote.className='thread-quote';quote.title=t.anchor.quote;const body=messageBlock(t,t);card.append(quote,body);const menu=body.querySelector('.comment-more');if(menu){menu.classList.add('thread-more');card.append(menu);}if(canEdit()){const revise=action('按照评论修改',()=>openEditChat({id:t.id,anchor:structuredClone(t.anchor),text:t.text,author:t.author}));revise.className='revise-comment';card.append(revise);}$('thread-list').append(card);});renderMarkers();if(floatingId){renderComment();positionComment();}}
$('composer').onsubmit=e=>{e.preventDefault();const text=$('comment-input').value.trim();if(!canComment()||!target||!text)return;const t={id:crypto.randomUUID(),author:user,text,time:Date.now(),anchor:structuredClone(target),replies:[],resolved:false};threads.push(t);if(!save()){threads.pop();return;}cancel();setMode(false);$('panel').hidden=true;render();toast('评论已保存');};
$('comment-input').oninput=()=>{const empty=!$('comment-input').value.trim();$('send').disabled=empty;};$('comment-input').onkeydown=e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('composer').requestSubmit();}};
$('cancel-comment').onclick=()=>{if(discard())cancel();};$('add-comment').onclick=()=>setMode(!(mode&&!editMode),'comment');$('exit-mode').onclick=()=>setMode(false);
$('threads-toggle').onclick=()=>{if(!$('panel').hidden){$('panel').hidden=true;position();}else openPanel();};$('close-panel').onclick=()=>{$('panel').hidden=true;position();};document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render();});
function applyPermissions(){if((editMode&&!canEdit())||(mode&&!canComment())){cancel();setMode(false);}$('add-comment').hidden=!canComment();$('threads-toggle').hidden=!canComment();if(!canComment())$('panel').hidden=true;if(!canEdit()){$('edit-chat').hidden=true;document.body.classList.remove('chat-open');}render();position();}
$('start').onclick=()=>{$('lesson').hidden=true;$('quiz').hidden=false;cancel();position();};$('back-cover').onclick=()=>{if(!discard())return;cancel();$('lesson').hidden=false;$('quiz').hidden=true;position();};
$('selection-comment').onclick=()=>{const n=target&&find(target);if(n&&canComment())openComposer(n);};
$('cancel-selection').onclick=()=>{if(discard())cancel();};
$('ai-edit').onclick=()=>{if(!canEdit()||!target)return;openEditChat({id:target.scope+':'+target.id+':'+target.context,anchor:structuredClone(target),text:'',author:user});};
$('ai-input').oninput=()=>{$('ai-submit').disabled=!$('ai-input').value.trim();$('ai-feedback').hidden=true;};
$('ai-form').onsubmit=e=>{e.preventDefault();if(canEdit()&&$('ai-input').value.trim()){$('ai-feedback').hidden=false;position();}};
const references=[];
function renderReferences(){
 $('attachment-count').textContent=references.length;$('clear-attachments').hidden=!references.length;$('chat-attachments').replaceChildren();
 for(const ref of references){const item=el('article','chat-attachment');const head=el('div','attachment-label');head.append(el('span','',ref.text?people[ref.author].name+'的评论':'选中内容'));const remove=action('×',()=>{references.splice(references.indexOf(ref),1);renderReferences();});remove.setAttribute('aria-label','移除引用：'+ref.anchor.quote);head.append(remove);item.append(head,el('blockquote','',ref.anchor.quote));if(ref.anchor.context)item.append(el('small','',ref.anchor.context));if(ref.text)item.append(el('p','',ref.text));$('chat-attachments').append(item);}
 $('chat-send').disabled=!canEdit()||!($('chat-input').value.trim()||references.some(r=>r.text));
}
$('revise-all').onclick=()=>openEditChat(threads.map(t=>({id:t.id,anchor:structuredClone(t.anchor),text:t.text,author:t.author})));
function openEditChat(ref){
 if(!canEdit()||!discard())return;
 if(ref){
  const batch=Array.isArray(ref)?ref:[ref];if(!batch.length)return;
  if(window.parent!==window&&new URLSearchParams(location.search).has('embedded')){cancel();setMode(false);$('panel').hidden=true;window.parent.postMessage({type:'fx-add-annotations',references:batch},location.origin);return;}
  try{const key='feixiang-workbench-annotations-v1'+(window.fileFormat!=='html'?'-'+window.fileFormat:'');const saved=JSON.parse(sessionStorage.getItem(key)||'[]');const merged=new Map((Array.isArray(saved)?saved:[]).map(r=>[r.id,r]));batch.forEach(r=>merged.set(r.id,r));sessionStorage.setItem(key,JSON.stringify([...merged.values()]));location.href='./?annotations=1&from=share&format='+window.fileFormat;}catch{toast('无法带入注释，请检查浏览器存储设置');}return;
 }
cancel();setMode(false);
 if(ref&&!references.some(r=>r.id===ref.id))references.push(ref);
 $('edit-chat').hidden=false;document.body.classList.add('chat-open');$('panel').hidden=true;$('chat-error').hidden=true;
 $('chat-attachments').hidden=false;$('toggle-attachments').setAttribute('aria-expanded','true');renderReferences();requestAnimationFrame(position);$('chat-input').focus();
}
$('close-chat').onclick=()=>{$('edit-chat').hidden=true;document.body.classList.remove('chat-open');position();};
$('toggle-attachments').onclick=()=>{const hide=!$('chat-attachments').hidden;$('chat-attachments').hidden=hide;$('toggle-attachments').setAttribute('aria-expanded',String(!hide));};
$('clear-attachments').onclick=()=>{references.length=0;renderReferences();};
$('chat-input').oninput=()=>{$('chat-error').hidden=true;renderReferences();};
$('chat-input').onkeydown=e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('chat-form').requestSubmit();}};
$('chat-form').onsubmit=e=>{e.preventDefault();if(!canEdit()||$('chat-send').disabled)return;$('chat-error').textContent='尚未连接 AI 修改服务，课件未改动。引用内容和修改要求已保留。';$('chat-error').hidden=false;};
// Reopen the personal draft by entering edit mode, without sharing the creator's chat history.
window.addEventListener('resize',position);$('canvas').addEventListener('scroll',position);window.addEventListener('storage',e=>{if(e.key==='feixiang-collab-demo-v1'+(window.fileFormat!=='html'?'-'+window.fileFormat:'')){applyPermissions();return;}if(e.key!==key)return;try{const data=JSON.parse(e.newValue);if(Array.isArray(data)){threads=data;render();}}catch{}});applyPermissions();
if(new URLSearchParams(location.search).has('embedded')){
 document.body.classList.add('embedded-preview');

 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='fx-toggle-annotation')setMode(!mode);});
}
const route=new URLSearchParams(location.search);
if(window.fileFormat==='html'&&route.get('surface')==='quiz'){$('lesson').hidden=true;$('quiz').hidden=false;}
if(route.get('comments')==='1')openPanel();
})();
