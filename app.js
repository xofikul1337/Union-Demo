const taxpayers = [
  { holding: '০১-১০১', name: 'মোঃ রহিম উদ্দিন', father: 'মোঃ করিম উদ্দিন', ward: '১', mobile: '01711111111', currentTax: 500, arrears: 200, address: 'উত্তর পাড়া, ওয়ার্ড ১' },
  { holding: '০১-১০২', name: 'মোঃ করিম মিয়া', father: 'মোঃ আলী আকবর', ward: '১', mobile: '01722222222', currentTax: 600, arrears: 0, address: 'বাজারপাড়া, ওয়ার্ড ১' },
  { holding: '০২-২০১', name: 'মোছাঃ আয়েশা খাতুন', father: 'মোঃ আবদুল জলিল', ward: '২', mobile: '01733333333', currentTax: 450, arrears: 150, address: 'দক্ষিণ পাড়া, ওয়ার্ড ২' },
  { holding: '০৩-৩০১', name: 'মোঃ জাহাঙ্গীর আলম', father: 'মোঃ হাসান আলী', ward: '৩', mobile: '01744444444', currentTax: 700, arrears: 300, address: 'মধ্যপাড়া, ওয়ার্ড ৩' },
  { holding: '০৪-৪০১', name: 'মোঃ সেলিম রেজা', father: 'মোঃ আবদুস সালাম', ward: '৪', mobile: '01755555555', currentTax: 550, arrears: 0, address: 'পশ্চিম পাড়া, ওয়ার্ড ৪' },
  { holding: '০৫-৫০১', name: 'মোছাঃ ফাতেমা বেগম', father: 'মোঃ মোক্তার হোসেন', ward: '৫', mobile: '01766666666', currentTax: 480, arrears: 220, address: 'কলেজ রোড, ওয়ার্ড ৫' },
  { holding: '০৬-৬০১', name: 'মোঃ মিজানুর রহমান', father: 'মোঃ হারুন অর রশিদ', ward: '৬', mobile: '01777777777', currentTax: 650, arrears: 100, address: 'স্টেশন রোড, ওয়ার্ড ৬' },
  { holding: '০৭-৭০১', name: 'মোঃ আব্দুল্লাহ আল মামুন', father: 'মোঃ আজিজুল হক', ward: '৭', mobile: '01788888888', currentTax: 520, arrears: 80, address: 'স্কুলপাড়া, ওয়ার্ড ৭' },
  { holding: '০৮-৮০১', name: 'মোছাঃ শারমিন আক্তার', father: 'মোঃ রফিকুল ইসলাম', ward: '৮', mobile: '01799999999', currentTax: 430, arrears: 170, address: 'হাটখোলা, ওয়ার্ড ৮' },
  { holding: '০৯-৯০১', name: 'মোঃ নাসির উদ্দিন', father: 'মোঃ ওয়াজেদ আলী', ward: '৯', mobile: '01611111111', currentTax: 750, arrears: 250, address: 'পূর্ব পাড়া, ওয়ার্ড ৯' }
];

const bn = new Intl.NumberFormat('bn-BD');
const sectionTitles = {
  home: 'ডেমো পরিচিতি',
  citizen: 'নাগরিক কর খুঁজুন',
  payment: 'পেমেন্ট ডেমো',
  receipt: 'ডিজিটাল রসিদ',
  admin: 'অফিস রিপোর্ট',
  proposal: 'প্রস্তাবনা'
};

let selectedTaxpayer = null;
let selectedMethod = 'bKash';
let payments = JSON.parse(localStorage.getItem('up_demo_payments') || '{}');
let lastReceipt = JSON.parse(localStorage.getItem('up_demo_last_receipt') || 'null');

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const total = (person) => person.currentTax + person.arrears;
const taka = (amount) => `৳ ${bn.format(amount)}`;
const todayText = () => new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });

function normalizeBanglaDigits(text = '') {
  const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  return String(text).replace(/[০-৯]/g, d => map[d]);
}

function switchSection(sectionId) {
  $$('.section').forEach(section => section.classList.remove('active-section'));
  $(`#${sectionId}`).classList.add('active-section');
  $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.section === sectionId));
  $('#sectionTitle').textContent = sectionTitles[sectionId] || 'ডেমো';
  if (sectionId === 'payment') renderPaymentContext();
  if (sectionId === 'receipt') renderReceipt();
  if (sectionId === 'admin') renderAdmin();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function findTaxpayer(query) {
  const q = normalizeBanglaDigits(query.trim()).toLowerCase();
  if (!q) return null;
  return taxpayers.find(person => {
    const holding = normalizeBanglaDigits(person.holding).toLowerCase();
    const mobile = normalizeBanglaDigits(person.mobile).toLowerCase();
    const name = person.name.toLowerCase();
    const father = person.father.toLowerCase();
    return holding.includes(q) || mobile.includes(q) || name.includes(query.trim().toLowerCase()) || father.includes(query.trim().toLowerCase());
  });
}

function isPaid(person) {
  return Boolean(payments[person.holding]);
}

function renderQuickSamples() {
  const container = $('#quickSamples');
  container.innerHTML = taxpayers.slice(0, 5).map(person => `<button class="sample-btn" data-holding="${person.holding}">${person.holding}</button>`).join('');
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      $('#searchInput').value = btn.dataset.holding;
      searchAndRender();
    });
  });
}

function searchAndRender() {
  const person = findTaxpayer($('#searchInput').value);
  const result = $('#citizenResult');
  const hint = $('#searchHint');
  if (!person) {
    result.classList.add('hidden');
    hint.classList.remove('hidden');
    hint.innerHTML = `<strong>তথ্য পাওয়া যায়নি</strong><span>ডেমোর জন্য ০১-১০১ বা ০২-২০১ লিখে চেষ্টা করুন।</span>`;
    return;
  }
  selectedTaxpayer = person;
  localStorage.setItem('up_demo_selected_holding', person.holding);
  hint.classList.add('hidden');
  const paid = isPaid(person);
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="tax-card-head">
      <div>
        <h4>${person.name}</h4>
        <p>পিতা: ${person.father} • ${person.address}</p>
      </div>
      <span class="pill ${paid ? 'paid' : 'due'}">${paid ? 'পরিশোধিত' : 'বকেয়া আছে'}</span>
    </div>
    <div class="tax-grid">
      <div class="tax-item"><span>হোল্ডিং নম্বর</span><strong>${person.holding}</strong></div>
      <div class="tax-item"><span>ওয়ার্ড</span><strong>${person.ward}</strong></div>
      <div class="tax-item"><span>মোবাইল</span><strong>${person.mobile}</strong></div>
      <div class="tax-item"><span>বর্তমান কর</span><strong>${taka(person.currentTax)}</strong></div>
      <div class="tax-item"><span>পূর্বের বকেয়া</span><strong>${taka(person.arrears)}</strong></div>
      <div class="tax-item"><span>অর্থবছর</span><strong>২০২৫-২৬</strong></div>
    </div>
    <div class="tax-total">
      <span>মোট পরিশোধযোগ্য</span>
      <strong>${paid ? 'পরিশোধ সম্পন্ন' : taka(total(person))}</strong>
    </div>
    <div class="tax-actions">
      <button class="primary-btn" id="goPayment">পেমেন্ট করুন</button>
      <button class="ghost-btn" id="showReceiptFromCitizen">রসিদ দেখুন</button>
    </div>
  `;
  $('#goPayment').addEventListener('click', () => switchSection('payment'));
  $('#showReceiptFromCitizen').addEventListener('click', () => switchSection('receipt'));
}

function getSelectedTaxpayer() {
  if (selectedTaxpayer) return selectedTaxpayer;
  const savedHolding = localStorage.getItem('up_demo_selected_holding') || '০১-১০১';
  selectedTaxpayer = taxpayers.find(person => person.holding === savedHolding) || taxpayers[0];
  return selectedTaxpayer;
}

function renderPaymentContext() {
  const person = getSelectedTaxpayer();
  const paid = isPaid(person);
  $('#paymentContext').innerHTML = `
    <div class="payment-summary">
      <div><span>করদাতা</span><strong>${person.name}</strong></div>
      <div><span>হোল্ডিং</span><strong>${person.holding}</strong></div>
      <div><span>${paid ? 'স্ট্যাটাস' : 'মোট পরিশোধযোগ্য'}</span><strong>${paid ? 'পরিশোধিত' : taka(total(person))}</strong></div>
    </div>
  `;
}

function makeReceipt(person, method) {
  const receiptNo = `UP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const receipt = {
    receiptNo,
    holding: person.holding,
    name: person.name,
    ward: person.ward,
    amount: total(person),
    method,
    date: todayText(),
    status: 'সফল'
  };
  payments[person.holding] = receipt;
  lastReceipt = receipt;
  localStorage.setItem('up_demo_payments', JSON.stringify(payments));
  localStorage.setItem('up_demo_last_receipt', JSON.stringify(lastReceipt));
  return receipt;
}

function pay(method) {
  selectedMethod = method;
  const person = getSelectedTaxpayer();
  const receipt = makeReceipt(person, method);
  $('#modalText').textContent = `${person.name} — ${taka(receipt.amount)} ${method} ডেমো পেমেন্ট সম্পন্ন হয়েছে।`;
  $('#paymentModal').classList.remove('hidden');
  renderPaymentContext();
}

function renderReceipt() {
  const fallbackPerson = getSelectedTaxpayer();
  const receipt = lastReceipt || payments[fallbackPerson.holding] || {
    receiptNo: 'UP-2026-DEMO',
    holding: fallbackPerson.holding,
    name: fallbackPerson.name,
    ward: fallbackPerson.ward,
    amount: total(fallbackPerson),
    method: 'Demo',
    date: todayText(),
    status: 'নমুনা'
  };
  $('#receiptArea').innerHTML = `
    <div class="receipt-top">
      <p>ইউনিয়ন পরিষদ অনলাইন কর আদায়</p>
      <h4>ডিজিটাল রসিদ</h4>
      <p>Assessment Tax Payment Receipt</p>
    </div>
    <div class="receipt-body">
      <div class="receipt-row"><span>রসিদ নম্বর</span><strong>${receipt.receiptNo}</strong></div>
      <div class="receipt-row"><span>করদাতার নাম</span><strong>${receipt.name}</strong></div>
      <div class="receipt-row"><span>হোল্ডিং নম্বর</span><strong>${receipt.holding}</strong></div>
      <div class="receipt-row"><span>ওয়ার্ড</span><strong>${receipt.ward}</strong></div>
      <div class="receipt-row"><span>পরিশোধের পরিমাণ</span><strong>${taka(receipt.amount)}</strong></div>
      <div class="receipt-row"><span>পেমেন্ট মাধ্যম</span><strong>${receipt.method}</strong></div>
      <div class="receipt-row"><span>তারিখ</span><strong>${receipt.date}</strong></div>
      <div class="receipt-row"><span>স্ট্যাটাস</span><strong>${receipt.status}</strong></div>
      <div class="fake-qr" aria-label="নমুনা QR"></div>
      <p class="receipt-note">এটি demo receipt. বাস্তব সিস্টেমে যাচাইযোগ্য রসিদ নম্বর/QR থাকবে।</p>
    </div>
  `;
}

function renderAdmin() {
  const wardFilter = $('#wardFilter').value || 'all';
  const statusFilter = $('#statusFilter').value || 'all';
  const filtered = taxpayers.filter(person => {
    const wardOk = wardFilter === 'all' || person.ward === wardFilter;
    const status = isPaid(person) ? 'paid' : 'due';
    const statusOk = statusFilter === 'all' || status === statusFilter;
    return wardOk && statusOk;
  });
  const collected = taxpayers.filter(isPaid).reduce((sum, person) => sum + total(person), 0);
  const dueAmount = taxpayers.filter(person => !isPaid(person)).reduce((sum, person) => sum + total(person), 0);
  const paidCount = taxpayers.filter(isPaid).length;
  $('#statsGrid').innerHTML = `
    <div class="stat-card"><span>মোট করদাতা</span><strong>${bn.format(taxpayers.length)} জন</strong></div>
    <div class="stat-card"><span>আদায় হয়েছে</span><strong>${taka(collected)}</strong></div>
    <div class="stat-card"><span>পরিশোধ করেছে</span><strong>${bn.format(paidCount)} জন</strong></div>
    <div class="stat-card"><span>বকেয়া আছে</span><strong>${taka(dueAmount)}</strong></div>
  `;
  $('#taxpayerTable').innerHTML = filtered.map(person => `
    <tr>
      <td>${person.holding}</td>
      <td>${person.name}</td>
      <td>${person.ward}</td>
      <td>${person.mobile}</td>
      <td>${taka(total(person))}</td>
      <td><span class="status ${isPaid(person) ? 'paid' : 'due'}">${isPaid(person) ? 'পরিশোধিত' : 'বকেয়া'}</span></td>
    </tr>
  `).join('') || `<tr><td colspan="6">কোনো তথ্য পাওয়া যায়নি</td></tr>`;

  renderWardBars();
}

function setupWardFilter() {
  const wards = [...new Set(taxpayers.map(person => person.ward))].sort((a, b) => Number(normalizeBanglaDigits(a)) - Number(normalizeBanglaDigits(b)));
  $('#wardFilter').innerHTML = `<option value="all">সব ওয়ার্ড</option>` + wards.map(ward => `<option value="${ward}">ওয়ার্ড ${ward}</option>`).join('');
}

function renderWardBars() {
  const wards = [...new Set(taxpayers.map(person => person.ward))].sort((a, b) => Number(normalizeBanglaDigits(a)) - Number(normalizeBanglaDigits(b)));
  $('#wardBars').innerHTML = wards.map(ward => {
    const wardPeople = taxpayers.filter(person => person.ward === ward);
    const wardTotal = wardPeople.reduce((sum, person) => sum + total(person), 0);
    const wardCollected = wardPeople.filter(isPaid).reduce((sum, person) => sum + total(person), 0);
    const percent = wardTotal ? Math.round((wardCollected / wardTotal) * 100) : 0;
    return `
      <div class="bar-row">
        <span>ওয়ার্ড ${ward}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${percent}%"></div></div>
        <strong>${percent}% আদায়</strong>
      </div>
    `;
  }).join('');
}

function exportCsv() {
  const rows = [['Holding','Name','Ward','Mobile','Total Tax','Status']];
  taxpayers.forEach(person => rows.push([person.holding, person.name, person.ward, person.mobile, total(person), isPaid(person) ? 'Paid' : 'Due']));
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'union-tax-demo-report.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadReceiptText() {
  const receipt = lastReceipt || payments[getSelectedTaxpayer().holding];
  if (!receipt) {
    alert('আগে একটি ডেমো পেমেন্ট করুন, তারপর রসিদ ডাউনলোড করুন।');
    return;
  }
  const text = `ইউনিয়ন পরিষদ অনলাইন কর আদায় - ডেমো রসিদ\n\nরসিদ নম্বর: ${receipt.receiptNo}\nনাম: ${receipt.name}\nহোল্ডিং: ${receipt.holding}\nওয়ার্ড: ${receipt.ward}\nপরিমাণ: ${taka(receipt.amount)}\nপেমেন্ট মাধ্যম: ${receipt.method}\nতারিখ: ${receipt.date}\nস্ট্যাটাস: ${receipt.status}\n\nএটি একটি demo receipt.`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${receipt.receiptNo}-receipt.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  if (!confirm('ডেমো payment/receipt ডাটা reset করবেন?')) return;
  localStorage.removeItem('up_demo_payments');
  localStorage.removeItem('up_demo_last_receipt');
  localStorage.removeItem('up_demo_selected_holding');
  payments = {};
  lastReceipt = null;
  selectedTaxpayer = taxpayers[0];
  $('#searchInput').value = '';
  $('#citizenResult').classList.add('hidden');
  $('#searchHint').classList.remove('hidden');
  $('#searchHint').innerHTML = `<strong>ডেমোর জন্য sample holding ব্যবহার করুন</strong><span>০১-১০১, ০১-১০২, ০২-২০১, ০৩-৩০১, ০৪-৪০১</span>`;
  renderPaymentContext();
  renderReceipt();
  renderAdmin();
}

function init() {
  selectedTaxpayer = getSelectedTaxpayer();
  renderQuickSamples();
  setupWardFilter();
  renderPaymentContext();
  renderReceipt();
  renderAdmin();

  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchSection(btn.dataset.section)));
  $$('[data-go]').forEach(btn => btn.addEventListener('click', () => {
    $('#presentationOverlay').classList.add('hidden');
    switchSection(btn.dataset.go);
  }));
  $('#searchBtn').addEventListener('click', searchAndRender);
  $('#searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') searchAndRender();
  });
  $$('.pay-card').forEach(btn => btn.addEventListener('click', () => pay(btn.dataset.method)));
  $('#closeModal').addEventListener('click', () => $('#paymentModal').classList.add('hidden'));
  $('#viewReceiptBtn').addEventListener('click', () => {
    $('#paymentModal').classList.add('hidden');
    switchSection('receipt');
  });
  $('#printReceipt').addEventListener('click', () => window.print());
  $('#downloadReceipt').addEventListener('click', downloadReceiptText);
  $('#wardFilter').addEventListener('change', renderAdmin);
  $('#statusFilter').addEventListener('change', renderAdmin);
  $('#exportCsv').addEventListener('click', exportCsv);
  $('#resetDemo').addEventListener('click', resetDemo);
  $('#presentationBtn').addEventListener('click', () => $('#presentationOverlay').classList.remove('hidden'));
  $('#closePresentation').addEventListener('click', () => $('#presentationOverlay').classList.add('hidden'));
}

document.addEventListener('DOMContentLoaded', init);
