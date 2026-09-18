(()=>{
const $=id=>document.getElementById(id),d=window.fileExamples[window.fileFormat];
$('detail-title').textContent=d.title;document.title=d.title+' — 飞象老师';
const favoriteKey='feixiang-favorite-'+window.fileFormat;
function renderFavorite(){let selected=false;try{selected=localStorage.getItem(favoriteKey)==='true';}catch{}$('detail-favorite').textContent=selected?'★ 已收藏':'☆ 收藏';$('detail-favorite').setAttribute('aria-pressed',String(selected));}
renderFavorite();
$('detail-favorite').onclick=()=>{try{localStorage.setItem(favoriteKey,String($('detail-favorite').getAttribute('aria-pressed')!=='true'));renderFavorite();}catch{notify('暂时无法保存收藏，请重试');}};
$('detail-adapt').onclick=()=>notify('一键改编功能尚未接入，当前课件未改动');
function notify(text){$('toast').textContent=text;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,2400);}
$('detail-share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);notify('链接已复制');}catch{notify('请复制浏览器地址栏中的链接');}};
$('detail-download').onclick=()=>{
 if(window.fileFormat==='html'){const a=document.createElement('a');a.href='courseware.html';a.download=d.file;a.click();return;}
 const text=d.pages.map(p=>'# '+p.title+'\n\n'+p.sections.map(([h,t])=>'## '+h+'\n\n'+t).join('\n\n')).join('\n\n---\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=d.file.replace(/\.[^.]+$/,'.md');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
if(window.fileFormat!=='html'){$('detail-download').textContent='下载预览稿';$('detail-download').title='下载 Markdown 预览稿';}
})();
