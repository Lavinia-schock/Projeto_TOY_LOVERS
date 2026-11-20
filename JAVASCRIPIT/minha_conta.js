
import { supabase } from './supabase.js';

const feedback = document.getElementById('account-feedback');
const botaoSair = document.getElementById('botao-sair');

function preencherCampo(id, valor) {
    document.getElementById(id).textContent = valor || 'Não informado';
}

async function carregarConta() {
    try {
        const { data: { user }, error: erroUsuario } =
            await supabase.auth.getUser();

        if (erroUsuario || !user) {
            window.location.replace('login.html');
            return;
        }

        const { data: perfil, error: erroPerfil } = await supabase
            .from('perfis')
            .select('nome, telefone, cep, cidade, rua, complemento')
            .eq('id', user.id)
            .single();

        if (erroPerfil) {
            throw erroPerfil;
        }

        const nome = perfil.nome || 'Usuário';

        document.getElementById('nome-usuario').textContent =
            `Olá, ${nome}!`;

        document.getElementById('email-usuario').textContent =
            user.email || '';

        preencherCampo('perfil-nome', perfil.nome);
        preencherCampo('perfil-email', user.email);
        preencherCampo('perfil-telefone', perfil.telefone);
        preencherCampo('perfil-cep', perfil.cep);
        preencherCampo('perfil-cidade', perfil.cidade);
        preencherCampo('perfil-rua', perfil.rua);
        preencherCampo('perfil-complemento', perfil.complemento);

    } catch (erro) {
        console.error('Erro ao carregar a conta:', erro);

        feedback.textContent =
            'Não foi possível carregar seus dados. Tente novamente.';
    }
}

botaoSair.addEventListener('click', async () => {
    botaoSair.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Erro ao sair:', error);
        feedback.textContent = 'Não foi possível encerrar sua sessão.';
        botaoSair.disabled = false;
        return;
    }

    window.location.replace('login.html');
});

carregarConta();
