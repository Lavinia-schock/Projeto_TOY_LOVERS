
import { supabase } from './supabase.js';


// ==========================================
// 1. ELEMENTOS DA PÁGINA
// ==========================================

const capaAbertura = document.getElementById('capa-abertura');
const conteudoPrincipal = document.getElementById('conteudo-principal');

const telaPerfil = document.getElementById('tela-perfil-kids');
const paginaJogos = document.getElementById('pagina-jogos');

const nicknameInput = document.getElementById('nickname');
const mensagemPerfil = document.getElementById('mensagem-perfil');

const botaoContinuar = document.getElementById('botao-continuar');
const botaoEditar = document.getElementById('botao-editar-perfil');
const botaoSair = document.getElementById('botao-sair');

const nomeConta = document.getElementById('nome-conta');

const avatarJogador = document.getElementById('avatar-jogador');
const nicknameJogador = document.getElementById('nickname-jogador');

const listaRanking = document.getElementById('lista-ranking');

const opcoesAvatar = document.querySelectorAll('.avatar-opcao');


// ==========================================
// 2. VARIÁVEIS
// ==========================================

let usuarioAtual = null;
let avatarSelecionado = '🦊';
let processandoTransicao = false;


// ==========================================
// 3. FUNÇÃO DE ESPERA
// ==========================================

function esperar(tempo) {
    return new Promise(resolve => setTimeout(resolve, tempo));
}


// ==========================================
// 4. ANIMAÇÃO DA CAPA DE ABERTURA
// ==========================================

async function iniciarAnimacao() {

    // Garante que a capa esteja visível
    capaAbertura.style.display = 'flex';
    capaAbertura.classList.remove('saindo');

    // Mostra o conteúdo principal
    conteudoPrincipal.classList.add('visivel');

    // Inicia a barra de carregamento
    const barra = document.querySelector('.progresso-preenchimento');

    barra.classList.remove('carregando');

    // Reinicia a animação da barra
    void barra.offsetWidth;

    barra.classList.add('carregando');

    // Aguarda o carregamento
    await esperar(2500);

    // Faz a capa sair
    capaAbertura.classList.add('saindo');

    // Aguarda a animação de saída
    await esperar(800);

    // Esconde a capa completamente
    capaAbertura.style.display = 'none';

    // Mostra a tela do nickname
    telaPerfil.classList.remove('escondido');
    telaPerfil.classList.remove('saindo');

    void telaPerfil.offsetWidth;

    telaPerfil.classList.add('ativa');

}


// ==========================================
// 5. VERIFICAR LOGIN
// ==========================================

async function verificarLogin() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {

        console.error('Erro ao verificar login:', error);

        window.location.replace('login.html');

        return false;

    }

    if (!data.session) {

        window.location.replace('login.html');

        return false;

    }

    usuarioAtual = data.session.user;

    nomeConta.textContent =
        usuarioAtual.user_metadata?.nome ||
        usuarioAtual.email?.split('@')[0] ||
        'Minha conta';

    return true;

}


// ==========================================
// 6. CARREGAR PERFIL SALVO
// ==========================================

async function carregarPerfil() {

    const { data, error } = await supabase
        .from('perfis')
        .select('nickname, avatar')
        .eq('id', usuarioAtual.id)
        .single();

    if (error) {

        console.error('Erro ao carregar perfil:', error);

        return;

    }

    if (data.nickname) {
        nicknameInput.value = data.nickname;
    }

    if (data.avatar) {

        avatarSelecionado = data.avatar;

        opcoesAvatar.forEach(botao => {

            botao.classList.toggle(
                'selecionado',
                botao.dataset.avatar === avatarSelecionado
            );

        });

    }

}


// ==========================================
// 7. SELEÇÃO DE AVATAR
// ==========================================

opcoesAvatar.forEach(botao => {

    botao.addEventListener('click', () => {

        // Remove seleção anterior
        opcoesAvatar.forEach(opcao => {
            opcao.classList.remove('selecionado');
        });

        // Seleciona o novo avatar
        botao.classList.add('selecionado');

        avatarSelecionado = botao.dataset.avatar;

    });

});


// ==========================================
// 8. ABRIR A ÁREA DOS JOGOS
// ==========================================

async function abrirPaginaJogos(nickname, avatar) {

    if (processandoTransicao) return;

    processandoTransicao = true;

    // Atualiza identificação do jogador
    nicknameJogador.textContent = nickname;
    avatarJogador.textContent = avatar;

    // Inicia a saída da tela do perfil
    telaPerfil.classList.remove('ativa');
    telaPerfil.classList.add('saindo');

    // Aguarda a animação terminar
    await esperar(700);

    // Esconde o formulário
    telaPerfil.classList.remove('saindo');
    telaPerfil.classList.add('escondido');

    // Mostra a área dos jogos
    paginaJogos.classList.remove('escondido');

    void paginaJogos.offsetWidth;

    paginaJogos.classList.add('ativa');

    processandoTransicao = false;

}


// ==========================================
// 9. SALVAR NICKNAME E AVATAR
// ==========================================


async function salvarPerfil() {

    if (processandoTransicao) return;

    const nickname = nicknameInput.value.trim();

    if (nickname.length < 3 || nickname.length > 16) {
        mensagemPerfil.textContent =
            'Seu nickname precisa ter entre 3 e 16 caracteres.';
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        mensagemPerfil.textContent =
            'Use apenas letras, números e underline (_).';
        return;
    }

    botaoContinuar.disabled = true;
    botaoContinuar.textContent = 'Salvando...';
    mensagemPerfil.textContent = '';

    // Salva somente o nickname e o avatar no perfil.
    const { error } = await supabase
        .from('perfis')
        .update({
            nickname: nickname,
            avatar: avatarSelecionado
        })
        .eq('id', usuarioAtual.id);

    if (error) {

        console.error('Erro ao salvar perfil:', error);

        mensagemPerfil.textContent =
            'Não foi possível salvar seu perfil. Tente novamente.';

        botaoContinuar.disabled = false;
        botaoContinuar.textContent = 'Continuar para os jogos';

        return;
    }

    // Atualiza a identificação do jogador e abre os jogos.
    await abrirPaginaJogos(nickname, avatarSelecionado);

    // Consulta o ranking sem exigir que o jogador já tenha pontos.
    await carregarRanking();

    botaoContinuar.disabled = false;
    botaoContinuar.textContent = 'Continuar para os jogos';
}



// ==========================================
// 10. EDITAR PERFIL
// ==========================================

botaoEditar.addEventListener('click', () => {

    if (processandoTransicao) return;

    paginaJogos.classList.remove('ativa');
    paginaJogos.classList.add('escondido');

    telaPerfil.classList.remove('escondido', 'saindo');

    void telaPerfil.offsetWidth;

    telaPerfil.classList.add('ativa');

});


// ==========================================
// 11. CARREGAR RANKING
// ==========================================


async function carregarRanking() {

    const secaoRanking = document.getElementById('ranking');

    // Inicialmente, esconde o pódio.
    secaoRanking.style.display = 'none';

    const { data, error } = await supabase
        .from('ranking_kids')
        .select('nickname, avatar, pontos')
        .gt('pontos', 0)
        .order('pontos', { ascending: false })
        .limit(10);

    if (error) {

        console.error('Erro ao carregar ranking:', error);

        return;
    }

    // Sem pontuações, não existe pódio para mostrar.
    if (!data || data.length === 0) {
        return;
    }

    // Mostra o pódio somente quando houver pontuações.
    secaoRanking.style.display = 'block';

    listaRanking.innerHTML = '';

    data.forEach((jogador, indice) => {

        const card = document.createElement('div');
        card.classList.add('card-jogador');

        const posicao = document.createElement('span');
        posicao.textContent = `${indice + 1}º lugar`;

        const avatar = document.createElement('div');
        avatar.classList.add('avatar-ranking');
        avatar.textContent = jogador.avatar || '🦊';

        const nome = document.createElement('h3');
        nome.textContent = jogador.nickname;

        const pontos = document.createElement('p');
        pontos.textContent = `${jogador.pontos} pontos`;

        card.append(posicao, avatar, nome, pontos);

        listaRanking.appendChild(card);

    });
}




// ==========================================
// 12. BOTÃO SAIR
// ==========================================

botaoSair.addEventListener('click', async () => {

    botaoSair.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {

        console.error('Erro ao sair:', error);

        alert('Não foi possível sair da conta.');

        botaoSair.disabled = false;

        return;

    }

    window.location.replace('login.html');

});


// ==========================================
// 13. INICIALIZAÇÃO
// ==========================================

async function iniciarComunidade() {

    // Esconde as telas antes de iniciar
    capaAbertura.classList.remove('saindo');

    telaPerfil.classList.add('escondido');
    paginaJogos.classList.add('escondido');

    // Verifica se existe login
    const loginValido = await verificarLogin();

    if (!loginValido) return;

    // Carrega informações salvas
    await carregarPerfil();

    // Carrega ranking
    await carregarRanking();

    // Inicia a sequência visual
    await iniciarAnimacao();

}


// ==========================================
// 14. EVENTOS
// ==========================================

botaoContinuar.addEventListener('click', salvarPerfil);


// Inicia a comunidade
iniciarComunidade();
