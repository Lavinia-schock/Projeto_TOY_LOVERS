
// ELEMENTOS DA PÁGINA

const capaAbertura = document.getElementById("capa-abertura");

const conteudoPrincipal = document.getElementById("conteudo-principal");


// ANIMAÇÃO DE ABERTURA

window.addEventListener("DOMContentLoaded", function () {

    setTimeout(function () {

        capaAbertura.classList.add("sair");

        conteudoPrincipal.classList.add("visivel");

    }, 2500);


    capaAbertura.addEventListener("transitionend", function (evento) {

        if (evento.propertyName === "transform") {

            capaAbertura.remove();

        }

    });

});


// DADOS DOS JOGADORES

const jogadores = [
    {
        nome: "Jogador 1",
        pontos: 250
    },
    {
        nome: "Jogador 2",
        pontos: 180
    },
    {
        nome: "Jogador 3",
        pontos: 320
    }
];


// ORGANIZAÇÃO DO RANKING

function organizarRanking() {

    return [...jogadores].sort(function (a, b) {

        return b.pontos - a.pontos;

    });

}


// EXIBIÇÃO DOS JOGADORES

function mostrarRanking() {

    const listaRanking = document.getElementById("lista-ranking");

    const jogadoresOrdenados = organizarRanking();

    listaRanking.innerHTML = "";

    jogadoresOrdenados.forEach(function (jogador, indice) {

        const cardJogador = document.createElement("div");

        cardJogador.classList.add("card-jogador");

        cardJogador.innerHTML = `
            <span>${indice + 1}º lugar</span>
            <h3>${jogador.nome}</h3>
            <p>${jogador.pontos} pontos</p>
        `;

        listaRanking.appendChild(cardJogador);

    });

}


// INICIALIZAÇÃO DO RANKING

mostrarRanking();
