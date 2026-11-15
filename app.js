(() => {
  'use strict';

  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbz9EFMKBpM9wNeR1qgEE3f_4te8HQQ3zss7iTTPy_gtmL8c9AckqBg6Z5TKmRwNs7LiiA/exec';

  const STORAGE_KEYS = {
    favorites: 'nutc_lunch_favorites_v1',
    comments: 'nutc_lunch_comments_v1',
    customStores: 'nutc_lunch_custom_stores_v1',
    reportedClosed: 'nutc_lunch_reported_closed_v1',
    gasUrl: 'nutc_lunch_gas_url_v1'
  };

  const state = {
    view: 'explore',
    campus: 'yizhong',
    day: 'sat',
    category: 'meal',
    sort: 'rating',
    favCampusFilter: 'all',
    favorites: loadJson(STORAGE_KEYS.favorites, []),
    comments: loadJson(STORAGE_KEYS.comments, {}),
    customStores: loadJson(STORAGE_KEYS.customStores, []),
    reportedClosed: loadJson(STORAGE_KEYS.reportedClosed, []),
    remoteCustomStores: [],
    remoteReportedClosed: [],
    remoteComments: {},
    openComments: new Set(),
    gasUrl: (localStorage.getItem(STORAGE_KEYS.gasUrl) || '').trim() || DEFAULT_GAS_URL,
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
  const exploreMoreMapsLink = document.getElementById('exploreMoreMapsLink');
  const hiddenBar = document.getElementById('hiddenBar');
  const hiddenBarText = document.getElementById('hiddenBarText');
  const restoreHiddenBtn = document.getElementById('restoreHiddenBtn');

  // Add Store & Export Elements
  const openAddStoreBtn = document.getElementById('openAddStoreBtn');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const addStoreModal = document.getElementById('addStoreModal');
  const closeAddStoreBtn = document.getElementById('closeAddStoreBtn');
  const cancelAddStoreBtn = document.getElementById('cancelAddStoreBtn');
  const addStoreForm = document.getElementById('addStoreForm');
  const newStoreCategory = document.getElementById('newStoreCategory');
  const newStoreMaxPrice = document.getElementById('newStoreMaxPrice');

  // Chat Widget Elements
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
  const chatWelcomeMsg = document.getElementById('chatWelcomeMsg');
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

  function saveCustomStores() {
    localStorage.setItem(STORAGE_KEYS.customStores, JSON.stringify(state.customStores));
  }

  function saveReportedClosed() {
    localStorage.setItem(STORAGE_KEYS.reportedClosed, JSON.stringify(state.reportedClosed));
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

  function getAllStores() {
    const merged = [...STORES];
    const seenIds = new Set(STORES.map((s) => s.id));
    [...state.remoteCustomStores, ...state.customStores].forEach((s) => {
      if (s && s.id && !seenIds.has(s.id)) {
        seenIds.add(s.id);
        merged.push({
          ...s,
          isCustom: true,
          mapsUrl: s.mapsUrl || buildGoogleMapsUrl(s.name, s.address)
        });
      }
    });
    return merged;
  }

  function getReportedSet() {
    return new Set([...state.reportedClosed, ...state.remoteReportedClosed]);
  }

  function getCommentsForStore(storeId) {
    const localList = state.comments[storeId] || [];
    const remoteList = state.remoteComments[storeId] || [];
    const seen = new Set();
    const combined = [];
    [...localList, ...remoteList].forEach((c) => {
      if (c && c.id && !seen.has(c.id)) {
        seen.add(c.id);
        combined.push(c);
      }
    });
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return combined;
  }

  async function postGasAction(payload) {
    if (!state.gasUrl) return null;
    try {
      const res = await fetch(state.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  async function syncFromGas() {
    if (!state.gasUrl) return false;
    try {
      const sep = state.gasUrl.includes('?') ? '&' : '?';
      const res = await fetch(`${state.gasUrl}${sep}action=getCommunity&_t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      const data = await res.json();
      if (data && data.ok) {
        state.remoteCustomStores = Array.isArray(data.customStores) ? data.customStores : [];
        state.remoteReportedClosed = Array.isArray(data.reportedIds) ? data.reportedIds : [];
        state.remoteComments = data.comments && typeof data.comments === 'object' ? data.comments : {};
        renderCurrentView();
        return true;
      }
      return false;
    } catch {
      // 靜默忽略，保持使用 localStorage
      return false;
    }
  }

  function updateFavBadge() {
    const reportedSet = getReportedSet();
    const count = getAllStores().filter((s) => !reportedSet.has(s.id) && isFavorite(s.id)).length;
    favCountBadge.textContent = String(count);
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

  function reportStoreClosed(storeId, storeName) {
    if (!window.confirm(`確定要將「${storeName}」標記為歇業或超預算並從清單隱藏嗎？\n（之後可隨時按「全部還原」）`)) {
      return;
    }
    if (!state.reportedClosed.includes(storeId)) {
      state.reportedClosed = [...state.reportedClosed, storeId];
      saveReportedClosed();
    }
    postGasAction({ action: 'reportStore', storeId });
    renderCurrentView();
  }

  function restoreHiddenStores() {
    state.reportedClosed = [];
    state.remoteReportedClosed = [];
    saveReportedClosed();
    postGasAction({ action: 'unreportAll' });
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
    postGasAction({ action: 'addComment', storeId, comment: newComment });
    renderCurrentView();
  }

  function deleteComment(storeId, commentId) {
    const existing = state.comments[storeId] || [];
    state.comments[storeId] = existing.filter((c) => c.id !== commentId);
    if (state.remoteComments[storeId]) {
      state.remoteComments[storeId] = state.remoteComments[storeId].filter((c) => c.id !== commentId);
    }
    saveComments();
    postGasAction({ action: 'deleteComment', storeId, commentId });
    renderCurrentView();
  }

  function getFilteredStores() {
    const reportedSet = getReportedSet();

    const filtered = getAllStores().filter((store) => {
      if (reportedSet.has(store.id)) return false;
      if (store.campus !== state.campus) return false;
      if (store.category !== state.category) return false;
      if (store.walkMinutes > 15) return false;
      if (store.category === 'meal' && store.maxPrice > 150) return false;
      if (store.category === 'snackdrink' && store.maxPrice > 120) return false;

      const dayHours = store.hours[state.day];
      if (!dayHours || !dayHours.open) return false;

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
    const comments = getCommentsForStore(store.id);
    const isCommentsOpen = state.openComments.has(store.id);
    const campusLabel = CAMPUS_INFO[store.campus]?.name || '';

    let categoryBadge = '<span class="badge badge-meal">🍱 正餐</span>';
    if (store.category === 'snackdrink') {
      categoryBadge =
        store.subCategory === 'snack'
          ? '<span class="badge badge-snack">🍡 點心</span>'
          : '<span class="badge badge-drink">🧋 手搖飲</span>';
    }

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
            ${store.isCustom ? '<span class="badge badge-custom">自訂</span>' : ''}
          </div>
          <div class="card-action-group">
            <button
              type="button"
              class="report-btn"
              data-action="report-closed"
              data-store-id="${escapeHtml(store.id)}"
              data-store-name="${escapeHtml(store.name)}"
              title="回報已歇業／超過預算並隱藏"
              aria-label="回報 ${escapeHtml(store.name)} 歇業或超預算"
            >
              🚫
            </button>
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
        </div>

        <h3 class="store-name" title="${escapeHtml(store.address)}">${escapeHtml(store.name)}</h3>

        <div class="store-quick-stats">
          <span class="stat-chip stat-rating">⭐ ${Number(store.rating).toFixed(1)}</span>
          <span class="stat-chip stat-distance">🚶 ${store.walkMinutes}分 (${store.distanceMeters}m)</span>
          <span class="stat-chip stat-hours">🕒 ${escapeHtml(hoursText)}</span>
        </div>

        <div class="store-highlights">
          ${(store.highlights || []).map((h) => `<span class="highlight-chip">${escapeHtml(h)}</span>`).join('')}
        </div>

        <div class="store-actions">
          <a
            class="map-link-btn"
            href="${escapeHtml(store.mapsUrl || buildGoogleMapsUrl(store.name, store.address))}"
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
    const campusObj = CAMPUS_INFO[state.campus];
    const dayText = state.day === 'sat' ? '週六' : '週日';
    const catText = state.category === 'meal' ? '正餐' : '點心＋手搖飲';

    resultSummary.textContent = `${campusObj.name}・${dayText}營業中・${catText} ${stores.length} 間（從${campusObj.originLabel}步行）`;
    exploreMoreMapsLink.href = state.category === 'meal' ? campusObj.nearbyMealMapsUrl : campusObj.nearbyDrinkMapsUrl;

    const reportedCount = getReportedSet().size;
    if (reportedCount > 0) {
      hiddenBar.hidden = false;
      hiddenBarText.textContent = `已隱藏 ${reportedCount} 間回報歇業／超預算的店家`;
    } else {
      hiddenBar.hidden = true;
    }

    if (stores.length === 0) {
      storeGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍙</div>
          <h3>沒有符合條件的店家</h3>
          <p>可以點「➕ 新增店家」或按「🗺️ 地圖找更多」探索周邊美食！</p>
        </div>
      `;
      return;
    }

    storeGrid.innerHTML = stores.map((s) => renderStoreCard(s, { showCampusBadge: false, activeDay: state.day })).join('');
  }

  function renderFavorites() {
    const reportedSet = getReportedSet();
    const favStores = getAllStores().filter((s) => {
      if (reportedSet.has(s.id)) return false;
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
    updateFavBadge();
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
  restoreHiddenBtn.addEventListener('click', restoreHiddenStores);

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

  function handleGridClick(e) {
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      toggleFavorite(favBtn.dataset.storeId);
      return;
    }

    const reportBtn = e.target.closest('[data-action="report-closed"]');
    if (reportBtn) {
      reportStoreClosed(reportBtn.dataset.storeId, reportBtn.dataset.storeName);
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

  // ==================== Add Custom Store Modal ====================
  function openAddStoreModal() {
    addStoreForm.elements.campus.value = state.campus;
    addStoreForm.elements.category.value = state.category;
    updateNewStorePriceCap();
    addStoreModal.hidden = false;
    addStoreForm.elements.name.focus();
  }

  function closeAddStoreModal() {
    addStoreModal.hidden = true;
  }

  function updateNewStorePriceCap() {
    const isMeal = newStoreCategory.value === 'meal';
    newStoreMaxPrice.max = isMeal ? '150' : '120';
    if (Number(newStoreMaxPrice.value) > Number(newStoreMaxPrice.max)) {
      newStoreMaxPrice.value = newStoreMaxPrice.max;
    }
  }

  newStoreCategory.addEventListener('change', updateNewStorePriceCap);
  openAddStoreBtn.addEventListener('click', openAddStoreModal);
  closeAddStoreBtn.addEventListener('click', closeAddStoreModal);
  cancelAddStoreBtn.addEventListener('click', closeAddStoreModal);
  addStoreModal.addEventListener('click', (e) => {
    if (e.target === addStoreModal) closeAddStoreModal();
  });

  addStoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = addStoreForm.elements;
    const campus = f.campus.value;
    const category = f.category.value;
    const name = f.name.value.trim();
    const address = f.address.value.trim();
    const walkMinutes = Math.min(15, Math.max(1, Number(f.walkMinutes.value) || 5));
    const cap = category === 'meal' ? 150 : 120;
    const maxPrice = Math.min(cap, Math.max(10, Number(f.maxPrice.value) || cap));
    const rating = Math.min(5, Math.max(1, Number(f.rating.value) || 4.5));
    const satText = f.satHours.value.trim();
    const sunText = f.sunHours.value.trim();
    const highlightsRaw = f.highlights.value
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);

    const newStore = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      campus,
      category,
      subCategory: category === 'snackdrink' ? 'snack' : undefined,
      name,
      address,
      distanceMeters: walkMinutes * 75,
      walkMinutes,
      rating,
      priceRange: `≤ $${maxPrice}`,
      maxPrice,
      highlights: highlightsRaw.length > 0 ? highlightsRaw : [category === 'meal' ? '平價正餐' : '點心／手搖飲'],
      hours: {
        sat: satText ? { open: true, text: satText } : { open: false, text: '週六公休' },
        sun: sunText ? { open: true, text: sunText } : { open: false, text: '週日公休' }
      },
      isCustom: true,
      mapsUrl: buildGoogleMapsUrl(name, address)
    };

    state.customStores = [newStore, ...state.customStores];
    saveCustomStores();
    postGasAction({ action: 'addStore', store: newStore });

    // 自動切換到剛新增的校區與分類方便立刻看到
    state.campus = campus;
    state.category = category;
    document.querySelectorAll('.campus-card').forEach((b) => {
      const active = b.dataset.campus === campus;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-category]').forEach((b) => {
      b.classList.toggle('active', b.dataset.category === category);
    });

    addStoreForm.reset();
    closeAddStoreModal();
    switchView('explore');
  });

  // ==================== Export All Stores to .xlsx ====================
  const CRC32_TABLE = (() => {
    const tbl = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      tbl[i] = c >>> 0;
    }
    return tbl;
  })();

  function crc32Bytes(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function buildStoredZipBytes(entries) {
    const encoder = new TextEncoder();
    const now = new Date();
    const dosTime = ((now.getHours() & 0x1f) << 11) | ((now.getMinutes() & 0x3f) << 5) | ((now.getSeconds() >> 1) & 0x1f);
    const dosDate = (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) | (((now.getMonth() + 1) & 0x0f) << 5) | (now.getDate() & 0x1f);

    const prepared = entries.map((entry) => {
      const nameBytes = encoder.encode(entry.name);
      const dataBytes = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
      return {
        nameBytes,
        dataBytes,
        crc: crc32Bytes(dataBytes),
        offset: 0
      };
    });

    let totalSize = 0;
    prepared.forEach((p) => {
      p.offset = totalSize;
      totalSize += 30 + p.nameBytes.length + p.dataBytes.length;
    });

    const cdStart = totalSize;
    prepared.forEach((p) => {
      totalSize += 46 + p.nameBytes.length;
    });
    const cdSize = totalSize - cdStart;
    totalSize += 22;

    const out = new Uint8Array(totalSize);
    const view = new DataView(out.buffer);
    let pos = 0;

    prepared.forEach((p) => {
      view.setUint32(pos, 0x04034b50, true);
      view.setUint16(pos + 4, 20, true);
      view.setUint16(pos + 6, 0x0800, true);
      view.setUint16(pos + 8, 0, true);
      view.setUint16(pos + 10, dosTime, true);
      view.setUint16(pos + 12, dosDate, true);
      view.setUint32(pos + 14, p.crc, true);
      view.setUint32(pos + 18, p.dataBytes.length, true);
      view.setUint32(pos + 22, p.dataBytes.length, true);
      view.setUint16(pos + 26, p.nameBytes.length, true);
      view.setUint16(pos + 28, 0, true);
      out.set(p.nameBytes, pos + 30);
      out.set(p.dataBytes, pos + 30 + p.nameBytes.length);
      pos += 30 + p.nameBytes.length + p.dataBytes.length;
    });

    prepared.forEach((p) => {
      view.setUint32(pos, 0x02014b50, true);
      view.setUint16(pos + 4, 20, true);
      view.setUint16(pos + 6, 20, true);
      view.setUint16(pos + 8, 0x0800, true);
      view.setUint16(pos + 10, 0, true);
      view.setUint16(pos + 12, dosTime, true);
      view.setUint16(pos + 14, dosDate, true);
      view.setUint32(pos + 16, p.crc, true);
      view.setUint32(pos + 20, p.dataBytes.length, true);
      view.setUint32(pos + 24, p.dataBytes.length, true);
      view.setUint16(pos + 28, p.nameBytes.length, true);
      view.setUint16(pos + 30, 0, true);
      view.setUint16(pos + 32, 0, true);
      view.setUint16(pos + 34, 0, true);
      view.setUint16(pos + 36, 0, true);
      view.setUint32(pos + 38, 0, true);
      view.setUint32(pos + 42, p.offset, true);
      out.set(p.nameBytes, pos + 46);
      pos += 46 + p.nameBytes.length;
    });

    view.setUint32(pos, 0x06054b50, true);
    view.setUint16(pos + 4, 0, true);
    view.setUint16(pos + 6, 0, true);
    view.setUint16(pos + 8, prepared.length, true);
    view.setUint16(pos + 10, prepared.length, true);
    view.setUint32(pos + 12, cdSize, true);
    view.setUint32(pos + 16, cdStart, true);
    view.setUint16(pos + 20, 0, true);
    return out;
  }

  function escapeXml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function colToLetter(idx) {
    let s = '';
    let n = idx + 1;
    while (n > 0) {
      const rem = (n - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  function buildStoreExportRow(store, reportedSet) {
    const campusLabel = (CAMPUS_INFO[store.campus] && CAMPUS_INFO[store.campus].name) || store.campus || '';
    const catLabel = store.category === 'meal' ? '150元內正餐' : store.subCategory === 'drink' ? '手搖飲' : '點心';
    const satText = store.hours && store.hours.sat
      ? (store.hours.sat.open ? store.hours.sat.text : (store.hours.sat.text || '週六公休'))
      : '週六公休';
    const sunText = store.hours && store.hours.sun
      ? (store.hours.sun.open ? store.hours.sun.text : (store.hours.sun.text || '週日公休'))
      : '週日公休';
    const statusText = reportedSet.has(store.id) ? '已標記隱藏' : '正常';
    const commentCount = getCommentsForStore(store.id).length;

    return [
      store.id || '',
      campusLabel,
      catLabel,
      store.name || '',
      Number(store.rating) || 0,
      store.priceRange || '',
      Number(store.maxPrice) || 0,
      Number(store.walkMinutes) || 0,
      Number(store.distanceMeters) || 0,
      Array.isArray(store.highlights) ? store.highlights.join('、') : '',
      satText,
      sunText,
      store.address || '',
      store.mapsUrl || buildGoogleMapsUrl(store.name, store.address),
      statusText,
      commentCount
    ];
  }

  function buildExcelWorkbookBytes(mainStores, customStores, reportedSet) {
    const headers = [
      '編號', '區域', '分類', '店名', '星級', '價格區間', '最高價格',
      '步行分鐘', '距離(公尺)', '推薦特色', '週六營業', '週日營業',
      '地址', 'Google地圖連結', '狀態', '留言數'
    ];
    const colWidths = [13, 12, 14, 30, 8, 12, 10, 10, 12, 28, 15, 15, 32, 46, 13, 9];
    const strings = [];
    const strMap = new Map();

    function intern(val) {
      const s = String(val);
      if (strMap.has(s)) return strMap.get(s);
      const idx = strings.length;
      strings.push(s);
      strMap.set(s, idx);
      return idx;
    }

    function buildSheetXml(rows) {
      const colsXml = colWidths
        .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
        .join('');
      const rowsXml = rows
        .map((row, rIdx) => {
          const rNum = rIdx + 1;
          const styleId = rIdx === 0 ? 1 : 2;
          const cellsXml = row
            .map((val, cIdx) => {
              const ref = `${colToLetter(cIdx)}${rNum}`;
              if (typeof val === 'number' && Number.isFinite(val)) {
                return `<c r="${ref}" s="${styleId}"><v>${val}</v></c>`;
              }
              return `<c r="${ref}" t="s" s="${styleId}"><v>${intern(val ?? '')}</v></c>`;
            })
            .join('');
          const ht = rIdx === 0 ? 24 : 20;
          return `<row r="${rNum}" ht="${ht}" customHeight="1">${cellsXml}</row>`;
        })
        .join('');

      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
</worksheet>`;
    }

    const mainRows = [headers, ...mainStores.map((s) => buildStoreExportRow(s, reportedSet))];
    const customRows = [headers, ...customStores.map((s) => buildStoreExportRow(s, reportedSet))];
    const sheet1Xml = buildSheetXml(mainRows);
    const sheet2Xml = buildSheetXml(customRows);

    const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${strings.map((s) => `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`).join('\n')}
</sst>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Microsoft JhengHei"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Microsoft JhengHei"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF8B5E3C"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf>
  </cellXfs>
</styleSheet>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="主清單" sheetId="1" r:id="rId1"/>
    <sheet name="網友新增" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`;

    return buildStoredZipBytes([
      { name: '[Content_Types].xml', content: contentTypesXml },
      { name: '_rels/.rels', content: rootRelsXml },
      { name: 'xl/workbook.xml', content: workbookXml },
      { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
      { name: 'xl/styles.xml', content: stylesXml },
      { name: 'xl/sharedStrings.xml', content: sharedStringsXml },
      { name: 'xl/worksheets/sheet1.xml', content: sheet1Xml },
      { name: 'xl/worksheets/sheet2.xml', content: sheet2Xml }
    ]);
  }

  function exportStoresToExcel() {
    const reportedSet = getReportedSet();
    const baseIds = new Set(STORES.map((s) => s.id));
    const seenCustom = new Set();
    const customList = [];
    [...state.remoteCustomStores, ...state.customStores].forEach((s) => {
      if (s && s.id && !baseIds.has(s.id) && !seenCustom.has(s.id)) {
        seenCustom.add(s.id);
        customList.push({
          ...s,
          isCustom: true,
          mapsUrl: s.mapsUrl || buildGoogleMapsUrl(s.name, s.address)
        });
      }
    });

    const bytes = buildExcelWorkbookBytes(STORES, customList, reportedSet);
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `中科大六日午餐店家清單_${today}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (exportExcelBtn) {
      const span = exportExcelBtn.querySelector('span');
      if (span) {
        span.textContent = '✓ 已匯出 Excel';
        setTimeout(() => {
          span.textContent = '📥 匯出 Excel';
        }, 1600);
      }
    }
  }

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', exportStoresToExcel);
  }

  // ==================== Cartoon Smiley Chat Widget & GAS Integration ====================
  function updateGasStatusUI() {
    gasUrlInput.value = state.gasUrl;
    if (state.gasUrl) {
      gasStatusText.textContent = '已設定 GAS 網址';
      gasStatusText.classList.add('connected');
      if (chatWelcomeMsg) {
        chatWelcomeMsg.innerHTML = '嗨嗨～我是午餐小客服 😊<br />想吃什麼呢？直接問我或點下方按鈕就能幫你挑囉～';
      }
    } else {
      gasStatusText.textContent = '尚未設定 GAS 網址';
      gasStatusText.classList.remove('connected');
      if (chatWelcomeMsg) {
        chatWelcomeMsg.innerHTML = '嗨嗨～我是午餐小客服 😊<br />點右上角 <strong>⚙️ 設定</strong> 貼上 GAS 網址，就能請我幫你挑午餐囉！';
      }
    }
  }

  function setSettingsFeedback(msg, isOk) {
    settingsFeedback.textContent = msg;
    settingsFeedback.className = `settings-feedback ${isOk ? 'ok' : 'err'}`;
  }

  function appendChatMessage(role, text, isLoading = false) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role === 'user' ? 'user' : 'bot'}${isLoading ? ' loading' : ''}`;
    div.textContent = String(text || '').trim();
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function formatChatReplyText(text) {
    return String(text || '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^[ \t]+/gm, '')
      .trim();
  }

  function buildSystemContext() {
    const campusInfo = CAMPUS_INFO[state.campus];
    const campusName = campusInfo.name;
    const dayName = state.day === 'sat' ? '週六中午' : '週日中午';
    const reportedSet = getReportedSet();
    const allStores = getAllStores().filter((s) => !reportedSet.has(s.id));
    const openStores = allStores.filter((s) => s.campus === state.campus && s.hours[state.day]?.open);
    const storeLines = openStores
      .map((s) => {
        const type = s.category === 'meal' ? '正餐' : s.subCategory === 'snack' ? '點心' : '手搖飲';
        return `- [${type}] ${s.name}｜${s.priceRange}｜${s.rating}★｜步行${s.walkMinutes}分｜${s.hours[state.day].text}｜${(s.highlights || []).join('、')}`;
      })
      .join('\n');

    const closedToday = allStores
      .filter((s) => s.campus === state.campus && !s.hours[state.day]?.open)
      .map((s) => s.name)
      .join('、');

    return [
      '你是「中科大午餐小客服」，用繁體中文回覆，語氣像親切熱情的朋友。',
      '【回覆規則】\n1. 簡潔精準：每次回覆控制在 3 句、約 70～110 字以內，直接給重點，不要長篇大論。\n2. 推薦精選：推薦時最多挑 2～3 間最適合的就好，每間一句「・店名｜步行幾分｜價位｜小亮點」。\n3. 禁止使用 Markdown 符號（不要寫 ** 或 ##），開頭不要空兩格。',
      `目前瀏覽：${campusName}（從${campusInfo.originLabel}出發），時段：${dayName}。`,
      `${campusName}${dayName}有營業：\n${storeLines}`,
      closedToday ? `${dayName}公休：${closedToday}` : ''
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
          action: 'chat',
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
      loadingEl.textContent = formatChatReplyText(assistantMsg.content) || '（AI 未回傳文字內容）';
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

  saveGasBtn.addEventListener('click', async () => {
    const val = gasUrlInput.value.trim();
    if (val && !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(val)) {
      setSettingsFeedback('網址格式應為 https://script.google.com/macros/s/.../exec', false);
      return;
    }
    if (val) {
      state.gasUrl = val;
      localStorage.setItem(STORAGE_KEYS.gasUrl, val);
    } else {
      localStorage.removeItem(STORAGE_KEYS.gasUrl);
      state.gasUrl = DEFAULT_GAS_URL;
    }
    updateGasStatusUI();
    setSettingsFeedback('儲存中，正在同步資料...', true);
    const synced = await syncFromGas();
    if (synced) {
      setSettingsFeedback(val ? '已儲存 GAS 網址並完成同步 ✓' : '已恢復使用網站預設 GAS 網址並完成同步 ✓', true);
    } else {
      setSettingsFeedback('已儲存網址，但同步失敗（請點「測試連線」確認 GAS 權限為所有人）', false);
    }
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
  syncFromGas();
})();
