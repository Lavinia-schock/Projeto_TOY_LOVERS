
import { supabase } from './supabase.js';

// ==========================================
// REGISTRAR PONTUAÇÃO DO JOGADOR
// ==========================================

export async function registrarPontuacao(pontosGanhos) {

    // Verifica se os pontos são válidos
    if (!Number.isInteger(pontosGanhos) || pontosGanhos <= 0) {
        console.error('Quantidade de pontos inválida.');
        return false;
    }

    // Verifica o usuário conectado
    const { data: usuarioData, error: usuarioError } =
        await supabase.auth.getUser();

    if (usuarioError || !usuarioData.user) {
        console.error('Usuário não está conectado.');
        return false;
    }

    const usuario = usuarioData.user;

    // Busca nickname e avatar salvos no perfil
    const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('nickname, avatar')
        .eq('id', usuario.id)
        .single();

    if (perfilError || !perfil || !perfil.nickname) {
        console.error('Não foi possível encontrar o perfil do jogador.');
        return false;
    }

    // Consulta se o jogador já está no ranking
    const { data: jogador, error: buscaError } = await supabase
        .from('ranking_kids')
        .select('pontos')
        .eq('user_id', usuario.id)
        .maybeSingle();

    if (buscaError) {
        console.error('Erro ao consultar ranking:', buscaError);
        return false;
    }

    // ======================================
    // PRIMEIRA PONTUAÇÃO DO JOGADOR
    // ======================================

    if (!jogador) {

        const { error: insercaoError } = await supabase
            .from('ranking_kids')
            .insert({
                user_id: usuario.id,
                nickname: perfil.nickname,
                avatar: perfil.avatar || '🦊',
                pontos: pontosGanhos
            });

        if (insercaoError) {
            console.error('Erro ao cadastrar jogador no ranking:', insercaoError);
            return false;
        }

        console.log('Jogador cadastrado no ranking!');
        return true;
    }

    // ======================================
    // ATUALIZAÇÃO DAS PRÓXIMAS PONTUAÇÕES
    // ======================================

    const novaPontuacao = jogador.pontos + pontosGanhos;

    const { error: atualizacaoError } = await supabase
        .from('ranking_kids')
        .update({
            pontos: novaPontuacao,
            nickname: perfil.nickname,
            avatar: perfil.avatar || '🦊',
            updated_at: new Date().toISOString()
        })
        .eq('user_id', usuario.id);

    if (atualizacaoError) {
        console.error('Erro ao atualizar pontuação:', atualizacaoError);
        return false;
    }

    console.log('Pontuação atualizada:', novaPontuacao);

    return true;
}
