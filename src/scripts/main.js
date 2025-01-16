document.addEventListener("DOMContentLoaded", () => {
    const yearElement = document.getElementById("currentYearFooter");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  });
  