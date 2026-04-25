const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navDropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));

// Paste your deployed Google Apps Script Web App URL here to send
// dealer and project inquiry submissions into Google Sheets.
const KC_FIXIT_GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbx_TKCc7DWiBE0LRcxoBvzFOVA02GW_QsairR3IeKQUSbaxbhorTN0IQew1aWlWIU0qwA/exec";

const closeDropdowns = (activeDropdown = null) => {
  navDropdowns.forEach((dropdown) => {
    const shouldStayOpen = activeDropdown && dropdown === activeDropdown;

    dropdown.classList.toggle("is-open", shouldStayOpen);

    dropdown.querySelectorAll(".nav-dropdown__link, .nav-dropdown__toggle").forEach((control) => {
      control.setAttribute("aria-expanded", String(shouldStayOpen));
    });
  });
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));

    if (!isOpen) {
      closeDropdowns();
    }
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeDropdowns();
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

navDropdowns.forEach((dropdown) => {
  dropdown.querySelectorAll(".nav-dropdown__link, .nav-dropdown__toggle").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const shouldOpen = !dropdown.classList.contains("is-open");
      closeDropdowns(shouldOpen ? dropdown : null);
    });
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-dropdown")) {
    closeDropdowns();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDropdowns();
  }
});

const currentPath = window.location.pathname.split("/").pop() || "index.html";
const navParent = document.body.dataset.navParent;
let navMatched = false;

document.querySelectorAll(".site-nav a[href]").forEach((link) => {
  const href = link.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return;
  }

  if (href === currentPath) {
    link.classList.add("is-current");
    navMatched = true;
  }
});

document.querySelectorAll(".nav-dropdown__menu a.is-current").forEach((link) => {
  const dropdownLink = link.closest(".nav-dropdown")?.querySelector(".nav-dropdown__link");

  if (dropdownLink) {
    dropdownLink.classList.add("is-current");
    navMatched = true;
  }
});

if (!navMatched && (currentPath === "technical.html" || navParent === "technical.html")) {
  const technicalTrigger = document.querySelector(".nav-dropdown__link");

  if (technicalTrigger) {
    technicalTrigger.classList.add("is-current");
    navMatched = true;
  }
}

if (!navMatched && navParent) {
  const parentLink = document.querySelector(`.site-nav a[href="${navParent}"]`);

  if (parentLink) {
    parentLink.classList.add("is-current");
  }
}

const sliderRoot = document.querySelector("[data-slider]");

if (sliderRoot) {
  const tabs = Array.from(sliderRoot.querySelectorAll(".hero-tab"));
  const panels = Array.from(sliderRoot.querySelectorAll(".hero-panel"));
  const panelsTrack = sliderRoot.querySelector(".hero-panels");
  const panelImages = Array.from(sliderRoot.querySelectorAll(".hero-scene"));
  const prevButton = sliderRoot.querySelector("[data-slider-prev]");
  const nextButton = sliderRoot.querySelector("[data-slider-next]");
  const currentDisplay = sliderRoot.querySelector("[data-slide-current]");
  const transitionDuration = 980;
  let activeIndex = 0;
  let rotationId = null;
  let exitCleanupId = null;

  panels.forEach((panel) => {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "true");
    panel.style.zIndex = "1";
  });

  const syncSliderHeight = () => {
    if (!panelsTrack) {
      return;
    }

    if (window.matchMedia("(max-width: 720px)").matches) {
      panelsTrack.style.removeProperty("height");
      return;
    }

    const tallestPanel = panels.reduce((maxHeight, panel) => {
      return Math.max(maxHeight, panel.scrollHeight);
    }, 0);

    if (tallestPanel > 0) {
      panelsTrack.style.height = `${tallestPanel}px`;
    }
  };

  const setActiveSlide = (index) => {
    const hasActivePanel = panels.some((panel) => panel.classList.contains("is-active"));
    const previousIndex = activeIndex;

    if (hasActivePanel && index === previousIndex) {
      return;
    }

    activeIndex = index;

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    if (exitCleanupId) {
      window.clearTimeout(exitCleanupId);
      exitCleanupId = null;
    }

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;
      const isExiting = hasActivePanel && panelIndex === previousIndex && previousIndex !== index;
      panel.classList.toggle("is-active", isActive);
      panel.classList.toggle("is-exiting", isExiting);
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.style.zIndex = isActive ? "3" : isExiting ? "2" : "1";
    });

    if (hasActivePanel && previousIndex !== index) {
      exitCleanupId = window.setTimeout(() => {
        panels.forEach((panel, panelIndex) => {
          if (panelIndex !== activeIndex) {
            panel.classList.remove("is-exiting");
            panel.style.zIndex = "1";
          }
        });
      }, transitionDuration);
    }

    if (currentDisplay) {
      currentDisplay.textContent = String(index + 1).padStart(2, "0");
    }

    window.requestAnimationFrame(syncSliderHeight);
  };

  const stopRotation = () => {
    if (rotationId) {
      window.clearInterval(rotationId);
      rotationId = null;
    }
  };

  const startRotation = () => {
    stopRotation();
    rotationId = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % panels.length;
      setActiveSlide(nextIndex);
    }, 3000);
  };

  tabs.forEach((tab, index) => {
    const activate = () => {
      setActiveSlide(index);
      startRotation();
    };

    tab.addEventListener("click", activate);
    tab.addEventListener("mouseenter", activate);
    tab.addEventListener("focus", activate);
  });

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      const nextIndex = (activeIndex - 1 + panels.length) % panels.length;
      setActiveSlide(nextIndex);
      startRotation();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const nextIndex = (activeIndex + 1) % panels.length;
      setActiveSlide(nextIndex);
      startRotation();
    });
  }

  sliderRoot.addEventListener("mouseenter", stopRotation);
  sliderRoot.addEventListener("mouseleave", startRotation);
  sliderRoot.addEventListener("focusin", stopRotation);
  sliderRoot.addEventListener("focusout", startRotation);
  window.addEventListener("resize", syncSliderHeight);
  window.addEventListener("load", syncSliderHeight);

  panelImages.forEach((image) => {
    if (image.complete) {
      return;
    }

    image.addEventListener("load", syncSliderHeight, { once: true });
    image.addEventListener("error", syncSliderHeight, { once: true });
  });

  setActiveSlide(0);
  syncSliderHeight();
  startRotation();
}

document.querySelectorAll("[data-card-slider]").forEach((slider) => {
  const viewport = slider.querySelector("[data-card-slider-viewport]");
  const track = slider.querySelector(".about-why-slider__track");
  const prevButton = slider.querySelector("[data-card-slider-prev]");
  const nextButton = slider.querySelector("[data-card-slider-next]");

  if (!viewport || !track) {
    return;
  }

  const getStep = () => {
    const firstCard = track.firstElementChild;
    const cardGap = parseFloat(window.getComputedStyle(track).gap || "0");

    if (!firstCard) {
      return viewport.clientWidth;
    }

    return firstCard.getBoundingClientRect().width + cardGap;
  };

  prevButton?.addEventListener("click", () => {
    viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  nextButton?.addEventListener("click", () => {
    viewport.scrollBy({ left: getStep(), behavior: "smooth" });
  });
});

document.querySelectorAll("[data-solution-slider]").forEach((slider) => {
  const viewport = slider.querySelector("[data-solution-slider-viewport]");
  const track = slider.querySelector(".solution-gallery__grid");
  const prevButton = slider.querySelector("[data-solution-slider-prev]");
  const nextButton = slider.querySelector("[data-solution-slider-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let autoRotateId = null;
  let direction = 1;

  if (!viewport || !track) {
    return;
  }

  const getGap = () => {
    return parseFloat(window.getComputedStyle(track).gap || "0");
  };

  const getStep = () => {
    const firstCard = track.firstElementChild;

    if (!firstCard) {
      return viewport.clientWidth;
    }

    return firstCard.getBoundingClientRect().width + getGap();
  };

  const getMaxScroll = () => {
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  };

  const getScrollBehavior = () => {
    return reducedMotion.matches ? "auto" : "smooth";
  };

  const syncControls = () => {
    const isScrollable = getMaxScroll() > 4;

    prevButton?.toggleAttribute("disabled", !isScrollable);
    nextButton?.toggleAttribute("disabled", !isScrollable);

    if (!isScrollable) {
      viewport.scrollLeft = 0;
      direction = 1;
    } else if (viewport.scrollLeft >= getMaxScroll() - 4) {
      direction = -1;
    } else if (viewport.scrollLeft <= 4) {
      direction = 1;
    }
  };

  const moveSlider = (nextDirection) => {
    const maxScroll = getMaxScroll();

    if (maxScroll <= 4) {
      return;
    }

    const currentLeft = viewport.scrollLeft;
    const step = getStep();
    let targetLeft = currentLeft + step * nextDirection;

    if (targetLeft >= maxScroll - 4) {
      targetLeft = 0;
      direction = 1;
    } else if (targetLeft <= 4) {
      targetLeft = 0;
      direction = 1;
    } else {
      direction = nextDirection;
    }

    viewport.scrollTo({ left: targetLeft, behavior: getScrollBehavior() });
  };

  const stopRotation = () => {
    if (autoRotateId) {
      window.clearInterval(autoRotateId);
      autoRotateId = null;
    }
  };

  const startRotation = () => {
    stopRotation();
    syncControls();

    if (reducedMotion.matches || getMaxScroll() <= 4) {
      return;
    }

    autoRotateId = window.setInterval(() => {
      moveSlider(1);
    }, 2600);
  };

  prevButton?.addEventListener("click", () => {
    direction = -1;
    moveSlider(direction);
    startRotation();
  });

  nextButton?.addEventListener("click", () => {
    direction = 1;
    moveSlider(direction);
    startRotation();
  });

  viewport.addEventListener(
    "scroll",
    () => {
      syncControls();
    },
    { passive: true }
  );

  slider.addEventListener("mouseenter", stopRotation);
  slider.addEventListener("mouseleave", startRotation);
  slider.addEventListener("focusin", stopRotation);
  slider.addEventListener("focusout", startRotation);
  window.addEventListener("resize", startRotation);

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", startRotation);
  }

  syncControls();
  startRotation();
});

const inquiryType = document.querySelector("#inquiry-type");
const inquiryFormShell = document.querySelector("[data-inquiry-form-shell]");
const inquiryTargets = Array.from(document.querySelectorAll("[data-role-target]"));

const openInquiryForm = (target) => {
  if (!inquiryType || !target) {
    return;
  }

  inquiryTargets.forEach((item) => {
    item.classList.toggle("is-selected", item === target);
  });

  if (inquiryFormShell) {
    inquiryFormShell.hidden = false;
  }

  inquiryType.value = target.dataset.roleTarget || "";
  inquiryType.focus();
  inquiryType.scrollIntoView({ behavior: "smooth", block: "center" });
};

inquiryTargets.forEach((target) => {
  target.addEventListener("click", () => {
    openInquiryForm(target);
  });

  target.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openInquiryForm(target);
  });
});

const googleSheetForms = Array.from(document.querySelectorAll("[data-sheet-form]"));

const googleSheetSuccessMessages = {
  "home-inquiry": "Thank you. Your inquiry has been submitted successfully.",
  "dealer-inquiry": "Thank you. Your dealer inquiry has been submitted successfully.",
  "project-inquiry": "Thank you. Your project inquiry has been submitted successfully."
};

const serializeFormFields = (form) => {
  const formData = new FormData(form);

  return Object.fromEntries(
    Array.from(formData.entries(), ([key, value]) => {
      return [key, typeof value === "string" ? value.trim() : value];
    })
  );
};

googleSheetForms.forEach((form) => {
  const status = form.querySelector(".form-status");
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!KC_FIXIT_GOOGLE_SHEETS_WEB_APP_URL) {
      if (status) {
        status.textContent =
          "Google Sheets is not configured yet. Add your Apps Script Web App URL in script.js first.";
      }

      return;
    }

    const payload = {
      formKey: form.dataset.sheetForm || "",
      page: window.location.pathname.split("/").pop() || "index.html",
      submittedAt: new Date().toISOString(),
      fields: serializeFormFields(form)
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (status) {
      status.textContent = "Sending inquiry...";
    }

    try {
      await fetch(KC_FIXIT_GOOGLE_SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      if (status) {
        status.textContent =
          googleSheetSuccessMessages[form.dataset.sheetForm || ""] ||
          "Thank you. Your inquiry has been submitted successfully.";
      }

      form.reset();
    } catch (error) {
      if (status) {
        status.textContent = "Could not send the inquiry right now. Please try again.";
      }

      console.error("Google Sheets submission failed", error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }
    }
  });
});

document.querySelectorAll("[data-demo-form]:not([data-sheet-form])").forEach((form) => {
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (status) {
      status.textContent =
        "Front-end demo ready. Connect this form to your CRM, email workflow, or WhatsApp lead endpoint.";
    }

    form.reset();
  });
});

const yearNode = document.querySelector("[data-year]");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const counterNodes = Array.from(document.querySelectorAll("[data-counter]"));

if (counterNodes.length) {
  const numberFormatter = new Intl.NumberFormat("en-IN");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getCounterText = (node, value) => {
    const prefix = node.dataset.prefix || "";
    const suffix = node.dataset.suffix || "";
    return `${prefix}${numberFormatter.format(value)}${suffix}`;
  };

  const finishCounter = (node) => {
    const target = Number(node.dataset.target || 0);
    node.textContent = getCounterText(node, target);
    node.dataset.counted = "true";
  };

  const animateCounter = (node) => {
    if (node.dataset.counted === "true") {
      return;
    }

    const target = Number(node.dataset.target || 0);
    const duration = Number(node.dataset.duration || 1600);
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);
      node.textContent = getCounterText(node, currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      finishCounter(node);
    };

    window.requestAnimationFrame(tick);
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    counterNodes.forEach(finishCounter);
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.55
      }
    );

    counterNodes.forEach((node) => {
      node.textContent = getCounterText(node, 0);
      counterObserver.observe(node);
    });
  }
}

document.querySelectorAll("[data-product-catalogue]").forEach((catalogue) => {
  const tabs = Array.from(catalogue.querySelectorAll("[data-product-tab]"));
  const panels = Array.from(catalogue.querySelectorAll("[data-product-panel]"));

  if (!tabs.length || !panels.length) {
    return;
  }

  const setActivePanel = (targetKey) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.productTab === targetKey;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.productPanel === targetKey;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    const activePanel = panels.find((panel) => panel.dataset.productPanel === targetKey);

    if (window.history.replaceState) {
      if (targetKey === "all") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      } else if (activePanel) {
        window.history.replaceState(null, "", `#${activePanel.id}`);
      }
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActivePanel(tab.dataset.productTab || "");
    });
  });

  const hashTarget = window.location.hash.replace("#", "");
  const hashPanel = panels.find((panel) => panel.id === hashTarget);
  const initialTab =
    (hashPanel && tabs.find((tab) => tab.dataset.productTab === hashPanel.dataset.productPanel)) ||
    tabs.find((tab) => tab.classList.contains("is-active")) ||
    tabs[0];

  if (initialTab) {
    setActivePanel(initialTab.dataset.productTab || "");
  }

  window.addEventListener("hashchange", () => {
    const nextHashTarget = window.location.hash.replace("#", "");
    const nextHashPanel = panels.find((panel) => panel.id === nextHashTarget);

    if (nextHashPanel) {
      setActivePanel(nextHashPanel.dataset.productPanel || "");
      return;
    }

    setActivePanel("all");
  });
});

const productDirectory = {
  standard: {
    title: "KC Fixit Standard",
    familyKey: "fixing",
    familyLabel: "Tile & Stone Fixing",
    familyCard: "Tile Adhesives",
    familyLink: "tile-fixing-adhesives.html",
    familyLinkLabel: "Explore tile fixing family",
    image: "tile-adhesive-hero.jpeg",
    imagePosition: "center",
    summary: "Practical starting point for regular ceramic tile work and straightforward site conditions.",
    description:
      "KC Fixit Standard is the entry point in the tile-fixing range, positioned for teams that need a dependable adhesive without moving straight into higher-spec grades.",
    descriptionSecondary:
      "It works best when tile size, substrate movement, and site demands stay within everyday project conditions and the goal is a cleaner fixing process than conventional site-mix methods.",
    bestFor: "Regular ceramic tile installations and standard internal fixing jobs.",
    useAreas: "Homes, routine commercial interiors, and straightforward wall or floor applications.",
    pairsWith: "KC Fixit Tile Grout and KC Fixit Plasto Fix."
  },
  advance: {
    title: "KC Fixit Advance",
    familyKey: "fixing",
    familyLabel: "Tile & Stone Fixing",
    familyCard: "Everyday Professional Adhesives",
    familyLink: "tile-fixing-adhesives.html",
    familyLinkLabel: "Explore tile fixing family",
    image: "tile-adhesive-hero.jpeg",
    imagePosition: "center",
    summary: "Everyday professional tile-fixing grade for teams that need stronger bond confidence across regular wall and floor work.",
    description:
      "KC Fixit Advance sits between the entry grade and higher-performance fixing products, giving project teams a more dependable everyday adhesive option.",
    descriptionSecondary:
      "It is suited to jobs that go beyond the most basic site condition but do not yet need the heavier performance jump of premium or critical-surface grades.",
    bestFor: "Day-to-day tile fixing, more confident internal wall and floor applications, and professional upgrade jobs.",
    useAreas: "Homes, retail interiors, residential upgrades, and standard commercial tile work.",
    pairsWith: "KC Fixit Tile Grout, KC Fixit Plasto Fix, and KC Fixit Aquacoat 2K in wet zones."
  },
  xtreme: {
    title: "KC Fixit Xtreme",
    familyKey: "fixing",
    familyLabel: "Tile & Stone Fixing",
    familyCard: "High-Performance Adhesives",
    familyLink: "tile-fixing-adhesives.html",
    familyLinkLabel: "Explore tile fixing family",
    image: "tile-adhesive-hero.jpeg",
    imagePosition: "center",
    summary: "High-performance fixing grade for larger tiles, denser finishes, and more demanding site conditions.",
    description:
      "KC Fixit Xtreme is positioned as the upgrade path when teams move beyond routine ceramic work into surfaces that need stronger bond confidence.",
    descriptionSecondary:
      "Use it when finish expectations rise, tile size increases, or the installation needs a more serious adhesive than the everyday starting grade.",
    bestFor: "Larger-format tiles, denser surfaces, and higher-performance fixing jobs.",
    useAreas: "Premium homes, commercial fit-outs, feature walls, and more demanding floor zones.",
    pairsWith: "KC Fixit Tile Grout, KC Fixit Aquacoat 2K, and KC Fixit Epoxyshield 2K."
  },
  flex: {
    title: "KC Fixit Flex",
    familyKey: "fixing",
    familyLabel: "Tile & Stone Fixing",
    familyCard: "Flexible Fixing Grade",
    familyLink: "tile-fixing-adhesives.html",
    familyLinkLabel: "Explore tile fixing family",
    image: "hero-tile-installation-2.jpg",
    imagePosition: "center",
    summary: "Flexible fixing grade for installations that need better movement tolerance and more forgiving performance than routine adhesives.",
    description:
      "KC Fixit Flex is designed for tile-fixing conditions where flexibility matters more and the substrate or service environment needs a more adaptable adhesive response.",
    descriptionSecondary:
      "It helps bridge the gap between everyday fixing work and premium critical-surface installation needs without overcomplicating selection.",
    bestFor: "Movement-sensitive installations and tile jobs that need better flexibility support.",
    useAreas: "Walls, floors, renovation zones, transition areas, and more tolerance-sensitive tile applications.",
    pairsWith: "KC Fixit Tile Grout, KC Fixit Aquacoat 2K, and KC Fixit SBR Latex Pro."
  },
  superflex: {
    title: "KC Fixit Superflex",
    familyKey: "fixing",
    familyLabel: "Tile & Stone Fixing",
    familyCard: "Premium Flexible Fixing",
    familyLink: "stone-fixing-solutions.html",
    familyLinkLabel: "Explore stone and critical-surface family",
    image: "hero-tile-installation-2.jpg",
    imagePosition: "center",
    summary: "Premium flexible fixing support for critical substrates, premium finishes, and higher-risk installation conditions.",
    description:
      "KC Fixit Superflex sits at the top of the fixing ladder for jobs where movement tolerance, premium finish quality, and long-term confidence matter more.",
    descriptionSecondary:
      "It is suited to teams that want the strongest option in the range before moving into stone, large-format, or more critical surface requirements.",
    bestFor: "Critical tile jobs, premium finishes, and high-expectation installations.",
    useAreas: "Large homes, premium commercial spaces, stone-facing systems, and sensitive substrates.",
    pairsWith: "KC Fixit Epoxyshield 3K, KC Fixit Aquacoat 2K, and surface-preparation support."
  },
  "tile-grout": {
    title: "KC Fixit Tile Grout",
    familyKey: "grouting",
    familyLabel: "Grouts & Epoxy",
    familyCard: "Tile Joint Fillers",
    familyLink: "tile-joint-fillers.html",
    familyLinkLabel: "Explore tile joint fillers",
    image: "tile-joint-filler-grouts.jpg",
    imagePosition: "center",
    summary: "Cleaner joint finishing support for tile installations that need better visual consistency and handover quality.",
    description:
      "KC Fixit Tile Grout is positioned for projects that need more than basic filling, helping teams deliver neater joint lines and a more complete final finish.",
    descriptionSecondary:
      "It fits naturally after the right adhesive grade has been chosen, especially on day-to-day residential and commercial tile jobs.",
    bestFor: "Routine tile-joint finishing and cleaner final presentation.",
    useAreas: "Homes, bathrooms, kitchens, interior floors, and standard commercial tile work.",
    pairsWith: "KC Fixit Standard, KC Fixit Xtreme, and waterproofing systems in wet areas."
  },
  "epoxyshield-2k": {
    title: "KC Fixit Epoxyshield 2K",
    familyKey: "grouting",
    familyLabel: "Grouts & Epoxy",
    familyCard: "Epoxy Grouting Systems",
    familyLink: "epoxy-grouting-systems.html",
    familyLinkLabel: "Explore epoxy grouting systems",
    image: "epoxy-grouting-system.jpg",
    imagePosition: "center",
    summary: "Higher-performance epoxy jointing support for wet, hygiene-sensitive, and maintenance-aware projects.",
    description:
      "KC Fixit Epoxyshield 2K helps teams step up from routine grout where cleaner joint performance and more controlled maintenance outcomes are required.",
    descriptionSecondary:
      "It is a strong fit when the installation environment becomes more demanding but the project still needs a practical, system-led upgrade path.",
    bestFor: "Wet areas, hygiene-sensitive environments, and premium tile handovers.",
    useAreas: "Bathrooms, kitchens, commercial washrooms, counters, and maintenance-aware spaces.",
    pairsWith: "KC Fixit Xtreme, KC Fixit Superflex, and KC Fixit Aquacoat 2K."
  },
  "epoxyshield-3k": {
    title: "KC Fixit Epoxyshield 3K",
    familyKey: "grouting",
    familyLabel: "Grouts & Epoxy",
    familyCard: "Epoxy Grouting Systems",
    familyLink: "epoxy-grouting-systems.html",
    familyLinkLabel: "Explore epoxy grouting systems",
    image: "epoxy-grouting-system.jpg",
    imagePosition: "center",
    summary: "Performance-led epoxy system for tougher commercial conditions where long-term joint durability matters more.",
    description:
      "KC Fixit Epoxyshield 3K is positioned for teams that need a stronger commercial-grade route than standard grout in harsher service environments.",
    descriptionSecondary:
      "It works best when the project has higher durability expectations and the overall installation needs a more premium jointing system.",
    bestFor: "Demanding commercial jobs and higher-durability jointing requirements.",
    useAreas: "Commercial kitchens, high-use wash areas, institutional spaces, and maintenance-heavy zones.",
    pairsWith: "KC Fixit Superflex, waterproofing layers, and premium tile-fixing systems."
  },
  "aquacoat-2k": {
    title: "KC Fixit Aquacoat 2K",
    familyKey: "waterproofing",
    familyLabel: "Waterproofing",
    familyCard: "Under-Tile Waterproofing",
    familyLink: "under-tile-waterproofing.html",
    familyLinkLabel: "Explore waterproofing systems",
    image: "waterproofing-solutions.jpg",
    imagePosition: "center",
    summary: "2K waterproofing layer for moisture-prone zones that need dependable protection before tiling begins.",
    description:
      "KC Fixit Aquacoat 2K is designed to protect the substrate before tile fixing and finishing systems are installed, especially in wet and seepage-sensitive areas.",
    descriptionSecondary:
      "It supports a cleaner system approach in bathrooms, terraces, and other zones where moisture control needs to be handled earlier in the build-up.",
    bestFor: "Pre-tiling waterproofing and moisture protection in critical zones.",
    useAreas: "Bathrooms, terraces, balconies, wet areas, and moisture-prone slabs or walls.",
    pairsWith: "KC Fixit Xtreme, KC Fixit Superflex, and KC Fixit Tile Grout."
  },
  concreteseal: {
    title: "KC Fixit Concreteseal",
    familyKey: "waterproofing",
    familyLabel: "Waterproofing",
    familyCard: "Concrete Sealing",
    familyLink: "under-tile-waterproofing.html",
    familyLinkLabel: "Explore waterproofing systems",
    image: "waterproofing-solutions.jpg",
    imagePosition: "center",
    summary: "Sealing support for exposed concrete and seepage-sensitive surfaces where moisture movement needs better control.",
    description:
      "KC Fixit Concreteseal is positioned for surfaces that need a practical sealing layer before downstream tile, repair, or finishing systems are introduced.",
    descriptionSecondary:
      "It helps teams improve substrate readiness earlier, especially where exposed concrete and seepage sensitivity become part of the wider waterproofing challenge.",
    bestFor: "Concrete sealing, seepage control, and early-stage substrate protection.",
    useAreas: "Concrete slabs, terraces, exposed surfaces, and seepage-prone project zones.",
    pairsWith: "KC Fixit Aquacoat 2K and KC Fixit SBR Latex Pro where surface readiness needs support."
  },
  "plasto-fix": {
    title: "KC Fixit Plasto Fix",
    familyKey: "support",
    familyLabel: "Surface Support & Masonry",
    familyCard: "Wall Preparation",
    familyLink: "polymer-surface-support.html",
    familyLinkLabel: "Explore surface-support family",
    image: "ready-mix-plasters.jpg",
    imagePosition: "center",
    summary: "Ready-mix plaster support for cleaner wall preparation and more controlled site execution.",
    description:
      "KC Fixit Plasto Fix helps teams move toward factory-controlled plastering support when wall preparation quality and site consistency need to improve.",
    descriptionSecondary:
      "It is suited to projects that want neater wall bases before tile fixing, painting, or additional surface-finishing systems are applied.",
    bestFor: "Wall preparation, controlled plastering, and cleaner base creation.",
    useAreas: "Internal walls, blockwork preparation, repair-ready surfaces, and finishing-stage base work.",
    pairsWith: "KC Fixit Standard, KC Fixit Tile Grout, and KC Fixit SBR Latex Pro."
  },
  "block-fix": {
    title: "KC Fixit Block Fix",
    familyKey: "support",
    familyLabel: "Surface Support & Masonry",
    familyCard: "Block Bonding",
    familyLink: "polymer-surface-support.html",
    familyLinkLabel: "Explore surface-support family",
    image: "block-adhesive.jpg",
    imagePosition: "center",
    summary: "Thin-joint block bonding support for cleaner masonry execution and better workflow control than conventional site mixing.",
    description:
      "KC Fixit Block Fix helps contractors shift toward cleaner masonry work by reducing the mess, variability, and bulk associated with traditional block-laying methods.",
    descriptionSecondary:
      "It is positioned for teams that want faster handling, better joint control, and a more system-led masonry workflow on site.",
    bestFor: "Thin-joint blockwork and cleaner masonry execution.",
    useAreas: "Internal partitions, masonry systems, project blocks, and faster wall-building workflows.",
    pairsWith: "KC Fixit Plasto Fix and KC Fixit SBR Latex Pro where the wider surface system needs support."
  },
  "sbr-latex-pro": {
    title: "KC Fixit SBR Latex Pro",
    familyKey: "support",
    familyLabel: "Surface Support & Masonry",
    familyCard: "Polymer Support",
    familyLink: "polymer-surface-support.html",
    familyLinkLabel: "Explore surface-support family",
    image: "hero-sbr-latex.jpg",
    imagePosition: "center",
    summary: "Polymer additive support for bond coats, repair layers, and mortar enhancement where adhesion needs more control.",
    description:
      "KC Fixit SBR Latex Pro is positioned to strengthen bond confidence across repair, coating, and mortar-improvement tasks that depend on better adhesion performance.",
    descriptionSecondary:
      "It works well when a project needs a more dependable support layer before moving into tile fixing, plaster repair, or concrete-surface preparation.",
    bestFor: "Bond coats, repair mixes, and adhesion-led surface support.",
    useAreas: "Repair zones, mortar enhancement, slurry coats, and substrate-preparation stages.",
    pairsWith: "KC Fixit Plasto Fix, KC Fixit Concreteseal, and tile-fixing or waterproofing systems."
  }
};

const productFamilyProfiles = {
  fixing: {
    systemType: "Tile fixing adhesive system",
    workflow: "Use after surface preparation and before joint finishing, with grade selection increasing as tile complexity and site movement increase.",
    selectionNote: "Move upward through the fixing range when tile size, finish sensitivity, substrate movement, or performance expectations become more demanding."
  },
  grouting: {
    systemType: "Joint filler and epoxy grouting system",
    workflow: "Use after tile fixing and joint preparation are complete, with epoxy grades preferred where hygiene, washability, and tougher service conditions matter more.",
    selectionNote: "Choose standard grout for everyday finishing and move into epoxy systems when wet, hygiene-sensitive, or heavy-use zones need stronger long-term performance."
  },
  waterproofing: {
    systemType: "Moisture-control and sealing system",
    workflow: "Use before downstream finishing layers so the substrate is protected early in bathrooms, terraces, balconies, and seepage-sensitive project zones.",
    selectionNote: "Prioritize these products where water control needs to be handled before tiling, coating, or other finish layers are installed."
  },
  support: {
    systemType: "Surface support and masonry system",
    workflow: "Use during substrate preparation, wall-building, repair, or bond-improvement stages to create a cleaner base before finish systems begin.",
    selectionNote: "These products are best used when site consistency, substrate readiness, or masonry efficiency needs to improve before the final finish."
  }
};

const productBrochureData = {
  standard: {
    cardPack: "20 & 40 kg",
    cardBadge: "C1TE",
    cardNote: "Coverage approx. 45 to 55 sq.ft. per 20 kg pack.",
    packSize: "20 & 40 kg",
    color: "Grey / White",
    badge: "C1TE",
    standard: "IS 15477:2019 Type 1T; EN C1TE Classification",
    coverage: "Approx. 45 to 55 sq.ft. per 20 kg pack using 6 mm x 6 mm square notched trowel at 3 mm bed thickness.",
    working: "Pot life 2 hours; heavy traffic after 16 to 24 hours at 27 C.",
    applications: "Indoor floor and wall installation of ceramic and vitrified tiles on cement plaster, cement concrete, and cement screed. Preferably for dry-area applications.",
    purpose: "Type 1 tile adhesive for regular ceramic and vitrified tile installation.",
    specs: [
      ["Product Type", "Tile Adhesive Type 1"],
      ["Colour", "Grey / White"],
      ["Pack Size", "20 & 40 kg"],
      ["Classification", "C1TE"],
      ["Tensile Adhesion", "0.75 to 0.80 N/mm2"],
      ["Slip Resistance", "0.40 to 0.45 mm"],
      ["Shear Adhesion", "1.15 to 1.20 N/mm2"],
      ["Compliance", "IS 15477:2019 Type 1T; EN C1TE"],
      ["Coverage", "Approx. 45 to 55 sq.ft. per 20 kg pack"],
      ["Working Properties", "Pot life 2 hours; heavy traffic 16 to 24 hours"]
    ]
  },
  advance: {
    cardPack: "20 & 40 kg",
    cardBadge: "C2TE",
    cardNote: "Coverage approx. 45 to 55 sq.ft. per 20 kg pack.",
    packSize: "20 & 40 kg",
    color: "Grey / White",
    badge: "C2TE",
    standard: "IS 15477:2019 Type 2T; EN C2TE Classification",
    coverage: "Approx. 45 to 55 sq.ft. per 20 kg pack using 6 mm x 6 mm square notched trowel at 3 mm bed thickness.",
    working: "Pot life 2 hours; heavy traffic after 16 to 24 hours at 27 C.",
    applications: "Interior floor and wall plus exterior floor applications for vitrified, fully vitrified, and glass mosaic tiles on cement-based substrates. Suitable for wet and submerged areas.",
    purpose: "Type 2 tile adhesive for wider day-to-day fixing conditions.",
    specs: [
      ["Product Type", "Tile Adhesive Type 2"],
      ["Colour", "Grey / White"],
      ["Pack Size", "20 & 40 kg"],
      ["Classification", "C2TE"],
      ["Dry Tensile Adhesion", "1.25 to 1.35 N/mm2"],
      ["Wet Tensile Adhesion", "1.15 to 1.25 N/mm2"],
      ["Slip Resistance", "0.30 to 0.45 mm"],
      ["Dry Shear Adhesion", "2.0 to 2.10 N/mm2"],
      ["Heat Ageing", "1.34 to 1.44 N/mm2"],
      ["Compliance", "IS 15477:2019 Type 2T; EN C2TE"]
    ]
  },
  xtreme: {
    cardPack: "20 & 40 kg",
    cardBadge: "C2TE S1",
    cardNote: "Natural stone and wet-area fixing support.",
    packSize: "20 & 40 kg",
    color: "Grey / White",
    badge: "C2TE S1",
    standard: "IS 15477:2019 Type 3T / Type 3T S1; EN C2TE / C2TE S1 Classification",
    coverage: "Approx. 45 to 55 sq.ft. per 20 kg pack using 6 mm x 6 mm square notched trowel at 3 mm bed thickness.",
    working: "Pot life 2 hours; heavy traffic after 16 to 24 hours.",
    applications: "Internal and external floor and wall installation of ceramic, clay, vitrified, basalt, porcelain, and natural stone. Recommended for wet areas like pools, sauna rooms, water bodies, and washrooms.",
    purpose: "High-performance Type 3 adhesive for natural stone, wet areas, and more demanding finishes.",
    specs: [
      ["Product Type", "Tile Adhesive Type 3"],
      ["Colour", "Grey / White"],
      ["Pack Size", "20 & 40 kg"],
      ["Classification", "C2TE S1"],
      ["Dry Tensile Adhesion", "1.5 to 1.65 N/mm2"],
      ["Wet Tensile Adhesion", "1.10 to 1.20 N/mm2"],
      ["Dry Shear Adhesion", "1.45 to 1.55 N/mm2"],
      ["Heat / Wet Shear", "1.15 to 1.25 N/mm2"],
      ["Slip Resistance", "0.25 to 0.35 mm"],
      ["Transverse Deformation", "2.70 to 2.80 mm"]
    ]
  },
  flex: {
    cardPack: "20 & 40 kg",
    cardBadge: "C2TE S1",
    cardNote: "Large-format and elevation-ready tile adhesive.",
    packSize: "20 & 40 kg",
    color: "Grey / White",
    badge: "C2TE S1",
    standard: "IS 15477:2019 Type 4TS1; EN C2TE S1 Classification",
    coverage: "Approx. 45 to 55 sq.ft. per 20 kg pack using 6 mm x 6 mm square notched trowel at 3 mm bed thickness.",
    working: "Pot life 2 hours; heavy traffic after 16 to 24 hours at 27 C.",
    applications: "Internal and external floor and wall use for large-format thin tiles and diversified materials. Best suited for elevation applications.",
    purpose: "Type 4 flexible adhesive for large-format, elevation, and multi-surface tile work.",
    specs: [
      ["Product Type", "Tile Adhesive Type 4"],
      ["Colour", "Grey / White"],
      ["Pack Size", "20 & 40 kg"],
      ["Classification", "C2TE S1"],
      ["Dry Tensile Adhesion", "2.5 to 2.8 N/mm2"],
      ["Wet Tensile Adhesion", "2.6 to 2.7 N/mm2"],
      ["Dry Shear Adhesion", "2.5 to 2.7 N/mm2"],
      ["Heat / Wet Shear", "1.9 to 2.1 N/mm2"],
      ["Slip Resistance", "0.25 to 0.30 mm"],
      ["Transverse Deformation", "3.0 to 4.0 mm"]
    ]
  },
  superflex: {
    cardPack: "4 kg",
    cardBadge: "PU Based",
    cardNote: "White Type 5 PU-based adhesive.",
    packSize: "4 kg",
    color: "White",
    badge: "PU Based",
    standard: "Tile Adhesives Type 5",
    coverage: "",
    working: "",
    applications: "Current brochure extract identifies this as a white, PU-based Type 5 tile adhesive.",
    purpose: "Type 5 PU-based tile adhesive positioned above the standard cementitious grades.",
    specs: [
      ["Product Type", "Tile Adhesives Type 5"],
      ["Colour", "White"],
      ["Pack Size", "4 kg"],
      ["System", "PU Based"]
    ]
  },
  "tile-grout": {
    cardPack: "1 kg",
    cardBadge: "CG1",
    cardNote: "For 1 mm to 3 mm tile joints.",
    packSize: "1 kg",
    color: "Multi Color",
    badge: "CG1 Cementitious Polymer",
    standard: "EN 13888; IS 17190:2020 CG1",
    coverage: "Suitable for 1 mm to 3 mm joint width max.",
    working: "Brochure notes a 30 min. working reference and both sanded and unsanded availability.",
    applications: "For glazed wall tiles, mosaics, vitrified and fully vitrified tiles, floor tiles, and industrial floor tiles. Designed to give hard-wearing, non-dusting joints.",
    purpose: "Water-resistant, non-cracking, non-shrink polymer-modified cementitious tile grout.",
    specs: [
      ["Product Type", "Tile Grout"],
      ["Colour", "Multi Color"],
      ["Pack Size", "1 kg"],
      ["Classification", "CG1 Cementitious Polymer"],
      ["Flexural Strength", "3.0 to 3.5 N/mm2"],
      ["Compressive Strength", "20 to 22 N/mm2"],
      ["Shrinkage", "2.00 to 2.22 mm/m"],
      ["Water Absorption", "2.5 to 3.0 g"],
      ["Compliance", "EN 13888; IS 17190:2020 CG1"],
      ["Joint Width", "1 mm to 3 mm max"]
    ]
  },
  "epoxyshield-2k": {
    cardPack: "2 component",
    cardBadge: "Epoxy Grout",
    cardNote: "Portfolio overview available in brochure extract.",
    packSize: "",
    color: "",
    badge: "2 Component Epoxy Resin Based Grout",
    standard: "",
    coverage: "",
    working: "",
    applications: "Listed in the brochure portfolio as a 2 component epoxy resin based grout.",
    purpose: "Epoxy grout positioned within the KC Fixit grouting system.",
    specs: [
      ["Product Type", "Epoxy Grout"],
      ["System", "2 Component Epoxy Resin Based Grout"],
      ["Brochure Note", "Detailed pack-size and technical table were not clearly readable in the extracted catalogue text."]
    ]
  },
  "epoxyshield-3k": {
    cardPack: "1 & 5 kg",
    cardBadge: "RG2",
    cardNote: "High-performance 3 component epoxy grout.",
    packSize: "1 & 5 kg",
    color: "Multi Color",
    badge: "EG-100 / EG-200",
    standard: "EN 13888; IS 17190:2020 RG2",
    coverage: "",
    working: "Brochure references a 240 min. performance note for the epoxy grout system.",
    applications: "For interior and covered exterior floor and wall joints on ceramic, vitreous, semi-vitreous, glass mosaic, terrazzo, engineered stone, and natural stone. Recommended for commercial kitchens, cafeterias, rest rooms, schools, pools, sauna rooms, and wash areas.",
    purpose: "Hygienic, easy-to-clean, water- and shock-resistant 3 component epoxy resin based grout.",
    specs: [
      ["Product Type", "Epoxyshield 3K"],
      ["Colour", "Multi Color"],
      ["Pack Size", "1 & 5 kg"],
      ["Variant", "EG-100 / EG-200"],
      ["Flexural Strength", "38 to 40 N/mm2"],
      ["Compressive Strength", "55 to 57 N/mm2"],
      ["Shrinkage", "0.6 to 0.8 mm/m"],
      ["Water Absorption", "0.015 to 0.040 g"],
      ["Abrasion Resistance", "Pass"],
      ["Compliance", "EN 13888; IS 17190:2020 RG2"]
    ]
  },
  "plasto-fix": {
    cardPack: "40 kg",
    cardBadge: "RMP",
    cardNote: "Polymer-modified ready mix plaster.",
    packSize: "40 kg",
    color: "Grey",
    badge: "Ready Mix Plaster",
    standard: "Polymer-Modified Ready Mix Plaster",
    coverage: "Brochure highlights excellent coverage.",
    working: "Recommended mix uses 15 to 17% water. Let the mix stand for 5 minutes, remix for 2 minutes, and cure for 7 days after initial set. Do not add extra cement or sand with admix.",
    applications: "For interior as well as exterior walls. Designed for smooth-finish plastering and cleaner wall preparation.",
    purpose: "Ready mix plaster for durable wall preparation with only water addition on site.",
    specs: [
      ["Product Type", "Ready Mix Plaster"],
      ["Colour", "Grey"],
      ["Pack Size", "40 kg"],
      ["System", "Polymer-Modified Ready Mix Plaster"],
      ["Mix Recommendation", "15 to 17% water"],
      ["Stand / Remix", "Stand 5 min; remix 2 min"],
      ["Curing", "Post 24 hours curing recommended for 7 days"],
      ["Application", "Interior and exterior walls"]
    ]
  },
  "block-fix": {
    cardPack: "40 kg",
    cardBadge: "AAC / CLC",
    cardNote: "Approx. 70 to 80 sq.ft. per 40 kg at 2 to 3 mm bed.",
    packSize: "40 kg",
    color: "Grey",
    badge: "AAC / CLC Block Jointing Mortar",
    standard: "ASTM C: 1660-10",
    coverage: "Approx. 70 to 80 sq.ft. per 40 kg at 2 to 3 mm bed thickness.",
    working: "Shelf life 12 months. Replaces the traditional 20 to 25 mm method with a 3 to 6 mm application thickness.",
    applications: "Polymer-modified adhesive for masonry building applications and AAC block bonding with high shear bond strength.",
    purpose: "Thin-joint block mortar for faster AAC and CLC masonry execution.",
    specs: [
      ["Product Type", "Block Jointing Mortar"],
      ["Colour", "Grey"],
      ["Pack Size", "40 kg"],
      ["Target Blocks", "AAC / CLC Blocks"],
      ["Coverage", "Approx. 70 to 80 sq.ft. per 40 kg at 2 to 3 mm bed"],
      ["Shelf Life", "12 months"],
      ["Standard", "ASTM C: 1660-10"],
      ["Application Thickness", "3 to 6 mm"]
    ]
  },
  "sbr-latex-pro": {
    cardPack: "1L / 5L / 10L",
    cardBadge: "SBR",
    cardNote: "Multipurpose bonding polymer additive.",
    packSize: "1L / 5L / 10L cans",
    color: "Milky White",
    badge: "Bonding Polymer Additive",
    standard: "ASTM C 1059 Type II; EN 12190",
    coverage: "",
    working: "Use as a repair polymer, waterproofing additive, primer, or bond coat depending on the site requirement.",
    applications: "For concrete repairs, waterproofing of roof terraces, sunken toilet and bathroom portions, lift pits, balconies, multi-layer plaster, and bonding new concrete to old concrete, masonry, and plaster.",
    purpose: "Multi-purpose additive for repair, waterproofing, strengthening, and bond improvement.",
    specs: [
      ["Product Type", "SBR Latex Additive"],
      ["Colour", "Milky White"],
      ["Pack Size", "1L / 5L / 10L cans"],
      ["System", "Bonding Polymer Additive"],
      ["Standard", "ASTM C 1059 Type II; EN 12190"],
      ["Use Case", "Repair, waterproofing, bond coat, and mortar enhancement"]
    ]
  },
  concreteseal: {
    cardPack: "1L / 5L / 10L",
    cardBadge: "LW+",
    cardNote: "Dosage 200 ml per 50 kg cement bag.",
    packSize: "1L / 5L / 10L cans",
    color: "Brownish Liquid",
    badge: "Integral Waterproofing Liquid",
    standard: "IS 2645:2003; IS 4031:1988; IS 6925:1973",
    coverage: "Dosage is 200 ml for one 50 kg cement bag.",
    working: "Improves workability with cement and helps save water usage and cement usage.",
    applications: "For waterproofing concrete and mortar in RCC beams, basements, roof slabs, screeds, water tanks, retaining structures, external plastering, bathrooms, balconies, sumps, and drains.",
    purpose: "Integral waterproofing liquid admixture for concrete and mortar to reduce porosity, seepage, and water ingress.",
    specs: [
      ["Product Type", "Liquid Waterproofing"],
      ["Colour", "Brownish Liquid"],
      ["Pack Size", "1L / 5L / 10L cans"],
      ["Variant", "LW+"],
      ["Dosage", "200 ml per 50 kg cement bag"],
      ["Standard", "IS 2645:2003; IS 4031:1988; IS 6925:1973"],
      ["Purpose", "Reduces porosity, seepage, and water ingress"]
    ]
  },
  "aquacoat-2k": {
    cardPack: "10 kg + 5 kg",
    cardBadge: "2K WP",
    cardNote: "Two-component elastomeric waterproof coating.",
    packSize: "Component A: 10 kg gray powder; Component B: 5 kg white liquid",
    color: "Gray Powder + White Liquid",
    badge: "2K Cementitious Waterproofing",
    standard: "ASTM D 4541; ASTM D 836; ASTM D 1640",
    coverage: "",
    working: "Acrylic liquid plus cementitious powder combination for flexible waterproofing and anti-carbonation protection.",
    applications: "Bathrooms, basement walls, balconies, water tanks, and terraces. Best suited for structures to be waterproofed and protected against moisture ingress.",
    purpose: "Two-component polymer-modified elastomeric waterproof and protective coating.",
    specs: [
      ["Product Type", "2K Cementitious Waterproofing"],
      ["Pack Components", "Component A: 10 kg gray powder; Component B: 5 kg white liquid"],
      ["System", "Elastomeric waterproof and protective coating"],
      ["Standard", "ASTM D 4541; ASTM D 836; ASTM D 1640"],
      ["Ideal Applications", "Bathrooms, basement walls, balconies, water tanks, terraces"],
      ["Purpose", "Flexible waterproofing against moisture ingress"]
    ]
  }
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getProductBrochure = (productKey) => productBrochureData[productKey] || null;

const joinText = (...parts) => parts.filter(Boolean).join(" ");

const getProductFeatureIcon = (iconKey) => {
  const icons = {
    pack: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M14 18L24 12L34 18V30L24 36L14 30V18Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M14 18L24 24L34 18" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M24 24V36" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
    `,
    classification: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 9L34 13V23C34 29.9 29.9 35.8 24 38C18.1 35.8 14 29.9 14 23V13L24 9Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M19.5 23.5L22.8 26.8L28.8 20.8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    packaging: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="10" y="16" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="2.6"/>
        <rect x="18" y="10" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="2.6"/>
        <rect x="26" y="18" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="2.6"/>
      </svg>
    `,
    coverage: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M12 33L28 17" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M27 13L35 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 35H34" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M18 29V35" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M24 25V35" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M30 29V35" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
    `,
    applications: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 38C31 31.3 35 26.4 35 21C35 15.2 30.5 11 24.8 11C21.2 11 18.1 12.7 16 15.7C13.9 12.7 10.8 11 7.2 11C1.5 11 -3 15.2 -3 21C-3 26.4 1 31.3 8 38L16 44L24 38Z" transform="translate(8 -2)" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
        <circle cx="24" cy="20" r="4.5" stroke="currentColor" stroke-width="2.6"/>
      </svg>
    `,
    guidance: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="13" y="10" width="22" height="28" rx="4" stroke="currentColor" stroke-width="2.6"/>
        <path d="M19 10.5H29" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M18 20H30" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M18 26H30" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M18 32H26" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
    `,
    role: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="10" y="20" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.6"/>
        <rect x="19" y="10" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.6"/>
        <rect x="28" y="20" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.6"/>
        <path d="M15 20V15H24V20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 30V36" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
    `,
    fit: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2.6"/>
        <circle cx="24" cy="24" r="7" stroke="currentColor" stroke-width="2.6"/>
        <circle cx="24" cy="24" r="1.8" fill="currentColor"/>
      </svg>
    `,
    logic: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M14 18H34" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M14 24H28" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M14 30H24" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M31 24L34 27L39 20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24" cy="24" r="17" stroke="currentColor" stroke-width="2.6"/>
      </svg>
    `,
    pairing: `
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="15" cy="17" r="4.5" stroke="currentColor" stroke-width="2.6"/>
        <circle cx="33" cy="17" r="4.5" stroke="currentColor" stroke-width="2.6"/>
        <circle cx="24" cy="31" r="4.5" stroke="currentColor" stroke-width="2.6"/>
        <path d="M19.5 19.5L21.8 25.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M28.5 19.5L26.2 25.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M19.5 17H28.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
    `
  };

  return icons[iconKey] || icons.role;
};

const buildProductFeatures = (product, brochure) => {
  if (brochure) {
    return [
      {
        icon: getProductFeatureIcon("pack"),
        label: "Pack Size",
        title: "Available Pack",
        text: brochure.packSize || "Refer brochure for pack details."
      },
      {
        icon: getProductFeatureIcon("classification"),
        label: "Classification",
        title: "Product Type",
        text: joinText(brochure.badge, brochure.standard)
      },
      {
        icon: getProductFeatureIcon("packaging"),
        label: "Packaging",
        title: "Colour / Packaging",
        text: brochure.color || product.familyLabel
      },
      {
        icon: getProductFeatureIcon("coverage"),
        label: "Coverage",
        title: "Coverage / Dosage",
        text: brochure.coverage || brochure.working || product.bestFor
      },
      {
        icon: getProductFeatureIcon("applications"),
        label: "Applications",
        title: "Recommended Use",
        text: brochure.applications || product.useAreas
      },
      {
        icon: getProductFeatureIcon("guidance"),
        label: "Working Note",
        title: "Site Guidance",
        text: brochure.working || brochure.purpose || product.descriptionSecondary
      }
    ];
  }

  return [
    {
      icon: getProductFeatureIcon("role"),
      label: "Product Role",
      title: "Range Position",
      text: product.summary
    },
    {
      icon: getProductFeatureIcon("fit"),
      label: "Best Fit",
      title: "Recommended Jobs",
      text: product.bestFor
    },
    {
      icon: getProductFeatureIcon("applications"),
      label: "Usage",
      title: "Use Areas",
      text: product.useAreas
    },
    {
      icon: getProductFeatureIcon("logic"),
      label: "Selection",
      title: "System Logic",
      text: product.description
    },
    {
      icon: getProductFeatureIcon("guidance"),
      label: "Guidance",
      title: "Selection Note",
      text: product.descriptionSecondary
    },
    {
      icon: getProductFeatureIcon("pairing"),
      label: "Pairing",
      title: "Recommended System Pairing",
      text: `Pairs well with ${product.pairsWith}`
    }
  ];
};

const buildProductSpecs = (product, brochure) => {
  if (brochure?.specs?.length) {
    return brochure.specs;
  }

  const familyProfile = productFamilyProfiles[product.familyKey];

  return [
    ["Product Name", product.title],
    ["Product Family", product.familyLabel],
    ["System Category", product.familyCard],
    ["System Type", familyProfile.systemType],
    ["Best Fit", product.bestFor],
    ["Recommended Use Areas", product.useAreas],
    ["Typical Workflow", familyProfile.workflow],
    ["Recommended Pairing", product.pairsWith]
  ];
};

const buildProductKnowledge = (product, brochure) => {
  const familyProfile = productFamilyProfiles[product.familyKey];

  if (brochure) {
    return [
      {
        icon: getProductFeatureIcon("guidance"),
        label: "Brochure",
        title: "Catalogue Summary",
        text: brochure.purpose || product.description
      },
      {
        icon: getProductFeatureIcon("applications"),
        label: "Applications",
        title: "Where It Is Used",
        text: brochure.applications || product.useAreas
      },
      {
        icon: getProductFeatureIcon("classification"),
        label: "Compliance",
        title: "Standard / Classification",
        text: joinText(brochure.badge, brochure.standard) || familyProfile.systemType
      },
      {
        icon: getProductFeatureIcon("coverage"),
        label: "Site Note",
        title: "Coverage / Working Properties",
        text: joinText(brochure.coverage, brochure.working, `Pairs well with ${product.pairsWith}`)
      }
    ];
  }

  return [
    {
      icon: getProductFeatureIcon("logic"),
      label: "Selection Logic",
      title: "Why This Product Exists",
      text: product.description
    },
    {
      icon: getProductFeatureIcon("fit"),
      label: "Project Fit",
      title: "Where It Performs Best",
      text: product.bestFor
    },
    {
      icon: getProductFeatureIcon("guidance"),
      label: "Workflow",
      title: "How To Place It In The System",
      text: familyProfile.workflow
    },
    {
      icon: getProductFeatureIcon("pairing"),
      label: "Pairing",
      title: "What To Use Alongside It",
      text: `Recommended pairing across the KC Fixit system: ${product.pairsWith}`
    }
  ];
};

const buildProductFaqs = (product, brochure) => {
  const familyProfile = productFamilyProfiles[product.familyKey];

  if (brochure) {
    const faqItems = [];

    if (brochure.packSize || brochure.color) {
      faqItems.push({
        question: `What pack size is available for ${product.title}?`,
        answer: joinText(
          brochure.packSize ? `${product.title} is listed with ${brochure.packSize}.` : "",
          brochure.color ? `Colour / packaging note: ${brochure.color}.` : ""
        )
      });
    }

    faqItems.push({
      question: `Where is ${product.title} recommended for use?`,
      answer: brochure.applications || product.useAreas
    });

    if (brochure.badge || brochure.standard) {
      faqItems.push({
        question: `What standard or classification is shown for ${product.title}?`,
        answer: joinText(brochure.badge, brochure.standard) || product.familyCard
      });
    }

    if (brochure.coverage || brochure.working) {
      faqItems.push({
        question: `What coverage, dosage, or working note is available for ${product.title}?`,
        answer: joinText(brochure.coverage, brochure.working)
      });
    }

    while (faqItems.length < 4) {
      faqItems.push({
        question: `How does ${product.title} fit inside the KC Fixit range?`,
        answer: `${product.title} sits in the ${product.familyCard.toLowerCase()} layer of the ${product.familyLabel.toLowerCase()} range. ${familyProfile.selectionNote} ${product.descriptionSecondary}`
      });
    }

    return faqItems.slice(0, 4);
  }

  return [
    {
      question: `When should I choose ${product.title}?`,
      answer: product.bestFor
    },
    {
      question: `Where is ${product.title} commonly used?`,
      answer: product.useAreas
    },
    {
      question: `What products should I pair with ${product.title}?`,
      answer: product.pairsWith
    },
    {
      question: `How does ${product.title} fit inside the KC Fixit range?`,
      answer: `${product.title} sits in the ${product.familyCard.toLowerCase()} layer of the ${product.familyLabel.toLowerCase()} range. ${familyProfile.selectionNote} ${product.descriptionSecondary}`
    }
  ];
};

document.querySelectorAll(".product-gallery-card").forEach((card) => {
  const targetLink =
    card.querySelector(".product-gallery-card__action") ||
    card.querySelector(".product-gallery-card__media");
  const body = card.querySelector(".product-gallery-card__body");

  if (!targetLink || !body || body.querySelector(".product-gallery-card__meta")) {
    return;
  }

  const href = targetLink.getAttribute("href");
  if (!href || !href.includes("product-detail.html")) {
    return;
  }

  const productUrl = new URL(href, window.location.href);
  const productKey = productUrl.searchParams.get("product");
  if (!productKey || !productDirectory[productKey]) {
    return;
  }

  const brochure = getProductBrochure(productKey);
  if (!brochure) {
    return;
  }

  const chips = [];

  if (brochure.cardPack) {
    chips.push(`<span class="product-gallery-card__chip">${escapeHtml(brochure.cardPack)}</span>`);
  }

  if (brochure.cardBadge) {
    chips.push(`<span class="product-gallery-card__chip product-gallery-card__chip--neutral">${escapeHtml(brochure.cardBadge)}</span>`);
  }

  if (chips.length) {
    body.insertAdjacentHTML("beforeend", `<div class="product-gallery-card__meta">${chips.join("")}</div>`);
  }

  if (brochure.cardNote) {
    body.insertAdjacentHTML("beforeend", `<p class="product-gallery-card__note">${escapeHtml(brochure.cardNote)}</p>`);
  }
});

const productDetailRoot = document.querySelector("[data-product-detail]");

if (productDetailRoot) {
  const imageNode = productDetailRoot.querySelector("[data-product-image]");
  const relatedSelect = productDetailRoot.querySelector("[data-product-related]");
  const familyCardNode = productDetailRoot.querySelector("[data-product-family-card]");
  const packSizeCardNode = productDetailRoot.querySelector("[data-product-pack-size-card]");
  const familyBadgeNode = productDetailRoot.querySelector("[data-product-family-badge]");
  const titleNode = productDetailRoot.querySelector("[data-product-title]");
  const summaryNode = productDetailRoot.querySelector("[data-product-summary]");
  const descriptionNode = productDetailRoot.querySelector("[data-product-description]");
  const descriptionSecondaryNode = productDetailRoot.querySelector("[data-product-description-secondary]");
  const bestForNode = productDetailRoot.querySelector("[data-product-best-for]");
  const useAreasNode = productDetailRoot.querySelector("[data-product-use-areas]");
  const pairsWithNode = productDetailRoot.querySelector("[data-product-pairs-with]");
  const packSizeNode = productDetailRoot.querySelector("[data-product-pack-size]");
  const colorNode = productDetailRoot.querySelector("[data-product-color]");
  const standardNode = productDetailRoot.querySelector("[data-product-standard]");
  const coverageNode = productDetailRoot.querySelector("[data-product-coverage]");
  const workingNode = productDetailRoot.querySelector("[data-product-working]");
  const familyLinkNode = productDetailRoot.querySelector("[data-product-family-link]");
  const featuresNode = document.querySelector("[data-product-features]");
  const specsNode = document.querySelector("[data-product-specs]");
  const knowledgeNode = document.querySelector("[data-product-knowledge]");
  const faqsNode = document.querySelector("[data-product-faqs]");
  const pageDescriptionNode = document.querySelector('meta[name="description"]');
  const fallbackKey = "standard";
  const url = new URL(window.location.href);
  const requestedKey = url.searchParams.get("product") || fallbackKey;
  const resolvedKey = productDirectory[requestedKey] ? requestedKey : fallbackKey;

  const setOptionalText = (node, value) => {
    if (!node) {
      return;
    }

    node.textContent = value || "";

    const container = node.closest("p, .product-detail__control-card");
    if (container) {
      container.hidden = !value;
    }
  };

  const renderProductDetail = (productKey) => {
    const product = productDirectory[productKey];
    const brochure = getProductBrochure(productKey);
    const relatedProducts = Object.entries(productDirectory).filter(([, item]) => item.familyKey === product.familyKey);

    if (imageNode) {
      imageNode.src = product.image;
      imageNode.alt = `${product.title} product image`;
      imageNode.style.objectPosition = product.imagePosition || "center";
    }

    if (relatedSelect) {
      relatedSelect.innerHTML = relatedProducts
        .map(([key, item]) => `<option value="${key}">${item.title}</option>`)
        .join("");
      relatedSelect.value = productKey;
    }

    if (familyCardNode) {
      familyCardNode.textContent = product.familyCard;
    }

    setOptionalText(packSizeCardNode, brochure?.packSize);

    if (familyBadgeNode) {
      familyBadgeNode.textContent = product.familyLabel;
    }

    if (titleNode) {
      titleNode.textContent = product.title;
    }

    if (summaryNode) {
      summaryNode.textContent = brochure?.purpose || product.summary;
    }

    if (descriptionNode) {
      descriptionNode.textContent = brochure?.applications || product.description;
    }

    if (descriptionSecondaryNode) {
      descriptionSecondaryNode.textContent = joinText(brochure?.working, brochure?.coverage) || product.descriptionSecondary;
    }

    if (bestForNode) {
      bestForNode.textContent = product.bestFor;
    }

    if (useAreasNode) {
      useAreasNode.textContent = brochure?.applications || product.useAreas;
    }

    if (pairsWithNode) {
      pairsWithNode.textContent = product.pairsWith;
    }

    setOptionalText(packSizeNode, brochure?.packSize);
    setOptionalText(colorNode, brochure?.color);
    setOptionalText(standardNode, joinText(brochure?.badge, brochure?.standard));
    setOptionalText(coverageNode, brochure?.coverage);
    setOptionalText(workingNode, brochure?.working);

    if (featuresNode) {
      featuresNode.innerHTML = buildProductFeatures(product, brochure)
        .map(
          (item) => `
            <article class="product-feature-card">
              <div class="product-feature-card__icon">${item.icon}</div>
              <div class="product-feature-card__content">
                <span class="product-feature-card__label">${escapeHtml(item.label)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </div>
            </article>
          `
        )
        .join("");
    }

    if (specsNode) {
      specsNode.innerHTML = buildProductSpecs(product, brochure)
        .map(
          ([label, value]) => `
            <tr>
              <td>${escapeHtml(label)}</td>
              <td>${escapeHtml(value)}</td>
            </tr>
          `
        )
        .join("");
    }

    if (knowledgeNode) {
      knowledgeNode.innerHTML = buildProductKnowledge(product, brochure)
        .map(
          (item) => `
            <article class="product-knowledge-card">
              <div class="product-knowledge-card__icon">${item.icon}</div>
              <div class="product-knowledge-card__content">
                <span class="product-knowledge-card__label">${escapeHtml(item.label)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </div>
            </article>
          `
        )
        .join("");
    }

    if (faqsNode) {
      faqsNode.innerHTML = buildProductFaqs(product, brochure)
        .map(
          (item, index) => `
            <details class="product-faq"${index === 0 ? " open" : ""}>
              <summary>${escapeHtml(item.question)}</summary>
              <div class="product-faq__answer">${escapeHtml(item.answer)}</div>
            </details>
          `
        )
        .join("");
    }

    if (familyLinkNode) {
      familyLinkNode.href = product.familyLink;
      familyLinkNode.textContent = product.familyLinkLabel;
    }

    document.title = `${product.title} | KC Fixit`;

    if (pageDescriptionNode) {
      pageDescriptionNode.setAttribute("content", `${product.title}: ${product.summary}`);
    }
  };

  if (requestedKey !== resolvedKey && window.history.replaceState) {
    url.searchParams.set("product", resolvedKey);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  relatedSelect?.addEventListener("change", () => {
    const nextKey = relatedSelect.value;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("product", nextKey);
    window.location.assign(nextUrl.toString());
  });

  renderProductDetail(resolvedKey);
}
