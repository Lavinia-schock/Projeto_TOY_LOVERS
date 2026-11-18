
(function () {
    const CHAVE_CARRINHO = "toysLoversCarrinho";

    const scriptCarrinho = document.currentScript;

    const caminhoCatalogo =
        scriptCarrinho?.dataset.catalogo || "JSON/catalogo_produto.json";

    function obterCarrinho() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_CARRINHO)
            );

            return Array.isArray(dados) ? dados : [];

        } catch (erro) {
            console.error("Erro ao recuperar o carrinho:", erro);
            return [];
        }
    }

    function salvarCarrinho(carrinho) {
        localStorage.setItem(
            CHAVE_CARRINHO,
            JSON.stringify(carrinho)
        );

        atualizarContadorCarrinho();

        window.dispatchEvent(new Event("carrinhoAtualizado"));
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function caminhoImagem(imagem) {
        if (!imagem) return "";

        if (/^https?:\/\//i.test(imagem)) {
            return imagem;
        }

        if (imagem.startsWith("../")) {
            return imagem;
        }

        return "../" + imagem.replace(/^\.\//, "");
    }

    function obterProdutos() {
        return obterCarrinho().map(produto => ({
            ...produto,
            quantidade: Number(produto.quantidade) || 1,
            preco: Number(produto.preco) || 0,
            imagemCompleta: caminhoImagem(produto.imagem)
        }));
    }

    async function adicionar(id) {
        try {
            const resposta = await fetch(caminhoCatalogo);

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o catálogo.");
            }

            const produtos = await resposta.json();

            const produto = produtos.find(
                item => Number(item.id) === Number(id)
            );

            if (!produto) {
                alert("Produto não encontrado no catálogo.");
                return;
            }

            const carrinho = obterCarrinho();

            const existente = carrinho.find(
                item => Number(item.id) === Number(produto.id)
            );

            if (existente) {
                existente.quantidade =
                    Number(existente.quantidade || 0) + 1;

            } else {
                carrinho.push({
                    id: Number(produto.id),
                    nome: produto.nome,
                    categoria: produto.categoria,
                    preco: Number(produto.preco),
                    imagem: produto.imagem,
                    quantidade: 1
                });
            }

            salvarCarrinho(carrinho);

            alert(`${produto.nome} foi adicionado ao carrinho!`);

        } catch (erro) {
            console.error("Erro ao adicionar produto:", erro);
            alert("Não foi possível adicionar o produto. Verifique o catálogo.");
        }
    }

    function alterarQuantidade(id, alteracao) {
        const carrinho = obterCarrinho();

        const produto = carrinho.find(
            item => Number(item.id) === Number(id)
        );

        if (!produto) return;

        produto.quantidade =
            Number(produto.quantidade) + alteracao;

        if (produto.quantidade <= 0) {
            remover(id);
            return;
        }

        salvarCarrinho(carrinho);
    }

    function remover(id) {
        const carrinho = obterCarrinho().filter(
            produto => Number(produto.id) !== Number(id)
        );

        salvarCarrinho(carrinho);
    }

    function limpar() {
        salvarCarrinho([]);
    }

    function calcularTotal() {
        return obterCarrinho().reduce((total, produto) => {
            return total +
                Number(produto.preco) *
                Number(produto.quantidade || 0);
        }, 0);
    }

    function atualizarContadorCarrinho() {
        const carrinho = obterCarrinho();

        const quantidade = carrinho.reduce(
            (total, produto) =>
                total + Number(produto.quantidade || 0),
            0
        );

        const linkCarrinho = document.querySelector(
            'a[href*="sistema_de_carrinho.html"]'
        );

        if (!linkCarrinho) return;

        let contador = document.getElementById("contadorCarrinho");

        if (!contador) {
            contador = document.createElement("span");
            contador.id = "contadorCarrinho";
            linkCarrinho.appendChild(contador);
        }

        contador.textContent = quantidade;
        contador.hidden = quantidade === 0;
    }

    document.addEventListener("click", function (event) {
        const botao = event.target.closest(
            ".add-cart, #modalAdicionarCarrinho"
        );

        if (!botao) return;

        event.preventDefault();

        const id = Number(botao.dataset.id);

        if (!id) {
            alert("Não foi possível identificar o produto selecionado.");
            return;
        }

        adicionar(id);
    });

    window.addEventListener("storage", atualizarContadorCarrinho);
    window.addEventListener("carrinhoAtualizado", atualizarContadorCarrinho);

    window.ToysLoversCarrinho = {
        pronto: Promise.resolve(),
        obterProdutos,
        adicionar,
        alterarQuantidade,
        remover,
        limpar,
        calcularTotal,
        formatarPreco
    };

    atualizarContadorCarrinho();

})();
