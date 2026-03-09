/* ============================================================
   ONE PIECE CARD GAME — Full Feature Engine v2
   Deck Builder | My Collection | Advanced Filters | Related Cards
   ============================================================ */

'use strict';

// ================================================================
//  DOM REFS — Card List
// ================================================================
const cardGrid = document.getElementById('cardGrid');
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');
const totalBadge = document.getElementById('totalBadge');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const sortSelect = document.getElementById('sortFilter');
const crewSelect = document.getElementById('crewFilter');
const resetBtn = document.getElementById('resetFilters');
const emptyReset = document.getElementById('emptyReset');
const scrollTopBtn = document.getElementById('scrollTop');
const filterToggle = document.getElementById('filterToggle');
const filterPanel = document.getElementById('filterPanel');
const costMin = document.getElementById('costMin');
const costMax = document.getElementById('costMax');
const powerMin = document.getElementById('powerMin');
const powerMax = document.getElementById('powerMax');
const costLabel = document.getElementById('costRangeLabel');
const powerLabel = document.getElementById('powerRangeLabel');

// DOM REFS — Modal
const modal = document.getElementById('cardModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalImage = document.getElementById('modalImage');
const modalId = document.getElementById('modalId');
const modalName = document.getElementById('modalName');
const modalCost = document.getElementById('modalCost');
const modalPower = document.getElementById('modalPower');
const modalCounter = document.getElementById('modalCounter');
const modalColor = document.getElementById('modalColor');
const modalAttribute = document.getElementById('modalAttribute');
const modalType = document.getElementById('modalType');
const modalEffect = document.getElementById('modalEffect');
const modalSet = document.getElementById('modalSet');
const modalPosition = document.getElementById('modalPosition');
const modalRarityBadge = document.getElementById('modalRarityBadge');
const modalAddDeck = document.getElementById('modalAddDeck');
const modalToggleOwned = document.getElementById('modalToggleOwned');
const relatedCardsRow = document.getElementById('relatedCardsRow');
const modalRelated = document.getElementById('modalRelated');
const statCost = document.getElementById('statCost');
const statCounter = document.getElementById('statCounter');

// DOM REFS — Deck Builder
const deckAllCards = document.getElementById('deckAllCards');
const deckSearchInput = document.getElementById('deckSearchInput');
const deckBadge = document.getElementById('deckBadge');
const deckSubtitle = document.getElementById('deckSubtitle');
const deckProgressFill = document.getElementById('deckProgressFill');
const deckLeaderSlot = document.getElementById('deckLeaderSlot');
const deckCardList = document.getElementById('deckCardList');
const deckEmptyMsg = document.getElementById('deckEmptyMsg');
const deckWarnings = document.getElementById('deckWarnings');
const leaderCount = document.getElementById('leaderCount');
const characterCount = document.getElementById('characterCount');
const deckCharCount = document.getElementById('deckCharCount');
const exportDeckBtn = document.getElementById('exportDeck');
const clearDeckBtn = document.getElementById('clearDeck');

// DOM REFS — Collection
const collectionGrid = document.getElementById('collectionGrid');
const collectionBadge = document.getElementById('collectionBadge');
const collectionSubtitle = document.getElementById('collectionSubtitle');
const collectionEmpty = document.getElementById('collectionEmpty');
const clearCollectionBtn = document.getElementById('clearCollection');

// DOM REFS — Tabs & UX
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const themeToggle = document.getElementById('themeToggle');
const viewToggle = document.getElementById('viewToggle');
const toastEl = document.getElementById('toast');

// ================================================================
//  STATE
// ================================================================
let allCards = [];
let filtered = [];
let modalIndex = 0;
let deckSearch = '';

const state = {
  color: 'All',
  cardType: 'All',
  rarity: 'All',
  set: 'All',
  crew: 'All',
  search: '',
  sort: 'default',
  costMin: 0,
  costMax: 10,
  powerMin: 0,
  powerMax: 13000,
};

// Deck: { leader: card|null, cards: { [id]: count } }
let deck = loadFromStorage('op-deck', { leader: null, cards: {} });
// Collection: { [id]: count }
let collection = loadFromStorage('op-collection', {});

// ================================================================
//  INIT
// ================================================================
fetch('../data/cards.json')
  .then(r => r.json())
  .then(cards => {
    allCards = cards;
    applyFilters();
    renderDeckPicker();
    renderDeck();
    updateCollectionBadge();
    totalBadge.textContent = cards.length;
  })
  .catch(err => {
    console.error('Failed to load cards:', err);
    cardGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:40px">Failed to load cards. Make sure to open via a local server or browser with file access.</p>';
  });

// ================================================================
//  FILTER + SORT + RENDER
// ================================================================
function applyFilters() {
  let cards = [...allCards];

  if (state.color !== 'All') cards = cards.filter(c => c.Color === state.color);
  if (state.cardType !== 'All') cards = cards.filter(c => c.cardType === state.cardType);
  if (state.rarity !== 'All') cards = cards.filter(c => c.rarity === state.rarity);
  if (state.set !== 'All') cards = cards.filter(c => c.set === state.set);
  if (state.crew !== 'All') cards = cards.filter(c => c.crew && c.crew.includes(state.crew));

  if (state.search) {
    const q = state.search.toLowerCase();
    cards = cards.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.Type && c.Type.toLowerCase().includes(q)) ||
      (c.Effect && c.Effect.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
    );
  }

  // Cost range (skip Leaders with null cost)
  cards = cards.filter(c => {
    if (c.Cost == null) return true; // Leaders always pass
    return c.Cost >= state.costMin && c.Cost <= state.costMax;
  });

  // Power range
  cards = cards.filter(c => {
    if (!c.Power) return true;
    return c.Power >= state.powerMin && c.Power <= state.powerMax;
  });

  cards = sortCards(cards, state.sort);
  filtered = cards;
  renderCards(cards);
  updateCounts(cards.length);
}

function sortCards(cards, mode) {
  const c = [...cards];
  switch (mode) {
    case 'name-asc': return c.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc': return c.sort((a, b) => b.name.localeCompare(a.name));
    case 'power-desc': return c.sort((a, b) => (b.Power || 0) - (a.Power || 0));
    case 'power-asc': return c.sort((a, b) => (a.Power || 0) - (b.Power || 0));
    case 'cost-desc': return c.sort((a, b) => (b.Cost ?? -1) - (a.Cost ?? -1));
    case 'cost-asc': return c.sort((a, b) => (a.Cost ?? 99) - (b.Cost ?? 99));
    default: return c;
  }
}

function updateCounts(n) {
  totalBadge.textContent = n;
  const total = allCards.length;
  const isFiltered = state.color !== 'All' || state.cardType !== 'All' || state.rarity !== 'All' ||
    state.set !== 'All' || state.crew !== 'All' || state.search ||
    state.costMin > 0 || state.costMax < 10 || state.powerMin > 0 || state.powerMax < 13000;
  resultCount.textContent = isFiltered ? `${n} of ${total} cards` : `${total} cards`;
}

// ================================================================
//  RENDER CARDS
// ================================================================
function renderCards(cards) {
  cardGrid.innerHTML = '';
  if (cards.length === 0) { emptyState.classList.remove('hidden'); return; }
  emptyState.classList.add('hidden');

  cards.forEach((card, i) => {
    const div = createCardElement(card, i, {
      showActions: true,
      onClick: () => openModal(i),
    });
    cardGrid.appendChild(div);
  });
}

function createCardElement(card, i, { showActions = true, onClick = null, compact = false } = {}) {
  const div = document.createElement('div');
  div.className = 'card-item';
  div.setAttribute('data-color', card.Color);
  div.setAttribute('data-id', card.id);
  div.setAttribute('role', 'listitem');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', `${card.name} — ${card.rarity}`);
  if (i !== undefined) div.style.animationDelay = `${Math.min(i * 35, 500)}ms`;

  const img = document.createElement('img');
  img.src = card.image;
  img.alt = card.name;
  img.loading = 'lazy';

  const badge = document.createElement('span');
  badge.className = `rarity-badge rarity-badge--${card.rarity}`;
  badge.textContent = card.rarity;

  // Status badges (In Deck / Owned)
  const deckCount = getDeckCount(card.id);
  const isLeader = deck.leader && deck.leader.id === card.id;
  const ownedCount = collection[card.id] || 0;

  if (deckCount > 0 || isLeader) {
    const sb = document.createElement('div');
    sb.className = 'status-badge status-badge--deck';
    sb.textContent = isLeader ? '⚑ Leader' : `⚔ ×${deckCount}`;
    div.appendChild(sb);
  } else if (ownedCount > 0) {
    const sb = document.createElement('div');
    sb.className = 'status-badge status-badge--owned';
    sb.textContent = `♥ ×${ownedCount}`;
    div.appendChild(sb);
  }

  // List view meta
  const meta = document.createElement('div');
  meta.className = 'card-list-meta';
  meta.innerHTML = `
    <span>${card.id}</span>
    ${card.Power ? `<span>${card.Power.toLocaleString()} PWR</span>` : ''}
    ${card.Cost != null ? `<span>Cost ${card.Cost}</span>` : ''}
    <span>${card.Color}</span>
  `;

  // Hover info strip
  if (showActions) {
    const strip = document.createElement('div');
    strip.className = 'card-info-strip';

    const nameEl = document.createElement('div');
    nameEl.className = 'card-info-name';
    nameEl.textContent = card.name;

    const acts = document.createElement('div');
    acts.className = 'card-strip-actions';

    const deckBtn = document.createElement('button');
    deckBtn.className = 'strip-btn';
    deckBtn.textContent = '+ Deck';
    deckBtn.addEventListener('click', e => { e.stopPropagation(); addToDeck(card); });

    const heartBtn = document.createElement('button');
    heartBtn.className = `strip-btn strip-btn--heart${ownedCount > 0 ? ' is-owned' : ''}`;
    heartBtn.textContent = ownedCount > 0 ? '♥ Owned' : '♥ Own';
    heartBtn.addEventListener('click', e => { e.stopPropagation(); toggleOwned(card); });

    acts.appendChild(deckBtn);
    acts.appendChild(heartBtn);
    strip.appendChild(nameEl);
    strip.appendChild(acts);
    div.appendChild(strip);
  }

  div.appendChild(img);
  div.appendChild(badge);
  div.appendChild(meta);

  if (onClick) {
    div.addEventListener('click', onClick);
    div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') onClick(); });
  }

  return div;
}

function getDeckCount(id) {
  return deck.cards[id] || 0;
}

function getTotalDeckCards() {
  const charCount = Object.values(deck.cards).reduce((s, n) => s + n, 0);
  return charCount + (deck.leader ? 1 : 0);
}

// ================================================================
//  MODAL
// ================================================================
function openModal(index) {
  modalIndex = index;
  populateModal(filtered[index]);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modalClose.focus(), 50);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function populateModal(card) {
  if (!card) return;
  modalImage.src = card.image;
  modalImage.alt = card.name;
  modalId.textContent = card.id;
  modalName.textContent = card.name;
  modalPower.textContent = card.Power ? card.Power.toLocaleString() : '–';
  modalColor.textContent = card.Color;
  modalAttribute.textContent = card.Attribute || '–';
  modalType.textContent = card.Type;
  modalEffect.textContent = card.Effect || '–';
  modalSet.textContent = card.CardSets || '–';
  modalPosition.textContent = `${modalIndex + 1} / ${filtered.length}`;
  modalRarityBadge.textContent = card.rarity;
  modalRarityBadge.className = `modal-rarity-badge rarity-badge--${card.rarity}`;

  statCost.classList.toggle('hidden', card.Cost == null);
  if (card.Cost != null) modalCost.textContent = card.Cost;

  const hasCounter = card.counter && card.counter !== '-';
  statCounter.classList.toggle('hidden', !hasCounter);
  if (hasCounter) modalCounter.textContent = card.counter;

  // Owned button state
  const ownedQty = collection[card.id] || 0;
  modalToggleOwned.textContent = ownedQty > 0 ? `♥ Owned (×${ownedQty}) — Remove` : '♥ Add to Collection';
  modalToggleOwned.classList.toggle('is-owned', ownedQty > 0);

  // Related cards
  const related = allCards.filter(c =>
    c.id !== card.id &&
    c.crew && card.crew &&
    c.crew.some(crew => card.crew.includes(crew))
  ).slice(0, 8);

  if (related.length > 0) {
    relatedCardsRow.innerHTML = '';
    related.forEach(rc => {
      const img = document.createElement('img');
      img.src = rc.image;
      img.alt = rc.name;
      img.className = 'related-card-thumb';
      img.title = rc.name;
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        const idx = filtered.findIndex(f => f.id === rc.id);
        if (idx !== -1) { modalIndex = idx; populateModal(filtered[idx]); }
        else {
          // Card not in current filter — show it in its own temp filtered view
          const tempIdx = allCards.findIndex(f => f.id === rc.id);
          if (tempIdx !== -1) showToast(`💡 "${rc.name}" is filtered out — reset filters to see it`);
        }
      });
      relatedCardsRow.appendChild(img);
    });
    modalRelated.classList.remove('hidden');
  } else {
    modalRelated.classList.add('hidden');
  }
}

function navigateModal(dir) {
  if (filtered.length === 0) return;
  modalIndex = (modalIndex + dir + filtered.length) % filtered.length;
  populateModal(filtered[modalIndex]);
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
modalPrev.addEventListener('click', () => navigateModal(-1));
modalNext.addEventListener('click', () => navigateModal(1));

modalAddDeck.addEventListener('click', () => {
  if (filtered[modalIndex]) addToDeck(filtered[modalIndex]);
});

modalToggleOwned.addEventListener('click', () => {
  if (filtered[modalIndex]) {
    toggleOwned(filtered[modalIndex]);
    populateModal(filtered[modalIndex]); // refresh button state
  }
});

document.addEventListener('keydown', e => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') navigateModal(-1);
  if (e.key === 'ArrowRight') navigateModal(1);
});

// ================================================================
//  DECK BUILDER
// ================================================================
function addToDeck(card) {
  const total = getTotalDeckCards();
  if (total >= 50) { showToast('🚫 Deck is full (50 cards max)'); return; }

  if (card.cardType === 'Leader') {
    if (deck.leader) {
      if (deck.leader.id === card.id) { showToast('Leader already in deck'); return; }
      deck.leader = card;
      showToast(`✓ Leader changed to ${card.name}`);
    } else {
      deck.leader = card;
      showToast(`✓ ${card.name} added as Leader`);
    }
  } else {
    const count = deck.cards[card.id] || 0;
    if (count >= 4) { showToast(`🚫 Max 4 copies of ${card.name}`); return; }
    deck.cards[card.id] = count + 1;
    showToast(`+ ${card.name} added (×${deck.cards[card.id]})`);
  }

  saveDeck();
  renderDeck();
  renderDeckPicker();
  renderCards(filtered); // refresh status badges
}

function removeFromDeck(card, removeAll = false) {
  if (card.cardType === 'Leader') {
    deck.leader = null;
  } else {
    const count = deck.cards[card.id] || 0;
    if (count <= 1 || removeAll) {
      delete deck.cards[card.id];
    } else {
      deck.cards[card.id] = count - 1;
    }
  }
  saveDeck();
  renderDeck();
  renderDeckPicker();
  renderCards(filtered);
}

function renderDeck() {
  const charTotal = Object.values(deck.cards).reduce((s, n) => s + n, 0);
  const total = charTotal + (deck.leader ? 1 : 0);
  const pct = Math.min((total / 50) * 100, 100);

  deckSubtitle.textContent = `${total} / 50 cards`;
  deckBadge.textContent = total;
  deckProgressFill.style.width = pct + '%';
  leaderCount.textContent = `Leader: ${deck.leader ? 1 : 0}/1`;
  characterCount.textContent = `Characters: ${charTotal}`;
  deckCharCount.textContent = `(${charTotal})`;

  // Warnings
  deckWarnings.innerHTML = '';
  const warns = [];
  if (!deck.leader) warns.push({ msg: 'No Leader card in deck', ok: false });
  if (total === 50) warns.push({ msg: '✓ Deck is full (50/50)', ok: true });
  if (total > 0 && total < 50) warns.push({ msg: `${50 - total} more cards needed`, ok: false });
  warns.forEach(w => {
    const el = document.createElement('div');
    el.className = `deck-warning${w.ok ? ' deck-warning--ok' : ''}`;
    el.textContent = w.msg;
    deckWarnings.appendChild(el);
  });

  // Leader slot
  if (deck.leader) {
    deckLeaderSlot.innerHTML = '';
    deckLeaderSlot.appendChild(makeDeckRow(deck.leader, true));
  } else {
    deckLeaderSlot.innerHTML = '<div class="deck-empty-slot">+ Add a Leader card</div>';
  }

  // Character list
  deckCardList.innerHTML = '';
  const charIds = Object.keys(deck.cards);
  if (charIds.length === 0) {
    deckEmptyMsg.classList.remove('hidden');
    deckCardList.appendChild(deckEmptyMsg);
  } else {
    deckEmptyMsg.classList.add('hidden');
    charIds.forEach(id => {
      const card = allCards.find(c => c.id === id);
      if (!card) return;
      deckCardList.appendChild(makeDeckRow(card, false));
    });
  }
}

function makeDeckRow(card, isLeader) {
  const row = document.createElement('div');
  row.className = `deck-row${isLeader ? ' deck-leader-row' : ''}`;

  const img = document.createElement('img');
  img.src = card.image;
  img.alt = card.name;
  img.className = 'deck-row-img';

  const info = document.createElement('div');
  info.className = 'deck-row-info';

  const name = document.createElement('div');
  name.className = 'deck-row-name';
  name.textContent = card.name;

  const sub = document.createElement('div');
  sub.className = 'deck-row-sub';
  sub.textContent = [
    isLeader ? 'LEADER' : card.rarity,
    card.Power ? `${card.Power.toLocaleString()} PWR` : null,
    card.Cost != null ? `Cost ${card.Cost}` : null,
  ].filter(Boolean).join(' · ');

  info.appendChild(name);
  info.appendChild(sub);

  const controls = document.createElement('div');
  controls.className = 'deck-row-controls';

  if (isLeader) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'deck-count-btn';
    removeBtn.title = 'Remove Leader';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', () => removeFromDeck(card, true));
    controls.appendChild(removeBtn);
  } else {
    const count = deck.cards[card.id] || 0;

    const minusBtn = document.createElement('button');
    minusBtn.className = 'deck-count-btn';
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', () => removeFromDeck(card));

    const countEl = document.createElement('span');
    countEl.className = 'deck-row-count';
    countEl.textContent = count;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'deck-count-btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => {
      if (getTotalDeckCards() >= 50) { showToast('🚫 Deck is full'); return; }
      if (count >= 4) { showToast('🚫 Max 4 copies'); return; }
      deck.cards[card.id] = count + 1;
      saveDeck();
      renderDeck();
      renderDeckPicker();
      renderCards(filtered);
    });

    controls.appendChild(minusBtn);
    controls.appendChild(countEl);
    controls.appendChild(plusBtn);
  }

  row.appendChild(img);
  row.appendChild(info);
  row.appendChild(controls);
  return row;
}

function renderDeckPicker() {
  const q = deckSearch.toLowerCase();
  const cards = q ? allCards.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) : allCards;

  deckAllCards.innerHTML = '';
  cards.forEach(card => {
    const div = document.createElement('div');
    const count = getDeckCount(card.id);
    const isLeader = deck.leader && deck.leader.id === card.id;
    const maxed = !isLeader && count >= 4;
    div.className = `deck-pick-card${count > 0 || isLeader ? ' in-deck' : ''}${maxed ? ' maxed' : ''}`;
    div.setAttribute('data-color', card.Color);
    div.title = maxed ? `Max copies of ${card.name} reached` : `Click to add ${card.name} to deck`;

    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.loading = 'lazy';

    const badge = document.createElement('span');
    badge.className = `rarity-badge rarity-badge--${card.rarity}`;
    badge.textContent = card.rarity;

    const countBadge = document.createElement('div');
    countBadge.className = 'deck-pick-count';
    countBadge.textContent = isLeader ? '⚑' : `×${count}`;

    div.appendChild(img);
    div.appendChild(badge);
    div.appendChild(countBadge);

    if (!maxed) {
      div.addEventListener('click', () => addToDeck(card));
    }

    deckAllCards.appendChild(div);
  });
}

// Deck persistence
function saveDeck() { saveToStorage('op-deck', deck); }
function loadDeck() { deck = loadFromStorage('op-deck', { leader: null, cards: {} }); }

// Deck export
exportDeckBtn.addEventListener('click', () => {
  const lines = [];
  if (deck.leader) lines.push(`[Leader] ${deck.leader.name} (${deck.leader.id})`);
  Object.entries(deck.cards).forEach(([id, count]) => {
    const card = allCards.find(c => c.id === id);
    if (card) lines.push(`${count}x ${card.name} (${id})`);
  });
  if (lines.length === 0) { showToast('Deck is empty'); return; }
  const total = getTotalDeckCards();
  lines.unshift(`=== ONE PIECE DECK (${total}/50) ===`);
  navigator.clipboard.writeText(lines.join('\n'))
    .then(() => showToast('📋 Deck list copied to clipboard!'))
    .catch(() => showToast('Copy failed — try manually'));
});

clearDeckBtn.addEventListener('click', () => {
  if (!confirm('Clear your entire deck?')) return;
  deck = { leader: null, cards: {} };
  saveDeck();
  renderDeck();
  renderDeckPicker();
  renderCards(filtered);
  showToast('Deck cleared');
});

// Deck tab search
deckSearchInput.addEventListener('input', () => {
  deckSearch = deckSearchInput.value.trim();
  renderDeckPicker();
});

// ================================================================
//  MY COLLECTION
// ================================================================
function toggleOwned(card) {
  if (collection[card.id]) {
    delete collection[card.id];
    showToast(`♡ ${card.name} removed from collection`);
  } else {
    collection[card.id] = 1;
    showToast(`♥ ${card.name} added to collection`);
  }
  saveCollection();
  updateCollectionBadge();
  renderCollectionView();
  renderCards(filtered);
}

function setOwnedQty(cardId, qty) {
  if (qty <= 0) delete collection[cardId];
  else collection[cardId] = qty;
  saveCollection();
  updateCollectionBadge();
}

function updateCollectionBadge() {
  const total = Object.keys(collection).length;
  collectionBadge.textContent = total;
  collectionSubtitle.textContent = `${total} card${total !== 1 ? 's' : ''} owned`;
}

function renderCollectionView() {
  const ownedIds = Object.keys(collection);
  collectionGrid.innerHTML = '';

  if (ownedIds.length === 0) {
    collectionEmpty.classList.remove('hidden');
    collectionGrid.appendChild(collectionEmpty);
    return;
  }
  collectionEmpty.classList.add('hidden');

  ownedIds.forEach((id, i) => {
    const card = allCards.find(c => c.id === id);
    if (!card) return;
    const qty = collection[id] || 1;

    const wrapper = document.createElement('div');
    wrapper.className = 'card-item collection-card-item';
    wrapper.setAttribute('data-color', card.Color);
    wrapper.style.animationDelay = `${Math.min(i * 35, 400)}ms`;

    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.loading = 'lazy';
    img.addEventListener('click', () => {
      // Open in modal against a temp filtered array
      const tempFiltered = filtered.length ? filtered : allCards;
      const idx = tempFiltered.findIndex(c => c.id === id);
      if (idx !== -1) { filtered = tempFiltered; openModal(idx); }
    });

    const rarBadge = document.createElement('span');
    rarBadge.className = `rarity-badge rarity-badge--${card.rarity}`;
    rarBadge.textContent = card.rarity;

    // Quantity controls
    const qtyBadge = document.createElement('div');
    qtyBadge.className = 'collection-qty-badge';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', e => {
      e.stopPropagation();
      setOwnedQty(id, qty - 1);
      renderCollectionView();
    });

    const qtyVal = document.createElement('span');
    qtyVal.className = 'qty-value';
    qtyVal.textContent = qty;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', e => {
      e.stopPropagation();
      setOwnedQty(id, qty + 1);
      renderCollectionView();
    });

    qtyBadge.appendChild(minusBtn);
    qtyBadge.appendChild(qtyVal);
    qtyBadge.appendChild(plusBtn);

    wrapper.appendChild(img);
    wrapper.appendChild(rarBadge);
    wrapper.appendChild(qtyBadge);
    collectionGrid.appendChild(wrapper);
  });
}

function saveCollection() { saveToStorage('op-collection', collection); }

clearCollectionBtn.addEventListener('click', () => {
  if (!confirm('Clear your entire collection?')) return;
  collection = {};
  saveCollection();
  updateCollectionBadge();
  renderCollectionView();
  renderCards(filtered);
  showToast('Collection cleared');
});

// ================================================================
//  FILTER CONTROLS
// ================================================================
function initPillGroup(groupId, stateKey) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state[stateKey] = pill.dataset.value;
    applyFilters();
  });
}

initPillGroup('colorFilter', 'color');
initPillGroup('typeFilter', 'cardType');
initPillGroup('rarityFilter', 'rarity');
initPillGroup('setFilter', 'set');

crewSelect.addEventListener('change', () => {
  state.crew = crewSelect.value;
  applyFilters();
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value.trim();
  searchClear.classList.toggle('hidden', !state.search);
  applyFilters();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  state.search = '';
  searchClear.classList.add('hidden');
  searchInput.focus();
  applyFilters();
});

sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; applyFilters(); });

// Range sliders
function updateRangeLabels() {
  costLabel.textContent = `${state.costMin} – ${state.costMax}`;
  powerLabel.textContent = `${state.powerMin.toLocaleString()} – ${state.powerMax.toLocaleString()}`;
}

costMin.addEventListener('input', () => {
  state.costMin = parseInt(costMin.value);
  if (state.costMin > state.costMax) { state.costMax = state.costMin; costMax.value = state.costMin; }
  updateRangeLabels();
  applyFilters();
});
costMax.addEventListener('input', () => {
  state.costMax = parseInt(costMax.value);
  if (state.costMax < state.costMin) { state.costMin = state.costMax; costMin.value = state.costMax; }
  updateRangeLabels();
  applyFilters();
});
powerMin.addEventListener('input', () => {
  state.powerMin = parseInt(powerMin.value);
  if (state.powerMin > state.powerMax) { state.powerMax = state.powerMin; powerMax.value = state.powerMin; }
  updateRangeLabels();
  applyFilters();
});
powerMax.addEventListener('input', () => {
  state.powerMax = parseInt(powerMax.value);
  if (state.powerMax < state.powerMin) { state.powerMin = state.powerMax; powerMin.value = state.powerMax; }
  updateRangeLabels();
  applyFilters();
});

function resetAllFilters() {
  Object.assign(state, { color: 'All', cardType: 'All', rarity: 'All', set: 'All', crew: 'All', search: '', sort: 'default', costMin: 0, costMax: 10, powerMin: 0, powerMax: 13000 });
  searchInput.value = '';
  searchClear.classList.add('hidden');
  sortSelect.value = 'default';
  crewSelect.value = 'All';
  costMin.value = 0; costMax.value = 10;
  powerMin.value = 0; powerMax.value = 13000;
  updateRangeLabels();
  ['colorFilter', 'typeFilter', 'rarityFilter', 'setFilter'].forEach(id => {
    const g = document.getElementById(id);
    if (!g) return;
    g.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    g.querySelector('.pill--all').classList.add('active');
  });
  applyFilters();
}

resetBtn.addEventListener('click', resetAllFilters);
emptyReset.addEventListener('click', resetAllFilters);
filterToggle.addEventListener('click', () => filterPanel.classList.toggle('mobile-open'));

// ================================================================
//  TABS
// ================================================================
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(`panel-${tab}`).classList.remove('hidden');

    if (tab === 'collection') {
      renderCollectionView();
    }
    if (tab === 'deck') {
      renderDeckPicker();
      renderDeck();
    }
  });
});

// ================================================================
//  THEME TOGGLE
// ================================================================
const html = document.documentElement;
const savedTheme = localStorage.getItem('op-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const cur = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('op-theme', next);
});

// ================================================================
//  VIEW TOGGLE
// ================================================================
if (localStorage.getItem('op-view') === 'list') document.body.classList.add('list-view');

viewToggle.addEventListener('click', () => {
  const isList = document.body.classList.toggle('list-view');
  localStorage.setItem('op-view', isList ? 'list' : 'grid');
  // Force re-render so list meta elements are shown
  renderCards(filtered);
});

// ================================================================
//  SCROLL TO TOP
// ================================================================
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ================================================================
//  TOAST
// ================================================================
let toastTimer;
function showToast(msg, duration = 2200) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

// ================================================================
//  localStorage HELPERS
// ================================================================
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('Storage error', e); }
}

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) { return fallback; }
}
