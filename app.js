const CATALOG_URL = 'data/catalog.json';

let catalog = [];
let filteredCatalog = [];

let searchInput;
let topicFilter;
let datasetList;
let datasetDetail;

document.addEventListener('DOMContentLoaded', () => {
  searchInput = document.getElementById('searchInput');
  topicFilter = document.getElementById('topicFilter');
  datasetList = document.getElementById('datasetList');
  datasetDetail = document.getElementById('datasetDetail');

  searchInput.addEventListener('input', applyFilters);
  topicFilter.addEventListener('change', applyFilters);

  loadCatalog();
});

async function loadCatalog() {
  try {
    const res = await fetch(CATALOG_URL);

    if (!res.ok) {
      console.error('Failed to fetch catalog.json', res.status, res.statusText);
      datasetList.innerHTML = `<p>Error loading catalog (HTTP ${res.status}).</p>`;
      return;
    }

    const raw = await res.json();
    console.log('Raw catalog JSON:', raw);

    // Expect an array at the top level
    if (!Array.isArray(raw)) {
      console.error('catalog.json is not an array');
      datasetList.innerHTML =
        '<p>catalog.json is not an array. It should be like [ { ...dataset... }, ... ].</p>';
      return;
    }

    catalog = raw;
    filteredCatalog = catalog;

    populateTopicFilter();
    renderList();
  } catch (err) {
    console.error('Error loading catalog', err);
    datasetList.innerHTML = '<p>Error loading catalog (check console for details).</p>';
  }
}

function populateTopicFilter() {
  const topics = new Set();
  catalog.forEach(d => (d.topics || []).forEach(t => topics.add(t)));
  topics.forEach(topic => {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    topicFilter.appendChild(opt);
  });
}

function renderList() {
  datasetList.innerHTML = '';
  filteredCatalog.forEach(d => {
    const card = document.createElement('div');
    card.className = 'dataset-card';
    card.innerHTML = `
      <strong>${d.title}</strong>
      <div>${d.description || ''}</div>
      <div style="font-size: 0.85em; color: #555;">
        Topics: ${(d.topics || []).join(', ') || 'None'}
      </div>
    `;
    card.addEventListener('click', () => showDetail(d));
    datasetList.appendChild(card);
  });
}

function applyFilters() {
  const q = (searchInput.value || '').toLowerCase();
  const topic = topicFilter.value;

  filteredCatalog = catalog.filter(d => {
    const text = [
      d.title,
      d.description,
      ...(d.keywords || []),
      ...(d.topics || [])
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !q || text.includes(q);
    const matchesTopic = !topic || (d.topics || []).includes(topic);

    return matchesSearch && matchesTopic;
  });

  renderList();
  datasetDetail.classList.add('hidden');
}

function showDetail(d) {
  datasetDetail.classList.remove('hidden');
  datasetDetail.innerHTML = `
    <h2>${d.title}</h2>
    <p>${d.description || ''}</p>

    <h3>Details</h3>
    <ul>
      <li><strong>ID:</strong> ${d.id}</li>
      <li><strong>Owner:</strong> ${d.owner || '—'}</li>
      <li><strong>Topics:</strong> ${(d.topics || []).join(', ') || '—'}</li>
      <li><strong>Keywords:</strong> ${(d.keywords || []).join(', ') || '—'}</li>
      <li><strong>Status:</strong> ${d.status || '—'}</li>
      <li><strong>Last updated:</strong> ${d.last_updated || '—'}</li>
    </ul>
  `;
}
