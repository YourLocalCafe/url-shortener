const form = document.querySelector("#shorten-form");
const output = document.querySelector("#output");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const originalUrl = form.originalUrl.value.trim();

  try {
    const response = await fetch("/api/url/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    output.innerHTML = `Shortened URL: <a href="${data.shortUrl}" target="_blank" rel="noopener norefferrer">${data.shortUrl}</a>`;
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
  }
});
