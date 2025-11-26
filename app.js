document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    const c = extractContact();

    if (!c.fn && !c.tel && !c.email) {
      alert("Non trovo dati contatto nella pagina.");
      return;
    }

    const vcf = buildVCard(c);
    downloadVcf(vcf, (c.fn || "contatto") + ".vcf");
  });
});

function extractContact() {
  const wrap = document.querySelector(".wrap") || document.body;

  const fn = textOf(wrap.querySelector("h1"));
  const title = textOf(wrap.querySelector("h2"));
  const org = textOf(wrap.querySelector(".mediate-logo h3"));

  const rows = [...wrap.querySelectorAll(".card .row")];

  const map = {};
  rows.forEach(row => {
    const label = textOf(row.querySelector(".label")).toLowerCase();
    const valueEl = row.querySelector(".value");
    let valueText = textOf(valueEl);

    // se c'è un link dentro value, preferisci l'href
    const a = valueEl ? valueEl.querySelector("a") : null;
    if (a && a.getAttribute("href")) {
      valueText = a.getAttribute("href");
    }

    map[label] = valueText;
  });

  const email = cleanMail(map["email"] || "");
  const tel = cleanTel(map["phone"] || "");
  const url = cleanUrl(map["web site"] || "");
  const linkedin = cleanUrl(map["linkedin"] || "");
  const address = (map["address"] || "").trim();

  return { fn, title, org, email, tel, url, linkedin, address };
}

function buildVCard(c) {
  // Ordine: Phone, Email, Address, Web Site, LinkedIn, Job info
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",

    // Nome
    c.fn ? `FN:${escapeVCard(c.fn)}` : "",

    // PHONE (label custom)
    c.tel ? `TEL;TYPE=CELL:${escapeVCard(c.tel)}` : "",
    c.tel ? "X-ABLabel:Phone" : "",

    // EMAIL (label custom)
    c.email ? `EMAIL;TYPE=INTERNET;TYPE=WORK:${escapeVCard(c.email)}` : "",
    c.email ? "X-ABLabel:Email" : "",

    // ADDRESS (label custom)
    c.address ? `ADR;TYPE=WORK:;;${escapeVCard(c.address)};;;;` : "",
    c.address ? "X-ABLabel:Address" : "",

    // WEBSITE (label custom)
    c.url ? `URL;TYPE=WORK:${escapeVCard(c.url)}` : "",
    c.url ? "X-ABLabel:Web Site" : "",

    // LINKEDIN (secondo URL cliccabile + label custom)
    c.linkedin ? `URL;TYPE=WORK:${escapeVCard(c.linkedin)}` : "",
    c.linkedin ? "X-ABLabel:LinkedIn" : "",

    // JOB INFO
    c.title ? `TITLE:${escapeVCard(c.title)}` : "",
    c.org ? `ORG:${escapeVCard(c.org)}` : "",

    "END:VCARD"
  ];

  return lines.filter(Boolean).join("\n");
}



function downloadVcf(text, filename) {
  const blob = new Blob([text], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

// Helpers
function textOf(el) {
  return el ? el.textContent.trim() : "";
}

function cleanTel(tel) {
  if (!tel) return "";
  return tel.replace(/^tel:/i, "").replace(/\s+/g, "").trim();
}

function cleanMail(mail) {
  if (!mail) return "";
  return mail.replace(/^mailto:/i, "").trim();
}

function cleanUrl(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, m => m.toLowerCase()).trim();
}

function escapeVCard(str = "") {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
