import { SequenceEmailTemplate } from './types';

export const SEQUENCE_TEMPLATES: Record<number, SequenceEmailTemplate> = {
  1: {
    step: 1,
    subject: '[Vídeo 1/7] Como conduzi a entrevista cultural em 19 minutos (gravação sem cortes)',
    videoId: 'OKjAuk-eu8M',
    youtubeUrl: 'https://www.youtube.com/watch?v=OKjAuk-eu8M',
    badge: 'Dia 1 de 7 • Entrevista Cultural e Screening',
    title: 'Entrevista cultural aprovada em 19 minutos',
    previewText: 'Assista aos bastidores reais de uma primeira fase com recrutador internacional conduzida com clareza e autoridade técnica.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 1 de 7 • Bastidores Reais Gravados
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Muitos engenheiros experientes perdem grandes oportunidades logo na primeira conversa com recrutadores globais por falta de direcionamento nas respostas e insegurança na comunicação em inglês.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste primeiro vídeo da nossa série de 7 dias, liberei a gravação integral de como conduzi minha triagem cultural em exatos <strong>19 minutos</strong>, aplicando a metodologia STAR e transmitindo maturidade de liderança desde o primeiro minuto de conversa.
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=OKjAuk-eu8M" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/OKjAuk-eu8M/maxresdefault.jpg" alt="Entrevista cultural aprovada em 19 minutos" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Assistir Gravação: Entrevista cultural aprovada em 19 minutos
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir no YouTube &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(223, 177, 91, 0.08); padding: 18px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">Fundamento de Autoridade deste vídeo:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            O recrutador internacional procura maturidade executiva, fluidez colaborativa e capacidade de resolver problemas técnicos com total autonomia.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 2/7</strong>, avançamos para a avaliação de arquitetura: uma <strong>Entrevista Técnica Java Sênior aprovada para um contrato de $6.500 USD por mês</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nNo primeiro vídeo da série de 7 dias com entrevistas reais, veja como conduzi a primeira fase cultural em exatos 19 minutos:\n\nAssista no YouTube: https://www.youtube.com/watch?v=OKjAuk-eu8M\n\nFundamento: O recrutador internacional busca maturidade executiva e posicionamento profissional.\n\nAmanhã, no Vídeo 2/7: Entrevista Técnica Java Sênior aprovada de $6.500 USD por mês!\n\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  },

  2: {
    step: 2,
    subject: '[Vídeo 2/7] Entrevista Técnica Java Sênior de $6.500 USD (Aprovado ao vivo)',
    videoId: 'saAmDOzWFNo',
    youtubeUrl: 'https://www.youtube.com/watch?v=saAmDOzWFNo',
    badge: 'Dia 2 de 7 • Avaliação Técnica ao Vivo',
    title: 'Aprovado: Entrevista Java Sênior para remuneração de $6.500 USD',
    previewText: 'Veja como sustentar decisões de arquitetura e Spring Boot para um Tech Lead americano mantendo postura consultiva de alto nível.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 2 de 7 • Avaliação Técnica ao Vivo
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Conquistar um contrato internacional de <strong>$6.500 USD (cerca de R$ 35.000 por mês)</strong> exige domínio de código e fundamentação sólida de trade-offs de engenharia.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Nesta gravação real, você acompanha uma sabatina profunda com foco em concorrência, Spring Boot, consistência transacional e resiliência de microsserviços para uma posição nos Estados Unidos.
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=saAmDOzWFNo" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/saAmDOzWFNo/maxresdefault.jpg" alt="Entrevista Java Sênior 6.5k USD" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Aprovado: Entrevista Java Sênior para $6.500 USD (Gravação Integral)
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir Entrevista Completa &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(223, 177, 91, 0.08); padding: 18px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">Ponto Chave de Análise:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            Conduzo o diálogo técnico com a postura de um consultor sênior, alinhando soluções e alternativas arquiteturais de engenheiro para engenheiro com serenidade e precisão.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 3/7</strong>: <strong>Live Coding com TDD gravado sem cortes</strong> e como manter a clareza mental sob observação contínua.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nNo Dia 2 da nossa série, veja uma Entrevista Técnica real gravada para uma vaga Java Sênior de $6.500 USD mensais (aproximadamente R$ 35.000 por mês):\n\nAssista no YouTube: https://www.youtube.com/watch?v=saAmDOzWFNo\n\nObserve a defesa de trade-offs arquiteturais com postura de consultor entre pares.\n\nAmanhã, Vídeo 3/7: Live Coding com TDD gravado sem cortes!\n\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  },

  3: {
    step: 3,
    subject: '[Vídeo 3/7] Live Coding com TDD sem cortes (Como manter a calma e passar)',
    videoId: 'KO4mFv2NhgI',
    youtubeUrl: 'https://www.youtube.com/watch?v=KO4mFv2NhgI',
    badge: 'Dia 3 de 7 • Código ao Vivo e TDD',
    title: 'Entrevista Sênior: Live Coding com TDD (Gravação Sem Cortes)',
    previewText: 'Veja como estruturar testes, pensar em voz alta em inglês e conduzir o código com tranquilidade técnica.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 3 de 7 • Código ao Vivo
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          A sabatina de código ao vivo costuma despertar apreensão em virtude da pressão de raciocinar em inglês com o entrevistador observando cada linha digitada.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste vídeo, apresento minha sessão de Live Coding na íntegra, sem edições. Demonstro a aplicação do método <em>Think Aloud</em> (expressar o raciocínio em voz alta em inglês) aliada ao Desenvolvimento Orientado por Testes (TDD) para construir a solução com controle absoluto do processo.
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=KO4mFv2NhgI" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/KO4mFv2NhgI/maxresdefault.jpg" alt="Live Coding com TDD Sem Cortes" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Live Coding Sênior com TDD (Gravação Sem Cortes)
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir Live Coding Completo &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(223, 177, 91, 0.08); padding: 18px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">O Método do Live Coding Internacional:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            O avaliador técnico observa como você valida hipóteses sob pressão. Iniciar escrevendo testes unitários organiza o pensamento e comprova maturidade de engenharia imediatamente.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 4/7</strong>: um formato de avaliação adotado por empresas maduras no exterior: <strong>Desafio Técnico em Code Review ($5.3k USD)</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nNo Dia 3 da série, assista à gravação real e sem cortes de um Live Coding com TDD para uma vaga sênior no mercado internacional:\n\nAssista no YouTube: https://www.youtube.com/watch?v=KO4mFv2NhgI\n\nA técnica de pensar em voz alta transforma o teste individual em uma sessão colaborativa de engenharia.\n\nAmanhã, Vídeo 4/7: Desafio Técnico em Code Review de $5.3k USD!\n\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  },

  4: {
    step: 4,
    subject: '[Vídeo 4/7] Desafio Técnico em Code Review ($5.3k USD): Análise arquitetural prática',
    videoId: 'xaUULwpy5mI',
    youtubeUrl: 'https://www.youtube.com/watch?v=xaUULwpy5mI',
    badge: 'Dia 4 de 7 • Code Review Internacional',
    title: 'Desafio Técnico em Code Review: Vaga Internacional de $5.3k USD',
    previewText: 'Veja como empresas globais avaliam sua visão de segurança e decisões de arquitetura ao revisar código alheio.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 4 de 7 • Code Review Internacional
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Organizações maduras no exterior priorizam a avaliação da rotina real de engenharia de software: <strong>a capacidade crítica de revisar Pull Requests de outros engenheiros</strong>.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste vídeo, examino um desafio de <strong>$5.3k USD mensais</strong> onde fui avaliado pela consistência dos apontamentos de segurança, arquitetura e melhorias de design propostas para a base de código da empresa.
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=xaUULwpy5mI" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/xaUULwpy5mI/maxresdefault.jpg" alt="Desafio Técnico Code Review" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Desafio Técnico em Code Review: Vaga de $5.3k USD
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir Análise do Desafio &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(223, 177, 91, 0.08); padding: 18px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">Critério Sênior de Avaliação:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            Em um Code Review sênior, a análise foca na detecção de vulnerabilidades de segurança, gargalos de I/O, concorrência e propostas de refatoração de alto impacto estrutural com linguagem colaborativa.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 5/7</strong>: como negociar remuneração em inglês e <strong>descobrir o teto orçamentário da empresa</strong> antes de declarar seus números.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nNo Dia 4 da série, veja como funciona uma avaliação técnica baseada em Code Review para uma posição de $5.3k USD por mês:\n\nAssista no YouTube: https://www.youtube.com/watch?v=xaUULwpy5mI\n\nVisão crítica de arquitetura e comunicação construtiva determinam aprovações internacionais.\n\nAmanhã, Vídeo 5/7: Descobrindo o teto orçamentário da contratação (Call gravada de negociação)!\n\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  },

  5: {
    step: 5,
    subject: '[Vídeo 5/7] Descobrindo o teto orçamentário da contratação (Call real gravada)',
    videoId: 'YPqkk_9BPik',
    youtubeUrl: 'https://www.youtube.com/watch?v=YPqkk_9BPik',
    badge: 'Dia 5 de 7 • Negociação em Moeda Forte',
    title: 'Descobrindo o teto salarial da vaga: Call de Negociação em Inglês',
    previewText: 'Aprenda a conduzir o recrutador a declarar o orçamento máximo antes de você apresentar seus honorários.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 5 de 7 • Negociação em Moeda Forte
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Informar pretensões financeiras de maneira prematura costuma rebaixar a remuneração final de um contrato internacional em milhares de dólares todos os meses.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Neste vídeo, disponibilizo uma chamada real gravada em inglês na qual conduzo o recrutador a declarar a faixa orçamentária máxima da posição antes de registrar qualquer número pessoal.
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=YPqkk_9BPik" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/YPqkk_9BPik/maxresdefault.jpg" alt="Descobrindo o teto salarial em call em inglês" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Descobrindo o teto orçamentário da contratação: Call em Inglês
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir Negociação ao Vivo &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(223, 177, 91, 0.08); padding: 18px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">Estratégia de Posicionamento:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            A pergunta <em>"What is the allocated budget range for this seniority level?"</em> demonstra maturidade executiva e protege a precificação dos seus serviços em moeda forte.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã, no <strong>Vídeo 6/7</strong>: <strong>Polyworking: a arquitetura técnica para conduzir múltiplos contratos no exterior</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nNo Dia 5 da nossa série, aprenda como conduzir conversas em inglês para conhecer o orçamento da vaga antes de apresentar seus honorários:\n\nAssista no YouTube: https://www.youtube.com/watch?v=YPqkk_9BPik\n\nA pergunta estratégica protege sua justa valorização financeira no mercado internacional.\n\nAmanhã, Vídeo 6/7: Polyworking e a gestão de múltiplos contratos globais!\n\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  },

  6: {
    step: 6,
    subject: '[Vídeo 6/7] Polyworking: A arquitetura de múltiplos contratos remotos no exterior',
    videoId: 'HDnSaI26Knk',
    youtubeUrl: 'https://www.youtube.com/watch?v=HDnSaI26Knk',
    badge: 'Dia 6 de 7 • Soberania Profissional e Múltiplos Contratos',
    title: 'Polyworking: Como estruturar contratos simultâneos com excelência técnica',
    previewText: 'A estratégia operacional e jurídica para prestar serviços em múltiplos contratos PJ no exterior com sustentabilidade.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 6 de 7 • Soberania Profissional
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          A dependência de uma única fonte pagadora reduz a autonomia e o patrimônio do profissional de tecnologia. A atuação como prestador de serviços corporativos viabiliza o atendimento simultâneo a clientes internacionais de alto nível.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          Nesta aula aprofundada, apresento a arquitetura do <strong>Polyworking</strong>: como engenheiros sênior organizam rotinas assíncronas, realizam entregas de alto impacto e constroem faturamentos consolidados de <strong>R$ 50.000 a R$ 80.000 mensais</strong> com conformidade jurídica e excelência técnica.
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=HDnSaI26Knk" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/HDnSaI26Knk/maxresdefault.jpg" alt="Polyworking para Engenheiros de Software" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Polyworking: Estruturação de Múltiplos Contratos Globais
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir Análise de Polyworking &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background-color: rgba(223, 177, 91, 0.08); padding: 18px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff; font-size: 14px;">Fundamento Central do Polyworking:</p>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">
            O Polyworking apoia-se na entrega assíncrona orientada a resultados tangíveis de engenharia de software com plena independência de agenda.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">
          Amanhã é o <strong>Dia 7 (O Próximo Passo)</strong>: o estudo de caso real de um engenheiro que <strong>em 60 dias conquistou sua posição no mercado global</strong>.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nNo Dia 6 da nossa série, entenda a estrutura prática do Polyworking (múltiplos contratos remotos simultâneos no exterior):\n\nAssista no YouTube: https://www.youtube.com/watch?v=HDnSaI26Knk\n\nFoco em entrega assíncrona orientada a valor e segurança jurídica corporativa B2B.\n\nAmanhã, Vídeo 7/7: O Caso Real de 60 dias e o seu próximo passo profissional!\n\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  },

  7: {
    step: 7,
    subject: '[Vídeo 7/7] De Engenheiro no Brasil a Contrato Internacional em 60 dias (Estudo de Caso Real)',
    videoId: '4NoGEhlYeWM',
    youtubeUrl: 'https://www.youtube.com/watch?v=4NoGEhlYeWM',
    badge: 'Dia 7 de 7 • Conclusão e Próximo Passo',
    title: 'Em 2 meses conquistou a vaga internacional: Estudo de Caso Completo',
    previewText: 'Assista à trajetória do Renan e descubra como acelerar sua aprovação internacional com acompanhamento técnico direto.',
    renderHtml: (firstName: string, unsubLink: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 24px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="background-color: #dfb15b; color: #08080a; padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
            Dia 7 de 7 • Conclusão e Próximo Passo
          </span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
          Olá, ${firstName}!
        </h1>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          Concluímos a nossa série de análises práticas. Ao longo dos últimos 6 dias, dissecamos a triagem cultural de 19 minutos, a entrevista técnica Java de $6.5k, o Live Coding com TDD sem cortes, o Code Review arquitetural e a negociação para obtenção do teto salarial.
        </p>
        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 20px;">
          No vídeo final de hoje, você conhece o relato do <strong>Renan</strong>, que aplicou com precisão este método e em apenas <strong>60 dias</strong> conquistou seu contrato internacional remunerado em moeda forte:
        </p>
        
        <div style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px;">
          <a href="https://www.youtube.com/watch?v=4NoGEhlYeWM" target="_blank" style="text-decoration: none; display: block;">
            <img src="https://img.youtube.com/vi/4NoGEhlYeWM/maxresdefault.jpg" alt="Caso Real Aluno Mercado Global" style="width: 100%; height: auto; display: block; border-bottom: 1px solid #334155;" />
            <div style="padding: 16px;">
              <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
                Em 2 meses conquistou a vaga internacional: Estudo de Caso Completo
              </h3>
              <span style="color: #dfb15b; font-weight: bold; font-size: 14px;">Assistir História do Renan &rarr;</span>
            </div>
          </a>
        </div>

        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #dfb15b; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">
            Acelere sua conquista com acompanhamento técnico individual
          </h2>
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
            No programa <strong>Descomplica DEV Na Gringa</strong>, realizamos simulações reais de entrevistas técnicas em inglês, otimização de perfil para recrutadores internacionais e suporte tático individual em cada etapa de negociação de contratos de alto valor.
          </p>
          <a href="https://global.robsoncassiano.software" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #dfb15b, #c99839); color: #08080a; font-weight: 800; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 15px; box-shadow: 0 4px 12px rgba(223, 177, 91, 0.3);">
            Conhecer a Mentoria e Casos Reais &rarr;
          </a>
        </div>

        <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 24px;">
          Muito obrigado por acompanhar esta jornada técnica. Você continuará recebendo minhas análises semanais e ensaios sobre arquitetura de software, design de sistemas e soberania profissional.
        </p>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 12px; color: #64748b;">
          Robson Cassiano | Engenheiro de Software Sênior e Mentor Internacional<br />
          <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • <a href="${unsubLink}" style="color: #ef4444; text-decoration: none;">Cancelar inscrição</a>
        </div>
      </div>
    `,
    renderText: (firstName: string, unsubLink: string) => `Olá, ${firstName}!\n\nHoje encerramos a série de 7 dias com o estudo de caso real do Renan, que em 60 dias conquistou sua posição no mercado internacional:\n\nAssista no YouTube: https://www.youtube.com/watch?v=4NoGEhlYeWM\n\nPara acelerar sua aprovação com mentoria técnica direta (simulações individuais em inglês e condução de negociações contratuais):\nAcesse: https://global.robsoncassiano.software\n\nAbraço,\nRobson Cassiano | Engenheiro de Software Sênior e Mentor Internacional\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nCancelar inscrição: ${unsubLink}`
  }
};
