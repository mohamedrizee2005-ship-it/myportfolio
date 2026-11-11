/**
 * Mohamed Rizny — Portfolio Scripts
 * 3D Background Canvas, Theme Toggle & UI Interactions
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = !window.matchMedia("(hover: hover)").matches;

  // 1. Theme Management
  function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "dark";

    document.documentElement.setAttribute("data-theme", savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme", nextTheme);
      });
    }
  }

  // 2. 3D Neural Manifold Background Canvas (Refined, High-Transparency & Elegant)
  function initBackgroundCanvas() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Keep a beautiful static background on touch devices without continuous GPU/CPU work.
    const staticMobile = isTouchDevice || window.matchMedia("(max-width: 640px)").matches;
    let width, height, dpr;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 220,
      isActive: false
    };

    let cols, rows;
    const spacing = 48;
    const fov = 400;
    const cameraZ = 520;
    const cameraY = -95;
    const cameraPitch = 0.50;

    const pulses = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      // Reset the transform on every resize to avoid multiplying the device-pixel scale.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / spacing) + 14;
      rows = Math.ceil(height / spacing) + 16;
    }

    function project3D(x, y, z) {
      const cosP = Math.cos(cameraPitch);
      const sinP = Math.sin(cameraPitch);

      const rotY = y * cosP - z * sinP + cameraY;
      const rotZ = y * sinP + z * cosP + cameraZ;

      if (rotZ <= 0) return null;

      const scale = fov / rotZ;
      return {
        x: width / 2 + x * scale,
        y: height / 2 + rotY * scale,
        scale,
        depth: rotZ
      };
    }

    function handlePointer(clientX, clientY) {
      mouse.targetX = clientX;
      mouse.targetY = clientY;

      if (!mouse.isActive) {
        mouse.x = clientX;
        mouse.y = clientY;
        mouse.isActive = true;
      }

      // Smooth parallax on ambient background glows
      const glow1 = document.getElementById("glow-1");
      const glow2 = document.getElementById("glow-2");
      const moveX = (clientX / width - 0.5) * 25;
      const moveY = (clientY / height - 0.5) * 25;

      if (glow1) glow1.style.transform = `translate(${moveX * 1.1}px, ${moveY * 1.1}px)`;
      if (glow2) glow2.style.transform = `translate(${-moveX}px, ${-moveY}px)`;

      const cursorGlow = document.querySelector("[data-cursor-glow]");
      if (cursorGlow) {
        cursorGlow.style.transform = `translate(${clientX}px, ${clientY}px)`;
      }
    }

    // Mouse pointer events
    window.addEventListener("mousemove", (e) => handlePointer(e.clientX, e.clientY));
    window.addEventListener("mouseleave", () => { mouse.isActive = false; });

    // Touch events for mobile phones & tablets
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length > 0) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("touchend", () => { mouse.isActive = false; }, { passive: true });

    function spawnPulse() {
      if (pulses.length < 5 && Math.random() < 0.03) {
        pulses.push({
          col: Math.floor(Math.random() * (cols - 4)) - Math.floor(cols / 2),
          row: Math.floor(Math.random() * (rows - 4)) - Math.floor(rows / 2),
          progress: 0,
          speed: 0.012 + Math.random() * 0.015
        });
      }
    }

    let time = 0;
    function render() {
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";

      ctx.clearRect(0, 0, width, height);

      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.09;
        mouse.y += (mouse.targetY - mouse.y) * 0.09;
      }

      const gridPoints = [];
      const startX = -Math.floor(cols / 2);
      const endX = Math.floor(cols / 2);
      const startZ = -Math.floor(rows / 2);
      const endZ = Math.floor(rows / 2);

      for (let c = startX; c <= endX; c++) {
        gridPoints[c] = [];
        for (let r = startZ; r <= endZ; r++) {
          const worldX = c * spacing;
          const worldZ = r * spacing;

          const t = time * 0.0012;
          let waveY =
            Math.sin(worldX * 0.003 + t) * Math.cos(worldZ * 0.003 + t * 0.8) * 30 +
            Math.sin((worldX + worldZ) * 0.002 + t * 1.1) * 14;

          const testProj = project3D(worldX, waveY, worldZ);
          let influence = 0;

          if (testProj && mouse.isActive && mouse.x > 0) {
            const dx = testProj.x - mouse.x;
            const dy = testProj.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
              influence = Math.pow(1 - dist / mouse.radius, 2);
              waveY -= influence * 52; // Smooth, subtle elevation
            }
          }

          gridPoints[c][r] = {
            proj: project3D(worldX, waveY, worldZ),
            influence
          };
        }
      }

      // Draw Neural Grid Vectors with High Transparency
      for (let c = startX; c < endX; c++) {
        for (let r = startZ; r < endZ; r++) {
          const p0 = gridPoints[c][r].proj;
          const pRight = gridPoints[c + 1][r].proj;
          const pDown = gridPoints[c][r + 1].proj;

          const influence = Math.max(
            gridPoints[c][r].influence,
            gridPoints[c + 1][r].influence,
            gridPoints[c][r + 1].influence
          );

          if (p0 && pRight && p0.depth > 50 && pRight.depth > 50) {
            const depthAlpha = Math.max(0, Math.min(1, (1050 - p0.depth) / 900));
            // Delicate, translucent line alpha
            const alpha = (0.06 + influence * 0.28) * depthAlpha;

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(pRight.x, pRight.y);

            if (influence > 0.05) {
              ctx.strokeStyle = isDark ? `rgba(0, 242, 254, ${alpha})` : `rgba(2, 132, 199, ${alpha})`;
              ctx.lineWidth = 0.7 + influence * 0.8;
            } else {
              ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${alpha * 0.6})` : `rgba(148, 163, 184, ${alpha * 0.7})`;
              ctx.lineWidth = 0.55;
            }
            ctx.stroke();
          }

          if (p0 && pDown && p0.depth > 50 && pDown.depth > 50) {
            const depthAlpha = Math.max(0, Math.min(1, (1050 - p0.depth) / 900));
            const alpha = (0.06 + influence * 0.28) * depthAlpha;

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(pDown.x, pDown.y);

            if (influence > 0.05) {
              ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${alpha})` : `rgba(124, 58, 237, ${alpha})`;
              ctx.lineWidth = 0.7 + influence * 0.8;
            } else {
              ctx.strokeStyle = isDark ? `rgba(139, 92, 246, ${alpha * 0.5})` : `rgba(203, 213, 225, ${alpha * 0.7})`;
              ctx.lineWidth = 0.55;
            }
            ctx.stroke();
          }

          // Refined, Translucent Node Dots
          if (p0 && p0.depth > 80) {
            const depthAlpha = Math.max(0, Math.min(1, (1050 - p0.depth) / 900));
            if (influence > 0.08) {
              const radius = (1.2 + influence * 2.0) * (p0.scale * 1.05);

              // Soft, translucent ethereal outer halo (no harsh reflection)
              ctx.beginPath();
              ctx.arc(p0.x, p0.y, radius * 2.2, 0, Math.PI * 2);
              ctx.fillStyle = isDark ? `rgba(0, 242, 254, ${influence * 0.12})` : `rgba(2, 132, 199, ${influence * 0.10})`;
              ctx.fill();

              // Subtle inner luminous core
              ctx.beginPath();
              ctx.arc(p0.x, p0.y, radius, 0, Math.PI * 2);
              ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${0.45 + influence * 0.35})` : `rgba(2, 132, 199, 0.65)`;
              ctx.fill();
            } else if ((c + r) % 3 === 0) {
              // Subtle background micro-points
              ctx.beginPath();
              ctx.arc(p0.x, p0.y, 0.95 * p0.scale, 0, Math.PI * 2);
              ctx.fillStyle = isDark ? `rgba(56, 189, 248, ${0.16 * depthAlpha})` : `rgba(148, 163, 184, ${0.28 * depthAlpha})`;
              ctx.fill();
            }
          }
        }
      }

      // Render Soft Energy Pulses
      spawnPulse();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        const c = pulse.col;
        const r = pulse.row;

        if (gridPoints[c] && gridPoints[c][r] && gridPoints[c][r].proj) {
          const p = gridPoints[c][r].proj;
          const alpha = Math.sin(pulse.progress * Math.PI) * 0.45;

          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? `rgba(0, 242, 254, ${alpha})` : `rgba(2, 132, 199, ${alpha})`;
          ctx.fill();
        }

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
        }
      }

      time += 33;
    }

    // Cap drawing to roughly 30 FPS on larger screens and stop work in background tabs.
    const minFrameMs = 1000 / 30;
    let frameHandle = 0;
    let lastFrameMs = 0;

    function animationFrame(now) {
      frameHandle = 0;
      if (document.hidden) return;
      if (now - lastFrameMs >= minFrameMs) {
        render();
        lastFrameMs = now;
      }
      frameHandle = requestAnimationFrame(animationFrame);
    }

    function startAnimation() {
      if (!staticMobile && !document.hidden && !frameHandle) {
        frameHandle = requestAnimationFrame(animationFrame);
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frameHandle) {
        cancelAnimationFrame(frameHandle);
        frameHandle = 0;
      } else if (!document.hidden) {
        startAnimation();
      }
    });

    window.addEventListener("resize", () => {
      resize();
      if (staticMobile) render();
    });
    resize();
    if (staticMobile) render();
    else startAnimation();
  }

  // 3. Typewriter Animation
  function initTypewriter() {
    const target = document.querySelector("[data-typewriter]");
    if (!target) return;

    let phrases = [];
    try {
      phrases = JSON.parse(target.getAttribute("data-typewriter"));
    } catch (err) {
      phrases = ["Exploring Machine Learning & Deep Learning", "Architecting Scalable Software & Cloud AI"];
    }

    // Respect reduced-motion preferences while keeping the subtitle readable.
    if (prefersReducedMotion) {
      target.textContent = phrases[0] || "Learning AI and software development";
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        target.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        target.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 35 : 65;

      if (!isDeleting && charIndex === current.length) {
        delay = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(tick, delay);
    }

    tick();
  }

  // 4. Mobile Navigation with Outside Click
  function initNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");

    if (!toggle || !menu) return;

    const closeNav = () => {
      menu.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menu.getAttribute("data-open") === "true";
      menu.setAttribute("data-open", isOpen ? "false" : "true");
      toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    menu.querySelectorAll("[data-nav-link]").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    // Close menu when tapping outside
    document.addEventListener("click", (e) => {
      if (menu.getAttribute("data-open") === "true" && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  // 5. ScrollSpy
  function initScrollSpy() {
    const links = document.querySelectorAll("[data-nav-link]");
    if (!links.length) return;

    const sections = Array.from(links)
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // 6. Card 3D Tilt Effect
  function initTilt() {
    if (isTouchDevice || prefersReducedMotion) return;

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const imgBox = card.querySelector(".cert-image-box");

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        const rotY = (px - 0.5) * 10;
        const rotX = (0.5 - py) * 10;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;

        if (imgBox) {
          imgBox.style.setProperty("--spot-x", `${px * 100}%`);
          imgBox.style.setProperty("--spot-y", `${py * 100}%`);
          imgBox.style.setProperty("--spot-opacity", "1");
        }
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        if (imgBox) {
          imgBox.style.setProperty("--spot-opacity", "0");
        }
      });
    });
  }

  // 7. Scroll Reveal
  function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((item) => item.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  // 8. Certificate Modal Lightbox
  function initModal() {
    const modal = document.querySelector("[data-lightbox]");
    const modalImg = document.querySelector("[data-lightbox-img]");
    const closeBtn = document.querySelector("[data-lightbox-close]");

    if (!modal || !modalImg || !closeBtn) return;

    function openModal(src, alt) {
      modalImg.src = src;
      modalImg.alt = alt || "Certificate Image";
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.hidden = true;
      modalImg.src = "";
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".zoom-button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const img = btn.closest(".cert-image-box")?.querySelector("img");
        if (img && img.src) {
          openModal(img.src, img.alt);
        }
      });
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  // 9. Contact Form Email Handler
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("fullname")?.value.trim() || "";
      const email = document.getElementById("email")?.value.trim() || "";
      const subject = document.getElementById("subject")?.value.trim() || `Portfolio Contact from ${name}`;
      const message = document.getElementById("message")?.value.trim() || "";

      if (!name || !email || !message) return;

      const recipient = "mohamedrizee2005@gmail.com";
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  // 10. Dynamic Copyright Year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Initialize Modules
  initTheme();
  initBackgroundCanvas();
  initTypewriter();
  initNav();
  initScrollSpy();
  initTilt();
  initScrollReveal();
  initModal();
  initContactForm();
});