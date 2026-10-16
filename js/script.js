
// ==========================================
// AIRCAPOTS ONE
// ANIMACIONES E INTERACCIONES
// JAVASCRIPT PURO
// ==========================================

(() => {
  "use strict";

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    [...document.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  // ==========================================
  // 1. BARRA DE PROGRESO Y HEADER
  // ==========================================

  const progress = $("#scrollProgress");
  const header = $("#siteHeader");

  let pageScroll = window.scrollY;
  let maxScroll = 1;

  function updateScroll() {
    pageScroll = window.scrollY;

    maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight -
      window.innerHeight
    );

    const percentage = clamp(
      pageScroll / maxScroll,
      0,
      1
    ) * 100;

    if (progress) {
      progress.style.width = `${percentage}%`;
    }

    if (header) {
      header.classList.toggle(
        "is-scrolled",
        pageScroll > 20
      );
    }
  }

  window.addEventListener("scroll", updateScroll, {
    passive: true
  });

  window.addEventListener("resize", updateScroll);

  updateScroll();

  // ==========================================
  // 2. ANIMACIÓN DEL MOUSE Y SCROLL
  // ==========================================

  /*
    ANIMACIÓN PROPIA DEL EQUIPO

    Movimiento horizontal:
      x = mouseX * 22

    Movimiento vertical:
      y = mouseY * 12 - scrollFactor * 35

    Rotación:
      r = mouseX * 3

    Escala:
      s = 1 - scrollFactor * 0.04

    Se utilizan interpolaciones para que
    los movimientos sean suaves.

    El producto ya está centrado mediante CSS.
    No se necesita translateX(-50%).
  */

  const hero = $(".hero");
  const heroProduct = $("#heroProduct");

  let targetX = 0;
  let targetY = 0;

  let smoothX = 0;
  let smoothY = 0;

  let currentScroll = pageScroll;

  let heroAnimationId = null;

  // Detectar movimiento del mouse

  if (hero && heroProduct) {

    hero.addEventListener(
      "pointermove",
      (event) => {

        if (
          reducedMotion.matches ||
          event.pointerType === "touch"
        ) {
          return;
        }

        const rect =
          hero.getBoundingClientRect();

        targetX = clamp(
          (
            (event.clientX - rect.left) /
            rect.width - 0.5
          ) * 2,
          -1,
          1
        );

        targetY = clamp(
          (
            (event.clientY - rect.top) /
            rect.height - 0.5
          ) * 2,
          -1,
          1
        );

      },
      { passive: true }
    );

    // Restablecer cuando sale el mouse

    hero.addEventListener(
      "pointerleave",
      () => {

        targetX = 0;
        targetY = 0;

      }
    );

    // Animación suave

    function animateHero() {

      smoothX +=
        (targetX - smoothX) * 0.07;

      smoothY +=
        (targetY - smoothY) * 0.07;

      currentScroll +=
        (pageScroll - currentScroll) * 0.09;

      // Factor del desplazamiento vertical

      const scrollFactor = clamp(
        currentScroll /
        Math.max(1, hero.offsetHeight),
        0,
        1
      );

      // Movimiento por mouse

      const moveX = smoothX * 22;
      const moveY = smoothY * 12;

      // Movimiento adicional por scroll

      const scrollY = scrollFactor * -35;

      // Rotación

      const rotate = smoothX * 3;

      // Escala sutil

      const scale =
        1 - scrollFactor * 0.04;

      // Transformación definitiva

      heroProduct.style.transform = `
        translate3d(
          ${moveX.toFixed(2)}px,
          ${(moveY + scrollY).toFixed(2)}px,
          0
        )
        rotate(${rotate.toFixed(2)}deg)
        scale(${scale.toFixed(3)})
      `;

      // Opacidad suave al bajar

      heroProduct.style.opacity = String(
        1 - scrollFactor * 0.25
      );

      heroAnimationId =
        requestAnimationFrame(animateHero);
    }

    if (!reducedMotion.matches) {
      heroAnimationId =
        requestAnimationFrame(animateHero);
    }
  }

  // ==========================================
  // 3. APARICIONES AL HACER SCROLL
  // ==========================================

  const revealElements = $$(
    ".reveal, .reveal-image"
  );

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {

    const revealObserver =
      new IntersectionObserver(

        (entries, observer) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );

            }

          });

        },

        {
          threshold: 0.12,
          rootMargin: "0px 0px -15px 0px"
        }

      );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

  }

  // ==========================================
  // 4. ONDAS Y ECUALIZADOR
  // ==========================================

  const soundButton = $("#soundToggle");
  const soundVisual = $("#soundVisual");
  const soundLabel = $("#soundLabel");
  const soundIcon = $("#soundIcon");

  if (
    soundButton &&
    soundVisual &&
    soundLabel &&
    soundIcon
  ) {

    soundButton.addEventListener(
      "click",
      () => {

        const active =
          soundVisual.classList.toggle(
            "is-active"
          );

        soundButton.setAttribute(
          "aria-pressed",
          String(active)
        );

        soundLabel.textContent = active
          ? "Pausar visualización"
          : "Activar visualización";

        soundIcon.textContent = active
          ? "Ⅱ"
          : "▶";

      }
    );

  }

  // ==========================================
  // 5. SELECTOR DE COLORES
  // ==========================================

  const stage = $("#colorStage");
  const productImage = $("#productImage");
  const colorName = $("#colorName");

  const swatches = $$(".swatch");

  const availableColors = [
    "Negro",
    "Blanco",
    "Plata",
    "Azul",
    "Rosa",
    "Verde"
  ];

  const imageCache = new Map();

  let colorRequest = 0;
  let colorTimer = null;

  // Precargar los seis PNG

  availableColors.forEach((color) => {

    const image = new Image();

    image.src = `assets/${color}.webp`;

    imageCache.set(color, image);

  });

  // Cambiar color del producto

  function selectColor(button) {

    if (
      !stage ||
      !productImage ||
      !colorName
    ) {
      return;
    }

    const color = button.dataset.color;
    const name = button.dataset.name || color;

    if (!availableColors.includes(color)) {
      return;
    }

    if (
      button.classList.contains("is-selected")
    ) {
      return;
    }

    const nextImage = imageCache.get(color);

    if (!nextImage) {
      return;
    }

    const currentRequest = ++colorRequest;

    const previousButton = $(
      ".swatch.is-selected"
    );

    const previousName = colorName.textContent;

    // Actualizar círculos

    swatches.forEach((swatch) => {

      const selected =
        swatch === button;

      swatch.classList.toggle(
        "is-selected",
        selected
      );

      swatch.setAttribute(
        "aria-pressed",
        String(selected)
      );

    });

    // Comenzar transición

    stage.classList.add("is-switching");

    if (colorTimer !== null) {
      clearTimeout(colorTimer);
    }

    function applyColor() {

      if (
        currentRequest !== colorRequest
      ) {
        return;
      }

      colorTimer = setTimeout(() => {

        if (
          currentRequest !== colorRequest
        ) {
          return;
        }

        productImage.src = nextImage.src;

        productImage.alt =
          `Audífonos AirCapots One color ${name}`;

        colorName.textContent = name;

        stage.classList.remove(
          "is-switching"
        );

      }, reducedMotion.matches ? 0 : 220);
    }

    // Mostrar cuando la imagen cargue

    if (
      nextImage.complete &&
      nextImage.naturalWidth > 0
    ) {

      applyColor();

    } else {

      nextImage.addEventListener(
        "load",
        applyColor,
        { once: true }
      );

      nextImage.addEventListener(
        "error",
        () => {

          if (
            currentRequest !== colorRequest
          ) {
            return;
          }

          stage.classList.remove(
            "is-switching"
          );

          colorName.textContent =
            previousName;

          swatches.forEach((swatch) => {

            const selected =
              swatch === previousButton;

            swatch.classList.toggle(
              "is-selected",
              selected
            );

            swatch.setAttribute(
              "aria-pressed",
              String(selected)
            );

          });

          console.error(`No se encontró assets/${color}.webp`);

        },
        { once: true }
      );

      // También manejar imágenes que ya
      // terminaron de cargar con error.

      if (
        nextImage.complete &&
        nextImage.naturalWidth === 0
      ) {
        nextImage.dispatchEvent(
          new Event("error")
        );
      }
    }
  }

  // Eventos de selección

  swatches.forEach((button) => {

    button.addEventListener(
      "click",
      () => selectColor(button)
    );

  });

  // ==========================================
  // 6. MENÚ RESPONSIVE
  // ==========================================

  const menuButton = $("#menuToggle");
  const navLinks = $("#navLinks");

  function setMenu(open) {

    if (
      !menuButton ||
      !navLinks
    ) {
      return;
    }

    navLinks.classList.toggle(
      "is-open",
      open
    );

    menuButton.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuButton.setAttribute(
      "aria-label",
      open ? "Cerrar menú" : "Abrir menú"
    );

  }

  if (menuButton && navLinks) {

    menuButton.addEventListener(
      "click",
      () => {

        const opened =
          navLinks.classList.contains(
            "is-open"
          );

        setMenu(!opened);

      }
    );

    // Cerrar al elegir una sección

    $$("#navLinks a").forEach((link) => {

      link.addEventListener(
        "click",
        () => setMenu(false)
      );

    });

    // Cerrar con Escape

    document.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Escape") {
          setMenu(false);
        }

      }
    );

    // Cerrar al pulsar fuera

    document.addEventListener(
      "pointerdown",
      (event) => {

        if (
          !menuButton.contains(event.target) &&
          !navLinks.contains(event.target)
        ) {
          setMenu(false);
        }

      }
    );

    // Cerrar si cambia a escritorio

    window.addEventListener(
      "resize",
      () => {

        if (window.innerWidth > 680) {
          setMenu(false);
        }

      }
    );

  }

  // ==========================================
  // FINAL
  // ==========================================

  console.log(
    "AirCapots One - Interacciones cargadas"
  );

})();
