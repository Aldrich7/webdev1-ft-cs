document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.body.classList.add('page-loaded');
  });

  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');

      if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('http') || link.target === '_blank') {
        return;
      }

      e.preventDefault();
      document.body.classList.remove('page-loaded');
      document.body.classList.add('page-exit');

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 240);
    });
  });
});