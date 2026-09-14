/*
 * CATEGORIA — página de destino do modal de sintoma e dos atalhos manuais.
 * Lê ?area=<slug> da URL, cruza com areasCorpo e filtra produtos.js pela
 * interseção de doencas[] com tags[]. Reaproveita produtoLinhaHTML (js/app.js).
 */

(function renderCategoria() {
  const tituloEl = document.getElementById("categoria-titulo");
  const gridEl = document.getElementById("categoria-grid");
  const vazioEl = document.getElementById("categoria-vazio");

  const slug = new URLSearchParams(window.location.search).get("area");
  const area = typeof areasCorpo !== "undefined"
    ? areasCorpo.find((a) => a.slug === slug)
    : null;

  if (!area) {
    tituloEl.textContent = "Categoria não encontrada";
    gridEl.hidden = true;
    vazioEl.hidden = false;
    vazioEl.innerHTML = `Não encontramos essa categoria. <a href="index.html">Voltar para a home</a>.`;
    return;
  }

  tituloEl.textContent = area.label;
  document.title = `${area.label} - Cotara`;

  const filtrados = produtos.filter((p) =>
    p.doencas.some((d) => area.tags.includes(d))
  );

  if (filtrados.length === 0) {
    gridEl.hidden = true;
    vazioEl.hidden = false;
    vazioEl.textContent = "Em breve. Estamos preparando produtos para essa área.";
    return;
  }

  gridEl.innerHTML = filtrados.map(produtoLinhaHTML).join("");
  tituloEl.insertAdjacentHTML(
    "beforeend",
    ` <span class="produtos__contagem">${filtrados.length} ${
      filtrados.length === 1 ? "produto" : "produtos"
    }</span>`
  );
})();
