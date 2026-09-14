# CLAUDE.md — Catálogo Cotara (novo site)

Lido automaticamente pelo Claude Code na raiz do repositório. **Este é um projeto novo, não uma evolução do repositório atual** (`Catalo-Digital-L-via`, hoje no GitHub Pages). O site antigo é referência de estrutura de dados e de lógica (carrinho, WhatsApp), nunca de conteúdo — os textos de produto de lá têm violação de compliance e não devem ser copiados como estão.

## 1. Por que site novo, não iteração no antigo

Dois motivos, os dois já resolvidos aqui: (1) o catálogo atual tem descrições de produto com "tratar/tratamento/previne/câncer/HIV" — risco regulatório real, publicado agora; (2) o design atual não é o padrão visual que a marca quer daqui pra frente. Construir do zero, com copy compliance-first e o design novo, é mais rápido que tentar consertar os dois problemas em cima da base antiga.

## 2. Regras de negócio (não negociável)

- **Wording ANVISA obrigatório:** "auxilia", "contribui". Nunca "trata", "cura", "previne", nem citação de doença grave (câncer, HIV, leucemia etc.) como alvo do produto — mesmo que a fonte original (fornecedor, folheto, site antigo) use essas palavras. Reescrever, nunca copiar.
- Produto em mais de uma categoria aparece nas duas, sem duplicar cadastro (array de categorias por produto — o `produtos.js` antigo já faz isso certo, reaproveitar a estrutura).
- Naturea by Cotara, quando mencionada, sempre endossada pela Cotara.
- **Ordem de prioridade comercial (não negociável, vale para hero, pílula de navegação, ordem de categorias em destaque e qualquer lugar que precise hierarquizar produtos):**
  1. **Probióticos** — herói da casa Cotara.
  2. **Regulação hormonal / Vitex** — rosto da Naturea by Cotara.
  3. **Sono / Acalanto** — segundo pilar da Naturea by Cotara.

  Essa ordem rege qualquer decisão de destaque (o que aparece primeiro na pílula, qual card vem antes em "Em breve" vs. lançado, qual produto ganha mais espaço visual). Nunca inverter Sono/Acalanto na frente de Hormônios/Vitex.

## 3. Estrutura da experiência

### 3.1 Landing page
- **Hero fotorrealista:** frasco de vidro âmbar sobre rocha coberta de musgo, campo de grama, luz dourada de fim de tarde — imagem original (gerada ou fotografada), nunca derivada de foto de terceiros. Prompt de geração já validado, ver seção 4.
- **Barra de navegação em pílula, sobreposta na parte inferior do hero** (estilo glass/blur, referência: site da LTX): primeiro item é o CTA principal **"O que você está sentindo hoje? →"**, os seguintes são atalhos de categoria manual (Sono, Hormônios, Intestino, Imunidade...).
- Abaixo, ao rolar: lista completa de produtos em ordem alfabética (o site antigo já tem essa ordenação pronta, é só fixar como seção sempre visível).
- Categorias sem produto ainda: card "Em breve".

### 3.2 Fluxo de busca por sintoma
1. Clique no CTA "O que você está sentindo hoje?" abre modal com **corpo humano em estilo wireframe** (line art) — **essa linguagem visual fica restrita ao modal**, não sangra pro resto do site, que é fotorrealista/editorial. São dois momentos diferentes da experiência, não precisam competir na mesma tela.
2. Lista de sintomas/áreas ao lado do wireframe; seleção dá foco visual na região correspondente do modelo.
3. Confirmação → navega pra `/categoria/[slug]` com a curadoria daquele sintoma.

  **Decisão de roteamento (Fase 5):** como o site é estático sem build/servidor, isso foi implementado como `categoria.html?area=<slug>` (query string) em vez de path bonito tipo `/categoria/hormonios`. Mesma ideia da tabela abaixo, adaptada ao stack real — não reabrir essa discussão.

Mapeamento sugerido de áreas do corpo (agrupando as tags `doencas` que já existem no catálogo antigo, evita expor 28 opções no modal):

| Área do corpo (wireframe) | Tags de origem |
|---|---|
| Intestino / Digestão | Digestão, Estômago, Intestino |
| Fígado / Rins | Fígado, Rins, Bexiga |
| Hormônios | Feminino, Hormônios, Masculino |
| Sono / Ansiedade | Sono, Ansiedade, Relaxamento, Humor |
| Coração / Pressão | Pressão, Coração, Circulação, Colesterol |
| Imunidade / Garganta | Imunidade, Garganta |
| Anti-inflamatório / Dores | Anti-inflamatório, Dores |
| Respiratório | Respiratório |
| Diabetes | Diabetes |
| Energia / Memória | Energia, Disposição, Memória |
| Pele / Cabelos | Pele, Cabelos |

"Cuidados Pessoais" e os tipos de produto (Extratos, Óleos Vegetais, Óleos Essenciais) ficam de fora do wireframe — ativam como atalho manual na pílula, não como sintoma.

### 3.3 Página de categoria
- Produtos curados pro sintoma: nome, descrição (reescrita, compliance), preço, adicionar ao carrinho. Cada card também tem um botão secundário "Comprar no WhatsApp" pra interesse num produto só, sem passar pelo carrinho (Fase 9).

### 3.4 Carrinho
- Confirmado: fecha pedido via **WhatsApp**, sem checkout/pagamento online. Reaproveitar a lógica do site antigo (`montarMensagem()`, `finalizar()`) quase 1:1 — essa parte já funciona bem.

## 4. Direção visual

- **Movimento no hero:** recomendo animação só em CSS sobre a imagem estática (efeito Ken Burns — zoom/pan lento e contínuo, 20–30s de loop) como padrão. Zero asset extra, zero peso de dados no celular do cliente, Claude Code implementa direto. Vídeo de fundo (loop curto, mudo, com a imagem estática como poster/fallback) é upgrade válido depois que o site estiver no ar e validado — mas adiciona peso de arquivo e exige plano de fallback pra conexão fraca, então não é bloqueante pro lançamento.

- **Hero:** fotografia/imagem ultra-realista, estilo still de campanha premium. Prompt validado (gerar como imagem original, não editar foto de terceiros):

  > *Fotografia ultra-realista, still de campanha publicitária premium. Uma rocha coberta de musgo verde vibrante no meio de um campo de grama alta, sob luz dourada de fim de tarde, céu claro ao fundo com montanhas desfocadas. Sobre a rocha, um frasco de vidro âmbar tipo conta-gotas (frasco de extrato fitoterápico premium), com um brilho quente e suave saindo de dentro do frasco. Composição centralizada, profundidade de campo rasa, foco nítido no frasco, grama e flores silvestres brancas desfocadas em primeiro plano. Estilo fotografia de produto cinematográfica, cores quentes e naturais, atmosfera calma e orgânica, sem texto, sem marca d'água. Proporção 16:9.*

- **Tipografia:** serifada pro headline do hero (clima editorial, como a referência do toca-discos); sans-serif limpa pra UI/pílula de navegação (como a referência da LTX).
- **Pílula de navegação:** fundo translúcido/glass blur, primeiro item sempre o CTA de sintoma. **Posição final: centralizada horizontalmente, ancorada perto da base do hero** (`bottom: 8%`) — decisão revista na implementação: como fica na faixa de grama desfocada em primeiro plano, abaixo do brilho do frasco, o contraste já é bom sem precisar deslocar pro lado direito da pedra (ideia original, descartada). O frasco fica sempre visível acima da pílula, nunca coberto por ela.
- **Imagem final (hero-frasco-ambar.png):** aprovada, proporção widescreen (~16:9), frasco centralizado com bastante negative space no céu (pro headline) e nas laterais (montanhas, boas pra hero full-width em telas grandes).
- **Paleta:** manter verde-profundo/verde-sálvia como cor de marca (CTA, badges, elementos de interface), deixando o calor da fotografia (dourado/âmbar) carregar o clima do hero. Não é pra brigar com a foto — a paleta antiga do site atual pode seguir valendo pra UI, só não pro hero.
- Wireframe do corpo: line art, minimalista, técnico — confinado ao modal (seção 3.2).

- **Headline do hero (Fase 9):** só "Cotara" (wordmark), `font-size: clamp(3.4rem, 12vw, 7rem)` — a frase original ("Bem-estar, do jeito que a natureza pretendia.") virou `<meta name="description">` no `<head>` (SEO, invisível na página).

- **Fundo fixo no site inteiro (revisado depois da Fase 9 — decisão explícita do usuário).** A Fase 9 original usava `position: sticky` escopado a um wrapper de 160vh especificamente pra EVITAR ter a imagem do hero fixa atrás da rolagem inteira (custo de repintura de `backdrop-filter`). O usuário pediu o oposto — quis a imagem como fundo persistente do site inteiro (escopo confirmado com ele: só `index.html`, `categoria.html` continua com fundo creme sólido), escurecendo conforme rola pra revelar os produtos em glassmorphism. Implementado assim:
  - `.site-fundo` (`position: fixed; inset:0; z-index:-1`) — a imagem + `.hero__overlay` (gradiente estático de legibilidade) + `.hero__veu` (camada escura cuja opacidade é controlada por JS).
  - `.hero-primeiro-plano` (headline + pílula) virou conteúdo normal de novo — só um bloco de ~100vh no topo da página, sem posicionamento especial; rola e some como qualquer coisa.
  - **Por que precisou de JS (só aqui):** um `position: fixed` sempre mostra o mesmo enquadramento da tela, não "cresce" com a altura da página — um gradiente CSS estático não sabe a que ponto da rolagem o usuário chegou. Só dá pra ligar a opacidade do véu à posição de rolagem via JS. `dimirFundoAoRolar()` em `app.js`: listener de `scroll` passivo + `requestAnimationFrame` (não any-frame direto, throttled), rampa a opacidade do véu de 0 a 0.85 ao longo do primeiro viewport de rolagem, depois mantém — sem tentar recalcular nada durante o resto da lista de 68 produtos.
  - **Achado real de performance ao testar:** com o fundo nunca soltando (ao contrário da Fase 9), backdrop-filter duplicado — no painel `.produtos` E em cada um dos 68 `.entrada` — mais o Ken Burns rodando pra sempre, travou o navegador de verdade (timeout de avaliação JS de 45s durante o teste). Corrigido com duas mudanças, não só reduzir blur:
    1. **Removido `backdrop-filter` dos 68 cards individuais** — só o painel `.produtos` borra o fundo; os cards ficam com fundo translúcido simples (`rgba(255,255,255,0.72)`, sem blur próprio) porque o que está atrás deles já foi borrado uma vez pelo painel — borrar de novo por card era custo redundante sem diferença visível.
    2. **Ken Burns pausa via `animation-play-state` assim que o véu chega em opacidade máxima** (`imgHero.style.animationPlayState = "paused"`) — uma animação rodando pra sempre atrás de uma camada com backdrop-filter força recomposição do blur a cada frame mesmo parado na tela; congelar a imagem (já quase encoberta pelo véu nesse ponto) resolve.
  - Depois dessas duas mudanças, rolagem real testada sem travamento (JS respondeu instantaneamente depois de rolar até o fim da lista). Vale reconfirmar num celular físico antes do deploy — a automação de browser não mede FPS real de GPU.
  - Botão "Comprar no WhatsApp" por produto (landing e categoria.html): mensagem `'Olá!\nTenho interesse no produto: ' + nome`, mesmo formato do site antigo, não mexe no carrinho.

- **"Cotara" atrás do frasco — testado e revertido.** Chegou a ser implementado (headline gigante centralizada + recorte do frasco via Adobe `image_remove_background` sobreposto com z-index maior, fade no scroll) — o usuário viu ao vivo e achou "feio demais", pediu pra voltar ao modelo anterior. Revertido por completo: `.hero__content` de volta a `position:relative; padding:12vh 24px 0` (headline no topo, não centralizada atrás do frasco), `font-size` de volta a `clamp(3.4rem,12vw,7rem)`, sem fade de texto no scroll. `design-references/hero-frasco-cutout.png` removido (não é mais referenciado em lugar nenhum). Não reabrir essa direção sem pedido explícito novo.

- **Catálogo: grade de cards individuais (decisão final do usuário).** A `/frontend-design` tinha experimentado um índice alfabético tipo field guide (linhas separadas por fio, divisores de letra grandes, sem caixa por produto) — o usuário viu e pediu pra voltar: cada produto no seu próprio "quadradinho" (card com fundo, borda e sombra), sem agrupamento por letra inicial, botões "+ Adicionar" e "WhatsApp" lado a lado (não empilhados). Estrutura atual: `.produtos__lista` é grid (`repeat(auto-fill, minmax(220px,1fr))`), cada produto é `.entrada` (card com imagem quadrada no topo, corpo com nome/desc/preço, e `.entrada__acoes` com os dois botões em flex row, 50/50). Sem divisores de letra — removidos de propósito. Função de render: `produtoLinhaHTML()` em `js/app.js`, reaproveitada por `categoria.js`. Paleta e tipografia continuam as mesmas (verde-profundo/verde-sálvia, Playfair/Manrope).

## 5. Dados

- **`produtos.js` já reescrito e pronto para uso** — arquivo `produtos-compliance.js`, mesma estrutura do catálogo antigo (nome, cat, doencas[], img, preco, desc, descLonga), com todo `desc`/`descLonga` revisado pra compliance ANVISA. É uma passada de linguagem, não certificação regulatória — revisar com quem cuida do registro/rotulagem antes de publicar. Dois pontos em aberto sinalizados no cabeçalho do arquivo: os nomes "Antiparasitário Natural" e "Regeneração Hepática" carregam alegação médica no próprio nome do produto, não só na descrição — decisão de renomear ou não é sua.
- Colocar o `produtos.js` antigo em `/design-references/legacy/produtos-antigo.js` só como referência de dado bruto (preço, categoria, princípio ativo) — nunca importar direto no site novo.
- Nova área do corpo (tabela da seção 3.2) vira arquivo de dado próprio, ex. `areas-corpo.js`.
- **`/imagens/`** (Fase 7): as 67 fotos de produto referenciadas em `produtos.js` (campo `img`), copiadas de `../Catalogo digital/imagens/` e otimizadas com `sharp` (≤800px no maior lado, paleta PNG otimizada, todas abaixo de 200KB). `regeneracao_hepatica.png` não foi copiada — produto excluído do catálogo compliance na Fase 2.

## 6. Stack técnica

- HTML/CSS/JS puro (sem framework) — mesma decisão de antes, ainda vale: site estático, sem necessidade de servidor, deploy direto (GitHub Pages ou Vercel, sem build).
- `framer-motion` não se aplica fora de React — usar GSAP (via CDN) pra animação do wireframe e transições do modal/carrinho, se quiser mais polimento do que CSS puro entrega.
- Estrutura de arquivos:
  ```
  /index.html
  /categoria.html                → área de sintoma, lê ?area=<slug> (ver seção 3.2)
  /css/style.css
  /js/produtos.js
  /js/areas-corpo.js
  /js/app.js
  /js/categoria.js
  /imagens/                      → 67 fotos de produto, otimizadas (Fase 7)
  /design-references
    /prints/                     → as duas referências visuais enviadas
    /hero-direcao.md              → prompt + notas de composição (seção 4)
    /legacy/produtos-antigo.js    → só estrutura/preço, nunca descrição
  ```

## 7. Fluxo de trabalho recomendado

1. ~~Gerar/produzir a imagem do hero~~ — feito, `hero-frasco-ambar.png`.
2. ~~Reescrever as descrições de produto (compliance ANVISA)~~ — feito, `produtos-compliance.js`.
3. ~~Scaffold: estrutura de pastas da seção 6, `git init`.~~ — feito.
4. ~~Landing estática: hero (com a imagem final) + pílula de navegação (sem interação ainda) + lista alfabética.~~ — feito.
5. ~~Modal de busca por sintoma: wireframe + seleção + destaque + confirmação + navegação.~~ — feito, incluindo `categoria.html`/`categoria.js` (página de categoria adiantada da Fase 6, ver item 6).
6. ~~Carrinho + WhatsApp (reaproveitando lógica do site antigo).~~ — feito. Botão "Adicionar" em cada produto-card (landing e categoria.html), FAB + drawer glass/blur reaproveitando o padrão visual do modal (inclusive o focus trap, extraído pra `criarFocoTrap()` em `app.js` e reusado pelos dois). `montarMensagem()`/`finalizar()` portados quase 1:1 do site antigo (`Catalogo digital/codigo_corrigido.html`), só trocando a chave do carrinho de índice de array pra `produto.nome` (categoria.html usa subconjunto filtrado, índice não seria estável). Número de WhatsApp confirmado contra o código antigo: `5562984803759`. Estado do carrinho: inicialmente só memória; revisto na Fase 7 pra `sessionStorage` (sobrevive à navegação entre páginas na mesma aba, some ao fechar a aba — sem persistência permanente tipo localStorage).
7. ~~Revisão mobile + checklist de compliance (seção 8) rodado em cada descrição.~~ — feito. Pré-requisito: as 67 imagens de produto referenciadas em `produtos.js` foram copiadas de `../Catalogo digital/imagens/` pra `./imagens/` (mesmo nome/extensão .png) e otimizadas com `sharp` (redimensionadas pro maior lado ≤800px, paleta otimizada) — 58,44MB → ~8,5MB, todas abaixo de 200KB, conferidas visualmente sem perda de qualidade. QA mobile (390px) rodado ponta a ponta: hero → modal de sintoma → categoria.html → carrinho → WhatsApp → atalhos da pílula, repetido em desktop (1280px). Checklist de compliance rodado sobre os 68 produtos (`desc`/`descLonga`), 0 violações. Único ajuste feito durante o QA: estado do carrinho movido de memória pura pra `sessionStorage` (ver item 6) pra sobreviver à navegação entre páginas, como o roteiro de teste exigia.
8. Deploy (GitHub Pages ou Vercel).

Um prompt por fase. O hero (imagem + pílula sobreposta) e o modal de sintoma merecem sessões próprias — são os dois pontos de maior complexidade visual do projeto.

## 8. Checklist de compliance

- [ ] Nenhuma ocorrência de "trata", "tratamento", "cura", "previne".
- [ ] Nenhuma menção a câncer, HIV, leucemia ou outra doença grave como alvo do produto.
- [ ] Toda descrição nova foi reescrita, não copiada do site antigo.
- [ ] Categorias "em breve" sem CTA de compra.

## 9. Comandos

Sem build step — abrir `index.html` direto ou servir com qualquer servidor estático local (`npx serve`, por exemplo) durante o desenvolvimento.
