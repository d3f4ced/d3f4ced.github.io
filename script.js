const projects = Array.isArray(window.DEFACED_PROJECTS)
  ? window.DEFACED_PROJECTS
  : [];
const list = document.querySelector("#project-list");
const safeURL = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};
const visibleProjects = projects.filter(
  (project) =>
    project && typeof project.title === "string" && project.title.trim(),
);
visibleProjects.forEach((project, index) => {
  const card = element("article", "project-card");
  const imageURL = safeURL(project.image);
  if (imageURL) {
    const image = element("img", "project-image");
    image.src = imageURL;
    image.alt = project.imageAlt || project.title;
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    card.append(image);
  }
  card.append(
    element(
      "span",
      "section-code",
      `${String(index + 1).padStart(2, "0")} / ${project.category || "PROYECTO"}`,
    ),
    element("h3", "", project.title),
    element("p", "", project.description || ""),
  );
  if (Array.isArray(project.tags)) {
    const tags = element("div", "project-tags");
    project.tags.forEach((tag) =>
      tags.append(element("span", "", String(tag))),
    );
    card.append(tags);
  }
  const links = element("div", "project-links");
  for (const [field, label] of [
    ["repo", "Código"],
    ["url", "Ver proyecto"],
  ]) {
    const url = safeURL(project[field]);
    if (url) {
      const anchor = element("a", "", label);
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute("aria-label", `${label}: ${project.title}`);
      links.append(anchor);
    }
  }
  if (links.children.length) card.append(links);
  list.append(card);
});
document.querySelector("#empty-projects").hidden = visibleProjects.length > 0;
document.querySelector("#project-count").textContent =
  `${visibleProjects.length} ${visibleProjects.length === 1 ? "entry" : "entries"}`;
document.querySelector("#year").textContent = new Date().getFullYear();
let toastTimer;
document.querySelector("#copy-user").addEventListener("click", async () => {
  const toast = document.querySelector("#toast");
  try {
    await navigator.clipboard.writeText("defaced");
    toast.textContent = "Usuario copiado: defaced";
  } catch {
    toast.textContent = "Usuario: defaced";
  }
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
});
const socials = window.DEFACED_SOCIALS || {};
document.querySelectorAll("[data-social]").forEach((link) => {
  const url = safeURL(socials[link.dataset.social]);
  if (!url) return;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.removeAttribute("aria-disabled");
  link.removeAttribute("role");
  link.setAttribute("aria-label", link.dataset.label);
  link.title = link.dataset.label;
});
