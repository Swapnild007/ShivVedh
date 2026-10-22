/* Read completeness from the service worker that owns the release cache. */
(() => {
  const status = document.getElementById('status'),
    save = document.getElementById('save'),
    progress = document.getElementById('progress');
  async function check() {
    save.disabled = true;
    if (!('serviceWorker' in navigator)) {
      status.textContent = 'या ब्राउझरमध्ये ऑफलाइन सुविधा नाही.';
      return;
    }
    let timer;
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      const ready = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(Error('timeout')), 15000);
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'redundant') reject(Error('install failed'));
          });
        }),
      ]);
      clearTimeout(timer);
      const state = await new Promise((resolve, reject) => {
        const channel = new MessageChannel(),
          timeout = setTimeout(() => reject(Error('status unavailable')), 5000);
        channel.port1.onmessage = (e) => {
          clearTimeout(timeout);
          resolve(e.data);
        };
        ready.active.postMessage({ type: 'OFFLINE_STATUS' }, [channel.port2]);
      });
      progress.textContent = `${state.saved} / ${state.total} फाइल्स`;
      status.textContent = state.complete
        ? 'ऑफलाइन वाचनासाठी या आवृत्तीच्या सर्व फाइल्स जतन झाल्या. इंटरनेट बंद करून वाचन तपासा.'
        : 'जतन अपूर्ण आहे. इंटरनेट व मोकळी जागा तपासा.';
      if (registration.waiting)
        status.textContent +=
          ' नवीन आवृत्ती तयार आहे. सर्व शिववेध टॅब बंद करून पुन्हा उघडा.';
    } catch {
      clearTimeout(timer);
      status.textContent =
        'ऑफलाइन जतन पूर्ण झाल्याची खात्री करता आली नाही. इंटरनेट व मोकळी जागा तपासून पुन्हा प्रयत्न करा.';
    } finally {
      save.disabled = false;
    }
  }
  save.textContent = 'जतन पुन्हा तपासा';
  save.onclick = check;
  check();
})();
