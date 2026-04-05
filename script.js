(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navbar = document.querySelector(".navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinksContainer = document.querySelector(".nav-links");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const floatingCta = document.querySelector(".floating-cta");
  const heroSection = document.querySelector(".hero");
  const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
  const revealNodes = Array.from(document.querySelectorAll(".reveal, .reveal-item"));
  const counterNodes = Array.from(document.querySelectorAll("[data-counter]"));
  const exploreViewButtons = Array.from(document.querySelectorAll(".explore-view-btn"));
  const sectionLinks = navLinks.filter((link) => {
    const href = link.getAttribute("href") || "";
    return href.startsWith("#");
  });

  const RESORT_COORDINATES = Object.freeze({
    lat: 19.58825,
    lon: 72.75667
  });

  const NEARBY_PLACE_COORDINATES = Object.freeze({
    "bhavangad-fort": {
      lat: 19.58427778,
      lon: 72.74663889,
      distanceKmOverride: 1.9
    },
    "kelwa-beach": {
      lat: 19.62225,
      lon: 72.7379,
      distanceKmOverride: 4.9,
      driveMinutesOverride: 10
    },
    "shitladevi-temple": {
      lat: 19.6075,
      lon: 72.7442,
      distanceKmOverride: 4.9,
      driveMinutesOverride: 10
    },
    "kelva-fort": {
      lat: 19.6246,
      lon: 72.7366,
      distanceKmOverride: 4.2,
      driveMinutesOverride: 10
    },
    "aashapuri-devi-mandir": {
      lat: 19.5958,
      lon: 72.7494,
      distanceKmOverride: 1.7,
      driveMinutesOverride: 5
    },
    "kelva-dam": {
      lat: 19.6181,
      lon: 72.7483,
      distanceKmOverride: 11.5,
      driveMinutesOverride: 30
    }
  });

  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function closeMobileMenu() {
    if (!menuToggle || !navLinksContainer) return;
    menuToggle.classList.remove("is-open");
    navLinksContainer.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function initMobileMenu() {
    if (!menuToggle || !navLinksContainer) return;

    menuToggle.addEventListener("click", function () {
      const isOpen = navLinksContainer.classList.toggle("open");
      menuToggle.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", function (event) {
      if (!navLinksContainer.classList.contains("open")) return;
      const clickedInsideMenu =
        navLinksContainer.contains(event.target) || menuToggle.contains(event.target);
      if (!clickedInsideMenu) closeMobileMenu();
    });

  }

  function setNavbarState() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 18);
  }

  function updateActiveNav() {
    if (!sectionLinks.length || !sections.length) return;

    const navOffset = (navbar ? navbar.offsetHeight : 72) + 120;
    let activeId = "#" + sections[0].id;

    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - navOffset) {
        activeId = "#" + section.id;
      }
    });

    sectionLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === activeId);
    });
  }

  function setRevealDelays() {
    const groups = Array.from(document.querySelectorAll(".reveal"));
    groups.forEach((group) => {
      const nestedItems = Array.from(group.querySelectorAll(".reveal-item"));
      nestedItems.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index, 7) * 70}ms`);
      });
    });
  }

  function revealWithObserver() {
    if (!revealNodes.length) return;

    if (!("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => {
        node.classList.add("active", "is-visible", "animate");
        node.classList.remove("hidden");
      });
      return;
    }

    revealNodes.forEach((node) => node.classList.add("hidden"));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const node = entry.target;
          if (entry.isIntersecting) {
            node.classList.add("active", "is-visible", "animate");
            node.classList.remove("hidden");
          } else {
            node.classList.remove("active", "is-visible", "animate");
            node.classList.add("hidden");
          }
        });
      },
      { threshold: [0, 0.12, 0.32], rootMargin: "0px 0px -4% 0px" }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  let floatingTriggerPoint = 420;

  function recalculateFloatingCtaTrigger() {
    floatingTriggerPoint = heroSection
      ? heroSection.offsetTop + heroSection.offsetHeight * 0.58
      : 420;
  }

  function updateFloatingCta() {
    if (!floatingCta) return;
    floatingCta.classList.toggle("visible", window.scrollY > floatingTriggerPoint);
  }

  function formatCounterValue(value, hasDecimal) {
    if (hasDecimal) return value.toFixed(1);
    return Math.round(value).toLocaleString("en-IN");
  }

  function animateCounter(counter) {
    const target = parseFloat(counter.dataset.counter || "0");
    if (Number.isNaN(target)) return;

    const suffix = counter.dataset.suffix || "";
    const hasDecimal = String(counter.dataset.counter || "").includes(".");
    const duration = 1400;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentValue = target * easedProgress;

      counter.textContent = formatCounterValue(currentValue, hasDecimal) + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        counter.textContent = formatCounterValue(target, hasDecimal) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    if (!counterNodes.length) return;

    if (!("IntersectionObserver" in window)) {
      counterNodes.forEach((counter) => animateCounter(counter));
      return;
    }

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    counterNodes.forEach((counter) => counterObserver.observe(counter));
  }

  function initDateInputs() {
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    if (!checkin || !checkout) return;

    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    checkin.min = minDate;
    checkout.min = minDate;

    checkin.addEventListener("change", function () {
      if (!checkin.value) return;
      checkout.min = checkin.value;
      if (checkout.value && checkout.value < checkin.value) {
        checkout.value = checkin.value;
      }
    });
  }

  function updateParallax() {
    if (prefersReducedMotion || !parallaxNodes.length) return;

    const viewportHeight = window.innerHeight || 1;

    parallaxNodes.forEach((node) => {
      const speed = parseFloat(node.dataset.parallax || "0");
      if (!speed) return;

      const rect = node.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
      const shift = Math.max(-30, Math.min(30, -distanceFromCenter * speed));
      node.style.setProperty("--parallax-shift", `${shift.toFixed(2)}px`);
    });
  }

  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function haversineDistanceKm(from, to) {
    const earthRadiusKm = 6371;
    const latDelta = toRadians(to.lat - from.lat);
    const lonDelta = toRadians(to.lon - from.lon);

    const a =
      Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
      Math.cos(toRadians(from.lat)) *
        Math.cos(toRadians(to.lat)) *
        Math.sin(lonDelta / 2) *
        Math.sin(lonDelta / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  function estimateDriveMinutes(distanceKm, averageSpeedKmh = 40) {
    const minutes = (distanceKm / averageSpeedKmh) * 60;
    return Math.max(1, Math.round(minutes));
  }

  function formatDistance(distanceKm) {
    return `${distanceKm.toFixed(1)} km away`;
  }

  function formatDriveTime(minutes) {
    return `Approx. ${minutes} mins drive`;
  }

  function updateExploreCardTravelMeta() {
    const exploreCards = Array.from(document.querySelectorAll(".explore-card"));

    exploreCards.forEach((card) => {
      const button = card.querySelector(".explore-view-btn");
      if (!button) return;

      const placeId = button.dataset.exploreId || "";
      if (!placeId) return;

      const placeCoordinates = NEARBY_PLACE_COORDINATES[placeId];
      if (!placeCoordinates) return;

      const distanceKm =
        typeof placeCoordinates.distanceKmOverride === "number"
          ? placeCoordinates.distanceKmOverride
          : haversineDistanceKm(RESORT_COORDINATES, placeCoordinates);
      const driveMinutes =
        typeof placeCoordinates.driveMinutesOverride === "number"
          ? placeCoordinates.driveMinutesOverride
          : estimateDriveMinutes(distanceKm);

      const distanceNode = card.querySelector("[data-explore-distance]");
      const timeNode = card.querySelector("[data-explore-time]");

      if (distanceNode) {
        distanceNode.innerHTML = `<span class="explore-meta-icon">📍</span> ${formatDistance(distanceKm)}`;
      }

      if (timeNode) {
        timeNode.innerHTML = `<span class="explore-meta-icon">⏱</span> ${formatDriveTime(driveMinutes)}`;
      }
    });
  }

  function initExploreLinks() {
    if (!exploreViewButtons.length) return;

    updateExploreCardTravelMeta();

    exploreViewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const exploreId = button.dataset.exploreId;
        if (!exploreId) return;
        window.location.href = `explore-details.html?id=${encodeURIComponent(exploreId)}`;
      });
    });
  }

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(function () {
      setNavbarState();
      updateActiveNav();
      updateFloatingCta();
      updateParallax();
      scrollTicking = false;
    });
  }

  function init() {
    initMobileMenu();
    initDateInputs();
    setRevealDelays();
    revealWithObserver();
    initCounters();
    initExploreLinks();

    recalculateFloatingCtaTrigger();
    setNavbarState();
    updateActiveNav();
    updateFloatingCta();
    updateParallax();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) closeMobileMenu();
      recalculateFloatingCtaTrigger();
      onScroll();
    });
  }

  init();
})();
