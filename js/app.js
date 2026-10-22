(() => {
  "use strict";

  const state = {
    phase: "impact",
    awarenessStep: 0,
    transitionId: 0,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  const elements = {};
  const lessonNames = [
    "What just happened?",
    "Why phishing is dangerous",
    "How to recognize phishing"
  ];

  function cacheElements() {
    elements.phases = [...document.querySelectorAll("[data-phase]")];
    elements.lessons = [...document.querySelectorAll("[data-step]")];
    elements.stepRail = [...document.querySelectorAll(".step-rail span")];
    elements.particles = document.getElementById("particles");
    elements.releaseButton = document.getElementById("releaseButton");
    elements.nextButton = document.getElementById("nextButton");
    elements.completeExitButton = document.getElementById("completeExitButton");
    elements.emergencyExitButton = document.getElementById("emergencyExitButton");
    elements.fullscreenButton = document.getElementById("fullscreenButton");
    elements.releaseProgress = document.getElementById("releaseProgress");
    elements.releasePercent = document.getElementById("releasePercent");
    elements.releaseProgressbar = document.querySelector('[role="progressbar"]');
    elements.currentStep = document.getElementById("currentStep");
    elements.lessonStatus = document.getElementById("lessonStatus");
    elements.liveRegion = document.getElementById("liveRegion");
  }

  function initializeExperience() {
    cacheElements();
    createParticles();

    elements.releaseButton.addEventListener("click", handleRelease);
    elements.nextButton.addEventListener("click", handleNext);
    elements.completeExitButton.addEventListener("click", exitSimulation);
    elements.emergencyExitButton.addEventListener("click", exitSimulation);
    elements.fullscreenButton.addEventListener("click", toggleFullscreen);

    document.addEventListener("fullscreenchange", updateFullscreenControl);
    document.addEventListener("webkitfullscreenchange", updateFullscreenControl);

    setPhaseAccessibility("impact");
    updateFullscreenControl();
    startImpactAnimation();
  }

  function createParticles() {
    if (state.reducedMotion) return;

    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 24; index += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${(index * 37) % 101}%`;
      particle.style.top = `${12 + ((index * 53) % 82)}%`;
      particle.style.setProperty("--duration", `${7 + (index % 6)}s`);
      particle.style.setProperty("--delay", `${-(index % 9)}s`);
      particle.style.setProperty("--drift", `${(index % 2 ? 1 : -1) * (18 + (index % 5) * 8)}px`);
      fragment.appendChild(particle);
    }
    elements.particles.appendChild(fragment);
  }

  function startImpactAnimation() {
    requestAnimationFrame(() => document.body.classList.add("is-initialized"));
  }

  function setPhaseAccessibility(activePhase) {
    elements.phases.forEach((phase) => {
      const isActive = phase.dataset.phase === activePhase;
      phase.classList.toggle("is-active", isActive);
      phase.setAttribute("aria-hidden", String(!isActive));
      phase.inert = !isActive;
    });
  }

  function setPhase(nextPhase) {
    state.phase = nextPhase;
    state.transitionId += 1;
    setPhaseAccessibility(nextPhase);
    document.body.classList.toggle("simulation-ended", nextPhase === "neutral");
  }

  function focusElement(selector) {
    requestAnimationFrame(() => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  function announce(message) {
    elements.liveRegion.textContent = "";
    requestAnimationFrame(() => {
      elements.liveRegion.textContent = message;
    });
  }

  function handleRelease() {
    if (state.phase !== "impact") return;

    elements.releaseButton.disabled = true;
    setPhase("release");
    const transitionId = state.transitionId;
    focusElement("#releaseTitle");
    announce("Release sequence initiated. Preparing security awareness briefing.");
    runReleaseProgress(transitionId);
  }

  function runReleaseProgress(transitionId) {
    const duration = state.reducedMotion ? 250 : 2200;
    const startTime = performance.now();

    function update(now) {
      if (state.phase !== "release" || state.transitionId !== transitionId) return;

      const progress = Math.min(100, Math.round(((now - startTime) / duration) * 100));
      elements.releaseProgress.style.width = `${progress}%`;
      elements.releasePercent.textContent = `${progress}%`;
      elements.releaseProgressbar.setAttribute("aria-valuenow", String(progress));

      if (progress < 100) {
        requestAnimationFrame(update);
        return;
      }

      window.setTimeout(() => {
        if (state.phase !== "release" || state.transitionId !== transitionId) return;
        showAwarenessStep(0);
      }, state.reducedMotion ? 0 : 220);
    }

    requestAnimationFrame(update);
  }

  function showAwarenessStep(step) {
    if (!Number.isInteger(step) || step < 0 || step >= elements.lessons.length) return;

    if (state.phase !== "awareness") setPhase("awareness");
    state.awarenessStep = step;

    elements.lessons.forEach((lesson, index) => {
      const isActive = index === step;
      lesson.hidden = !isActive;
      lesson.classList.toggle("is-active", isActive);
      lesson.setAttribute("aria-hidden", String(!isActive));
    });

    elements.stepRail.forEach((segment, index) => {
      segment.classList.toggle("is-complete", index <= step);
    });

    const humanStep = step + 1;
    elements.currentStep.textContent = String(humanStep).padStart(2, "0");
    elements.lessonStatus.textContent = `Step ${humanStep} of 3: ${lessonNames[step]}`;
    elements.nextButton.querySelector("span").textContent = step === 2 ? "COMPLETE" : "NEXT";

    focusElement(`[data-step="${step}"] h3`);
    announce(`Step ${humanStep} of 3. ${lessonNames[step]}`);
  }

  function handleNext() {
    if (state.phase !== "awareness") return;

    if (state.awarenessStep < elements.lessons.length - 1) {
      showAwarenessStep(state.awarenessStep + 1);
      return;
    }

    completeAwareness();
  }

  function completeAwareness() {
    if (state.phase !== "awareness") return;

    setPhase("success");
    focusElement("#successTitle");
    announce("Threat recognized. Awareness completed.");
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  async function requestFullscreen() {
    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen;

    if (!request) {
      announce("Fullscreen is not supported in this browser. The simulation remains fully usable.");
      return;
    }

    try {
      await Promise.resolve(request.call(root));
    } catch {
      announce("Fullscreen was not enabled. You can continue the simulation normally.");
    }
  }

  async function exitFullscreen() {
    if (!fullscreenElement()) return;

    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return;

    try {
      await Promise.resolve(exit.call(document));
    } catch {
      announce("Fullscreen could not be exited automatically. Press Escape to leave fullscreen.");
    }
  }

  function toggleFullscreen() {
    if (fullscreenElement()) {
      exitFullscreen();
      return;
    }
    requestFullscreen();
  }

  function updateFullscreenControl() {
    if (!elements.fullscreenButton) return;
    const isFullscreen = Boolean(fullscreenElement());
    elements.fullscreenButton.querySelector("span").textContent = isFullscreen ? "Leave Fullscreen" : "Enter Fullscreen";
    elements.fullscreenButton.setAttribute("aria-pressed", String(isFullscreen));
  }

  async function exitSimulation() {
    if (state.phase === "neutral") return;

    state.transitionId += 1;
    await exitFullscreen();
    setPhase("neutral");
    focusElement("#neutralTitle");
    announce("Simulation ended. No workstation changes were made. You may close this page.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExperience, { once: true });
  } else {
    initializeExperience();
  }
})();
