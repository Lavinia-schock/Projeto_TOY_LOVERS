
import { supabase } from './supabase.js';

const formulario = document.getElementById('login-form');
const feedback = document.getElementById('login-feedback');
const botao = document.getElementById('botao-login');

const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('senha');


// AUTENTICAÇÃO DO USUÁRIO

formulario.addEventListener('submit', async (evento) => {

    evento.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    feedback.textContent = 'Verificando seus dados...';
    botao.disabled = true;
    botao.innerHTML = 'Entrando...';

    try {

        const { data, error } = await supabase.auth.signInWithPassword({

            email: email,
            password: senha

        });

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error('Não foi possível iniciar sua sessão.');
        }

        feedback.textContent = 'Login realizado com sucesso!';

        window.location.href = '../index.html';

    } catch (erro) {

        console.error('Erro no login:', erro);

        feedback.textContent =
            'Não foi possível entrar. Confira seu e-mail e sua senha.';

        botao.disabled = false;
        botao.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';

    }

});


// MOSTRAR E OCULTAR SENHA

const botaoMostrarSenha = document.getElementById('mostrar-senha');

botaoMostrarSenha.addEventListener('click', () => {

    const senhaVisivel = campoSenha.type === 'password';

    campoSenha.type = senhaVisivel ? 'text' : 'password';

    botaoMostrarSenha.innerHTML = senhaVisivel
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';

    botaoMostrarSenha.setAttribute(
        'aria-label',
        senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'
    );

});


// LINK DE RECUPERAÇÃO DE SENHA

document.getElementById('esqueci-senha').addEventListener('click', (evento) => {

    evento.preventDefault();

    feedback.textContent =
        'A recuperação de senha ainda será configurada.';

});
