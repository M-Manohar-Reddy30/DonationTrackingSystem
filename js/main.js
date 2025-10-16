/* js/main.js
   Pro consolidated app logic for Charity Analytics dashboard:
   - LocalStorage keys: 'cc_donors', 'cc_recipients', 'cc_donations'
   - Seed demo data when empty
   - Exposes window.CC API for other pages
   - Renders charts, counters, recent list, top donors
   - Designed for production front-end; backend integration later is trivial
*/

(() => {
  const K = {
    DONORS: 'cc_donors',
    RECIPIENTS: 'cc_recipients',
    DONATIONS: 'cc_donations'
  };

  // helpers
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2,9);
  const read = (k) => JSON.parse(localStorage.getItem(k) || '[]');
  const write = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const currencyFmt = (n) => {
    if (isNaN(Number(n))) return n;
    return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  // seed demo data if empty (safe to remove when using real backend)
  function seed() {
    if (!read(K.DONORS).length) {
      write(K.DONORS, [
        { id: uid(), name: 'Asha Sharma', email:'asha@example.com', phone:'9000000001' },
        { id: uid(), name: 'Rohit Kumar', email:'rohit@example.com', phone:'9000000002' },
        { id: uid(), name: 'Meera Patel', email:'meera@example.com', phone:'9000000003' }
      ]);
    }
    if (!read(K.RECIPIENTS).length) {
      write(K.RECIPIENTS, [
        { id: uid(), name: 'Child Education', need:'Education' },
        { id: uid(), name: 'Winter Relief', need:'Food' },
        { id: uid(), name: 'Medical Aid', need:'Health' }
      ]);
    }
    if (!read(K.DONATIONS).length) {
      const donors = read(K.DONORS);
      const recipients = read(K.RECIPIENTS);
      write(K.DONATIONS, [
        { id: uid(), donorId: donors[0].id, donorName: donors[0].name, recipientId: recipients[0].id, recipientName: recipients[0].name, amount: 5000, date: new Date().toISOString().slice(0,10) },
        { id: uid(), donorId: donors[1].id, donorName: donors[1].name, recipientId: recipients[1].id, recipientName: recipients[1].name, amount: 2500, date: new Date().toISOString().slice(0,10) },
        { id: uid(), donorId: donors[2].id, donorName: donors[2].name, recipientId: recipients[2].id, recipientName: recipients[2].name, amount: 4000, date: new Date().toISOString().slice(0,10) }
      ]);
    }
  }

  // CRUD
  function getDonors(){ return read(K.DONORS); }
  function getRecipients(){ return read(K.RECIPIENTS); }
  function getDonations(){ return read(K.DONATIONS); }

  function saveDonors(list){ write(K.DONORS, list); refresh(); }
  function saveRecipients(list){ write(K.RECIPIENTS, list); refresh(); }
  function saveDonations(list){ write(K.DONATIONS, list); refresh(); }

  function addDonor({name,email,phone}) {
    const list = getDonors();
    if (list.some(d=>d.email === email)) return { ok:false, msg:'Donor with this email exists' };
    const newD = { id: uid(), name, email, phone, createdAt: new Date().toISOString() };
    list.push(newD); saveDonors(list);
    return { ok:true, donor:newD };
  }
  function addRecipient({name,need,contact}) {
    const list = getRecipients();
    const newR = { id: uid(), name, need, contact, createdAt: new Date().toISOString() };
    list.push(newR); saveRecipients(list);
    return { ok:true, recipient:newR };
  }
  function addDonation({donorId,recipientId,amount,date}) {
    const donors = getDonors();
    const recipients = getRecipients();
    const donor = donors.find(d=>d.id===donorId) || { id:donorId, name: donorId };
    const recipient = recipients.find(r=>r.id===recipientId) || { id:recipientId, name: recipientId };
    const list = getDonations();
    const d = { id: uid(), donorId: donor.id, donorName: donor.name, recipientId: recipient.id, recipientName: recipient.name, amount: Number(amount)||0, date: date || new Date().toISOString().slice(0,10), createdAt: new Date().toISOString() };
    list.push(d);
    saveDonations(list);
    return { ok:true, donation:d };
  }

  function deleteDonor(id){ const list = getDonors().filter(x=>x.id!==id); saveDonors(list); }
  function deleteRecipient(id){ const list = getRecipients().filter(x=>x.id!==id); saveRecipients(list); }
  function deleteDonation(id){ const list = getDonations().filter(x=>x.id!==id); saveDonations(list); }

  // UI helpers
  function animateCounter(el, target, duration=700) {
    if (!el) return;
    const start = Number(el.innerText.replace(/\D/g,'')) || 0;
    const end = Number(target);
    const range = end - start;
    const startTime = performance.now();
    function step(now){
      const t = Math.min((now - startTime) / duration, 1);
      const val = Math.floor(start + (range * t));
      if (el.dataset.currency === 'true') el.innerText = currencyFmt(val);
      else el.innerText = val;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function currencyFmt(n){ return Number(n).toLocaleString('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }); }

  // Chart rendering
  let donorChart = null;
  function renderDonorChart() {
    const ctx = document.getElementById('donationByDonor');
    if (!ctx) return;
    const donors = getDonors();
    const labels = donors.map(d=>d.name);
    const data = donors.map(d => getDonations().filter(x=>x.donorId === d.id).reduce((s,x)=>s + Number(x.amount||0),0));
    const ChartLib = window.Chart;
    if (!ChartLib) return; // Chart.js not loaded
    if (donorChart) donorChart.destroy();
    donorChart = new ChartLib(ctx.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Donations (₹)', data, backgroundColor: 'rgba(14,165,255,0.9)', borderRadius:6 }] },
      options: { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
    });
  }

  // recent table
  function renderRecent() {
    const tbody = document.getElementById('recentTbody');
    if (!tbody) return;
    const donations = getDonations().slice(-8).reverse();
    tbody.innerHTML = '';
    if (!donations.length) {
      tbody.innerHTML = `<tr><td class="py-2 px-1 text-slate-500" colspan="4">No donations yet</td></tr>`;
      return;
    }
    donations.forEach(d => {
      const tr = document.createElement('tr');
      tr.className = 'border-b';
      tr.innerHTML = `<td class="py-2 text-sm">${escapeHtml(d.donorName)}</td>
                      <td class="py-2 text-sm">${escapeHtml(d.recipientName)}</td>
                      <td class="py-2 text-sm font-semibold">${currencyFmt(d.amount)}</td>
                      <td class="py-2 text-sm">${escapeHtml(d.date)}</td>`;
      tbody.appendChild(tr);
    });
  }

  // top donors list
  function renderTopDonors() {
    const wrap = document.getElementById('topDonors');
    if (!wrap) return;
    const donors = getDonors();
    const totals = donors.map(d => {
      const sum = getDonations().filter(x=>x.donorId===d.id).reduce((s,x)=>s + Number(x.amount||0),0);
      return { id:d.id, name:d.name, total:sum };
    }).sort((a,b)=>b.total - a.total).slice(0,6);
    wrap.innerHTML = '';
    totals.forEach(t => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between py-2 border-b';
      li.innerHTML = `<div class="text-sm font-medium">${escapeHtml(t.name)}</div><div class="text-sm font-semibold">${currencyFmt(t.total)}</div>`;
      wrap.appendChild(li);
    });
    if (!totals.length) wrap.innerHTML = `<div class="text-sm text-slate-500">No donors yet</div>`;
  }

  // escape helper to prevent injection in innerHTML usage
  function escapeHtml(s){ if (s === undefined || s === null) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }

  // update all UI pieces
  function refresh() {
    const donors = getDonors().length;
    const recipients = getRecipients().length;
    const donations = getDonations();
    const totalAmount = donations.reduce((s,d)=>s + (Number(d.amount)||0), 0);

    const elDonors = document.getElementById('totalDonors');
    const elRecipients = document.getElementById('totalRecipients');
    const elDonations = document.getElementById('totalDonations');

    if (elDonors) animateCounter(elDonors, donors);
    if (elRecipients) animateCounter(elRecipients, recipients);
    if (elDonations) {
      elDonations.dataset.currency = 'true';
      elDonations.innerText = currencyFmt(totalAmount);
    }

    renderRecent();
    renderTopDonors();
    renderDonorChart();
  }

  // public API
  window.CC = {
    getDonors, getRecipients, getDonations,
    addDonor, addRecipient, addDonation,
    deleteDonor, deleteRecipient, deleteDonation,
    refresh, currencyFmt
  };

  // auto init
  document.addEventListener('DOMContentLoaded', () => {
    seed();
    refresh();
    window.addEventListener('storage', () => refresh());
  });
})();
