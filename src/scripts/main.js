
// **** Copy and paste code from code elements
// Reference: https://www.roboleary.net/demos/iNGpDikU/preview/?tab=code

const copyButtonIcon = '<i data-lucide="copy"></i>&nbsp;Copy';
// only pre elements that have a code as a child
let blocks = document.querySelectorAll("pre:has(code)");

blocks.forEach((block) => {
    let codeElements = block.querySelectorAll("code");

    codeElements.forEach(codeElement => {
        // Extract language from the class (e.g., "language-javascript")
        let languageClass = [...codeElement.classList].find(cls => cls.startsWith("language-"));
        let language = languageClass ? languageClass.replace("language-", "") : "Code Snippet";
        // Create and insert a header into the pre element
        let codeHeader = document.createElement("div");
        codeHeader.innerText = language.toUpperCase();
        codeHeader.classList.add("code-language-header");

        block.insertBefore(codeHeader, codeElement);

         // Copy code block to the clipboard using Clipboard API
        let button = document.createElement("button");
        button.innerHTML = copyButtonIcon;
        codeHeader.appendChild(button);

        button.addEventListener("click", async () => {
            await copyCode(block, button);
        });
    });
});

async function copyCode(block, button) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  // visual feedback that task is completed
  button.innerHTML = '<i data-lucide="circlecheck"></i>&nbsp;Copied!'

  setTimeout(() => {
    button.innerHTML = copyButtonIcon;
  }, 1000);
}

// Typed JS Animation: https://github.com/mattboldt/typed.js

    var typed = new Typed('#hero-text', {
      strings: ['small businesses', 'churches', 'ministries', 'nonprofits'],
      typeSpeed: 75,       // slightly slower = more human typing
      backSpeed: 50,       // smoother and less abrupt
      backDelay: 1500,     // gives time to read before deleting
      startDelay: 500,     // small pause before starting
      loop: true,           // continuous loop for engagement
    });
