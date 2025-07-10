const storage = chrome.storage.local;

// Preset AWS services with official console logos
const awsServices = [
  { name: "ACM", logo: "./aws-icons/ACM.png" },
  { name: "AWS Batch", logo: "./aws-icons/Batch.png" },
  { name: "Aurora", logo: "./aws-icons/Aurora.png" },
  { name: "CloudWatch", logo: "./aws-icons/CloudWatch.png" },
  { name: "S3", logo: "./aws-icons/S3.png" },
  { name: "Systems Manager", logo: "./aws-icons/SystemsManager.png" },
  { name: "Lambda", logo: "./aws-icons/Lambda.png" },
  { name: "DynamoDB", logo: "./aws-icons/DynamoDB.png" },
  { name: "VPC", logo: "./aws-icons/VPC.png" },
  { name: "EC2", logo: "./aws-icons/EC2.png" },
  { name: "ECS", logo: "./aws-icons/ECS.png" },
  { name: "CloudFront", logo: "./aws-icons/CloudFront.png" },
  { name: "Cognito", logo: "./aws-icons/CloudFront.png" },
  { name: "Route53", logo: "./aws-icons/Route53.png" },
  { name: "CodePipeline", logo: "./aws-icons/CodePipeline.png" },
  { name: "CodeBuild", logo: "./aws-icons/CodeBuild.png" },
  { name: "SQS", logo: "./aws-icons/SQS.png" },
  { name: "SES", logo: "./aws-icons/SES.png" },
  { name: "SNS", logo: "./aws-icons/SNS.png" },
  { name: "WAF", logo: "./aws-icons/WAF.png" },
  { name: "ElastiCache", logo: "./aws-icons/ElastiCache.png" },
  { name: "IAM", logo: "./aws-icons/IAM.png" },
  { name: "Billing and Cost Management", logo: "./aws-icons/Billing.png" },
  { name: "サポートセンター", logo: "./aws-icons/Support.png" },
  { name: "その他", logo: "./aws-icons/AWS.png" }
];

// Preset bookmarks for quick start
const initialBookmarks = [
  { url: 'https://ap-northeast-1.console.aws.amazon.com/console/home', title: 'マネジメントコンソール', service: 'その他' },
];

let customBookmarks = [];
let editingIndex = null;
let editingService = null;

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  populateServiceDropdown();
  updateServiceLogo();
  document.getElementById('bmService').addEventListener('change', updateServiceLogo);

  storage.get(['bookmarks'], data => {
    customBookmarks = data.bookmarks || [];
    renderList();
  });
  document.getElementById('search').addEventListener('input', renderList);
  document.getElementById('search').focus();

  // Toggle bottom section
  const toggleBtn = document.getElementById('toggleBottomBtn');
  const bottom = document.querySelector('.bottom-section');
  toggleBtn.addEventListener('click', () => {
    const expanded = bottom.classList.toggle('expanded');
    toggleBtn.textContent = expanded ? '▲' : '▼';
  });
});

function populateServiceDropdown() {
  const sel = document.getElementById('bmService');
  awsServices.forEach(svc => {
    const opt = document.createElement('option');
    opt.value = svc.name;
    opt.textContent = svc.name;
    sel.appendChild(opt);
  });
}

function updateServiceLogo() {
  const select = document.getElementById('bmService');
  const logo = document.getElementById('serviceLogo');
  const svc = awsServices.find(s => s.name === select.value);
  logo.src = svc ? svc.logo : '';
}

function renderList() {
  const listEl = document.getElementById('list');
  const query = document.getElementById('search').value.toLowerCase();
  listEl.innerHTML = '';

  awsServices.forEach(svc => {
    const presetGroup = initialBookmarks.filter(b =>
      b.service === svc.name &&
      (b.title.toLowerCase().includes(query) ||
       b.url.toLowerCase().includes(query) ||
       svc.name.toLowerCase().includes(query))
    );
    const customGroup = customBookmarks.filter(b =>
      b.service === svc.name &&
      (b.title.toLowerCase().includes(query) ||
       b.url.toLowerCase().includes(query) ||
       svc.name.toLowerCase().includes(query))
    );

    if (presetGroup.length || customGroup.length) {
      const container = document.createElement('div'); container.className = 'service-group';
      // Header
      const header = document.createElement('div'); header.className = 'service-header';
      const img = document.createElement('img'); img.src = svc.logo;
      const span = document.createElement('span'); span.textContent = svc.name;
      header.appendChild(img);
      header.appendChild(span);
      container.appendChild(header);

      presetGroup.forEach(bm => {
        const item = document.createElement('div'); item.className = 'bookmark-item';
        item.innerHTML = `<a href="${bm.url}" target="_blank">${bm.title}</a><span class="preset-label">preset</span>`;
        container.appendChild(item);
      });

      customGroup.forEach((bm, idx) => {
        const item = document.createElement('div'); item.className = 'bookmark-item';
        item.innerHTML = `<a href="${bm.url}" target="_blank">${bm.title}</a><button class="edit-btn" data-svc="${svc.name}" data-idx="${idx}">Edit</button>`;
        container.appendChild(item);
      });

      listEl.appendChild(container);
    }
  });
  attachHandlers();
}

function attachHandlers() {
  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', startEdit));
}

function startEdit(e) {
  const serviceName = e.target.dataset.svc;
  const idx = parseInt(e.target.dataset.idx, 10);
  const bm = customBookmarks.filter(b => b.service === serviceName)[idx];
  editingIndex = customBookmarks.indexOf(bm);
  editingService = serviceName;
  renderEditForm(bm);
}

function renderEditForm(bm) {
  const listEl = document.getElementById('list');
  const form = document.createElement('div'); form.className = 'edit-form';
  form.innerHTML = `<input id="editTitle" type="text" value="${bm.title}" /><input id="editUrl" type="url" value="${bm.url}" /><div class="buttons"><button class="save-btn">Save</button><button class="delete-btn">Delete</button><button class="cancel-btn">Cancel</button></div>`;
  listEl.prepend(form);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.querySelector('#editTitle').focus();

  form.querySelector('.save-btn').addEventListener('click', () => {
    customBookmarks[editingIndex].title = form.querySelector('#editTitle').value;
    customBookmarks[editingIndex].url = form.querySelector('#editUrl').value;
    saveAndRender();
  });
  form.querySelector('.delete-btn').addEventListener('click', () => {
    if (confirm('Delete this bookmark?')) { customBookmarks.splice(editingIndex, 1); saveAndRender(); }
  });
  form.querySelector('.cancel-btn').addEventListener('click', renderList);
}

function saveAndRender() { storage.set({ bookmarks: customBookmarks }, renderList); }

document.getElementById('addBookmarkBtn').addEventListener('click', () => {
  const url = document.getElementById('bmUrl').value;
  const title = document.getElementById('bmTitle').value;
  const service = document.getElementById('bmService').value;
  if (url && title) {
    customBookmarks.push({ url, title, service }); saveAndRender();
    document.getElementById('bmUrl').value = '';
    document.getElementById('bmTitle').value = '';
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify({ bookmarks: customBookmarks }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'aws-bookmarks.json'; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = () => {
    try { customBookmarks = JSON.parse(reader.result).bookmarks || []; saveAndRender(); }
    catch { alert('Invalid JSON file'); }
  };
  reader.readAsText(file);
});

document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (confirm('すべてのカスタムブックマークを削除しますか？')) {
    customBookmarks = [];
    storage.remove('bookmarks', renderList);
  }
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = () => {
    try {
      customBookmarks = JSON.parse(reader.result).bookmarks || [];
      saveAndRender();
      alert('インポートが完了しました。');
    } catch {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
});
