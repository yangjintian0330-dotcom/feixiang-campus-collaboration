(()=>{
const format=window.fileFormat,d=window.fileExamples[format];if(format==='html')return;
const heading=document.querySelector('.title_GBaV6');if(heading)heading.textContent='文件预览 · '+d.label;
const edit=document.getElementById('wb-edit');if(edit)edit.hidden=true;
const title=[...document.querySelectorAll('div')].find(n=>n.childElementCount===0&&n.textContent==='生成初中文言文虚词教学动画');if(title)title.textContent=d.title;
document.title=d.title+' — 飞象老师';
const close=document.querySelector('.closeIcon_bn4Ur');if(close){close.setAttribute('role','button');close.setAttribute('aria-label','关闭文件预览');close.tabIndex=0;close.onclick=()=>{const viewer=document.querySelector('.attachmentViewerWrapper_u7vdf');if(viewer)viewer.hidden=true;};close.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();close.click();}};}
const buttons=[...document.querySelectorAll('.resourceActions_bph9v button')];const full=buttons.find(b=>b.classList.contains('fullScreenOpen_bmyn3'));if(full){full.title='全屏预览';full.setAttribute('aria-label','全屏预览');full.onclick=()=>document.querySelector('iframe[title="HTML Preview"]').requestFullscreen?.();}
const download=buttons.find(b=>b!==full&&!b.id);if(download){download.title='下载预览稿（Markdown）';download.setAttribute('aria-label','下载预览稿（Markdown）');download.onclick=()=>{const data=window.fileExamples[format];const text=data.pages.map(p=>`# ${p.title}\n\n${p.subtitle}\n\n`+p.sections.map(([h,t])=>`## ${h}\n\n${t}`).join('\n\n')).join('\n\n---\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=d.file.replace(/\.[^.]+$/,'.md');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};}
})();
