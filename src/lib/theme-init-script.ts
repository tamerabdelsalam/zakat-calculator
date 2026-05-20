/** Inline script for layout — mirrors next-themes (class + system + colorScheme). */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("theme")||"system",r=t;if(t==="system"){r=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r}catch(e){}})();`;
