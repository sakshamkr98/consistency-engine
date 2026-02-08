const editor = document.querySelector(".editor");
const API = "https://consistency-engine.onrender.com/api";


async function loadBlog() {
  const res = await fetch(`${API}/blog`);
  const data = await res.json();
  if (data.content) editor.innerHTML = data.content;
}

async function saveBlog() {
  await fetch(`${API}/blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: editor.innerHTML })
  });
}

editor.addEventListener("input", saveBlog);
loadBlog();
