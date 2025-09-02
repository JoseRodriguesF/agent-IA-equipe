import openai from "../config/IAconfig.js";
import fs from 'fs';

const bdPrompt = fs.readFileSync('RAG/Prompts/markdownBD.md', 'utf-8');
const backPrompt = fs.readFileSync('RAG/Prompts/markdownBack.md', 'utf-8');

let contexto = [];
// Função para configurar e enviar mensagens para a API IA+
export async function chat(message) {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Mensagem inválida ou vazia');
        }
        // Adiciona a mensagem do usuário ao contexto da conversa
        contexto.push({ role: "user", content: message });
        // Envia a mensagem para a API IA com as diretrizes e contexto
        const respostaIA = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:  `Você é um assistente interno da equipe MindTracking, especializado em auxiliar desenvolvedores e QA’s
                     no projeto da plataforma de acompanhamento psicológico. 
                     A plataforma utiliza questionários diários, diários escritos e interações com a Athena (IA de apoio psicológico)
                     para gerar dados que o usuário pode exportar ou visualizar para melhorar sua saúde mental.  
                                            
                            Suas responsabilidades:
                                            
                            1. Desenvolvimento Web
                            - Auxiliar com dúvidas técnicas de back-end e banco de dados.
                            - Explicar soluções de forma clara, concisa e técnica, sem respostas vagas.
                            - Você terá acesso aos seguintes prompts de apoio:
                              - Prompt de Banco de Dados: \${bdPrompt}
                              - Prompt de Back-End: \${backPrompt}
                                            
                            2. Testes Automatizados (QA)
                            - Ajudar a equipe de QA a criar testes automatizados para as funcionalidades da plataforma.
                            - Ensinar como forçar bugs, realizar testes brutos e gerar erros de forma controlada para fortalecer a aplicação.
                                            
                            3. Escopo de Resposta
                            - Responder somente a perguntas relacionadas ao projeto MindTracking.
                            - Se a pergunta for fora desse contexto, responda educadamente:
                              "Posso ajudar apenas com dúvidas relacionadas ao desenvolvimento ou testes da plataforma MindTracking."
                            `
                },
                ...contexto
            ],
            model: "gpt-4o-mini", // Modelo de IA utilizado
            temperature: 0.7 // Controla a criatividade das respostas
        });

        const resposta = respostaIA.choices[0]?.message?.content?.trim();

        if (!resposta) {
            throw new Error('Não foi possível gerar uma resposta');
        }

        // Adiciona a resposta ao contexto da conversa
        contexto.push({ role: "assistant", content: resposta });

        return resposta;

    } catch (error) {
        console.error('Erro ao configurar chat:', error);
        throw new Error('Não foi possível processar sua mensagem. Por favor, tente novamente mais tarde.');
    }
}
