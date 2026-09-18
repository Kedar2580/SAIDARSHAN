document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Pre-fill subject from ?subject= ---------- */
  try {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");
    if (subject) {
      const select = document.getElementById("subject");
      const msg = document.getElementById("message");
      if (select) {
        const opts = Array.from(select.options).map(function (o) { return o.text; });
        const matched = opts.find(function (t) { return subject.toLowerCase().includes(t.toLowerCase()); });
        if (matched) {
          select.value = matched;
        } else {
          const opt = document.createElement("option");
          opt.text = subject;
          opt.selected = true;
          select.appendChild(opt);
        }
      }
      if (msg && !msg.value) {
        msg.value = "I'm interested in the " + subject + " panel. Please share the price and availability.";
      }
    }
  } catch (e) {}

  /* ---------- Mobile menu ---------- */
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  function toggleNav() {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleNav();
    });

    document.addEventListener("click", function (e) {
      if (
        navMenu.classList.contains("open") &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        toggleNav();
      }
    });
  }

  /* ---------- Mobile dropdowns ---------- */
  document.querySelectorAll(".has-subnav > a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });

  /* ---------- Catalog filtering ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll("[data-category]");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      productCards.forEach(function (card) {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* ---------- Form submit handling ---------- */
  document.querySelectorAll("form[data-js-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const action = form.getAttribute("action");
      const success = form.querySelector(".form-success");
      const error = form.querySelector(".form-error");
      const btn = form.querySelector("button[type='submit']");
      const original = btn ? btn.innerHTML : "";

      const resetMessages = function () {
        if (success) success.style.display = "none";
        if (error) error.style.display = "none";
      };
      const setLoading = function (loading) {
        if (btn) {
          btn.innerHTML = loading ? "Sending..." : original;
          btn.disabled = loading;
        }
      };
      const showSuccess = function () {
        if (success) success.style.display = "block";
        form.reset();
        setTimeout(function () {
          if (success) success.style.display = "none";
        }, 6000);
      };
      const showError = function () {
        if (error) error.style.display = "block";
        setTimeout(function () {
          if (error) error.style.display = "none";
        }, 6000);
      };

      resetMessages();

      if (!action) {
        showError();
        return;
      }

      if (!window.fetch) {
        form.action = action;
        form.method = "POST";
        form.submit();
        return;
      }

      const ajaxUrl = action.replace(
        "formsubmit.co/",
        "formsubmit.co/ajax/"
      );
      const data = new FormData(form);

      setLoading(true);
      fetch(ajaxUrl, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) { return res.json(); })
        .then(function (res) {
          setLoading(false);
          if (res && (res.success === "true" || res.success === true)) {
            showSuccess();
          } else {
            showError();
          }
        })
        .catch(function () {
          setLoading(false);
          showError();
        });
    });
  });

  /* ---------- Animate counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const animate = function (el) {
      const base = parseInt(el.getAttribute("data-count"), 10);
      const target = Math.max(1, Math.round(base * (0.8 + Math.random() * 0.5)));
      const duration = 1400;
      const start = performance.now();
      const step = function (now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString("en-IN");
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) {
      io.observe(c);
    });
  }
});