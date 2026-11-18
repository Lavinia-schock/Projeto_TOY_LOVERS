
let todosProdutos = [];
let produtosFiltrados = [];
let paginaAtual = 1;

const produtosPorPagina = 12;

// ELEMENTOS DA PÁGINA

const areaProdutos = document.getElementById("products");
const areaPaginacao = document.querySelector(".pagination");

const formularioBusca = document.getElementById("formBusca");
const campoBusca = document.getElementById("busca");

const filtroPreco = document.getElementById("filtroPreco");
const valorPreco = document.querySelector(".price-value");

const filtrosIdade = document.querySelectorAll("[data-idade]");
const filtrosOrdenacao = document.querySelectorAll('input[name="ordenar"]');

// ELEMENTOS DO MODAL

const modalProduto = document.getElementById("modalProduto");
const fecharModal = document.getElementById("fecharModal");

const modalImagem = document.getElementById("modalImagem");
const modalNome = document.getElementById("modalNome");
const modalCategoria = document.getElementById("modalCategoria");
const modalDescricao = document.getElementById("modalDescricao");
const modalIdade = document.getElementById("modalIdade");
const modalAvaliacao = document.getElementById("modalAvaliacao");
const modalVendidos = document.getElementById("modalVendidos");
const modalPreco = document.getElementById("modalPreco");
const modalAdicionarCarrinho = document.getElementById("modalAdicionarCarrinho");




// FORMATAR PREÇOS

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// NORMALIZAR TEXTOS DA PESQUISA

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


// ORGANIZAR CAMINHO DAS IMAGENS

function caminhoImagem(imagem) {
    if (!imagem) {
        return "";
    }

    if (/^https?:\/\//i.test(imagem)) {
        return imagem;
    }

    return "../" + String(imagem).replace(/^\.?\//, "");
}


// OBTER IDADE DO PRODUTO

function obterIdade(produto) {
    const idade = String(produto.idade || "").match(/\d+/);

    return idade ? Number(idade[0]) : 0;
}


// CALCULAR DESCONTO

function obterDesconto(produto) {
    const desconto = Number(produto.desconto) || 0;

    if (desconto > 0) {
        return desconto;
    }

    const preco = Number(produto.preco) || 0;
    const precoAntigo = Number(produto.precoAntigo) || 0;

    if (precoAntigo > preco && precoAntigo > 0) {
        return Math.round(
            ((precoAntigo - preco) / precoAntigo) * 100
        );
    }

    return 0;
}


// CRIAR CARD DOS PRODUTOS

function criarCard(produto) {
    const preco = Number(produto.preco) || 0;
    const precoAntigo = Number(produto.precoAntigo) || 0;
    const desconto = obterDesconto(produto);

    const avaliacao = Math.max(
        0,
        Math.min(5, Number(produto.avaliacao) || 0)
    );

    return `
        <article class="product-card" data-id="${produto.id}">

            ${desconto > 0
                ? `<span class="discount">-${desconto}%</span>`
                : ""
            }

            <button class="favorite" type="button"
                aria-label="Favoritar" aria-pressed="false">
                <i class="fa-regular fa-heart"></i>
            </button>

            <img
                src="${caminhoImagem(produto.imagem)}"
                alt="${produto.nome}"
            >

            <div class="product-info">

                <span class="category">
                    ${produto.categoria || "Brinquedo"}
                </span>

                <h3>${produto.nome}</h3>

                <div class="rating">
                    <span>${"★".repeat(avaliacao)}</span>
                    <small>(${produto.vendidos || 0})</small>
                </div>

                <div class="price">
                    ${formatarPreco(preco)}

                    ${precoAntigo > preco
                        ? `<del>${formatarPreco(precoAntigo)}</del>`
                        : ""
                    }
                </div>

                <p class="installment">
                    Recomendado para ${produto.idade || "todas as"} anos ou mais.
                </p>

                <button class="add-cart" type="button"
                    data-id="${produto.id}">
                    Adicionar ao carrinho
                </button>

            </div>

        </article>
    `;
}


// EXIBIR OS PRODUTOS

function mostrarProdutos(lista) {
    produtosFiltrados = lista;
    paginaAtual = 1;

    mostrarPaginaAtual();
    criarPaginacao();
}


// EXIBIR A PÁGINA ATUAL

function mostrarPaginaAtual() {
    const inicio = (paginaAtual - 1) * produtosPorPagina;
    const fim = inicio + produtosPorPagina;

    const produtosPagina = produtosFiltrados.slice(inicio, fim);

    if (produtosFiltrados.length === 0) {
        areaProdutos.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum produto encontrado.
                Tente alterar sua pesquisa ou seus filtros.
            </p>
        `;

        areaPaginacao.innerHTML = "";
        return;
    }

    areaProdutos.innerHTML = produtosPagina
        .map(criarCard)
        .join("");
}


// CRIAR PAGINAÇÃO

function criarPaginacao() {
    const totalPaginas = Math.ceil(
        produtosFiltrados.length / produtosPorPagina
    );

    areaPaginacao.innerHTML = "";

    if (totalPaginas <= 1) {
        return;
    }

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        areaPaginacao.innerHTML += `
            <a
                href="#"
                data-pagina="${pagina}"
                class="${pagina === paginaAtual ? "current" : ""}"
            >
                ${pagina}
            </a>
        `;
    }

    if (paginaAtual < totalPaginas) {
        areaPaginacao.innerHTML += `
            <a
                href="#"
                data-pagina="${paginaAtual + 1}"
                aria-label="Próxima página"
            >
                <i class="fa-solid fa-chevron-right"></i>
            </a>
        `;
    }
}


// FUNCIONAMENTO DA PAGINAÇÃO

areaPaginacao.addEventListener("click", function(event) {
    const link = event.target.closest("[data-pagina]");

    if (!link) {
        return;
    }

    event.preventDefault();

    paginaAtual = Number(link.dataset.pagina);

    mostrarPaginaAtual();
    criarPaginacao();

    document.querySelector(".catalog").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


// FILTRAR E ORDENAR PRODUTOS

function filtrarProdutos() {
    const pesquisa = normalizarTexto(campoBusca.value);
    const precoMaximo = Number(filtroPreco.value);

    const idadesSelecionadas = Array.from(
        document.querySelectorAll("[data-idade]:checked")
    ).map(campo => Number(campo.dataset.idade));

    const ordenacao = document.querySelector(
        'input[name="ordenar"]:checked'
    )?.value;

    let resultado = todosProdutos.filter(produto => {
        const nome = normalizarTexto(produto.nome);
        const categoria = normalizarTexto(produto.categoria);
        const descricao = normalizarTexto(produto.descricao);

        const correspondePesquisa =
            nome.includes(pesquisa) ||
            categoria.includes(pesquisa) ||
            descricao.includes(pesquisa);

        const correspondePreco =
            Number(produto.preco) <= precoMaximo;

        const idadeProduto = obterIdade(produto);

        const correspondeIdade =
            idadesSelecionadas.length === 0 ||
            idadesSelecionadas.includes(idadeProduto);

        return correspondePesquisa &&
            correspondePreco &&
            correspondeIdade;
    });


    // ORDENAR RESULTADOS

    switch (ordenacao) {
        case "nome-az":
            resultado.sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt-BR")
            );
            break;

        case "nome-za":
            resultado.sort((a, b) =>
                b.nome.localeCompare(a.nome, "pt-BR")
            );
            break;

        case "recente":
            resultado.sort((a, b) =>
                Number(b.id) - Number(a.id)
            );
            break;

        case "menor-preco":
            resultado.sort((a, b) =>
                Number(a.preco) - Number(b.preco)
            );
            break;

        case "maior-preco":
            resultado.sort((a, b) =>
                Number(b.preco) - Number(a.preco)
            );
            break;

        case "desconto":
            resultado.sort((a, b) =>
                obterDesconto(b) - obterDesconto(a)
            );
            break;

        case "vendidos":
            resultado.sort((a, b) =>
                Number(b.vendidos) - Number(a.vendidos)
            );
            break;
    }

    mostrarProdutos(resultado);
}


// CARREGAR PRODUTOS DO JSON

async function carregarProdutos() {
    try {
        const resposta = await fetch("../JSON/catalogo_produto.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o catálogo.");
        }

        todosProdutos = await resposta.json();

        const parametros = new URLSearchParams(
            window.location.search
        );

        const pesquisaInicial = parametros.get("busca") || "";

        campoBusca.value = pesquisaInicial;

        filtrarProdutos();

    } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);

        areaProdutos.innerHTML = `
            <p class="mensagem-vazia">
                Não foi possível carregar os produtos.
                Verifique o arquivo JSON e seu caminho.
            </p>
        `;
    }
}


// PESQUISA PELO CAMPO

formularioBusca.addEventListener("submit", function(event) {
    event.preventDefault();

    const parametros = new URLSearchParams();

    parametros.set("busca", campoBusca.value.trim());

    window.location.href =
        `catalogo_produto.html?${parametros.toString()}`;
});

campoBusca.addEventListener("input", filtrarProdutos);


// FILTRO DE PREÇO

filtroPreco.addEventListener("input", function() {
    valorPreco.textContent =
        `R$ 19,99 - Até ${formatarPreco(filtroPreco.value)}`;

    filtrarProdutos();
});


// FILTRO DE IDADE

filtrosIdade.forEach(campo => {
    campo.addEventListener("change", filtrarProdutos);
});


// ORDENAÇÃO

filtrosOrdenacao.forEach(campo => {
    campo.addEventListener("change", filtrarProdutos);
});


// ABRIR MODAL DO PRODUTO

areaProdutos.addEventListener("click", function(event) {

    // Não abrir o modal ao clicar nos botões do card
    if (event.target.closest(".favorite, .add-cart")) {
        return;
    }

    const card = event.target.closest(".product-card");

    if (!card) {
        return;
    }

    const id = card.dataset.id;

    const produto = todosProdutos.find(produto =>
        String(produto.id) === String(id)
    );

    if (!produto) {
        return;
    }

    modalImagem.src = caminhoImagem(produto.imagem);
    modalImagem.alt = produto.nome;

    modalNome.textContent = produto.nome;
    modalCategoria.textContent = produto.categoria || "Brinquedo";

    modalDescricao.textContent =
        produto.descricao || "Descrição não disponível.";

    modalIdade.textContent =
        `Recomendado para ${produto.idade || "todas as"} anos ou mais.`;

    const avaliacao = Math.max(
        0,
        Math.min(5, Number(produto.avaliacao) || 0)
    );

    modalAvaliacao.textContent = "★".repeat(avaliacao);

    modalVendidos.textContent =
        `${produto.vendidos || 0} vendas`;

    const preco = Number(produto.preco) || 0;
    const precoAntigo = Number(produto.precoAntigo) || 0;

    modalPreco.innerHTML = `
        ${formatarPreco(preco)}

        ${precoAntigo > preco
            ? `<del>${formatarPreco(precoAntigo)}</del>`
            : ""
        }
    `;

    // Identificar o produto no botão do carrinho
    modalAdicionarCarrinho.dataset.id = produto.id;

    modalProduto.classList.add("ativo");
    modalProduto.setAttribute("aria-hidden", "false");
});


// FECHAR MODAL

function fecharJanelaModal() {
    modalProduto.classList.remove("ativo");
    modalProduto.setAttribute("aria-hidden", "true");
}

fecharModal.addEventListener("click", fecharJanelaModal);


// FECHAR CLICANDO FORA DO MODAL

modalProduto.addEventListener("click", function(event) {
    if (event.target === modalProduto) {
        fecharJanelaModal();
    }
});


// FECHAR COM ESC

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        fecharJanelaModal();
    }
});


// FAVORITAR PRODUTOS

areaProdutos.addEventListener("click", function(event) {
    const botao = event.target.closest(".favorite");

    if (!botao) {
        return;
    }

    const icone = botao.querySelector("i");
    const estaFavoritado = botao.getAttribute("aria-pressed") === "true";

    botao.setAttribute("aria-pressed", String(!estaFavoritado));

    if (estaFavoritado) {
        icone.classList.remove("fa-solid");
        icone.classList.add("fa-regular");
    } else {
        icone.classList.remove("fa-regular");
        icone.classList.add("fa-solid");
    }
});


// INICIAR O CATÁLOGO

carregarProdutos();
