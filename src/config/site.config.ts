export const siteConfig = {
  name: "Luca Torelli",
  role: {
    it: "Studente di Ingegneria Informatica · Politecnico di Torino",
    en: "Computer Engineering Student · Politecnico di Torino",
  },
  email: "torelliluca06@gmail.com",
  github: "https://github.com/TorelliLuca",
  linkedin: "https://linkedin.com/in/luca-torelli-224974263",
  bio: {
    it: [
      "Sono uno studente di Ingegneria Informatica al Politecnico di Torino, con un solido background in informatica e robotica.",
      "Ho conseguito il diploma all'ITIS a pieni voti in Informatica, curvatura Smart Robot: un percorso che mi ha dato basi solide in programmazione e sistemi complessi, rafforzando la passione per lo sviluppo software e l'intelligenza artificiale.",
      "Cerco opportunità per ampliare le competenze e contribuire a progetti innovativi, crescendo nel mondo dello sviluppo software e mettendo in pratica ciò che studio all'università.",
    ],
    en: [
      "I'm a Computer Engineering student at Politecnico di Torino, with a strong background in computer science and robotics.",
      "I graduated from ITIS with full marks in Computer Science, Smart Robot track — a path that gave me solid foundations in programming and complex systems, and strengthened my passion for software development and artificial intelligence.",
      "I'm always looking for opportunities to expand my skills and contribute to innovative projects, growing professionally in software development and applying what I learn at university.",
    ],
  },
  education: [
    {
      school: "Politecnico di Torino",
      degree: {
        it: "Ingegneria Informatica",
        en: "Computer Engineering",
      },
      detail: {
        it: "Laurea triennale · in corso",
        en: "Bachelor's degree · in progress",
      },
    },
    {
      school: "ITIS",
      degree: {
        it: "Informatica · curvatura Smart Robot",
        en: "Computer Science · Smart Robot track",
      },
      detail: {
        it: "Diploma · 100/100",
        en: "Diploma  · 100/100",
      },
    },
  ],
  nav: [
    { href: "/#about", key: "about" as const },
    { href: "/#skills", key: "skills" as const },
    { href: "/#projects", key: "projects" as const },
    { href: "/#visualizzazioni", key: "visualizations" as const },
    { href: "/#showcase", key: "showcase" as const },
    { href: "/#contact", key: "contact" as const },
  ],
  skills: [
    {
      icon: "code" as const,
      titleKey: "skillSoftwareTitle" as const,
      descKey: "skillSoftwareDesc" as const,
    },
    {
      icon: "brain" as const,
      titleKey: "skillAiTitle" as const,
      descKey: "skillAiDesc" as const,
    },
    {
      icon: "cpu" as const,
      titleKey: "skillRoboticsTitle" as const,
      descKey: "skillRoboticsDesc" as const,
    },
    {
      icon: "rocket" as const,
      titleKey: "skillWebTitle" as const,
      descKey: "skillWebDesc" as const,
    },
  ],
  languages: ["C", "C++", "Java", "JavaScript", "Python", "TypeScript"],
} as const;
