(function (root) {
  const commands = [
    "neofetch",
    "sudo",
    "help",
    "whoami",
    "skills",
    "projects",
    "contact",
    "ls",
    "pwd",
    "clear",
    "history",
    "cat interests.conf",
    "./defaced.sh -show about",
    "./defaced.sh -show skills",
    "./defaced.sh -show projects",
    "./defaced.sh -show contact",
  ];
  const aliases = {
    about: "about",
    whoami: "about",
    skills: "skills",
    environment: "skills",
    entorno: "skills",
    project: "projects",
    projects: "projects",
    proyectos: "projects",
    contact: "contact",
    contacto: "contact",
  };
  function parse(raw) {
    const value = raw.trim().replace(/\s+/g, " ");
    if (!value) return { type: "empty" };
    const parts = value.split(" ");
    if (parts[0] === "sudo") return { type: "sudo" };
    if (parts[0] === "./defaced.sh") {
      if (
        parts.length === 1 ||
        (["--help", "-h"].includes(parts[1]) && parts.length === 2)
      )
        return { type: "help" };
      if (parts[1] === "-show" && parts.length === 3 && aliases[parts[2]])
        return { type: "section", section: aliases[parts[2]] };
      return { type: "usage" };
    }
    if (aliases[value]) return { type: "section", section: aliases[value] };
    if (value === "cat interests.conf")
      return { type: "section", section: "skills" };
    if (
      ["help", "neofetch", "ls", "pwd", "clear", "history", "void"].includes(
        value,
      )
    )
      return { type: value };
    return { type: "unknown", command: parts[0] };
  }
  root.DefacedShell = { parse, commands };
})(typeof window !== "undefined" ? window : globalThis);
