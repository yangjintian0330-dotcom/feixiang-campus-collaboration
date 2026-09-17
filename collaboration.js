(() => {
'use strict';
const key='feixiang-collab-demo-v1';
const currentTeacherSubject='语文';
const directory=[{id:'zhang',name:'张晓敏',discipline:'语文',subject:'语文 · 七年级'},{id:'li',name:'李文静',discipline:'语文',subject:'语文 · 八年级'},{id:'chen',name:'陈思远',discipline:'语文',subject:'语文 · 九年级'},{id:'wang',name:'王慧',discipline:'语文',subject:'语文 · 备课组长'},{id:'zhou',name:'周明',discipline:'数学',subject:'数学 · 七年级'},{id:'zhao',name:'赵欣',discipline:'英语',subject:'英语 · 八年级'}];
const defaults={members:[],access:'school',linkRole:'view',download:true,copy:true};
let state=structuredClone(defaults),selected=new Set();
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Array.isArray(saved.members)&&['invited','school'].includes(saved.access))state={...defaults,...saved,members:saved.members.filter(m=>directory.some(d=>d.id===m.id)&&['comment','edit'].includes(m.role))};}catch{}
// Download and personal copies are always allowed, including previously saved settings.
state.download=true;state.copy=true;state.access='school';state.linkRole='view';
try{localStorage.setItem(key,JSON.stringify(state));}catch{}
const dlg=document.createElement('dialog');dlg.id='collab-dialog';dlg.setAttribute('aria-labelledby','co-title');
dlg.innerHTML=`<div class="co-head"><div><h2 id="co-title">协作</h2></div><button class="co-close" aria-label="关闭协作设置">×</button></div><div class="co-body"><div class="co-invite-panel"><span class="co-label" id="co-picker-label">邀请同事协作</span><div class="co-picker" id="co-picker"><div class="co-picker-field" id="co-picker-field" role="group" aria-labelledby="co-picker-label"><div id="co-selected" class="co-selected"></div><button type="button" id="co-picker-toggle" aria-expanded="false" aria-controls="co-picker-popover"><span id="co-picker-placeholder">选择校内老师</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div><div id="co-picker-popover" class="co-picker-popover" hidden><div class="co-search"><input id="co-search" placeholder="搜索姓名、学科或年级" aria-label="搜索老师" autocomplete="off" aria-controls="co-results"></div><div class="co-quick" role="group" aria-label="快捷选择老师"><span>快速选择</span><button type="button" id="co-all-school">学校内全部成员</button><button type="button" id="co-all-subject">同学科全部成员</button></div><div id="co-results" class="co-results"></div><div class="co-picker-footer"><span id="co-selection-count" aria-live="polite">已选择 0 位老师</span><button type="button" id="co-clear">清空</button><button type="button" id="co-picker-done">收起名单</button></div></div></div><div id="co-pending-hint" class="co-pending-hint" aria-live="polite" hidden></div><div class="co-invite-actions"><div class="co-permission"><select id="co-invite-role" class="co-select" aria-label="邀请成员权限"><option value="comment">可评论</option><option value="edit">可编辑</option></select><span id="co-role-hint">可发表评论，不可修改原件</span></div><button id="co-add" class="co-primary" disabled>添加</button></div><div class="co-hint">仅共享此课件，原始 AI 对话不随课件共享</div></div><section class="co-section"><div class="co-section-title">协作成员 <span id="co-count" class="co-count"></span></div><div class="co-member-list"><div class="co-member"><span class="co-avatar">杨</span><div class="co-person"><strong>杨金田 <span class="co-sub">（我）</span></strong><small>上海市江湾初级中学</small></div><span class="co-owner">所有者</span></div><div id="co-members"></div></div><div id="co-members-empty" class="co-hint" hidden>尚未添加协作者，可在上方选择老师</div></section><div id="co-feedback" class="co-feedback" role="status" aria-live="polite"></div><input id="co-linkbox" class="co-linkbox" aria-label="示例链接，请手动复制" readonly hidden></div><div class="co-foot"><span class="co-foot-note">同校老师可查看，评论和编辑需添加为协作者</span><button id="co-copy-link" class="co-copy">↗ &nbsp;复制链接</button></div>`;
document.body.append(dlg);
const $=id=>dlg.querySelector('#'+id);
function feedback(message,error=false){$('co-feedback').textContent=message;$('co-feedback').classList.toggle('co-error',error);}
let toastTimer;
function showToast(message){
 let toast=dlg.querySelector('#co-toast');
 if(!toast){toast=document.createElement('div');toast.id='co-toast';toast.className='co-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');dlg.append(toast);}
 clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;
 toastTimer=setTimeout(()=>{toast.hidden=true;},2200);
}
function save(message='设置已保存到当前浏览器'){try{localStorage.setItem(key,JSON.stringify(state));feedback('');showToast(message);}catch{feedback('浏览器无法保存设置，本次操作仅在当前页面有效',true);}}
function roles(value){return [['comment','可评论'],['edit','可编辑'],['remove','移除成员']].map(([v,t])=>`<option value="${v}" ${v===value?'selected':''}>${t}</option>`).join('');}
function render(){
 $('co-count').textContent=`${state.members.length+1} 人`;
 $('co-members-empty').hidden=state.members.length>0;
 $('co-members').replaceChildren();
 state.members.forEach(member=>{const person=directory.find(p=>p.id===member.id);const row=document.createElement('div');row.className='co-member';row.innerHTML=`<span class="co-avatar">${person.name[0]}</span><div class="co-person"><strong>${person.name}</strong><small>${person.subject}</small></div><select aria-label="${person.name}的权限">${roles(member.role)}</select>`;row.querySelector('select').onchange=e=>{if(e.target.value==='remove'){state.members=state.members.filter(m=>m.id!==member.id);save(`已移除${person.name}的协作权限，仍可查看课件`);render();}else{member.role=e.target.value;save(`已更新${person.name}的权限`);}};$('co-members').append(row);});updateGroups();

}
function renderSelection(){
 $('co-picker-placeholder').textContent=selected.size?'继续选择':'选择校内老师';$('co-picker-field').classList.toggle('has-selection',selected.size>0);
 $('co-selection-count').textContent=`已选择 ${selected.size} 位老师`;
 $('co-selected').replaceChildren();
 for(const id of selected){const person=directory.find(p=>p.id===id);const chip=document.createElement('span');chip.className='co-chip';chip.append(person.name);const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`取消选择${person.name}`);remove.onclick=e=>{e.stopPropagation();selected.delete(id);renderSelection();search();};chip.append(remove);$('co-selected').append(chip);}
 $('co-pending-hint').hidden=!selected.size;$('co-pending-hint').textContent=`已选 ${selected.size} 位老师，点击添加后生效`;$('co-clear').disabled=!selected.size;updateGroups();
 $('co-add').disabled=selected.size===0;
 $('co-add').textContent=selected.size?`添加 ${selected.size} 位老师`:'添加协作者';
}
function search(){
 const q=$('co-search').value.trim();$('co-results').replaceChildren();
 const choices=directory.filter(p=>(p.name+' '+p.subject).includes(q)).sort((a,b)=>Number(state.members.some(m=>m.id===a.id))-Number(state.members.some(m=>m.id===b.id)));
 if(!choices.length){const empty=document.createElement('div');empty.className='co-empty';empty.textContent='没有找到老师，试试姓名、学科或年级';$('co-results').append(empty);return;}
 choices.forEach(person=>{const b=document.createElement('button');b.type='button';b.className='co-result';const joined=state.members.some(m=>m.id===person.id);b.disabled=joined;b.setAttribute('aria-pressed',String(selected.has(person.id)));b.dataset.person=person.id;b.innerHTML=`<span class="co-check" aria-hidden="true">${selected.has(person.id)?'✓':''}</span><span>${person.name}<small>${person.subject}</small></span>`;if(joined){const tag=document.createElement('span');tag.className='co-joined';tag.textContent='已加入';b.append(tag);}b.onclick=e=>{e.stopPropagation();if(selected.has(person.id))selected.delete(person.id);else selected.add(person.id);renderSelection();search();const next=[...$('co-results').querySelectorAll('button')].find(el=>el.textContent.includes(person.name));next?.focus();};$('co-results').append(b);});
}
$('co-clear').onclick=()=>{selected.clear();renderSelection();search();$('co-search').focus();};
$('co-invite-role').onchange=()=>{$('co-role-hint').textContent=$('co-invite-role').value==='edit'?'可评论，并修改原件内容':'可发表评论，不可修改原件';};
function setPicker(open,focus=true){$('co-picker-popover').hidden=!open;$('co-picker-toggle').setAttribute('aria-expanded',String(open));if(open){updateGroups();search();if(focus)$('co-search').focus();}}
$('co-picker-toggle').onclick=()=>setPicker($('co-picker-popover').hidden);
$('co-picker-field').onclick=e=>{if(!e.target.closest('button'))setPicker(true);};
$('co-picker-done').onclick=()=>{setPicker(false);$('co-picker-toggle').focus();};
dlg.addEventListener('cancel',e=>{if(!$('co-picker-popover').hidden){e.preventDefault();setPicker(false);$('co-picker-toggle').focus();}});
$('co-picker-toggle').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();setPicker(true);}};
$('co-search').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();$('co-results').querySelector('button:not(:disabled)')?.focus();}});
$('co-results').addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();const items=[...$('co-results').querySelectorAll('button:not(:disabled)')];if(!items.length)return;const i=items.indexOf(document.activeElement);items[(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();});
function eligibleGroup(sameSubject){return directory.filter(p=>(!sameSubject||p.discipline===currentTeacherSubject)&&!state.members.some(m=>m.id===p.id));}
function updateGroups(){[[false,'co-all-school','学校内全部成员'],[true,'co-all-subject','同学科全部成员']].forEach(([same,id,label])=>{const eligible=eligibleGroup(same),count=eligible.filter(p=>selected.has(p.id)).length,button=$(id);button.textContent=`${label}（${eligible.length}）`;button.disabled=!eligible.length;button.setAttribute('aria-pressed',String(eligible.length>0&&count===eligible.length));button.dataset.partial=String(count>0&&count<eligible.length);button.title=same?`选择当前学科（${currentTeacherSubject}）中尚未加入的老师`:'选择学校内尚未加入的老师';});}
function selectGroup(sameSubject){
 const eligible=eligibleGroup(sameSubject),all=eligible.every(p=>selected.has(p.id));
 eligible.forEach(p=>{if(all)selected.delete(p.id);else selected.add(p.id);});
 $('co-search').value='';renderSelection();search();
}
$('co-all-school').onclick=()=>selectGroup(false);
$('co-all-subject').onclick=()=>selectGroup(true);
$('co-search').addEventListener('input',search);$('co-search').addEventListener('focus',search);
$('co-add').onclick=()=>{
 const ids=[...selected].filter(id=>!state.members.some(m=>m.id===id));if(!ids.length)return;
 state.members.push(...ids.map(id=>({id,role:$('co-invite-role').value})));
 save(`已添加 ${ids.length} 位协作成员`);selected.clear();$('co-search').value='';renderSelection();setPicker(false);render();
};

$('co-copy-link').onclick=async()=>{const url=new URL('share.html',location.href);$('co-linkbox').value=url.href;try{await navigator.clipboard.writeText(url.href);$('co-linkbox').hidden=true;feedback('');showToast('链接已复制');}catch{$('co-linkbox').hidden=false;$('co-linkbox').focus();$('co-linkbox').select();feedback('请手动复制下方示例链接');}};
document.getElementById('collab-trigger').onclick=()=>{render();renderSelection();feedback('');$('co-linkbox').hidden=true;dlg.showModal();dlg.querySelector('.co-close').focus();};
dlg.querySelector('.co-close').onclick=()=>dlg.close();dlg.addEventListener('click',e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close();}if(!e.target.closest('#co-picker'))setPicker(false,false);});
dlg.addEventListener('close',()=>{setPicker(false,false);document.getElementById('collab-trigger').focus();});
})();
