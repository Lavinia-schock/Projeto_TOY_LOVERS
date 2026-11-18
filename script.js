// FORMATAÇÃO DE PREÇOS

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// CÁLCULO DE DESCONTO

function calcularDesconto(produto) {
    const precoAntigo = Number(produto.precoAntigo);
    const precoAtual = Number(produto.preco);

    if (!precoAntigo || precoAntigo <= precoAtual) {
        return 0;
    }

    return Math.round(
        ((precoAntigo - precoAtual) / precoAntigo) * 100
    );
}


// FORMATAÇÃO DA IDADE

function formatarIdade(idade) {
    if (typeof idade === "number") {
        return `A partir de ${idade} anos`;
    }

    return idade || "Consulte a indicação de idade";
}


// CRIAÇÃO DOS CARDS

function criarCard(produto) {
    const desconto = calcularDesconto(produto);

    return `
        <article class="produto" data-id="${produto.id}">
            <img
                src="${produto.imagem}"
                alt="${produto.nome}"
                onerror="this.alt='Imagem indisponível';"
            >

            <h4>${produto.nome}</h4>

            <p class="categoria-produto">
                ${produto.categoria}
            </p>

            <div class="avaliacao">
                ⭐ ${Number(produto.avaliacao).toFixed(1).replace(".", ",")}
            </div>

            <div class="precos">
                ${
                    desconto > 0
                        ? `
                            <del>${formatarPreco(produto.precoAntigo)}</del>
                            <span class="desconto">-${desconto}%</span>
                        `
                        : ""
                }
            </div>

            <strong class="preco-atual">
                ${formatarPreco(produto.preco)}
            </strong>
        </article>
    `;
}


// ELEMENTOS DO HTML

const jogos = document.getElementById("produtos-jogos");
const quebraCabecas = document.getElementById("produtos-quebra-cabecas");

const modal = document.getElementById("modalProduto");
const botaoFecharModal = document.getElementById("fecharModal");
const botaoAdicionarCarrinho = document.getElementById("modalAdicionarCarrinho");

const formularioBusca = document.getElementById("formBusca");
const campoBusca = document.getElementById("busca");

const resultadosBusca = document.getElementById("resultadosBusca");
const listaResultados = document.getElementById("listaResultados");

const tituloResultados = document.getElementById("tituloResultados");
const descricaoResultados = document.getElementById("descricaoResultados");

const botaoLimparBusca = document.getElementById("limparBusca");


// NORMALIZAÇÃO DE TEXTO

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


// CARREGAMENTO DO CATÁLOGO JSON

let todosProdutos = [];

async function carregarCatalogo() {
    try {
        const resposta = await fetch("JSON/catalogo_produto.json");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o catálogo JSON.");
        }

        todosProdutos = await resposta.json();

        carregarProdutosNaPagina();

    } catch (erro) {
        console.error("Erro ao carregar o catálogo:", erro);

        if (jogos) {
            jogos.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
        }

        if (quebraCabecas) {
            quebraCabecas.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
        }
    }
}


// SEPARAÇÃO DOS PRODUTOS POR CATEGORIA

function carregarProdutosNaPagina() {
    if (!jogos || !quebraCabecas) {
        console.error("Não encontrei os espaços das categorias no HTML.");
        return;
    }

    jogos.innerHTML = "";
    quebraCabecas.innerHTML = "";

    const produtosJogos = todosProdutos.filter(produto =>
        normalizarTexto(produto.categoria) === normalizarTexto("Jogos de Tabuleiro")
    );

    const produtosQuebraCabecas = todosProdutos.filter(produto =>
        normalizarTexto(produto.categoria) === normalizarTexto("Quebra-Cabeças")
    );

    produtosJogos.forEach(produto => {
        jogos.innerHTML += criarCard(produto);
    });

    produtosQuebraCabecas.forEach(produto => {
        quebraCabecas.innerHTML += criarCard(produto);
    });

    if (produtosJogos.length === 0) {
        jogos.innerHTML = "<p>Nenhum jogo de tabuleiro encontrado.</p>";
    }

    if (produtosQuebraCabecas.length === 0) {
        quebraCabecas.innerHTML = "<p>Nenhum quebra-cabeça encontrado.</p>";
    }
}


// ABRIR O MODAL DO PRODUTO

document.addEventListener("click", function(event) {
    const card = event.target.closest(".produto");

    if (!card) {
        return;
    }

    const produtoId = Number(card.dataset.id);

    const produtoSelecionado = todosProdutos.find(produto =>
        Number(produto.id) === produtoId
    );

    if (!produtoSelecionado || !modal) {
        return;
    }

    document.getElementById("modalImagem").src = produtoSelecionado.imagem;
    document.getElementById("modalImagem").alt = produtoSelecionado.nome;

    document.getElementById("modalNome").textContent =
        produtoSelecionado.nome;

    document.getElementById("modalCategoria").textContent =
        produtoSelecionado.categoria;

    document.getElementById("modalDescricao").textContent =
        produtoSelecionado.descricao || "Conheça esse brinquedo!";

    document.getElementById("modalIdade").textContent =
        formatarIdade(produtoSelecionado.idade);

    document.getElementById("modalAvaliacao").textContent =
        `⭐ ${produtoSelecionado.avaliacao}`;

    document.getElementById("modalVendidos").textContent =
        `Vendas: ${produtoSelecionado.vendidos}`;

    document.getElementById("modalPreco").textContent =
        formatarPreco(produtoSelecionado.preco);

    // IDENTIFICA O PRODUTO NO BOTÃO DO CARRINHO

    if (botaoAdicionarCarrinho) {
        botaoAdicionarCarrinho.dataset.id = produtoSelecionado.id;
    }

    modal.classList.add("ativo");
});


// FECHAR O MODAL

botaoFecharModal?.addEventListener("click", function() {
    modal?.classList.remove("ativo");
});

modal?.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.classList.remove("ativo");
    }
});


// MOSTRAR RESULTADOS DA PESQUISA

function mostrarResultados(produtos, pesquisa) {
    resultadosBusca.hidden = false;

    tituloResultados.textContent = "Resultados da pesquisa";

    descricaoResultados.textContent =
        `${produtos.length} produto(s) encontrado(s) para "${pesquisa}".`;

    listaResultados.innerHTML = "";

    if (produtos.length === 0) {
        listaResultados.innerHTML = `
            <p class="mensagem-sem-produtos">
                Nenhum produto encontrado. Tente pesquisar outro brinquedo.
            </p>
        `;
    } else {
        produtos.forEach(produto => {
            listaResultados.innerHTML += criarCard(produto);
        });
    }

    resultadosBusca.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// PESQUISA PELO NOME, CATEGORIA OU DESCRIÇÃO

formularioBusca?.addEventListener("submit", function(event) {
    event.preventDefault();

    const pesquisa = campoBusca.value.trim();

    if (!pesquisa) {
        campoBusca.focus();
        return;
    }

    const termo = normalizarTexto(pesquisa);

    const produtosEncontrados = todosProdutos.filter(produto => {
        return (
            normalizarTexto(produto.nome).includes(termo) ||
            normalizarTexto(produto.categoria).includes(termo) ||
            normalizarTexto(produto.descricao).includes(termo)
        );
    });

    mostrarResultados(produtosEncontrados, pesquisa);
});


// PESQUISA AO CLICAR NAS CATEGORIAS DA SEÇÃO

document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", function() {
        const categoria = normalizarTexto(card.dataset.categoria);

        const produtosEncontrados = todosProdutos.filter(produto =>
            normalizarTexto(produto.categoria) === categoria
        );

        mostrarResultados(produtosEncontrados, card.dataset.categoria);
    });
});


// VOLTAR E LIMPAR A PESQUISA

botaoLimparBusca?.addEventListener("click", function() {
    resultadosBusca.hidden = true;
    listaResultados.innerHTML = "";
    campoBusca.value = "";
});


// INICIAR O CARREGAMENTO

carregarCatalogo();