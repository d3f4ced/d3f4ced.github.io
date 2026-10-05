const output = document.querySelector("#terminal-output");
const commandInput = document.querySelector("#command-input");
const scrollbox = document.querySelector("#console-scroll");
const announce = document.querySelector("#terminal-announcement");
const history = [];
let historyIndex = 0,
  draft = "",
  voidTimer,
  lastFocus;
const sectionMap = {
  about: ".about",
  skills: "#entorno",
  projects: "#proyectos",
  contact: "#contacto",
};
function line(text, className = "console-line") {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  return p;
}
function welcome() {
  const block = document.createElement("div");
  block.className = "console-welcome";
  block.append(
    line("defaced.sh — personal archive", "boot-title"),
    line("Conexión establecida. El resto depende de tu curiosidad."),
    line("Escribe help para ver los comandos.", "boot-hint"),
    line("Empieza con: ./defaced.sh -show about", "boot-command"),
  );
  output.append(block);
}
function scrollEnd() {
  scrollbox.scrollTop = scrollbox.scrollHeight;
}
function trimOutput() {
  while (output.children.length > 40) output.firstElementChild.remove();
}
function openVoid() {
  clearTimeout(voidTimer);
  lastFocus = document.activeElement;
  const overlay = document.querySelector("#void-overlay");
  overlay.hidden = false;
  document
    .querySelectorAll("header,main,footer")
    .forEach((node) => (node.inert = true));
  document.body.classList.add("void-active");
  document.querySelector("#void-close").focus();
  voidTimer = setTimeout(closeVoid, 4200);
}
function closeVoid() {
  clearTimeout(voidTimer);
  document.querySelector("#void-overlay").hidden = true;
  document.body.classList.remove("void-active");
  document
    .querySelectorAll("header,main,footer")
    .forEach((node) => (node.inert = false));
  lastFocus?.focus({ preventScroll: true });
}
document.querySelector("#void-close").addEventListener("click", closeVoid);
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !document.querySelector("#void-overlay").hidden
  ) {
    event.preventDefault();
    closeVoid();
  }
});
function run(raw) {
  const result = DefacedShell.parse(raw);
  if (result.type === "empty") return;
  history.push(raw);
  if (history.length > 100) history.shift();
  historyIndex = history.length;
  draft = "";
  commandInput.value = "";
  if (result.type === "clear") {
    output.replaceChildren();
    announce.textContent = "Terminal limpia.";
    return;
  }
  const entry = document.createElement("div");
  entry.className = "console-entry";
  entry.append(line(`visitor@void:~$ ${raw}`, "command-echo"));
  const response = document.createElement("div");
  response.className = "console-response";
  let summary = "Comando completado.";
  if (result.type === "section") {
    const section = document
      .querySelector(sectionMap[result.section])
      .cloneNode(true);
    section.removeAttribute("id");
    section
      .querySelectorAll("[id]")
      .forEach((node) => node.removeAttribute("id"));
    section.classList.remove("reveal");
    section.classList.add("shell-result");
    response.append(section);
    summary = `Mostrando ${result.section}.`;
  } else if (result.type === "help") {
    response.append(line("USAGE: ./defaced.sh -show <section>", "help-title"));
    const rows = [
      ["-show about", "Quién está detrás de defaced."],
      ["-show skills", "Linux, lenguajes e intereses."],
      ["-show projects", "Proyectos y herramientas."],
      ["-show contact", "Abrir un canal."],
      ["whoami / skills / projects / contact", "Atajos para las secciones."],
      ["neofetch", "Perfil de defaced en un vistazo."],
      ["history / clear", "Historial y limpiar terminal."],
      ["Tab / ↑ ↓ / Ctrl+L", "Completar, historial y limpiar."],
    ];
    const table = document.createElement("dl");
    table.className = "help-list";
    rows.forEach(([cmd, description]) => {
      const row = document.createElement("div");
      row.append(element("dt", "", cmd), element("dd", "", description));
      table.append(row);
    });
    response.append(
      table,
      line("Algunas cosas no aparecen en help.", "secret-hint"),
    );
    summary = "Ayuda mostrada.";
  } else if (result.type === "neofetch") {
    const profile = element("div", "neofetch-profile");
    const mark = element("div", "neofetch-mark", "[ d ]");
    mark.setAttribute("aria-hidden", "true");
    const details = element("div", "neofetch-details");
    details.append(element("p", "neofetch-title", "defaced@void"));
    const values = element("dl", "neofetch-values");
    [
      ["Alias", "defaced"],
      ["Focus", "Pentesting / seguridad ofensiva"],
      ["Entorno", "Linux / terminal"],
      ["Código", "Python / C / C++ / Bash"],
      ["Explorando", "Web security / reversing"],
      ["Ubicación", "Tenerife, España"],
      ["Estado", "Siempre aprendiendo"],
    ].forEach(([key, value]) => {
      const row = element("div");
      row.append(element("dt", "", key), element("dd", "", value));
      values.append(row);
    });
    details.append(values);
    const palette = element("div", "neofetch-palette");
    palette.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 6; i++) palette.append(element("span"));
    details.append(palette);
    profile.append(mark, details);
    response.append(profile);
    summary = "Perfil de defaced mostrado.";
  } else if (result.type === "sudo") {
    response.append(
      line("nice try. you are still a visitor.", "sudo-response"),
    );
    summary = "nice try. you are still a visitor.";
  } else if (result.type === "usage") {
    response.append(
      line(
        "Uso: ./defaced.sh -show about|skills|projects|contact",
        "console-error",
      ),
    );
  } else if (result.type === "unknown") {
    response.append(
      line(`zsh: command not found: ${result.command}`, "console-error"),
      line("Escribe help. Aquí solo viven los comandos del portfolio."),
    );
  } else if (result.type === "pwd") {
    response.append(line("/home/visitor/void"));
  } else if (result.type === "ls") {
    response.append(
      line(
        "./defaced.sh    about/    skills/    projects/    contact/",
        "directory-list",
      ),
    );
  } else if (result.type === "history") {
    response.append(
      line(
        history
          .map((cmd, index) => `${String(index + 1).padStart(3, " ")}  ${cmd}`)
          .join("\n"),
        "history-output",
      ),
    );
  } else if (result.type === "void") {
    response.append(line("you looked deeper.", "void-result"));
    summary = "you looked deeper.";
    openVoid();
  }
  entry.append(response);
  output.append(entry);
  trimOutput();
  announce.textContent = summary;
  requestAnimationFrame(() => {
    scrollbox.scrollTop = entry.offsetTop - scrollbox.offsetTop - 18;
  });
}
document.querySelector("#command-form").addEventListener("submit", (event) => {
  event.preventDefault();
  run(commandInput.value.trim());
});
let completionState = null;
commandInput.addEventListener("input", () => {
  completionState = null;
});
commandInput.addEventListener("keydown", (event) => {
  if (event.isComposing) return;
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex === history.length) draft = commandInput.value;
    if (historyIndex > 0) commandInput.value = history[--historyIndex];
    completionState = null;
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (historyIndex < history.length) historyIndex++;
    commandInput.value =
      historyIndex === history.length ? draft : history[historyIndex];
    completionState = null;
  } else if (event.key === "Tab" && !event.shiftKey) {
    const value = commandInput.value;
    if (!value) return;
    let matches;
    if (completionState && value === completionState.last) {
      matches = completionState.matches;
      completionState.index = (completionState.index + 1) % matches.length;
    } else {
      matches = DefacedShell.commands.filter((command) =>
        command.startsWith(value),
      );
      if (!matches.length) return;
      completionState = { matches, index: 0, last: "" };
    }
    event.preventDefault();
    commandInput.value = matches[completionState.index];
    completionState.last = commandInput.value;
    announce.textContent = `Comando completado: ${commandInput.value}`;
  } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
    event.preventDefault();
    run("clear");
  } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
    event.preventDefault();
    if (commandInput.value) {
      output.append(
        line(`visitor@void:~$ ${commandInput.value} ^C`, "command-echo"),
      );
      commandInput.value = "";
      scrollEnd();
    }
  }
});
document.querySelectorAll("[data-command]").forEach((button) =>
  button.addEventListener("click", () => {
    commandInput.value = button.dataset.command;
    completionState = null;
    commandInput.focus({ preventScroll: true });
    scrollEnd();
  }),
);
welcome();
if (window.matchMedia("(pointer:fine)").matches)
  commandInput.focus({ preventScroll: true });
