var THEME_PREF_KEY = 'auto-flow-theme-pref';

function getThemePref() {
  try { return localStorage.getItem(THEME_PREF_KEY); } catch (e) { return null; }
}

function setThemePref(value) {
  try {
    if (value === null || value === 'system') localStorage.removeItem(THEME_PREF_KEY);
    else localStorage.setItem(THEME_PREF_KEY, value);
  } catch (e) {}
}

function effectiveTheme() {
  var stored = getThemePref();
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme() {
  var root = document.documentElement;
  var stored = getThemePref();
  var eff = effectiveTheme();
  root.setAttribute('data-theme', eff);
  root.setAttribute('data-theme-pref', stored === 'light' || stored === 'dark' ? stored : 'system');
  var follow = document.getElementById('theme-follow');
  if (follow) follow.hidden = !(stored === 'light' || stored === 'dark');
  var tt = document.getElementById('theme-toggle');
  if (tt) tt.setAttribute('aria-label', eff === 'dark' ? '切换为浅色模式' : '切换为深色模式');
  var meta = document.getElementById('theme-color-meta');
  if (meta) meta.setAttribute('content', eff === 'dark' ? '#08080f' : '#f8fafc');
}

function copyTextWithFallback(value, onDone) {
  if (!value) {
    if (typeof onDone === 'function') onDone(false);
    return;
  }

  function done(success) {
    if (typeof onDone === 'function') onDone(!!success);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(function () {
      done(true);
    }).catch(function () {
      done(fallbackCopyValue(value));
    });
    return;
  }
  done(fallbackCopyValue(value));
}

function fallbackCopyValue(value) {
  var textarea = null;
  textarea = document.createElement('textarea');
  try {
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.setAttribute('readonly', 'readonly');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    if (typeof document.execCommand !== 'function') return false;
    return !!document.execCommand('copy');
  } catch (err) {
    return false;
  } finally {
    if (textarea && textarea.parentNode) textarea.parentNode.removeChild(textarea);
  }
}

function copyEmail(e) {
  e.preventDefault();
  var email = 'wakeupgyh@163.com';
  copyTextWithFallback(email, function (ok) {
    if (ok) showToast(email);
    else showToast(email, { prefix: '复制失败，请手动复制：', error: true });
  });
}

function copyEmailKey(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    copyEmail(e);
  }
}

function copyContact(e, value) {
  e.preventDefault();
  copyTextWithFallback(value, function (ok) {
    if (ok) showToast(value);
    else showToast(value, { prefix: '复制失败，请手动复制：', error: true });
  });
}

function copyContactKey(e, value) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    copyContact(e, value);
  }
}

(function initFallbackImages() {
  document.querySelectorAll('img[data-fallback-src]').forEach(function (img) {
    img.addEventListener('error', function handleError() {
      var fallbackSrc = img.getAttribute('data-fallback-src');
      if (!fallbackSrc || img.getAttribute('data-fallback-applied') === 'true') return;
      img.setAttribute('data-fallback-applied', 'true');
      img.src = fallbackSrc;
    }, { once: true });
  });
})();

(function initConsultForm() {
  var form = document.getElementById('cta-form');
  var input = document.getElementById('cta-user-email');
  var err = document.getElementById('cta-form-error');
  if (!form || !input || !err) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.textContent = '';
    var v = input.value.trim();
    if (!v) {
      err.textContent = '请填写您的邮箱地址。';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      err.textContent = '请输入有效的邮箱地址。';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.setAttribute('aria-invalid', 'false');
    var body = '您好，我想咨询 RPA AI 自动化方案。\n\n【我的联系邮箱】' + v + '\n\n【需求概要】\n（请简要描述业务场景、期望效果、预算范围）\n';
    var subject = 'RPA AI 自动化咨询';
    window.location.href = 'mailto:wakeupgyh@163.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  input.addEventListener('input', function () {
    err.textContent = '';
    input.setAttribute('aria-invalid', 'false');
  });
})();

function showToast(copiedValue, options) {
  var opts = options || {};
  var toast = document.getElementById('toast');
  if (!toast) return;
  var toastPrefix = toast.querySelector('.toast-prefix');
  var toastValue = toast.querySelector('.toast-email');
  if (toastPrefix) toastPrefix.textContent = opts.prefix || '已复制：';
  if (toastValue && copiedValue) toastValue.textContent = copiedValue;
  toast.classList.toggle('toast-error', !!opts.error);
  clearTimeout(toast._hideTimer);
  if (typeof toast.showPopover === 'function') {
    try {
      toast.showPopover();
      toast._hideTimer = setTimeout(function () {
        if (typeof toast.hidePopover === 'function') toast.hidePopover();
      }, 2500);
      return;
    } catch (err) {}
  }
  toast.classList.add('show');
  toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 2500);
}

(function initThemeUi() {
  var toggle = document.getElementById('theme-toggle');
  var follow = document.getElementById('theme-follow');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var eff = document.documentElement.getAttribute('data-theme');
      setThemePref(eff === 'dark' ? 'light' : 'dark');
      applyTheme();
    });
  }
  if (follow) {
    follow.addEventListener('click', function () {
      setThemePref(null);
      applyTheme();
    });
  }
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    var s = getThemePref();
    if (s !== 'light' && s !== 'dark') applyTheme();
  });
})();

(function initScenarioConsult() {
  var dlg = document.getElementById('consult-dialog');
  var ctx = document.getElementById('consult-dialog-context');
  var closeBtn = dlg ? dlg.querySelector('.consult-dialog-close') : null;
  var formLink = document.getElementById('consult-dialog-form');
  var hint = document.getElementById('consult-dialog-copy-hint');
  if (!dlg || !ctx) return;

  document.querySelectorAll('.scenario-card').forEach(function (card) {
    if (card.querySelector('.card-consult-btn')) return;
    var titleEl = card.querySelector('.card-title');
    var name = titleEl ? titleEl.textContent.trim() : '';
    var footer = document.createElement('div');
    footer.className = 'card-footer';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card-consult-btn';
    btn.textContent = '点击咨询';
    btn.setAttribute('data-scenario', name);
    btn.setAttribute('aria-label', '咨询场景：' + name);
    footer.appendChild(btn);
    card.appendChild(footer);
  });

  document.querySelectorAll('.card-consult-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-scenario') || '';
      ctx.textContent = name ? '咨询场景：「' + name + '」' : '';
      document.body.style.overflow = 'hidden';
      dlg.showModal();
      if (closeBtn) closeBtn.focus();
    });
  });

  function afterClose() {
    document.body.style.overflow = '';
  }

  dlg.addEventListener('close', afterClose);

  if (closeBtn) closeBtn.addEventListener('click', function () { dlg.close(); });

  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) dlg.close();
  });

  function flashHint(label, value) {
    if (!hint) return;
    hint.textContent = (label || '内容') + '已复制：' + value;
    clearTimeout(hint._t);
    hint._t = setTimeout(function () { hint.textContent = ''; }, 2200);
  }

  function flashHintError(label, value) {
    if (!hint) return;
    hint.textContent = (label || '内容') + '复制失败，请手动复制：' + value;
    clearTimeout(hint._t);
    hint._t = setTimeout(function () { hint.textContent = ''; }, 2600);
  }

  if (dlg) {
    dlg.querySelectorAll('.contact-copy-btn').forEach(function (copyTrigger) {
      copyTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var value = copyTrigger.getAttribute('data-copy-value') || '';
        var label = copyTrigger.getAttribute('data-copy-label') || '内容';
        copyTextWithFallback(value, function (ok) {
          if (ok) {
            showToast(value);
            flashHint(label, value);
            return;
          }
          showToast(value, { prefix: '复制失败，请手动复制：', error: true });
          flashHintError(label, value);
        });
      });
    });
  }

  if (formLink) {
    formLink.addEventListener('click', function () {
      dlg.close();
    });
  }
})();

(function initMobileNav() {
  var btn = document.getElementById('nav-menu-toggle');
  var menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 768px)').matches) {
        menu.classList.remove('is-open');
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', '打开导航菜单');
      }
    });
  });
})();

(function initBackToTop() {
  var backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  var visibleAfter = 420;
  var ticking = false;

  function syncVisibleState() {
    var shouldShow = window.scrollY > visibleAfter;
    backToTop.classList.toggle('is-visible', shouldShow);
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var progress = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
    var nearBottom = maxScroll - window.scrollY < 56;
    backToTop.classList.toggle('is-near-bottom', shouldShow && nearBottom);
    backToTop.style.setProperty('--scroll-progress', progress.toFixed(2));
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(syncVisibleState);
  }, { passive: true });
  window.addEventListener('resize', syncVisibleState);

  backToTop.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });

  syncVisibleState();
})();

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (reduceMotion.matches) {
  document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('visible'); });
  document.querySelectorAll('.scenario-card').forEach(function (card) {
    card.style.opacity = '1';
    card.style.transform = 'none';
  });
} else {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up').forEach(function (el) { observer.observe(el); });

  document.querySelectorAll('.scenario-grid').forEach(function (grid) {
    var cards = grid.querySelectorAll('.scenario-card');
    cards.forEach(function (card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease ' + (i * 0.1) + 's, transform 0.5s ease ' + (i * 0.1) + 's';
    });
    var gridObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          cards.forEach(function (card) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    gridObserver.observe(grid);
  });
}
