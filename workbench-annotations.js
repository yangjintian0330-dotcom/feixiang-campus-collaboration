(() => {
'use strict';
const worksLabel=[...document.querySelectorAll('._navLabel_vupjn_57')].find(label=>label.textContent.trim()==='我的作品');
const worksButton=worksLabel?.closest('button');
if(worksButton){
 worksButton.classList.add('wb-works-entry');
 const hint=document.createElement('span');hint.className='wb-works-inline-hint';hint.textContent='← 点击查看';hint.setAttribute('aria-hidden','true');worksButton.append(hint);
 worksButton.title='点击我的作品，查看我的协作';
 worksButton.onclick=()=>{location.href='./works.html';};
}

const storeKey='feixiang-workbench-annotations-v1';
let refs=[];try{const saved=JSON.parse(sessionStorage.getItem(storeKey));if(Array.isArray(saved))refs=saved.filter(r=>r&&r.anchor&&typeof r.text==='string');}catch{}
const frame=document.querySelector('iframe[title="HTML Preview"]');
const input=document.querySelector('.editable-area');const container=document.querySelector('.editor-container');
if(!frame||!input||!container)return;
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const chat=document.querySelector('.musk-chat-scroll-container');
const chatContent=document.querySelector('.musk-chat-list-content');
const fromShare=new URLSearchParams(location.search).get('from')==='share';
if(fromShare&&chatContent){chatContent.replaceChildren();const empty=el('div','wb-chat-empty');empty.append(el('span','wb-empty-icon','✧'),el('h2','','一起完善这份课件'),el('p','',refs.length?'注释已带入输入框，你可以补充修改要求后发送。':'在下方输入修改要求，或在右侧课件中添加注释。'));chatContent.append(empty);}
function scrollChat(){requestAnimationFrame(()=>{if(chat)chat.scrollTop=chat.scrollHeight;});}
function sendMessage(){
 if(send.disabled||!chatContent)return;
 chatContent.querySelector('.wb-chat-empty')?.remove();
 const text=input.textContent.trim(),attached=structuredClone(refs),turn=el('section','wb-chat-turn'),message=el('div','wb-user-message');
 message.append(el('div','wb-message-label','你'));
 if(attached.length){const details=el('details','wb-sent-annotations'),summary=el('summary','',`${attached.length} 条注释`);details.append(summary);attached.forEach((ref,i)=>{const item=el('article','wb-sent-reference');item.append(el('small','',`注释 ${i+1}`),el('blockquote','',ref.anchor.quote),el('p','',ref.text));details.append(item);});message.append(details);}
 message.append(el('p','wb-message-text',text||'请按照这些注释修改课件。'));turn.append(message);
 const response=el('div','wb-ai-message');response.setAttribute('role','status');response.append(el('span','wb-ai-avatar','AI'),el('div','wb-ai-status'));
 const body=response.lastChild;body.append(el('strong','','暂时无法生成回复'),el('p','','尚未连接 AI 修改服务。修改要求已展示在本次对话中，课件未发生变更。'));
 const reuse=el('button','wb-reuse','重新编辑');reuse.type='button';reuse.onclick=()=>{if(input.textContent.trim()||refs.length){status.textContent='请先发送或清空输入框中的内容，再重新编辑这条消息。';status.hidden=false;return;}input.textContent=text;refs=structuredClone(attached);persist();render();input.focus();};body.append(reuse);turn.append(response);chatContent.append(turn);
 input.replaceChildren();refs=[];persist();render();status.hidden=true;scrollChat();
}
const area=el('div','wb-annotations'),badge=el('button','wb-count'),popover=el('div','wb-popover');badge.type='button';badge.setAttribute('aria-expanded','false');popover.id='wb-annotation-preview';badge.setAttribute('aria-controls',popover.id);area.append(badge,popover);container.prepend(area);
function persist(){try{sessionStorage.setItem(storeKey,JSON.stringify(refs));}catch{}}
function render(){badge.textContent=`${refs.length} 条注释`;area.hidden=!refs.length;popover.replaceChildren();refs.forEach((ref,i)=>{const item=el('article','wb-reference'),head=el('div','wb-reference-head');head.append(el('strong','',`注释 ${i+1}`));const remove=el('button','','×');remove.type='button';remove.setAttribute('aria-label',`移除注释 ${i+1}`);remove.onclick=()=>{refs.splice(i,1);persist();render();};head.append(remove);item.append(head,el('blockquote','',ref.anchor.quote),el('p','',ref.text));popover.append(item);});updateSend();}
badge.onclick=()=>{const open=area.classList.toggle('is-open');badge.setAttribute('aria-expanded',String(open));};area.onkeydown=e=>{if(e.key==='Escape'){area.classList.remove('is-open');badge.setAttribute('aria-expanded','false');badge.blur();}};
input.replaceChildren();input.setAttribute('aria-label','对话消息');input.dataset.placeholder='输入修改意见或继续追问';input.removeAttribute('data-slate-editor');input.removeAttribute('data-slate-node');
const oldSend=document.querySelector('.send-button');const send=el('button','wb-send');send.type='button';send.setAttribute('aria-label','发送对话');send.textContent='↑';oldSend?.replaceWith(send);
const status=el('p','wb-chat-status');status.hidden=true;status.setAttribute('role','status');container.append(status);
function updateSend(){send.disabled=!(input.textContent.trim()||refs.length);}
input.oninput=()=>{status.hidden=true;updateSend();};send.onclick=sendMessage;input.onkeydown=e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();send.click();}};
const editAction=document.querySelector('.resourceActions_bph9v button');
let action=null;
if(editAction){
 editAction.id='wb-edit';editAction.title='编辑';editAction.setAttribute('aria-label','编辑');
 editAction.onclick=()=>{input.focus();container.scrollIntoView({block:'nearest',behavior:'smooth'});};
 action=editAction.cloneNode(false);editAction.parentElement.insertBefore(action,editAction);
}

if(action){action.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.7A9 9 0 1 1 21 11.5Z"/><path d="M12 8v7m-3.5-3.5h7"/></svg>';action.setAttribute('aria-label','添加注释');action.title='添加注释';action.id='wb-add-annotation';action.onclick=()=>frame.contentWindow.postMessage({type:'fx-toggle-annotation'},location.origin);}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==='fx-annotation-state'){action?.setAttribute('aria-pressed',String(e.data.active));}if(e.data?.type==='fx-add-annotation'){const ref=e.data.reference;if(!ref||!ref.anchor||typeof ref.text!=='string')return;const existing=refs.findIndex(r=>r.id===ref.id);if(existing<0)refs.push(ref);else refs[existing]=ref;persist();render();input.focus();}});
const surface=refs.at(-1)?.anchor.scope==='cover'||new URLSearchParams(location.search).get('surface')==='cover'?'cover':'quiz';frame.src=`share.html?embedded=1&surface=${surface}&v=19`;
render();if(refs.length){input.focus();requestAnimationFrame(()=>{const chat=document.querySelector('.musk-chat-scroll-container');if(chat)chat.scrollTop=chat.scrollHeight;});}
})();
