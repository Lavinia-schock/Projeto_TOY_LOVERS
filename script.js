
function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function calcularDesconto(produto) {
    const precoAntigo = Number(produto.precoAntigo);
    const precoAtual = Number(produto.preco);

    if (!precoAntigo || precoAntigo <= precoAtual) {
        return 0;
    }

    return Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100);
}

function formatarIdade(idade) {
    if (typeof idade === "number") {
        return `A partir de ${idade} anos`;
    }

    return idade || "Consulte a indicação de idade";
}

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

            <p class="categoria-produto">${produto.categoria}</p>

            <div class="avaliacao">
                ⭐ ${Number(produto.avaliacao).toFixed(1).replace(".", ",")}
            </div>

            <div class="precos">
                ${desconto > 0
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

fetch("catalogo_produto.json")
    .then(resposta => {
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o JSON.");
        }

        return resposta.json();
    })
    .then(produtos => {
        const jogos = document.getElementById("produtos-jogos");
        const quebraCabecas = document.getElementById("produtos-quebra-cabecas");

        if (!jogos || !quebraCabecas) {
            throw new Error("Não encontrei os containers das categorias.");
        }

        jogos.innerHTML = "";
        quebraCabecas.innerHTML = "";

        produtos.forEach(produto => {
            if (produto.categoria === "Jogos de Tabuleiro") {
                jogos.innerHTML += criarCard(produto);
            }

            if (produto.categoria === "Quebra-Cabeças") {
                quebraCabecas.innerHTML += criarCard(produto);
            }
        });

        const modal = document.getElementById("modalProduto");
        let produtoSelecionado = null;

        document.addEventListener("click", event => {
            const card = event.target.closest(".produto");

            if (!card || !modal) return;

            const produtoId = Number(card.dataset.id);

            produtoSelecionado = produtos.find(
                produto => Number(produto.id) === produtoId
            );

            if (!produtoSelecionado) return;

            document.getElementById("modalImagem").src = produtoSelecionado.imagem;
            document.getElementById("modalImagem").alt = produtoSelecionado.nome;
            document.getElementById("modalNome").textContent = produtoSelecionado.nome;
            document.getElementById("modalCategoria").textContent = produtoSelecionado.categoria;
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

            modal.classList.add("ativo");
        });

        document.getElementById("fecharModal")?.addEventListener("click", () => {
            modal?.classList.remove("ativo");
        });

        document.getElementById("modalAdicionarCarrinho")?.addEventListener("click", () => {
            if (produtoSelecionado && typeof adicionarCarrinho === "function") {
                adicionarCarrinho(produtoSelecionado);
            }
        });
    })
    .catch(erro => {
        console.error("Erro ao carregar produtos:", erro);
});


// PESQUISA DE PRODUTOS

const formularioBusca = document.getElementById("formBusca");
const campoBusca = document.getElementById("busca");

const resultadosBusca = document.getElementById("resultadosBusca");
const listaResultados = document.getElementById("listaResultados");

const tituloResultados = document.getElementById("tituloResultados");
const descricaoResultados = document.getElementById("descricaoResultados");

const botaoLimparBusca = document.getElementById("limparBusca");


// CARREGAR O CATÁLOGO JSON

const carregarProdutosPesquisa = fetch("../JSON/catalogo_produto.json")
    .then(resposta => {
        if (!resposta.ok) {
            throw new Error("Erro ao carregar o catálogo JSON.");
        }

        return resposta.json();
    })
    .catch(erro => {
        console.error("Erro ao carregar produtos:", erro);
        return [];
    });


// NORMALIZAR TEXTO

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


// MOSTRAR RESULTADOS

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


// PESQUISAR PELO CAMPO EXISTENTE

formularioBusca?.addEventListener("submit", async function(event) {

    event.preventDefault();

    const pesquisa = campoBusca.value.trim();

    if (!pesquisa) {
        campoBusca.focus();
        return;
    }

    const produtos = await carregarProdutosPesquisa;

    const termo = normalizarTexto(pesquisa);

    const produtosEncontrados = produtos.filter(produto => {

        return (
            normalizarTexto(produto.nome).includes(termo) ||
            normalizarTexto(produto.categoria).includes(termo) ||
            normalizarTexto(produto.descricao).includes(termo)
        );

    });

    mostrarResultados(produtosEncontrados, pesquisa);

});


// PESQUISAR POR CATEGORIA

document.querySelectorAll(".product-card").forEach(card => {

    card.addEventListener("click", async function() {

        const produtos = await carregarProdutosPesquisa;

        const categoria = normalizarTexto(card.dataset.categoria);

        const produtosEncontrados = produtos.filter(produto => {

            return normalizarTexto(produto.categoria) === categoria;

        });

        mostrarResultados(produtosEncontrados, card.dataset.categoria);

    });

});


// VOLTAR E LIMPAR PESQUISA

botaoLimparBusca?.addEventListener("click", function() {

    resultadosBusca.hidden = true;

    listaResultados.innerHTML = "";

    campoBusca.value = "";

});


