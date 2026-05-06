(() => {
  const defaultPath = '<circle cx="12" cy="12" r="7"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path>';
  const paths = {
    menu: '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    search: '<path d="m21 21-4.3-4.3"></path><circle cx="11" cy="11" r="7"></circle>',
    check: '<path d="m5 12 4 4L19 6"></path>',
    "check-check": '<path d="m3 12 4 4L17 6"></path><path d="m13 12 2 2 6-7"></path>',
    "check-circle": '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>',
    "layout-dashboard": '<rect x="3" y="3" width="7" height="8" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="15" width="7" height="6" rx="1"></rect>',
    "clipboard-list": '<rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M6 4h12v18H6z"></path><path d="M10 11h6"></path><path d="M10 16h6"></path>',
    "shield-check": '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path><path d="m8.5 12 2.5 2.5 5-6"></path>',
    "map-pin": '<path d="M12 21s7-5.5 7-12a7 7 0 0 0-14 0c0 6.5 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.5"></circle>',
    map: '<path d="M4 6 9 4l6 2 5-2v14l-5 2-6-2-5 2z"></path><path d="M9 4v14"></path><path d="M15 6v14"></path>',
    "calendar-days": '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path>',
    "badge-check": '<path d="M12 3 15 6l4 .5-.5 4L21 14l-3.5 2 .5 4-4-.5L12 22l-2-2.5-4 .5.5-4L3 14l2.5-3.5-.5-4L9 6z"></path><path d="m8.5 12 2.5 2.5 5-6"></path>',
    "scan-line": '<path d="M4 7V5h2"></path><path d="M18 5h2v2"></path><path d="M20 17v2h-2"></path><path d="M6 19H4v-2"></path><path d="M7 12h10"></path>',
    "messages-square": '<path d="M4 4h12v9H8l-4 4z"></path><path d="M10 15h6l4 4V8h-2"></path>',
    blocks: '<rect x="3" y="11" width="8" height="8" rx="1"></rect><rect x="13" y="3" width="8" height="8" rx="1"></rect><path d="M11 15h3"></path><path d="M17 11v3"></path>',
    "file-bar-chart": '<path d="M6 3h8l4 4v14H6z"></path><path d="M14 3v5h5"></path><path d="M9 17v-2"></path><path d="M12 17v-5"></path><path d="M15 17v-3"></path>',
    "user-plus": '<circle cx="9" cy="8" r="4"></circle><path d="M3 21a6 6 0 0 1 12 0"></path><path d="M18 8v6"></path><path d="M15 11h6"></path>',
    download: '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v6h6"></path>',
    "wand-2": '<path d="M15 4 20 9"></path><path d="M4 20 20 4"></path><path d="m14 10 4 4"></path>',
    send: '<path d="M22 2 11 13"></path><path d="m22 2-7 20-4-9-9-4z"></path>',
    shuffle: '<path d="M16 3h5v5"></path><path d="M4 20 21 3"></path><path d="M21 16v5h-5"></path><path d="m15 15 6 6"></path><path d="m4 4 5 5"></path>',
    "calendar-plus": '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M3 10h18"></path><path d="M12 14v5"></path><path d="M9.5 16.5h5"></path>',
    "graduation-cap": '<path d="M22 10 12 5 2 10l10 5z"></path><path d="M6 12v5c3 2 9 2 12 0v-5"></path>',
    "package-check": '<path d="M4 7 12 3l8 4v10l-8 4-8-4z"></path><path d="M12 12v9"></path><path d="m9 15 2 2 4-5"></path>',
    save: '<path d="M5 3h12l2 2v16H5z"></path><path d="M8 3v6h8V3"></path><path d="M8 21v-7h8v7"></path>',
    badge: '<rect x="5" y="3" width="14" height="18" rx="2"></rect><circle cx="12" cy="9" r="3"></circle><path d="M8 17h8"></path>',
    satellite: '<path d="M5 12a7 7 0 0 1 7-7"></path><path d="M2 12C2 6.5 6.5 2 12 2"></path><circle cx="15" cy="15" r="4"></circle><path d="m17.8 17.8 3.2 3.2"></path>',
    "ticket-plus": '<path d="M3 8a3 3 0 0 0 0 6v4h18v-4a3 3 0 0 0 0-6V4H3z"></path><path d="M12 8v6"></path><path d="M9 11h6"></path>',
    bot: '<rect x="5" y="7" width="14" height="12" rx="2"></rect><path d="M12 3v4"></path><circle cx="9" cy="13" r="1"></circle><circle cx="15" cy="13" r="1"></circle>',
    plus: defaultPath,
    printer: '<path d="M6 9V3h12v6"></path><rect x="5" y="13" width="14" height="8"></rect><path d="M4 17H2v-6h20v6h-2"></path>',
    award: '<circle cx="12" cy="8" r="5"></circle><path d="m8.5 12-2 8 5.5-3 5.5 3-2-8"></path>',
    hotel: '<path d="M4 21V5h8v16"></path><path d="M12 9h8v12"></path><path d="M7 8h2"></path><path d="M7 12h2"></path><path d="M15 13h2"></path>',
    handshake: '<path d="M8 12 4 16l4 4 4-4"></path><path d="M16 12l4 4-4 4-4-4"></path><path d="M12 16h4"></path><path d="M8 12h8"></path>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="1"></rect><path d="M12 8v13"></path><path d="M3 12h18"></path><path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8"></path><path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8"></path>',
    "credit-card": '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h4"></path>',
    "message-circle": '<path d="M21 11.5a8.5 8.5 0 0 1-12 7.8L3 21l1.7-5.5A8.5 8.5 0 1 1 21 11.5Z"></path>',
    headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"></path><rect x="3" y="14" width="4" height="6" rx="1"></rect><rect x="17" y="14" width="4" height="6" rx="1"></rect>',
    "refresh-cw": '<path d="M3 12a9 9 0 0 1 15-6l3 3"></path><path d="M21 4v5h-5"></path><path d="M21 12a9 9 0 0 1-15 6l-3-3"></path><path d="M3 20v-5h5"></path>'
  };

  window.lucide = {
    createIcons() {
      document.querySelectorAll("i[data-lucide]").forEach((icon) => {
        const name = icon.dataset.lucide;
        icon.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="${name}" aria-hidden="true">${paths[name] || defaultPath}</svg>`;
      });
    }
  };
})();
