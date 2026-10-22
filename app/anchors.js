/* Resolve stable archive URLs even when records arrive asynchronously. */
(() => {
  let observer;
  function follow() {
    observer?.disconnect();
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    if (!id) return;
    const scroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: 'start' });
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      observer?.disconnect();
      return true;
    };
    if (!scroll()) {
      observer = new MutationObserver(scroll);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
  window.addEventListener('hashchange', follow);
  follow();
})();
