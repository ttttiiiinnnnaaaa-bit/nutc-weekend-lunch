(() => {
  'use strict';

  const STORAGE_KEYS = {
    favorites: 'nutc_lunch_favorites_v1',
    comments: 'nutc_lunch_comments_v1',
    gasUrl: 'nutc_lunch_gas_url_v1'
  };

  const state = {
    view: 'explore',
    campus: 'sanmin',
    day: 'sat',
    category: 'meal',
    sort: 'rating',
    search: '',
    favCampusFilter: 'all',
    favorites: loadJson(STORAGE_KEYS.favorites, []),
    comments: loadJson(STORAGE_KEYS.comments, {}),
    openComments: new Set(),
    gasUrl: localStorage.getItem(STORAGE_KEYS.gasUrl) || '',
    chatHistory: [],
    isSendingChat: false
  };

  const navExplore = document.getElementById('navExplore');
  const navFavorites = document.getElementById('navFavorites');
  const favCountBadge = document.getElementById('favCountBadge');
  const exploreView = document.getElementById('exploreView');
  const favoritesView = document.getElementById('favoritesView');
  const storeGrid = document.getElementById('storeGrid');
  const favoritesGrid = document.getElementById('favoritesGrid');
  const resultSummary = document.getElementById('resultSummary');
  const searchInput = document.getElementById('searchInput');

  const chatPanel = document.getElementById('chatPanel');
  const smileyLauncher = document.getElementById('smileyLauncher');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const chatSettings = document.getElementById('chatSettings');
  const gasUrlInput = document.getElementById('gasUrlInput');
  const saveGasBtn = document.getElementById('saveGasBtn');
  const testGasBtn = document.getElementById('testGasBtn');
  const settingsFeedback = document.getElementById('settingsFeedback');
  const gasStatusText = document.getElementById('gasStatusText');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
    updateFavBadge();
  }

  function saveComments() {
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(state.comments));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTimestamp(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${min}`;
  }

  function updateFavBadge() {
    favCountBadge.textContent = String(state.favorites.length);
  }

  function isFavorite(storeId) {
    return state.favorites.includes(storeId);
  }

  function toggleFavorite(storeId) {
    if (isFavorite(storeId)) {
      state.favorites = state.favorites.filter((id) => id !== storeId);
    } else {
      state.favorites = [...state.favorites, storeId];
    }
    saveFavorites();
    renderCurrentView();
  }

  function toggleCommentDrawer(storeId) {
    if (state.openComments.has(storeId)) {
      state.openComments.delete(storeId);
    } else {
      state.openComments.add(storeId);
    }
    renderCurrentView();
  }

  function addComment(storeId, author, text) {
    const cleanText = text.trim();
    if (!cleanText) return;
    const cleanAuthor = author.trim() || '同學';
    const existing = state.comments[storeId] || [];
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: cleanAuthor,
      text: cleanText,
      createdAt: new Date().toISOString()
    };
    state.comments[storeId] = [newComment, ...existing];
    state.openComments.add(storeId);
    saveComments();
    renderCurrentView();
  }

  function deleteComment(storeId, commentId) {
    const existing = state.comments[storeId] || [];
    state.comments[storeId] = existing.filter((c) => c.id !== commentId);
    saveComments();
    renderCurrentView();
  }

  function getFilteredStores() {
    const keyword = state.search.trim().toLowerCase();

    const filtered = STORES.filter((store) => {
      if (store.campus !== state.campus) return false;
      if (store.category !== state.category) return false;
      if (store.walkMinutes > 10) return false;
      if (store.category === 'meal' && store.maxPrice > 150) return false;
      if (store.category === 'drink' && store.maxPrice > 100) return false;

      const dayHours = store.hours[state.day];
      if (!dayHours || !dayHours.open) return false;

      if (keyword) {
        const haystack = [store.name, store.address, ...store.highlights].join(' ').toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (state.sort === 'rating') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.distanceMeters - b.distanceMeters;
      }
      if (a.distanceMeters !== b.distanceMeters) return a.distanceMeters - b.distanceMeters;
      return b.rating - a.rating;
    });

    return filtered;
  }

  function renderStoreCard(store, options = { showCampusBadge: false, activeDay: state.day }) {
    const fav = isFavorite(store.id);
    const comments = state.comments[store.id] || [];
    const isCommentsOpen = state.openComments.has(store.id);
    const campusLabel = CAMPUS_INFO[store.campus]?.name || '';

    const categoryBadge =
      store.category === 'meal'
        ? '<span class="badge badge-meal">🍱 正餐</span>'
        : '<span class="badge badge-drink">🧋 手搖飲</span>';

    const dayKey = options.activeDay || 'sat';
    const hoursText = options.showCampusBadge
      ? `六 ${store.hours.sat.text}｜日 ${store.hours.sun.text}`
      : store.hours[dayKey].text;

    const commentsHtml =
      comments.length === 0
        ? '<p class="comment-empty">還沒有留言，歡迎分享心得！</p>'
        : comments
            .map(
              (c) => `
          <div class="comment-item">
            <div class="comment-item-head">
              <span class="comment-author">${escapeHtml(c.author)}</span>
              <span class="comment-meta">
                <span>${escapeHtml(formatTimestamp(c.createdAt))}</span>
                <button type="button" class="comment-del-btn" data-action="delete-comment" data-store-id="${escapeHtml(store.id)}" data-comment-id="${escapeHtml(c.id)}">刪除</button>
              </span>
            </div>
            <p class="comment-text">${escapeHtml(c.text)}</p>
          </div>
        `
            )
            .join('');

    return `
      <article class="store-card" data-store-id="${escapeHtml(store.id)}">
        <div class="store-top">
          <div class="store-badges">
            ${options.showCampusBadge ? `<span class="badge badge-campus">${escapeHtml(campusLabel)}</span>` : ''}
            ${categoryBadge}
            <span class="badge badge-price">${escapeHtml(store.priceRange)}</span>
          </div>
          <button
            type="button"
            class="fav-btn ${fav ? 'is-fav' : ''}"
            data-action="toggle-fav"
            data-store-id="${escapeHtml(store.id)}"
            aria-label="${fav ? '取消收藏' : '加入收藏'} ${escapeHtml(store.name)}"
            title="${fav ? '取消收藏' : '加入收藏'}"
          >
            ${fav ? '♥' : '♡'}
          </button>
        </div>

        <a
          class="store-name-link"
          href="${escapeHtml(store.mapsUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          title="${escapeHtml(store.address)}"
        >
          ${escapeHtml(store.name)}
        </a>

        <div class="store-quick-stats">
          <span class="stat-chip stat-rating">⭐ ${store.rating.toFixed(1)}</span>
          <span class="stat-chip stat-distance">🚶 ${store.walkMinutes}分 (${store.distanceMeters}m)</span>
          <span class="stat-chip stat-hours">🕒 ${escapeHtml(hoursText)}</span>
        </div>

        <div class="store-highlights">
          ${store.highlights.map((h) => `<span class="highlight-chip">${escapeHtml(h)}</span>`).join('')}
        </div>

        <div class="store-actions">
          <a
            class="map-link-btn"
            href="${escapeHtml(store.mapsUrl)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 Google 地圖 ↗
          </a>
          <button
            type="button"
            class="comment-toggle-btn ${isCommentsOpen ? 'open' : ''}"
            data-action="toggle-comments"
            data-store-id="${escapeHtml(store.id)}"
            aria-expanded="${String(isCommentsOpen)}"
          >
            💬 留言 (${comments.length})
          </button>
        </div>

        <div class="comments-section" ${isCommentsOpen ? '' : 'hidden'}>
          <div class="comments-list">
            ${commentsHtml}
          </div>
          <form class="comment-form" data-action="add-comment" data-store-id="${escapeHtml(store.id)}">
            <div class="comment-form-row">
              <input
                type="text"
                name="author"
                class="comment-author-input"
                placeholder="暱稱"
                maxlength="16"
              />
              <input
                type="text"
                name="text"
                class="comment-text-input"
                placeholder="寫下留言或推薦餐點..."
                maxlength="180"
                required
              />
              <button type="submit" class="comment-submit-btn">送出</button>
            </div>
          </form>
        </div>
      </article>
    `;
  }

  function renderExplore() {
    const stores = getFilteredStores();
    const campusName = CAMPUS_INFO[state.campus].name;
    const dayText = state.day === 'sat' ? '週六' : '週日';
    const catText = state.category === 'meal' ? '正餐' : '手搖飲';

    resultSummary.textContent = `${campusName}・${dayText}營業中・${catText} ${stores.length} 間`;

    if (stores.length === 0) {
      storeGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍙</div>
          <h3>沒有符合條件的店家</h3>
          <p>試著清除搜尋字詞或切換週六／週日看看！</p>
        </div>
      `;
      return;
    }

    storeGrid.innerHTML = stores.map((s) => renderStoreCard(s, { showCampusBadge: false, activeDay: state.day })).join('');
  }

  function renderFavorites() {
    const favStores = STORES.filter((s) => {
      if (!isFavorite(s.id)) return false;
      if (state.favCampusFilter !== 'all' && s.campus !== state.favCampusFilter) return false;
      return true;
    });

    if (favStores.length === 0) {
      favoritesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🤍</div>
          <h3>還沒有收藏店家喔</h3>
          <p>點擊店家卡片右上角的 ♡ 愛心，就能把想吃的收進來！</p>
          <button type="button" class="btn-primary" id="backToExploreBtn">回去逛美食</button>
        </div>
      `;
      const backBtn = document.getElementById('backToExploreBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => switchView('explore'));
      }
      return;
    }

    favoritesGrid.innerHTML = favStores.map((s) => renderStoreCard(s, { showCampusBadge: true })).join('');
  }

  function renderCurrentView() {
    if (state.view === 'explore') {
      renderExplore();
    } else {
      renderFavorites();
    }
  }

  function switchView(viewName) {
    state.view = viewName;
    const isExplore = viewName === 'explore';
    exploreView.hidden = !isExplore;
    favoritesView.hidden = isExplore;
    navExplore.classList.toggle('active', isExplore);
    navFavorites.classList.toggle('active', !isExplore);
    renderCurrentView();
  }

  navExplore.addEventListener('click', () => switchView('explore'));
  navFavorites.addEventListener('click', () => switchView('favorites'));

  document.querySelectorAll('.campus-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const campus = btn.dataset.campus;
      if (!campus || campus === state.campus) return;
      state.campus = campus;
      document.querySelectorAll('.campus-card').forEach((b) => {
        const active = b.dataset.campus === campus;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });
      renderCurrentView();
    });
  });

  document.querySelectorAll('[data-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.day = btn.dataset.day;
      document.querySelectorAll('[data-day]').forEach((b) => b.classList.toggle('active', b === btn));
      renderExplore();
    });
  });

  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = btn.dataset.category;
      document.querySelectorAll('[data-category]').forEach((b) => b.classList.toggle('active', b === btn));
      renderExplore();
    });
  });

  document.querySelectorAll('[data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sort = btn.dataset.sort;
      document.querySelectorAll('[data-sort]').forEach((b) => b.classList.toggle('active', b === btn));
      renderExplore();
    });
  });

  document.querySelectorAll('[data-fav-campus]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.favCampusFilter = btn.dataset.favCampus;
      document.querySelectorAll('[data-fav-campus]').forEach((b) => b.classList.toggle('active', b === btn));
      renderFavorites();
    });
  });

  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    renderExplore();
  });

  function handleGridClick(e) {
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      toggleFavorite(favBtn.dataset.storeId);
      return;
    }

    const commentToggleBtn = e.target.closest('[data-action="toggle-comments"]');
    if (commentToggleBtn) {
      toggleCommentDrawer(commentToggleBtn.dataset.storeId);
      return;
    }

    const delBtn = e.target.closest('[data-action="delete-comment"]');
    if (delBtn) {
      deleteComment(delBtn.dataset.storeId, delBtn.dataset.commentId);
    }
  }

  function handleGridSubmit(e) {
    const form = e.target.closest('[data-action="add-comment"]');
    if (!form) return;
    e.preventDefault();
    const storeId = form.dataset.storeId;
    const author = form.elements.author.value;
    const text = form.elements.text.value;
    addComment(storeId, author, text);
  }

  storeGrid.addEventListener('click', handleGridClick);
  storeGrid.addEventListener('submit', handleGridSubmit);
  favoritesGrid.addEventListener('click', handleGridClick);
  favoritesGrid.addEventListener('submit', handleGridSubmit);

  // ==================== Cartoon Smiley Chat Widget & GAS Integration ====================
  function updateGasStatusUI() {
    gasUrlInput.value = state.gasUrl;
    if (state.gasUrl) {
      gasStatusText.textContent = '已設定 GAS 網址';
      gasStatusText.classList.add('connected');
    } else {
      gasStatusText.textContent = '尚未設定 GAS 網址';
      gasStatusText.classList.remove('connected');
    }
  }

  function setSettingsFeedback(msg, isOk) {
    settingsFeedback.textContent = msg;
    settingsFeedback.className = `settings-feedback ${isOk ? 'ok' : 'err'}`;
  }

  function appendChatMessage(role, text, isLoading = false) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role === 'user' ? 'user' : 'bot'}${isLoading ? ' loading' : ''}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function buildSystemContext() {
    const campusName = CAMPUS_INFO[state.campus].name;
    const dayName = state.day === 'sat' ? '週六中午' : '週日中午';
    const openStores = STORES.filter((s) => s.campus === state.campus && s.hours[state.day]?.open);
    const storeLines = openStores
      .map((s) => {
        const type = s.category === 'meal' ? '正餐' : '手搖飲';
        return `- [${type}] ${s.name}｜${s.priceRange}｜${s.rating}★｜步行${s.walkMinutes}分(${s.distanceMeters}m)｜${s.hours[state.day].text}｜${s.highlights.join('、')}`;
      })
      .join('\n');

    const closedToday = STORES.filter((s) => s.campus === state.campus && !s.hours[state.day]?.open)
      .map((s) => s.name)
      .join('、');

    return [
      '你是「國立臺中科技大學六日午餐小客服」，語氣可愛溫馨親切，使用繁體中文回答，簡潔實用。',
      `使用者目前瀏覽：${campusName}（${CAMPUS_INFO[state.campus].gateAddress}），時段：${dayName}。`,
      '原則：推薦 10 分鐘內走得到的店家，正餐 150 元內、手搖飲 100 元內，不推薦點心。',
      `${campusName}在${dayName}有營業的店家清單：\n${storeLines}`,
      closedToday ? `${campusName}在${dayName}公休的店家：${closedToday}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  async function sendChatPrompt(userText) {
    const trimmed = userText.trim();
    if (!trimmed || state.isSendingChat) return;

    if (!state.gasUrl) {
      appendChatMessage('user', trimmed);
      appendChatMessage('bot', '請先點右上角「⚙️ 設定」填入 GAS 部署網址並儲存，我才能連線幫忙推薦喔 😊');
      chatSettings.hidden = false;
      gasUrlInput.focus();
      return;
    }

    state.isSendingChat = true;
    chatSendBtn.disabled = true;
    appendChatMessage('user', trimmed);
    const loadingEl = appendChatMessage('bot', '小客服思考中...', true);

    const nextMessages = [...state.chatHistory, { role: 'user', content: trimmed }];

    try {
      const res = await fetch(state.gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        redirect: 'follow',
        body: JSON.stringify({
          messages: nextMessages,
          systemContext: buildSystemContext()
        })
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`GAS 回傳非 JSON 格式：${rawText.slice(0, 120)}`);
      }

      if (!data.ok || !data.message) {
        throw new Error(data.error || 'OpenRouter API 回傳失敗');
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.message.content || ''
      };
      if (data.message.reasoning_details !== undefined) {
        assistantMsg.reasoning_details = data.message.reasoning_details;
      }

      state.chatHistory = [...nextMessages, assistantMsg];
      loadingEl.classList.remove('loading');
      loadingEl.textContent = assistantMsg.content || '（AI 未回傳文字內容）';
    } catch (err) {
      loadingEl.classList.remove('loading');
      loadingEl.textContent = `連線失敗：${err.message}\n請確認 GAS 網址正確且部署權限為「所有人」。`;
    } finally {
      state.isSendingChat = false;
      chatSendBtn.disabled = false;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  smileyLauncher.addEventListener('click', () => {
    chatPanel.hidden = !chatPanel.hidden;
    if (!chatPanel.hidden) {
      chatInput.focus();
    }
  });

  closeChatBtn.addEventListener('click', () => {
    chatPanel.hidden = true;
  });

  openSettingsBtn.addEventListener('click', () => {
    chatSettings.hidden = !chatSettings.hidden;
    settingsFeedback.textContent = '';
    if (!chatSettings.hidden) {
      gasUrlInput.focus();
    }
  });

  saveGasBtn.addEventListener('click', () => {
    const val = gasUrlInput.value.trim();
    if (val && !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(val)) {
      setSettingsFeedback('網址格式應為 https://script.google.com/macros/s/.../exec', false);
      return;
    }
    state.gasUrl = val;
    if (val) {
      localStorage.setItem(STORAGE_KEYS.gasUrl, val);
      setSettingsFeedback('已儲存 GAS 網址！', true);
    } else {
      localStorage.removeItem(STORAGE_KEYS.gasUrl);
      setSettingsFeedback('已清除 GAS 網址。', true);
    }
    updateGasStatusUI();
  });

  testGasBtn.addEventListener('click', async () => {
    const val = gasUrlInput.value.trim();
    if (!val) {
      setSettingsFeedback('請先填入 GAS 網址再測試。', false);
      return;
    }
    setSettingsFeedback('測試連線中...', true);
    try {
      const res = await fetch(val, { method: 'GET', redirect: 'follow' });
      const data = await res.json();
      if (data && data.ok) {
        setSettingsFeedback(`連線成功！${data.status || 'ready'}`, true);
      } else {
        setSettingsFeedback(`回應異常：${JSON.stringify(data)}`, false);
      }
    } catch (err) {
      setSettingsFeedback(`測試失敗：${err.message}`, false);
    }
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = chatInput.value;
    chatInput.value = '';
    sendChatPrompt(val);
  });

  document.querySelectorAll('.quick-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      sendChatPrompt(chip.dataset.prompt || '');
    });
  });

  updateFavBadge();
  updateGasStatusUI();
  renderCurrentView();
})();
