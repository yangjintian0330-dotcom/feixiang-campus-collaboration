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

const storeKey='feixiang-workbench-annotations-v1'+(window.fileFormat!=='html'?'-'+window.fileFormat:'');
let refs=[];try{const saved=JSON.parse(sessionStorage.getItem(storeKey));if(Array.isArray(saved))refs=saved.filter(r=>r&&r.anchor&&typeof r.text==='string');}catch{}
const frame=document.querySelector('iframe[title="HTML Preview"]');
const input=document.querySelector('.editable-area');const container=document.querySelector('.editor-container');
if(!frame||!input||!container)return;
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const chat=document.querySelector('.musk-chat-scroll-container');
const chatContent=document.querySelector('.musk-chat-list-content');
const conversationKey='feixiang-shared-conversation-v1-'+window.fileFormat;
const people={owner:'杨金田',chen:'陈思远',li:'李文静',zhou:'周明'};
const currentUser=people[document.body.dataset.currentUser]?document.body.dataset.currentUser:'owner';
const updates=el('div','wb-shared-updates');
function readTurns(){
 try{const value=JSON.parse(localStorage.getItem(conversationKey)||'[]');return Array.isArray(value)?value.filter(t=>t&&typeof t.id==='string'&&typeof t.text==='string'&&people[t.author]&&Array.isArray(t.refs)):[];}catch{return [];}
}
function userMessage(text,attached,author){
 const group=el('div','wb-user-group'),message=el('div','wb-user-message');
 const label=el('div','wb-message-label',people[author]);
 group.append(label,message);
 if(attached.length){const details=el('details','wb-sent-annotations');details.append(el('summary','',attached.length+' 条注释'));attached.forEach((ref,i)=>{const item=el('article','wb-sent-reference');item.append(el('small','','注释 '+(i+1)),el('blockquote','',ref.anchor?.quote||''),el('p','',ref.text));details.append(item);});message.append(details);}
 message.append(el('p','wb-message-text',text||'请按照这些注释修改课件。'));
 return group;
}
function seedConversation(){
 if(!chatContent)return;
 const d=window.fileExamples[window.fileFormat],turn=el('section','wb-chat-turn');
 turn.append(userMessage(d.prompt||'结合初中文言文常见的18个虚词，生成一个虚词互动知识问答，让学生在互动答题中培养文言文理解语感。',[],'owner'));
 if(window.fileFormat!=='html'){
  chatContent.replaceChildren();
  const answer=el('div','file-answer'),card=el('button','file-output-card');card.type='button';
  card.append(el('span','file-type-icon',d.label),el('span','file-output-name',d.file),el('span','','查看 ↗'));
  card.onclick=()=>{const viewer=document.querySelector('.attachmentViewerWrapper_u7vdf');if(viewer)viewer.hidden=false;frame.focus();};
  answer.append(el('strong','','已生成 '+d.label+' 文件'),el('p','',d.summary),card);turn.append(answer);
 }
 chatContent.prepend(turn);chatContent.append(updates);
}
function renderConversation(){
 updates.replaceChildren();
 for(const entry of readTurns()){
  const turn=el('section','wb-chat-turn');turn.dataset.messageId=entry.id;
  turn.append(userMessage(entry.text,entry.refs,entry.author));
  const response=el('div','wb-ai-message'),body=el('div','wb-ai-status');
  response.append(el('span','wb-ai-avatar','AI'),body);
  body.append(el('strong','','暂时无法生成回复'),el('p','','尚未连接 AI 修改服务。修改要求已保留在对话中，课件未发生变更。'));
  if(entry.author===currentUser){
   const reuse=el('button','wb-reuse','重新编辑');reuse.type='button';
   reuse.onclick=()=>{if(input.textContent.trim()||refs.length){status.textContent='请先发送或清空输入框中的内容，再重新编辑这条消息。';status.hidden=false;return;}input.textContent=entry.text;refs=structuredClone(entry.refs);persist();render();input.focus();};body.append(reuse);
  }
  turn.append(response);updates.append(turn);
 }
}
function scrollChat(){requestAnimationFrame(()=>{if(chat)chat.scrollTop=chat.scrollHeight;});}
function sendMessage(){
 if(send.disabled||!chatContent)return;
 const entry={id:crypto.randomUUID(),author:currentUser,text:input.textContent.trim(),refs:structuredClone(refs),createdAt:Date.now()};
 try{const turns=readTurns();turns.push(entry);localStorage.setItem(conversationKey,JSON.stringify(turns));}
 catch{status.textContent='消息未能保存，请稍后重试。';status.hidden=false;return;}
 renderConversation();input.replaceChildren();refs=[];persist();render();status.hidden=true;scrollChat();
}
window.addEventListener('storage',event=>{
 if(event.key!==conversationKey)return;
 const atBottom=!chat||chat.scrollHeight-chat.scrollTop-chat.clientHeight<100;
 renderConversation();if(atBottom)scrollChat();
});
seedConversation();renderConversation();
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
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==='fx-annotation-state'){action?.setAttribute('aria-pressed',String(e.data.active));}if(['fx-add-annotation','fx-add-annotations'].includes(e.data?.type)){const batch=e.data.type==='fx-add-annotations'?e.data.references:[e.data.reference];if(!Array.isArray(batch))return;for(const ref of batch){if(!ref||!ref.anchor||typeof ref.text!=='string')continue;const existing=refs.findIndex(r=>r.id===ref.id);if(existing<0)refs.push(ref);else refs[existing]=ref;}persist();render();input.focus();}});
const surface=refs.at(-1)?.anchor.scope==='cover'||new URLSearchParams(location.search).get('surface')==='cover'?'cover':'quiz';frame.src=`share.html?embedded=1&surface=${window.fileFormat==='html'?surface:'cover'}&format=${window.fileFormat}&v=29`;
render();if(refs.length){input.focus();requestAnimationFrame(()=>{const chat=document.querySelector('.musk-chat-scroll-container');if(chat)chat.scrollTop=chat.scrollHeight;});}
})();
