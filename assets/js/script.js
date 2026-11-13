/**
 * Mohamed Rizny — Portfolio Scripts
 * 3D Background Canvas, Theme Toggle & UI Interactions
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // 1. Theme Management
  function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "light";

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

  // The hero uses static text and no background canvas.

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

  // Cards remain steady and readable; no scroll-dependent reveals.

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

      const status = document.getElementById("contact-form-status");
      if (!name || !email || !message || !form.reportValidity()) {
        if (status) status.textContent = "Please enter your name, a valid email and a message.";
        return;
      }
      if (status) status.textContent = "Your email app should open with a draft. Review it and press Send there.";

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
  initNav();
  initScrollSpy();
  initModal();
  initContactForm();
});