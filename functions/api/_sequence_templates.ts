export interface SequenceEmailTemplate {
  step: number;
  subject: string;
  videoId: string;
  youtubeUrl: string;
  badge: string;
  title: string;
  previewText: string;
  renderHtml: (firstName: string, unsubLink: string) => string;
  renderText: (firstName: string, unsubLink: string) => string;
}

export const SEQUENCE_TEMPLATES: Record<number, SequenceEmailTemplate> = {
  1: {
    step: 1,
    subject: '[Vídeo 1/7] Como passei na entrevista não-técnica em 19 minutos (gravação real)',
    videoId: 'OKjAuk-eu8M',
    youtubeUrl: 'https://www.youtube.com/watch?v=OKjAuk-eu8M',
    badge: 'Dia 1/7 • Entrevista Cultural & Screening',
    title: 'Eu venci a entrevista não-técnica em 19 minutos',
    previewText: 'Assista aos bastidores reais de uma primeira fase com recrutador internacional sem travar no inglês.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 1 de 7 • Entrevistas Reais Gravadas
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          A maioria dos desenvolvedores tem pavor da <strong>Fase 1 (Screening Call)</strong> com recrutadores internacionais porque acredita no mito de que precisa de um "inglês perfeito de nativo".
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste primeiro vídeo da nossa série de 7 dias, eu liberei a gravação <strong>sem cortes</strong> de como conduzi e venci uma entrevista cultural em exatos <strong>19 minutos</strong>, aplicando o método STAR e posicionando autoridade sênior desde o primeiro minuto.
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=OKjAuk-eu8M" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/OKjAuk-eu8M/maxresdefault.jpg" alt="Eu venci a entrevista não técnica em 19 minutos" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Assistir Gravação: Eu venci a entrevista não técnica em 19 minutos!
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Assistir no YouTube &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(163, 230, 53, 0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">💡 Principal Modelo Mental deste vídeo:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            O recrutador não quer avaliar sua gramática britânica; ele quer checar clareza, alinhamento de expectativas e se você é um solucionador de problemas tranquilo de trabalhar em equipe.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 2/7</strong>, vamos entrar na parte técnica pesada: vou te mostrar uma <strong>Entrevista Técnica Java Sênior aprovada de $6.500 USD/mês</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nNeste primeiro vídeo da nossa série de 7 dias com entrevistas reais gravadas, veja como passei na Fase 1 (Screening) em exatos 19 minutos sem enrolação:\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=OKjAuk-eu8M\n\n💡 Lição: O recrutador internacional busca clareza e autoridade, não perfeição gramatical acadêmica.\n\nAmanhã, no Vídeo 2/7: Entrevista Técnica Java Sênior aprovada de $6.500 USD/mês!\n\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  },

  2: {
    step: 2,
    subject: '[Vídeo 2/7] Entrevista Técnica Java Sênior de $6.500 USD (Aprovado ao vivo)',
    videoId: 'saAmDOzWFNo',
    youtubeUrl: 'https://www.youtube.com/watch?v=saAmDOzWFNo',
    badge: 'Dia 2/7 • Entrevista Técnica Java',
    title: 'Aprovado: Entrevista Java Sênior para ganhar $6.500 USD',
    previewText: 'Veja exatamente como defender decisões de arquitetura e Spring Boot para um Tech Lead americano.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 2 de 7 • Fase Técnica ao Vivo
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          O que diferencia um desenvolvedor de R$ 10k no Brasil de um engenheiro contratado por <strong>$6.500 USD (~R$ 35.000+/mês)</strong> no exterior não é decorar sintaxe, mas a forma como você justifica suas decisões arquiteturais.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Na gravação de hoje, você vai assistir a uma entrevista técnica real onde o Tech Lead aprofunda em concorrência, Spring Boot, transações de banco e resiliência de microserviços.
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=saAmDOzWFNo" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/saAmDOzWFNo/maxresdefault.jpg" alt="Entrevista Java Sênior 6.5k USD" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Aprovado: Entrevista Java Sênior para ganhar $6.500 USD (Entrevista Real)
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Assistir Entrevista Completa &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(163, 230, 53, 0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">💡 O que observar neste vídeo:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            Note como eu conduzo a conversa de igual para igual. Não respondo como um aluno sendo sabatinado, mas como um consultor sênior alinhando soluções técnicas com outro engenheiro.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 3/7</strong>: o terror de muitos devs — <strong>Live Coding com TDD gravado sem cortes</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nHoje é o Dia 2 da nossa série: assista a uma Entrevista Técnica real gravada para uma vaga Java Sênior de $6.500 USD/mês (~R$ 35k+/mês):\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=saAmDOzWFNo\n\n💡 Observe como justificar decisões arquiteturais e manter uma postura de consultor entre pares.\n\nAmanhã, Vídeo 3/7: Live Coding com TDD gravado sem cortes!\n\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  },

  3: {
    step: 3,
    subject: '[Vídeo 3/7] Live Coding com TDD sem cortes (Como manter a calma e passar)',
    videoId: 'KO4mFv2NhgI',
    youtubeUrl: 'https://www.youtube.com/watch?v=KO4mFv2NhgI',
    badge: 'Dia 3/7 • Live Coding & TDD',
    title: 'Gravei Minha Entrevista Sênior: Live Coding com TDD (Sem Cortes)',
    previewText: 'Como pensar em voz alta, estruturar testes e não travar enquanto o entrevistador olha sua tela.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 3 de 7 • Código ao Vivo
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          O <strong>Live Coding</strong> é o momento em que 80% dos desenvolvedores se sabotam por ansiedade. A tela compartilhada dá a sensação de estar sendo vigiado.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste vídeo, eu gravei a minha sessão de Live Coding completa, sem edições ou cortes, demonstrando a técnica de <em>Think Aloud</em> (pensar em voz alta em inglês) combinada com TDD para resolver o problema passo a passo.
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=KO4mFv2NhgI" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/KO4mFv2NhgI/maxresdefault.jpg" alt="Live Coding com TDD Sem Cortes" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Gravei Minha Entrevista Sênior: Live Coding com TDD (Sem Cortes)
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Assistir Live Coding Completo &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(163, 230, 53, 0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">💡 O Segredo do Live Coding Internacional:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            O entrevistador quer ver como você lida com dúvidas e se comunica sob pressão. Começar escrevendo o teste garante clareza e mostra maturidade técnica imediata.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 4/7</strong>: um formato moderno de teste que está virando febre nas empresas gringas: <strong>Desafio Técnico em Code Review ($5.3k USD)</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nNo Dia 3 da nossa série, assista à gravação real e sem cortes de um Live Coding com TDD para vaga sênior internacional:\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=KO4mFv2NhgI\n\n💡 Dica: A técnica de "Think Aloud" transforma o teste de código em um pair-programming colaborativo.\n\nAmanhã, Vídeo 4/7: Desafio Técnico feito em Code Review de $5.3k USD!\n\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  },

  4: {
    step: 4,
    subject: '[Vídeo 4/7] Desafio Técnico em Code Review ($5.3k USD) — Formato incomum e realista',
    videoId: 'xaUULwpy5mI',
    youtubeUrl: 'https://www.youtube.com/watch?v=xaUULwpy5mI',
    badge: 'Dia 4/7 • Avaliação por Code Review',
    title: 'Desafio Técnico feito em Code Review - 5.3k USD - Realista e Incomum',
    previewText: 'Por que as melhores empresas internacionais avaliam seu senso crítico e não apenas digitação.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 4 de 7 • Code Review na Gringa
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Empresas maduras no exterior estão abandonando provinhas de LeetCode abstratas para avaliar o que você realmente faz no dia a dia: <strong>revisar Pull Requests de outros engenheiros</strong>.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Nesta gravação, analiso um desafio prático de <strong>$5.3k USD/mês</strong> onde a empresa me avaliou exclusivamente com base nos comentários, apontamentos de segurança e melhorias de design que fiz no código deles.
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=xaUULwpy5mI" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/xaUULwpy5mI/maxresdefault.jpg" alt="Desafio Técnico Code Review" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Desafio Técnico feito em Code Review - 5.3k USD - Realista e Incomum
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Ver Análise do Desafio &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(163, 230, 53, 0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">💡 Diferencial Sênior:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            Em um Code Review sênior, você não aponta apenas formatação de código; você identifica vazamentos de memória, gargalos de I/O e sugere refatorações de alto impacto de forma empática.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 5/7</strong>: como negociar o salário em inglês e <strong>descobrir o budget máximo da empresa</strong> sem queimar sua proposta.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nNo Dia 4 da nossa série, veja como funciona um desafio técnico avaliado 100% através de Code Review em uma vaga de $5.3k USD/mês:\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=xaUULwpy5mI\n\n💡 Lição: Senso crítico arquitetural e comunicação empática valem mais do que decorar algoritmos.\n\nAmanhã, Vídeo 5/7: Descobrindo o salário que a empresa pode pagar (Call gravada de negociação)!\n\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  },

  5: {
    step: 5,
    subject: '[Vídeo 5/7] Descobrindo o salário que a gringa está disposta a pagar (Call gravada)',
    videoId: 'YPqkk_9BPik',
    youtubeUrl: 'https://www.youtube.com/watch?v=YPqkk_9BPik',
    badge: 'Dia 5/7 • Negociação Salarial em Dólar',
    title: 'Descobrindo o salário que estão dispostos a pagar - Call em Inglês',
    previewText: 'Aprenda a fazer a empresa revelar o teto salarial antes de você dizer o primeiro número.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 5 de 7 • Negociação em Inglês
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          A regra de ouro da negociação de contratos é: <strong>quem fala o primeiro número perde a margem</strong>.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste vídeo, eu mostro uma chamada real gravada em inglês onde uso técnicas de ancoragem para fazer o recrutador revelar a faixa orçamentária da vaga antes de eu me comprometer com um valor.
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=YPqkk_9BPik" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/YPqkk_9BPik/maxresdefault.jpg" alt="Descobrindo o salário em call em inglês" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Descobrindo o salário que estão dispostos a pagar - Call em Inglês
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Assistir Negociação ao Vivo &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(163, 230, 53, 0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">💡 Estratégia de Posicionamento:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            Perguntar <em>"What is the allocated budget range for this seniority level?"</em> demonstra maturidade corporativa e evita que você feche por $3k uma vaga que pagaria $6.5k.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 6/7</strong>: o tema mais pedido — <strong>Polyworking: a arquitetura para gerenciar múltiplos contratos no exterior</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nNo Dia 5 da nossa série, aprenda como negociar em inglês e descobrir o budget da empresa antes de dar sua pretensão salarial:\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=YPqkk_9BPik\n\n💡 Lição: A pergunta certa no momento certo pode significar uma diferença de R$ 15.000 a mais por mês no seu contrato.\n\nAmanhã, Vídeo 6/7: Polyworking e a gestão de múltiplos contratos internacionais!\n\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  },

  6: {
    step: 6,
    subject: '[Vídeo 6/7] Polyworking: A arquitetura de múltiplos contratos remotos no exterior',
    videoId: 'HDnSaI26Knk',
    youtubeUrl: 'https://www.youtube.com/watch?v=HDnSaI26Knk',
    badge: 'Dia 6/7 • Polyworking & Múltiplos Contratos',
    title: 'Polyworking: Como não ser descoberto e tirar vantagem disso?',
    previewText: 'A estratégia operacional e jurídica para acumular múltiplos contratos PJ no exterior de forma sustentável.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 6 de 7 • Soberania Financeira
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Por que depender de apenas um único empregador se você pode atuar como um <strong>prestador de serviços soberano</strong> para clientes globais?
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Nesta aula aprofundada, abordo a arquitetura do <strong>Polyworking</strong>: como engenheiros sênior organizam agendas assíncronas, gerenciam entregas de alto valor e acumulam rendas de <strong>R$ 50k+ a R$ 80k+/mês</strong> com segurança jurídica e excelência técnica.
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=HDnSaI26Knk" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/HDnSaI26Knk/maxresdefault.jpg" alt="Polyworking para DEVs" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Polyworking, como não ser descoberto e tirar vantagem disso?
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Assistir Análise de Polyworking &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(163, 230, 53, 0.05); padding: 18px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">💡 Pilar Central do Polyworking:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            Polyworking não é fazer corpo mole; é dominar a entrega assíncrona orientada a resultados e não a horas de cadeira.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã é o <strong>Dia 7 (O Fechamento)</strong>: vou compartilhar o caso real de um aluno que <strong>em 2 meses conquistou a vaga na gringa</strong> e como você pode trilhar o mesmo caminho.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nNo Dia 6 da nossa série, entenda a estratégia real de Polyworking (múltiplos contratos remotos simultâneos no exterior):\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=HDnSaI26Knk\n\n💡 Foco em entrega assíncrona de alto impacto e segurança jurídica como prestador B2B.\n\nAmanhã, Vídeo 7/7: O Caso Real de 60 dias e o seu próximo passo!\n\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  },

  7: {
    step: 7,
    subject: '[Vídeo 7/7] De Dev no Brasil a Contrato Internacional em 60 dias (Estudo de Caso Real)',
    videoId: '4NoGEhlYeWM',
    youtubeUrl: 'https://www.youtube.com/watch?v=4NoGEhlYeWM',
    badge: 'Dia 7 de 7 • Prova Real & Mentoria',
    title: 'Em 2 meses conseguiu a vaga na gringa, e hoje ganha mais que 99% dos Brasileiros',
    previewText: 'O estudo de caso completo e o convite para a Mentoria Descomplica DEV Na Gringa.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 7 de 7 • Conclusão & Próximo Passo
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Chegamos ao último dia da nossa série de entrevistas reais. Ao longo desta semana, você viu com seus próprios olhos: o screening de 19 minutos, a entrevista técnica de $6.5k, o Live Coding sem cortes, o Code Review e a negociação salarial.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          No vídeo de hoje, você vai conhecer o caso do <strong>Renan</strong>, que aplicou exatamente este passo a passo e em apenas <strong>60 dias</strong> conquistou seu contrato internacional, saindo do teto salarial do Brasil:
        </p>
        
        <!-- Video Card -->
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=4NoGEhlYeWM" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/4NoGEhlYeWM/maxresdefault.jpg" alt="Caso Real Aluno Gringa" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                ▶️ Em 2 meses conseguiu a vaga na gringa, e hoje ganha mais que 99% dos Brasileiros
              </h3>
              <span style="color: #a3e635; font-weight: bold; font-size: 14px;">Assistir Caso Real &rarr;</span>
            </div>
          </a>
        </div>

        <!-- Mentorship CTA Box -->
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #a3e635; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">
            🚀 Quer acelerar sua aprovação com a minha mentoria direta?
          </h2>
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
            No programa <strong>Descomplica DEV Na Gringa</strong>, nós fazemos simulações reais de entrevistas técnicas em inglês, otimização de currículo para filtros ATS e acompanhamento até a assinatura do seu contrato de R$ 30k+/mês.
          </p>
          <a href="https://global.robsoncassiano.software" target="_blank" style="display: inline-block; background-color: #a3e635; color: #022c22; font-weight: 800; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 15px;">
            Conhecer o Programa & Ver Mais Casos Reais &rarr;
          </a>
        </div>

        <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 24px;">
          Obrigado por acompanhar esta série. A partir de agora, você continuará recebendo meus ensaios técnicos semanais no portal.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Senior Software Engineer & Mentor Global<br />
          <a href="https://eu.robsoncassiano.software" style="color: #a3e635; text-decoration: none;">eu.robsoncassiano.software</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Fala, ${firstName}!\n\nHoje encerramos a série de 7 dias com o estudo de caso real do Renan, que em 60 dias conquistou sua vaga na gringa:\n\n▶️ Assista no YouTube: https://www.youtube.com/watch?v=4NoGEhlYeWM\n\n🚀 Se você quer acelerar sua aprovação com a minha mentoria direta (simulações reais de entrevistas técnicas em inglês e negociação de contratos de R$ 30k+ a R$ 60k+/mês):\n👉 Acesse: https://global.robsoncassiano.software\n\nForte abraço,\nRobson Cassiano\nCancelar inscrição: ${unsubLink}`
  }
};
