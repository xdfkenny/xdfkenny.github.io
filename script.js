document.addEventListener("DOMContentLoaded", () => {
  const projects = {
    cicmun: {
      desc: "Focused digital experience: Centralized portal for MUN conferences and delegates.",
      url: "https://cicmun.qzz.io"
    },
    calendar: {
      desc: "Comprehensive event tracking and scheduling system for global MUN conferences.",
      url: "https://calendar.cicmun.qzz.io"
    },
    echoo: {
      desc: "Premium e-commerce concept featuring modern shopping interfaces and robust logic.",
      url: "https://echooshop.vercel.app"
    }
  };

  const tabs = document.querySelectorAll(".project-tab");
  const desc = document.getElementById("project-desc");
  const link = document.getElementById("project-link");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Update active state
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Update content
      const projectKey = tab.getAttribute("data-project");
      const projectData = projects[projectKey];

      if (projectData) {
        desc.textContent = projectData.desc;
        link.href = projectData.url;
      }
    });
  });

  console.log("Portfolio logic initialized.");
});
