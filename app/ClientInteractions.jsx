"use client";

import { useEffect } from "react";

export default function ClientInteractions() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const navToggle = document.getElementById("navToggle");
    const themeToggleBtn = document.getElementById("themeToggle");

    if (!nav || !navToggle || !themeToggleBtn) return undefined;

    const handleScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 50);
    };

    const closeMobileMenu = () => {
      nav.classList.remove("nav--open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    const handleMenuToggle = () => {
      const isOpen = nav.classList.toggle("nav--open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    const handleThemeToggle = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("essentio-theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("essentio-theme", "dark");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (event) => {
      if (localStorage.getItem("essentio-theme")) return;
      document.documentElement.toggleAttribute("data-theme", event.matches);
      if (event.matches) document.documentElement.setAttribute("data-theme", "dark");
    };

    const handleFaqClick = (event) => {
      const question = event.currentTarget;
      const item = question.parentElement;
      if (!item) return;

      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq__item.active").forEach((openItem) => {
        openItem.classList.remove("active");
        openItem.querySelector(".faq__question")?.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
      }
    };

    const handleAnchorClick = (event) => {
      const anchor = event.currentTarget;
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    };

    const revealElements = document.querySelectorAll(".reveal");
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      revealElements.forEach((element) => observer.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("revealed"));
    }

    const closeLinks = document.querySelectorAll("[data-nav-close]");
    const faqQuestions = document.querySelectorAll(".faq__question");
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    navToggle.addEventListener("click", handleMenuToggle);
    themeToggleBtn.addEventListener("click", handleThemeToggle);
    mediaQuery.addEventListener("change", handleThemeChange);
    closeLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));
    faqQuestions.forEach((question) => question.addEventListener("click", handleFaqClick));
    anchorLinks.forEach((anchor) => anchor.addEventListener("click", handleAnchorClick));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      navToggle.removeEventListener("click", handleMenuToggle);
      themeToggleBtn.removeEventListener("click", handleThemeToggle);
      mediaQuery.removeEventListener("change", handleThemeChange);
      closeLinks.forEach((link) => link.removeEventListener("click", closeMobileMenu));
      faqQuestions.forEach((question) => question.removeEventListener("click", handleFaqClick));
      anchorLinks.forEach((anchor) => anchor.removeEventListener("click", handleAnchorClick));
      observer?.disconnect();
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
