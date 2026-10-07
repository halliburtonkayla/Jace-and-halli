window.addEventListener('load',()=>{const tab=[...document.querySelectorAll('[data-tab]')].find(b=>'#'+b.dataset.tab===location.hash);tab?.click();});
