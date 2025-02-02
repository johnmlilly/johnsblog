
// **** Copy and paste code from code elements
// Reference: https://www.roboleary.net/demos/iNGpDikU/preview/?tab=code

const copyButtonIcon = '<i class="bi bi-clipboard-check"></i>';
// only pre elements that have a code as a child
let blocks = document.querySelectorAll("pre:has(code)");

blocks.forEach((block) => {
  // only add button if browser supports Clipboard API
  if (navigator.clipboard) {
    let button = document.createElement("button");
    button.innerHTML = copyButtonIcon;
    block.appendChild(button);

    button.addEventListener("click", async () => {
      await copyCode(block, button);
    });
  }
});

async function copyCode(block, button) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  // visual feedback that task is completed
  button.innerHTML = '<i class="bi bi-check-circle"></i>'

  setTimeout(() => {
    button.innerHTML = copyButtonIcon;
  }, 1000);
}