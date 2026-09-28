// Everything a release needs to fill in lives here. index.html reads it at load time.
// Entries marked TODO are placeholders; the page shows them in a warning color until replaced.
window.SITE = {
  title: "Beyond the Timeline",
  subtitle: "Augmenting Long-Video Memory with Grounded Entity Biographies",

  // One entry per author. `affil` lists indices into `affiliations`. `equal: true` adds the shared-first-author mark.
  authors: [
    { name: "Hui Ren", url: "https://rhfeiyang.top/", affil: [1] },
    { name: "Lei Fan", url: "https://leifan95.github.io/", affil: [2] },
    { name: "Henry Pao", url: "https://openreview.net/profile?id=~Henry_Pao1", affil: [2] },
    { name: "Han Guo", url: "https://openreview.net/profile?id=~Han_Guo11", affil: [2] },
    { name: "Zeeshan Zia", url: "http://www.zeeshanzia.com/", affil: [2] },
    { name: "Ying Chen", url: "https://openreview.net/profile?id=~Ying_Chen64", affil: [2] },
    { name: "Alexander G. Schwing", url: "https://www.alexander-schwing.de/", affil: [1] },
    { name: "Gang Hua", url: "https://www.ganghua.org/", affil: [2] },
  ],
  affiliations: {
    1: "University of Illinois Urbana-Champaign",
    2: "Amazon",
  },
  equalNote: "Equal contribution",

  links: {
    arxiv: "https://arxiv.org/abs/XXXX.XXXXX",
    code: "https://github.com/rhfeiyang/GEB",
    // Leave empty to hide the button.
    data: "",
  },

  bibtex: `@article{ren2026geb,
  title   = {Beyond the Timeline: Augmenting Long-Video Memory with Grounded Entity Biographies},
  author  = {Ren, Hui and Fan, Lei and Pao, Henry and Guo, Han and Zia, Zeeshan and Chen, Ying and Schwing, Alexander G. and Hua, Gang},
  journal = {arXiv preprint arXiv:XXXX.XXXXX},
  year    = {2026}
}`,
};
