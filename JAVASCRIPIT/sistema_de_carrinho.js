
document.addEventListener("DOMContentLoaded", async function () {
    const sistema = window.ToysLoversCarrinho;

    if (!sistema) {
        console.error("Erro: o objeto ToysLoversCarrinho não foi encontrado. Verifique se carrinho.js foi carregado antes deste arquivo.");
        return;
    }

    await sistema.pronto;

    const areaProdutos = document.getElementById("cart-items");
    const carrinhoVazio = document.getElementById("empty-cart");
    const resumo = document.getElementById("order-summary");
    const botaoLimpar = document.getElementById("clear-cart");

    const totalItens = document.getElementById("total-items");
    const subtotal = document.getElementById("subtotal");
    const totalPreco = document.getElementById("total-price");

    const botaoFinalizar = document.getElementById("checkout-button");
    const botaoConfirmar = document.getElementById("confirm-order");

    const modalElemento = document.getElementById("checkoutModal");

    const modalCompra = modalElemento && window.bootstrap
        ? new bootstrap.Modal(modalElemento)
        : null;

    if (!areaProdutos || !carrinhoVazio || !resumo || !botaoLimpar) {
        console.error("Erro: um ou mais elementos principais do carrinho não foram encontrados no HTML.");
        return;
    }

    function atualizarResumo() {
        const produtos = sistema.obterProdutos();

        const quantidade = produtos.reduce((total, produto) => {
            return total + Number(produto.quantidade || 0);
        }, 0);

        const total = sistema.calcularTotal();

        if (totalItens) {
            totalItens.textContent =
                `${quantidade} ${quantidade === 1 ? "produto" : "produtos"}`;
        }

        if (subtotal) {
            subtotal.textContent = sistema.formatarPreco(total);
        }

        if (totalPreco) {
            totalPreco.textContent = sistema.formatarPreco(total);
        }
    }

    function mostrarCarrinho() {
        const produtos = sistema.obterProdutos();

        if (!produtos || produtos.length === 0) {
            carrinhoVazio.style.display = "flex";
            areaProdutos.style.display = "none";
            resumo.style.display = "none";
            botaoLimpar.style.display = "none";

            if (totalItens) totalItens.textContent = "0 produtos";
            if (subtotal) subtotal.textContent = sistema.formatarPreco(0);
            if (totalPreco) totalPreco.textContent = sistema.formatarPreco(0);

            return;
        }

        carrinhoVazio.style.display = "none";
        areaProdutos.style.display = "flex";
        resumo.style.display = "block";
        botaoLimpar.style.display = "inline-block";

        areaProdutos.innerHTML = produtos.map(produto => `
            <article class="cart-product">

                <img
                    src="${produto.imagemCompleta || produto.imagem || ""}"
                    alt="${produto.nome}"
                >

                <div class="cart-product-info">
                    <h3>${produto.nome}</h3>

                    <strong>
                        ${sistema.formatarPreco(produto.preco * produto.quantidade)}
                    </strong>

                    <p>
                        ${sistema.formatarPreco(produto.preco)} cada
                    </p>
                </div>

                <div class="quantity-control">
                    <button
                        type="button"
                        class="quantity-btn"
                        data-id="${produto.id}"
                        data-action="diminuir"
                        aria-label="Diminuir quantidade"
                    >-</button>

                    <span>${produto.quantidade}</span>

                    <button
                        type="button"
                        class="quantity-btn"
                        data-id="${produto.id}"
                        data-action="aumentar"
                        aria-label="Aumentar quantidade"
                    >+</button>
                </div>

                <button
                    type="button"
                    class="remove-product"
                    data-id="${produto.id}"
                    aria-label="Remover produto"
                >
                    <i class="fa-solid fa-trash-can"></i>
                </button>

            </article>
        `).join("");

        atualizarResumo();
    }

    areaProdutos.addEventListener("click", function (event) {
        const botao = event.target.closest("button");

        if (!botao) return;

        const id = Number(botao.dataset.id);

        if (botao.classList.contains("quantity-btn")) {
            if (botao.dataset.action === "aumentar") {
                sistema.alterarQuantidade(id, 1);
            }

            if (botao.dataset.action === "diminuir") {
                sistema.alterarQuantidade(id, -1);
            }
        }

        if (botao.classList.contains("remove-product")) {
            sistema.remover(id);
        }

        mostrarCarrinho();
    });

    botaoLimpar.addEventListener("click", function () {
        if (confirm("Deseja realmente limpar seu carrinho?")) {
            sistema.limpar();
            mostrarCarrinho();
        }
    });

    if (botaoFinalizar) {
        botaoFinalizar.addEventListener("click", function () {
            if (sistema.obterProdutos().length === 0) return;

            const pagamento = document.querySelector(
                'input[name="forma-pagamento"]:checked'
            );

            if (!pagamento) {
                alert("Selecione uma forma de pagamento.");
                return;
            }

            const modalTotal = document.getElementById("modal-total");
            const modalPagamento = document.getElementById("modal-pagamento");

            if (modalTotal) {
                modalTotal.textContent =
                    sistema.formatarPreco(sistema.calcularTotal());
            }

            if (modalPagamento) {
                modalPagamento.textContent = pagamento.value;
            }

            if (modalCompra) {
                modalCompra.show();
            } else {
                alert("Não foi possível abrir a confirmação. Verifique o Bootstrap e o elemento checkoutModal no HTML.");
            }
        });
    }

    if (botaoConfirmar) {
        botaoConfirmar.addEventListener("click", function () {
            alert("Demonstração concluída! Nenhum pagamento foi realizado.");

            sistema.limpar();
            mostrarCarrinho();

            if (modalCompra) {
                modalCompra.hide();
            }
        });
    }

    window.addEventListener("carrinhoAtualizado", mostrarCarrinho);

    window.addEventListener("storage", function (event) {
        if (event.key === "toysLoversCarrinho" || event.key === null) {
            mostrarCarrinho();
        }
    });

    mostrarCarrinho();
});
