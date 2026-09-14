/*
 * APP — orquestração geral do site (landing, modal de sintoma, carrinho).
 * Fase 6: carrinho + WhatsApp, portado quase 1:1 da lógica do site antigo
 * (montarMensagem()/finalizar()), adaptado pra usar produto.nome como chave
 * (índice de array não é estável entre a lista completa e categoria.html,
 * que trabalha com um subconjunto filtrado de produtos.js).
 * Fase 7: estado do carrinho movido pra sessionStorage (ver seção 3.4/6 do
 * CLAUDE.md) — sobrevive à navegação entre páginas na mesma aba, some ao
 * fechar a aba. Decisão revista em relação à Fase 6 (que previa só memória).
 */

function produtoCardHTML(produto) {
  return `
    <article class="produto-card">
      <div class="produto-card__img" style="background-image:url('${produto.img}')"></div>
      <div class="produto-card__corpo">
        <h3 class="produto-card__nome">${produto.nome}</h3>
        <p class="produto-card__desc">${produto.desc}</p>
        <span class="produto-card__preco">R$ ${produto.preco}</span>
        <button class="produto-card__add" type="button" data-nome="${produto.nome}">
          + Adicionar ao carrinho
        </button>
      </div>
    </article>
  `;
}

function renderListaProdutos() {
  const grid = document.getElementById("produtos-grid");
  if (!grid) return;

  const ordenados = [...produtos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  grid.innerHTML = ordenados.map(produtoCardHTML).join("");
}

renderListaProdutos();

/* ---------- Atalhos manuais da pílula ---------- */

document.querySelectorAll(".pill-nav__item[data-slug]").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = `categoria.html?area=${btn.dataset.slug}`;
  });
});

/* ---------- Foco: trap reaproveitável por modal de sintoma e drawer do carrinho ---------- */

function criarFocoTrap(container, aoFechar) {
  let elementoAnterior = null;

  function focaveis() {
    return Array.from(
      container.querySelectorAll(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      aoFechar();
      return;
    }

    if (e.key === "Tab") {
      const f = focaveis();
      if (f.length === 0) return;

      const primeiro = f[0];
      const ultimo = f[f.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  }

  return {
    abrir() {
      elementoAnterior = document.activeElement;
      container.focus();
      document.addEventListener("keydown", onKeydown);
    },
    fechar() {
      document.removeEventListener("keydown", onKeydown);
      if (elementoAnterior) elementoAnterior.focus();
    },
  };
}

/* ---------- Modal de busca por sintoma ---------- */

(function initModalSintoma() {
  const ctaBtn = document.getElementById("cta-sintoma");
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("modal-sintoma");
  const fecharBtn = document.getElementById("modal-fechar");
  const confirmarBtn = document.getElementById("modal-confirmar");
  const hotspotsWrap = document.getElementById("hotspots");
  const listaEl = document.getElementById("sintomas-lista");
  const figuraEl = document.getElementById("wireframe-figura");

  if (!ctaBtn || !overlay || !modal || typeof areasCorpo === "undefined") return;

  let slugSelecionado = null;
  const trap = criarFocoTrap(modal, fecharModal);

  // ---- monta hotspots (uma área sem hotspot: sono-ansiedade, clicável via silhueta) ----
  areasCorpo
    .filter((area) => area.hotspot)
    .forEach((area) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hotspot";
      btn.dataset.slug = area.slug;
      btn.style.left = `${area.hotspot.x}%`;
      btn.style.top = `${area.hotspot.y}%`;
      btn.setAttribute("aria-label", area.label);
      btn.addEventListener("click", () => selecionarArea(area.slug));
      hotspotsWrap.appendChild(btn);
    });

  figuraEl.addEventListener("click", () => selecionarArea("sono-ansiedade"));

  // ---- monta lista de sintomas ----
  areasCorpo.forEach((area) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sintoma-item";
    btn.dataset.slug = area.slug;
    btn.textContent = area.label;
    btn.addEventListener("click", () => selecionarArea(area.slug));
    li.appendChild(btn);
    listaEl.appendChild(li);
  });

  function selecionarArea(slug) {
    slugSelecionado = slug;

    hotspotsWrap.querySelectorAll(".hotspot").forEach((el) => {
      el.classList.toggle("is-ativo", el.dataset.slug === slug);
    });

    listaEl.querySelectorAll(".sintoma-item").forEach((el) => {
      el.classList.toggle("is-ativo", el.dataset.slug === slug);
    });

    figuraEl.classList.toggle("is-ativo", slug === "sono-ansiedade");

    confirmarBtn.disabled = false;
  }

  function abrirModal() {
    overlay.hidden = false;
    trap.abrir();
  }

  function fecharModal() {
    overlay.hidden = true;
    trap.fechar();
  }

  ctaBtn.addEventListener("click", abrirModal);
  fecharBtn.addEventListener("click", fecharModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharModal();
  });

  confirmarBtn.addEventListener("click", () => {
    if (!slugSelecionado) return;
    window.location.href = `categoria.html?area=${slugSelecionado}`;
  });
})();

/* ---------- Carrinho + WhatsApp ---------- */

(function initCarrinho() {
  const WHATSAPP = "5562984803759"; // 55 (62) 98480-3759 — mesmo número do site antigo

  const fab = document.getElementById("cart-fab");
  const badge = document.getElementById("cart-badge");
  const overlay = document.getElementById("cart-overlay");
  const painel = document.getElementById("cart-painel");
  const fecharBtn = document.getElementById("cart-fechar");
  const itensEl = document.getElementById("cart-itens");
  const totalItensEl = document.getElementById("cart-total-itens");
  const totalValorEl = document.getElementById("cart-total-valor");
  const checkoutBtn = document.getElementById("cart-checkout");
  const toast = document.getElementById("toast");

  if (!fab || !overlay || !painel || typeof produtos === "undefined") return;

  const CHAVE_SESSAO = "cotara_carrinho";

  // { [nome do produto]: quantidade } — sessionStorage: sobrevive à navegação
  // entre index.html/categoria.html na mesma aba, some ao fechar a aba (sem
  // persistência permanente tipo localStorage).
  function carregarCarrinho() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO)) || {};
    } catch (e) {
      return {};
    }
  }

  let carrinho = carregarCarrinho();
  const trap = criarFocoTrap(painel, fecharCarrinho);

  function salvarCarrinho() {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(carrinho));
  }

  function getProduto(nome) {
    return produtos.find((p) => p.nome === nome);
  }

  function adicionar(nome) {
    carrinho[nome] = (carrinho[nome] || 0) + 1;
    salvarCarrinho();
    atualizarCarrinho();
    mostrarToast();
  }

  function mudarQtd(nome, delta) {
    carrinho[nome] = (carrinho[nome] || 0) + delta;
    if (carrinho[nome] <= 0) delete carrinho[nome];
    salvarCarrinho();
    atualizarCarrinho();
  }

  function remover(nome) {
    delete carrinho[nome];
    salvarCarrinho();
    atualizarCarrinho();
  }

  function atualizarCarrinho() {
    const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0);
    badge.textContent = totalItens;
    checkoutBtn.disabled = totalItens === 0;
    renderCarrinho();
  }

  function renderCarrinho() {
    const nomes = Object.keys(carrinho);

    if (nomes.length === 0) {
      itensEl.innerHTML = '<p class="cart-vazio">Seu carrinho está vazio.</p>';
      totalItensEl.textContent = "0";
      totalValorEl.textContent = "R$ 0,00";
      return;
    }

    itensEl.innerHTML = nomes
      .map((nome) => {
        const p = getProduto(nome);
        const qtd = carrinho[nome];
        return `
          <div class="cart-item">
            <div class="cart-item__img" style="background-image:url('${p.img}')"></div>
            <div class="cart-item__info">
              <div class="cart-item__nome">${p.nome}</div>
              <div class="cart-item__qtd">
                <button type="button" data-qtd-delta="-1" data-nome="${p.nome}" aria-label="Diminuir quantidade">−</button>
                <span>${qtd}</span>
                <button type="button" data-qtd-delta="1" data-nome="${p.nome}" aria-label="Aumentar quantidade">+</button>
              </div>
            </div>
            <button class="cart-item__remover" type="button" data-remover="${p.nome}" aria-label="Remover ${p.nome}">🗑</button>
          </div>
        `;
      })
      .join("");

    const totalItens = nomes.reduce((a, nome) => a + carrinho[nome], 0);
    const totalValor = nomes.reduce(
      (soma, nome) =>
        soma + parseFloat(getProduto(nome).preco.replace(",", ".")) * carrinho[nome],
      0
    );

    totalItensEl.textContent = totalItens;
    totalValorEl.textContent = "R$ " + totalValor.toFixed(2).replace(".", ",");
  }

  function montarMensagem() {
    const linhas = Object.keys(carrinho).map((nome) => {
      const qtd = carrinho[nome];
      return qtd > 1 ? `${qtd}x ${nome}` : `1x ${nome}`;
    });
    return (
      "Olá!\nGostaria de fazer um pedido:\n\n" +
      linhas.join("\n") +
      "\n\nPoderia me confirmar a disponibilidade?"
    );
  }

  function finalizar() {
    if (Object.keys(carrinho).length === 0) return;
    const msg = encodeURIComponent(montarMensagem());
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
    carrinho = {};
    salvarCarrinho();
    atualizarCarrinho();
    fecharCarrinho();
  }

  function abrirCarrinho() {
    overlay.hidden = false;
    trap.abrir();
  }

  function fecharCarrinho() {
    overlay.hidden = true;
    trap.fechar();
  }

  let toastTimer;
  function mostrarToast() {
    if (!toast) return;
    toast.classList.add("is-visivel");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visivel"), 2200);
  }

  // ---- adicionar ao carrinho a partir de qualquer produto-card (landing ou categoria) ----
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".produto-card__add");
    if (addBtn) adicionar(addBtn.dataset.nome);
  });

  // ---- interações dentro do painel do carrinho ----
  itensEl.addEventListener("click", (e) => {
    const qtdBtn = e.target.closest("[data-qtd-delta]");
    if (qtdBtn) {
      mudarQtd(qtdBtn.dataset.nome, parseInt(qtdBtn.dataset.qtdDelta, 10));
      return;
    }
    const remBtn = e.target.closest("[data-remover]");
    if (remBtn) remover(remBtn.dataset.remover);
  });

  fab.addEventListener("click", abrirCarrinho);
  fecharBtn.addEventListener("click", fecharCarrinho);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharCarrinho();
  });
  checkoutBtn.addEventListener("click", finalizar);

  atualizarCarrinho();
})();
