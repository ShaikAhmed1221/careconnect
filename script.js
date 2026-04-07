/* ══════════════════════════════════════════
   CareConnect – script.js
   ══════════════════════════════════════════ */

/* ──────────── NAVBAR SCROLL ──────────── */
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
});

/* ──────────── MOBILE MENU ──────────── */
function toggleMenu() {
  const links = document.getElementById("navLinks");
  const btn = document.getElementById("hamburger");
  if (!links || !btn) return;
  links.classList.toggle("open");
  btn.classList.toggle("open");
}

// Close menu when a nav link is clicked
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("navLinks")?.classList.remove("open");
      document.getElementById("hamburger")?.classList.remove("open");
    });
  });
});

/* ──────────── SMOOTH SCROLL HELPER ──────────── */
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ──────────── ANIMATED COUNTERS ──────────── */
function animateCounters() {
  document.querySelectorAll(".stat-num[data-target]").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent =
        (target >= 1000 ? value.toLocaleString() : value) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// Trigger counters once when the stats card enters viewport
const statsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  },
  { threshold: 0.3 },
);
document.addEventListener("DOMContentLoaded", () => {
  const statsCard = document.querySelector(".stats-card");
  if (statsCard) statsObserver.observe(statsCard);
});

/* ──────────── TAB SWITCHER ──────────── */
function switchTab(name) {
  // Update button states
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase().includes(name.slice(0, 4)),
    );
  });

  // Show correct panel
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.remove("active");
  });
  const target = document.getElementById("tab-" + name);
  if (target) target.classList.add("active");
}

/* ──────────── FORM VALIDATION & SUBMIT ──────────── */
const formConfig = {
  patient: {
    required: ["p-fname", "p-lname", "p-phone", "p-support", "p-city"],
    consent: "p-consent",
  },
  volunteer: {
    required: [
      "v-fname",
      "v-lname",
      "v-email",
      "v-phone",
      "v-city",
      "v-skills",
      "v-lang",
    ],
    consent: "v-consent",
  },
  clinic: {
    required: [
      "cl-name",
      "cl-person",
      "cl-phone",
      "cl-email",
      "cl-addr",
      "cl-type",
    ],
    consent: "cl-consent",
  },
  contact: {
    required: ["c-name", "c-email", "c-msg"],
    consent: null,
  },
};

function submitForm(type) {
  const config = formConfig[type];
  if (!config) return;

  // Validate required fields
  let allValid = true;
  config.required.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value.trim();
    if (!val) {
      markInvalid(el);
      allValid = false;
    } else {
      markValid(el);
    }
  });

  // Validate consent
  if (config.consent) {
    const checkbox = document.getElementById(config.consent);
    if (checkbox && !checkbox.checked) {
      showToast(
        "Please agree to the consent / terms before submitting.",
        "error",
      );
      allValid = false;
    }
  }

  if (!allValid) {
    showToast("Please fill in all required fields (*).", "error");
    return;
  }

  // Simulate submission with loading state
  const btn = document.querySelector("#tab-" + type + " .submit-btn");
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "Submitting…";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.opacity = "1";

      // Show success banner
      const banner = document.getElementById("success-" + type);
      if (banner) {
        banner.classList.add("show");
        banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      // Reset form fields
      config.required.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = "";
          markValid(el);
        }
      });
      if (config.consent) {
        const cb = document.getElementById(config.consent);
        if (cb) cb.checked = false;
      }

      showToast("Submission successful! We'll be in touch soon.", "success");
    }, 1200);
  }
}

function markInvalid(el) {
  el.style.borderColor = "#ef4444";
  el.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)";
  el.addEventListener("input", () => markValid(el), { once: true });
}

function markValid(el) {
  el.style.borderColor = "";
  el.style.boxShadow = "";
}

/* ──────────── TOAST NOTIFICATIONS ──────────── */
function showToast(message, type = "info") {
  // Remove existing toast
  document.getElementById("cc-toast")?.remove();

  const toast = document.createElement("div");
  toast.id = "cc-toast";
  const colors = {
    success: { bg: "#e8f5ef", border: "#c2e0d2", color: "#1a6b4a" },
    error: { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" },
    info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
  };
  const c = colors[type] || colors.info;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    background: c.bg,
    border: `1px solid ${c.border}`,
    color: c.color,
    padding: "14px 20px",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "600",
    fontFamily: "Instrument Sans, sans-serif",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: "9999",
    maxWidth: "360px",
    lineHeight: "1.5",
    animation: "toastIn 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  // Inject keyframe if not present
  if (!document.getElementById("cc-toast-style")) {
    const style = document.createElement("style");
    style.id = "cc-toast-style";
    style.textContent = `@keyframes toastIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s, transform 0.4s";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(16px)";
    setTimeout(() => toast.remove(), 400);
  }, 3800);
}

// chatbot

const API_KEY = "AIzaSyDwbHCrD_exfcZ4zGJHxxGWffMwG19F5PM";

// 🧠 System prompt
const SYSTEM_PROMPT = `You are CareConnect AI, a healthcare NGO assistant in India.
- Be helpful, short (2-4 lines)
- No diagnosis
- Suggest doctor consultation when needed
- For emergencies suggest 108 or nearest hospital`;

function getAIResponse(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("volunteer"))
    return "To volunteer, go to the Volunteer tab and fill the form. Our team will contact you within 48 hours.";

  if (msg.includes("services"))
    return "We provide medical consultation, mental health support, transport aid, and financial assistance.";

  if (msg.includes("donate"))
    return "You can donate via UPI, CSR partnerships, or by contacting our team through the Contact section.";

  if (msg.includes("urgent"))
    return "For emergencies, call 108 immediately or visit the nearest hospital.";

  return "I can help with services, volunteering, donations, or support. Please tell me more.";
}

async function callGemini(text, retries = 2) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            role: "system",
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    const data = await res.json();
    console.log("API RESPONSE:", data);

    if (data?.error?.code === 503 && retries > 0) {
      console.log("Retrying...");
      await new Promise((r) => setTimeout(r, 1500));
      return callGemini(text, retries - 1);
    }

    return data;
  } catch (err) {
    console.error("Fetch Error:", err);
    return { error: true };
  }
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const window_ = document.getElementById("chatWindow");

  if (!input || !window_) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  appendMessage(text, "user");

  // ⏳ Typing indicator
  const typingId = "typing-" + Date.now();
  const typingDiv = document.createElement("div");
  typingDiv.className = "msg bot";
  typingDiv.id = typingId;
  typingDiv.innerHTML = `
    <div class="msg-avatar">🌿</div>
    <div class="msg-bubble">Typing...</div>`;
  window_.appendChild(typingDiv);
  window_.scrollTop = window_.scrollHeight;

  const data = await callGemini(text);

  document.getElementById(typingId)?.remove();

  let reply = "⚠️ No response from AI.";

  if (data?.error) {
    console.log("Using fallback AI");
    reply = getAIResponse(text);
  } else if (data?.candidates?.length > 0) {
    const parts = data.candidates[0].content.parts;
    if (parts) {
      reply = parts.map((p) => p.text).join("");
    }
  }

  appendMessage(reply, "bot", true);
}

function appendMessage(text, role, isMarkdown = false) {
  const window_ = document.getElementById("chatWindow");

  const div = document.createElement("div");
  div.className = "msg " + role;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "bot" ? "🌿" : "👤";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  if (isMarkdown) {
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  div.appendChild(avatar);
  div.appendChild(bubble);
  window_.appendChild(div);
  window_.scrollTop = window_.scrollHeight;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

function sendChip(el) {
  const text = el.textContent.trim();
  document.getElementById("chatInput").value = text;
  sendMessage();
}

/* ──────────── SCROLL REVEAL ──────────── */
document.addEventListener("DOMContentLoaded", () => {
  const revealTargets = document.querySelectorAll(
    ".service-card, .step-card, .testimonial-card, .about-card, .team-card, .partner-badge, .tl-item",
  );

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, idx * 60);
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  revealTargets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    revealObs.observe(el);
  });
});

/* ──────────── ACTIVE NAV LINK ON SCROLL ──────────── */
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id], .hero[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.style.color = "";
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.style.color = "var(--green)";
            }
          });
        }
      });
    },
    { threshold: 0.4 },
  );
  sections.forEach((sec) => sectionObs.observe(sec));
});

/* ──────────── INIT ──────────── */
document.addEventListener("DOMContentLoaded", () => {
  console.log("CareConnect portal loaded ✅");
});
