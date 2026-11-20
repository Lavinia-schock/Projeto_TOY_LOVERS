
import { supabase } from './supabase.js';

const areaUsuario = document.getElementById('area-usuario');

const estaNaPastaHTML = window.location.pathname.includes('/HTML/');

const caminhoLogin = estaNaPastaHTML
    ? 'login.html'
    : 'HTML/login.html';

const caminhoConta = estaNaPastaHTML
    ? 'minha_conta.html'
    : 'HTML/minha_conta.html';


function mostrarVisitante() {

    areaUsuario.innerHTML = `
        <li>
            <a href="${caminhoLogin}" aria-label="Entrar na conta">
                <i class="fa-regular fa-user"></i>
            </a>
        </li>
    `;

}


function mostrarUsuario(usuario) {

    const nome = usuario.user_metadata?.nome ||
        usuario.email?.split('@')[0] ||
        'Minha conta';

    areaUsuario.innerHTML = `
        <li class="usuario-logado">
            <a href="${caminhoConta}" class="nome-usuario"></a>

            <button type="button" id="botao-sair">
                Sair
            </button>
        </li>
    `;

    areaUsuario.querySelector('.nome-usuario').textContent =
        `Olá, ${nome}`;

    document.getElementById('botao-sair')
        .addEventListener('click', async () => {

            const botao = document.getElementById('botao-sair');

            botao.disabled = true;

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Erro ao sair:', error);
                alert('Não foi possível sair da conta.');
                botao.disabled = false;
            }

        });

}


async function verificarSessao() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Erro ao verificar sessão:', error);
        mostrarVisitante();
        return;
    }

    if (data.session) {
        mostrarUsuario(data.session.user);
    } else {
        mostrarVisitante();
    }

}


verificarSessao();

supabase.auth.onAuthStateChange((evento, sessao) => {

    if (sessao) {
        mostrarUsuario(sessao.user);
    } else {
        mostrarVisitante();
    }

});
