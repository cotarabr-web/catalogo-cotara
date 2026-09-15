/*
 * APP — orquestração geral do site (landing, modal de sintoma, carrinho).
 * Fase 6: carrinho + WhatsApp, portado quase 1:1 da lógica do site antigo
 * (montarMensagem()/finalizar()), adaptado pra usar produto.nome como chave
 * (índice de array não é estável entre a lista completa e categoria.html,
 * que trabalha com um subconjunto filtrado de produtos.js).
 * Fase 7: estado do carrinho movido pra sessionStorage (ver seção 3.4/6 do
 * CLAUDE.md) — sobrevive à navegação entre páginas na mesma aba, some ao
 * fechar a aba. Decisão revista em relação à Fase 6 (que previa só memória).
 * Grade de cards por produto (voltou a pedido do usuário — a versão anterior
 * agrupava por letra inicial num índice tipo field guide, revertida).
 */

function produtoLinhaHTML(produto) {
  return `
    <article class="entrada" data-nome="${produto.nome}">
      <div class="entrada__img" style="background-image:url('${produto.img}')"></div>
      <div class="entrada__corpo">
        <h3 class="entrada__nome">${produto.nome}</h3>
        <p class="entrada__desc">${produto.desc}</p>
        <span class="entrada__preco">R$ ${produto.preco}</span>
        <div class="entrada__acoes">
          <button class="entrada__add" type="button" data-nome="${produto.nome}">
            + Adicionar
          </button>
          <button class="entrada__whats" type="button" data-nome="${produto.nome}">
            WhatsApp
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ---------- Comprar produto único via WhatsApp (não mexe no carrinho) ---------- */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".entrada__whats");
  if (!btn) return;
  const msg = encodeURIComponent(
    "Olá!\nTenho interesse no produto: " + btn.dataset.nome
  );
  window.open(`https://wa.me/5562984803759?text=${msg}`, "_blank");
});

function renderListaProdutos() {
  const grid = document.getElementById("produtos-grid");
  if (!grid) return;

  const ordenados = [...produtos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  grid.innerHTML = ordenados.map(produtoLinhaHTML).join("");

  const titulo = document.querySelector(".produtos__titulo");
  if (titulo) {
    titulo.insertAdjacentHTML(
      "beforeend",
      ` <span class="produtos__contagem">${ordenados.length} produtos</span>`
    );
  }
}

renderListaProdutos();

/* ---------- Atalhos manuais da pílula ---------- */

document.querySelectorAll(".pill-nav__item[data-slug]").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = `categoria.html?area=${btn.dataset.slug}`;
  });
});

/* ---------- Fundo fixo: escurece conforme rola pra ver os produtos ----------
 * .site-fundo é fixed (cobre sempre o mesmo enquadramento da tela, não
 * "acompanha" a altura da página) — um gradiente CSS não sabe a que altura
 * o usuário rolou, então só dá pra ligar a opacidade do véu à rolagem via
 * JS. Listener passivo + rAF pra não travar o scroll. */
(function dimirFundoAoRolar() {
  const veu = document.getElementById("hero-veu");
  const imgHero = document.querySelector(".hero__img");
  if (!veu) return;

  const ehVideo = imgHero && imgHero.tagName === "VIDEO";
  const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // autoplay não fica declarado no HTML de propósito — só chama play() se
  // o usuário não pediu "reduzir movimento" no sistema. Assim quem pediu
  // nunca vê nem o primeiro frame se mexer, só o poster estático.
  if (ehVideo && !prefereMenosMovimento) {
    imgHero.play().catch(() => {});
  }

  let pendente = false;

  function atualizar() {
    const progresso = Math.min(window.scrollY / window.innerHeight, 1);
    veu.style.opacity = (progresso * 0.85).toFixed(2);

    // Ken Burns (fallback <img>) ou o próprio vídeo rodando pra sempre
    // atrás de um painel com backdrop-filter força recomposição do blur a
    // cada frame, mesmo com o conteúdo quase encoberto pelo véu — trava o
    // scroll em celular (já visto com o Ken Burns). Congela/pausa assim
    // que sai de cena; volta se o usuário rolar de novo pra cima.
    if (imgHero) {
      imgHero.style.animationPlayState = progresso >= 1 ? "paused" : "running";
      if (ehVideo && !prefereMenosMovimento) {
        if (progresso >= 1 && !imgHero.paused) {
          imgHero.pause();
        } else if (progresso < 1 && imgHero.paused) {
          imgHero.play().catch(() => {});
        }
      }
    }

    pendente = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(atualizar);
    },
    { passive: true }
  );

  atualizar();
})();

/* ---------- Foco: trap reaproveitável por modal de sintoma e drawer do carrinho ---------- */

function criarFocoTrap(container, aoFechar) {
  let elementoAnterior = null;

  function focaveis() {
    return Array.from(
      container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

/* ---------- Modal de detalhe do produto ----------
 * Qualquer .entrada é clicável (landing e categoria.html) — abre esse modal
 * com descLonga, preço e os mesmos botões de ação do card. Os botões dentro
 * do modal reaproveitam as classes .entrada__add/.entrada__whats — os
 * listeners delegados dessas classes (mais abaixo neste arquivo) já
 * funcionam pra qualquer elemento com essa classe, então não precisa
 * duplicar a lógica de adicionar ao carrinho / abrir WhatsApp aqui. */
(function initDetalheProduto() {
  const overlay = document.getElementById("produto-overlay");
  const modal = document.getElementById("produto-modal");
  const fecharBtn = document.getElementById("produto-fechar");
  const imgEl = document.getElementById("produto-detalhe-img");
  const tituloEl = document.getElementById("produto-titulo");
  const precoEl = document.getElementById("produto-detalhe-preco");
  const descEl = document.getElementById("produto-detalhe-desc");
  const descToggle = document.getElementById("produto-detalhe-desc-toggle");
  const addBtn = document.getElementById("produto-detalhe-add");
  const whatsBtn = document.getElementById("produto-detalhe-whats");

  if (!overlay || !modal || typeof produtos === "undefined") return;

  const trap = criarFocoTrap(modal, fecharDetalhe);

  function abrirDetalhe(nome) {
    const produto = produtos.find((p) => p.nome === nome);
    if (!produto) return;

    imgEl.style.backgroundImage = `url('${produto.img}')`;
    tituloEl.textContent = produto.nome;
    precoEl.textContent = `R$ ${produto.preco}`;
    descEl.textContent = produto.descLonga || produto.desc;
    descEl.classList.remove("is-expandido");
    descToggle.hidden = true;
    descToggle.textContent = "Ler descrição completa";
    addBtn.dataset.nome = produto.nome;
    whatsBtn.dataset.nome = produto.nome;

    overlay.hidden = false;
    trap.abrir();

    // só mostra o botão se a descrição realmente estourar as 3 linhas do clamp
    // (ler scrollHeight/clientHeight já força o layout, não precisa de rAF)
    descToggle.hidden = descEl.scrollHeight <= descEl.clientHeight + 1;
  }

  descToggle.addEventListener("click", () => {
    const expandido = descEl.classList.toggle("is-expandido");
    descToggle.textContent = expandido ? "Ler menos" : "Ler descrição completa";
  });

  function fecharDetalhe() {
    overlay.hidden = true;
    trap.fechar();
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".entrada__acoes")) return;
    const card = e.target.closest(".entrada[data-nome]");
    if (card) abrirDetalhe(card.dataset.nome);
  });

  fecharBtn.addEventListener("click", fecharDetalhe);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharDetalhe();
  });
})();

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

/* ---------- Busca manual por palavra ----------
 * Botão-lupa fora da pílula (busca-fab) abre um popup com um campo de
 * texto de verdade. Busca em nome, categoria, tags de sintoma (doencas[])
 * e nas duas descrições (desc/descLonga) — não só o título — pra "óleos
 * essenciais" (categoria) e "intestino" (tag de sintoma) funcionarem tão
 * bem quanto buscar pelo nome do produto. Normaliza acento/caixa dos dois
 * lados (query e texto indexado) pra "acafrao" achar "Açafrão". Resultados
 * renderizados com produtoLinhaHTML() dentro de um .produtos__lista comum —
 * os cliques (abrir detalhe, adicionar, WhatsApp) já funcionam de graça
 * porque os listeners são delegados no document, não presos a #produtos-grid. */
(function initBuscaManual() {
  const fab = document.getElementById("busca-fab");
  const overlay = document.getElementById("busca-overlay");
  const modal = document.getElementById("busca-modal");
  const fecharBtn = document.getElementById("busca-fechar");
  const input = document.getElementById("busca-input");
  const dicaEl = document.getElementById("busca-dica");
  const vazioEl = document.getElementById("busca-vazio");
  const resultadosEl = document.getElementById("busca-resultados");

  if (!fab || !overlay || !modal || typeof produtos === "undefined") return;

  const trap = criarFocoTrap(modal, fecharBusca);

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  // Dois níveis de texto por produto, calculados uma única vez (68 itens,
  // não precisa recalcular a cada tecla):
  // - "estrutural" (nome/categoria/tags de sintoma) — preciso, é onde a
  //   busca procura primeiro.
  // - "completo" (+ desc/descLonga) — usado só quando o nível estrutural
  //   não acha nada, pra aumentar o alcance sem confundir "óleos
  //   essenciais" com um óleo vegetal que só cita "ácidos graxos
  //   essenciais" (nutriente) na descrição.
  const indice = produtos.map((produto) => {
    const estrutural = normalizar([produto.nome, produto.cat, ...produto.doencas].join(" "));
    const completo = normalizar(estrutural + " " + produto.desc + " " + (produto.descLonga || ""));
    return { produto, estrutural, completo };
  });

  function buscar(query) {
    const termos = normalizar(query).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return null;

    const bateEm = (campo) => (item) => termos.every((termo) => item[campo].includes(termo));

    const porEstrutura = indice.filter(bateEm("estrutural"));
    if (porEstrutura.length > 0) return porEstrutura.map(({ produto }) => produto);

    return indice.filter(bateEm("completo")).map(({ produto }) => produto);
  }

  function renderizar(query) {
    const bruto = query.trim();

    if (bruto.length < 2) {
      dicaEl.hidden = false;
      vazioEl.hidden = true;
      resultadosEl.innerHTML = "";
      return;
    }

    const encontrados = buscar(bruto);
    dicaEl.hidden = true;

    if (encontrados.length === 0) {
      vazioEl.hidden = false;
      vazioEl.textContent = `Nenhum produto encontrado para "${bruto}".`;
      resultadosEl.innerHTML = "";
      return;
    }

    vazioEl.hidden = true;
    resultadosEl.innerHTML = encontrados.map(produtoLinhaHTML).join("");
  }

  function abrirBusca() {
    input.value = "";
    dicaEl.hidden = false;
    vazioEl.hidden = true;
    resultadosEl.innerHTML = "";
    overlay.hidden = false;
    trap.abrir();
    input.focus();
  }

  function fecharBusca() {
    overlay.hidden = true;
    trap.fechar();
  }

  fab.addEventListener("click", abrirBusca);
  fecharBtn.addEventListener("click", fecharBusca);
  input.addEventListener("input", () => renderizar(input.value));

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharBusca();
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

  // ---- adicionar ao carrinho a partir de qualquer entrada (landing ou categoria) ----
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".entrada__add");
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
