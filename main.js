// Fills the masthead, the resource buttons and the BibTeX block from config.js.
(function () {
  const site = window.SITE;
  const isTodo = (s) => typeof s === "string" && /^TODO\b/.test(s.trim());
  const stripTodo = (s) => s.replace(/^TODO\s*/, "");

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (v !== "" && v != null) node.setAttribute(k, v); });
    (children || []).forEach((c) => node.append(c));
    return node;
  };


  const authors = document.getElementById("authors");
  site.authors.forEach((a, i) => {
    const label = stripTodo(a.name) + (a.equal ? "*" : "");
    const name = a.url ? el("a", { href: a.url }, [label]) : el("span", {}, [label]);
    if (isTodo(a.name)) name.classList.add("todo");
    authors.append(name, el("sup", {}, [a.affil.join(",")]));
    if (i < site.authors.length - 1) authors.append(", ");
  });

  const affils = document.getElementById("affils");
  Object.entries(site.affiliations).forEach(([idx, text]) => {
    const span = el("span", {}, [el("sup", {}, [idx]), " " + stripTodo(text)]);
    if (isTodo(text)) span.classList.add("todo");
    affils.append(span);
  });
  if (site.authors.some((a) => a.equal)) {
    affils.append(el("span", {}, ["*" + site.equalNote]));
  }

  const icons = {
    arxiv: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6zM14 3.5V8h4.5M8 12h8v1.5H8zM8 15.5h8V17H8z"/></svg>',
    hf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM8.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3zM7.5 14h9a4.5 4.5 0 0 1-9 0z"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6zm8 1.5V8h4.5M8 11.5h1.8c1.1 0 1.7.6 1.7 1.5s-.6 1.5-1.7 1.5H9.2V17H8zm5 0h1.9c1.6 0 2.6 1 2.6 2.75S17.5 17 15.9 17H13zm1.2 1.1v3.3h.7c.9 0 1.4-.6 1.4-1.65s-.5-1.65-1.4-1.65z"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6 3 12l5.5 6 1.4-1.4L5.8 12l4.1-4.6zM15.5 6l-1.4 1.4 4.1 4.6-4.1 4.6 1.4 1.4L21 12z"/></svg>',
    data: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4.4 0 8 1.3 8 3v12c0 1.7-3.6 3-8 3s-8-1.3-8-3V6c0-1.7 3.6-3 8-3zm6 5.6C16.6 9.4 14.4 9.9 12 9.9S7.4 9.4 6 8.6V12c0 .5 2.3 1.4 6 1.4s6-.9 6-1.4zm0 5C16.6 14.4 14.4 14.9 12 14.9S7.4 14.4 6 13.6V18c0 .5 2.3 1.4 6 1.4s6-.9 6-1.4z"/></svg>',
  };
  const labels = { arxiv: "arXiv", hf: "Hugging Face", pdf: "Paper (PDF)", code: "Code", data: "Artifacts" };
  const links = document.getElementById("links");
  Object.entries(site.links).forEach(([key, url]) => {
    if (!url) return;
    const todo = isTodo(url);
    const a = el("a", {
      class: "btn" + (key === "arxiv" ? " primary" : ""),
      href: todo ? "#" : url,
      target: todo ? null : "_blank",
      rel: todo ? null : "noopener noreferrer",
    });
    a.innerHTML = icons[key] + " " + labels[key];
    if (todo) { a.classList.add("todo-link"); a.title = "Link not set yet: edit config.js"; }
    links.append(a);
  });

  const bib = document.getElementById("bibtex");
  bib.textContent = site.bibtex;
  const copy = document.getElementById("copy-bibtex");
  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(site.bibtex).then(() => {
      copy.textContent = "Copied";
      setTimeout(() => { copy.textContent = "Copy BibTeX"; }, 1600);
    });
  });

})();
