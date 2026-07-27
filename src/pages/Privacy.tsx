import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Política de Privacidade                                            */
/*                                                                     */
/*  MINUTA — PRECISA DE REVISÃO JURÍDICA ANTES DE PUBLICAR.            */
/*                                                                     */
/*  O texto descreve fielmente o que o sistema faz hoje, e é isso que  */
/*  o torna útil como ponto de partida. Mas política de privacidade é  */
/*  documento legal, e este produto trata dado biométrico e CPF — as   */
/*  duas categorias mais sensíveis da LGPD. Bases legais, prazos de    */
/*  retenção e a redação dos direitos do titular precisam passar por   */
/*  advogado antes de ir ao ar.                                        */
/*                                                                     */
/*  Campos a preencher antes da revisão: razão social completa, CNPJ,  */
/*  endereço e o contato do encarregado (DPO).                         */
/* ------------------------------------------------------------------ */

const UPDATED_AT = '27 de julho de 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-bold text-lg text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <span className="font-display font-bold text-base text-white">
            <span className="text-gold">[18+]</span>Check
          </span>
        </Link>

        <h1 className="font-display font-bold text-3xl text-white mb-2">
          Política de Privacidade
        </h1>
        <p className="text-xs text-gray-600 mb-12">Atualizada em {UPDATED_AT}</p>

        <Section title="O que este serviço faz">
          <p>
            O [18+]Check verifica se <span className="text-gray-300">a sua própria imagem</span>{' '}
            aparece em plataformas de conteúdo adulto sem a sua autorização, e ajuda a
            solicitar a remoção do que for encontrado.
          </p>
          <p>
            Não é possível pesquisar outra pessoa. A varredura só roda depois que você prova
            ser a pessoa retratada, e usa o rosto capturado nessa prova — não existe campo
            para enviar a foto de terceiro, nem busca por nome, telefone ou documento alheio.
          </p>
        </Section>

        <Section title="Dados que tratamos">
          <p>
            <span className="text-gray-300">Cadastro.</span> Nome, e-mail e senha (guardada
            apenas como hash, nunca em texto legível).
          </p>
          <p>
            <span className="text-gray-300">Prova de vida.</span> Um vídeo curto do seu rosto,
            transmitido do seu navegador diretamente ao provedor de verificação. Esse vídeo{' '}
            <span className="text-gray-300">não passa pelos nossos servidores</span>. Recebemos
            de volta apenas uma imagem de referência extraída dele.
          </p>
          <p>
            <span className="text-gray-300">CPF.</span> Usado uma única vez, para conferir se o
            rosto capturado corresponde ao registro oficial. Não é armazenado no seu cadastro
            nem gravado em nossos registros de operação.
          </p>
          <p>
            <span className="text-gray-300">Resultado da varredura.</span> Os endereços onde
            sua imagem foi localizada, a data e o grau de correspondência.
          </p>
        </Section>

        <Section title="Dado biométrico e por quanto tempo fica">
          <p>
            Sua imagem de referência facial é dado pessoal sensível (LGPD, art. 5º, II) e
            recebe tratamento à parte.
          </p>
          <p>
            <span className="text-gray-300">Por padrão, ela é apagada assim que a varredura
            termina.</span> Cada nova verificação recomeça do zero.
          </p>
          <p>
            Ela só é guardada se você marcar, separadamente, a autorização para monitoramento
            contínuo — que existe porque conteúdo removido costuma reaparecer em espelho
            semanas depois, e sem a referência não há como comparar. Essa autorização é
            opcional, independente da autorização de verificar, e{' '}
            <span className="text-gray-300">pode ser revogada a qualquer momento na sua
            conta</span>. A revogação apaga a referência de fato — não a marca como inativa.
          </p>
        </Section>

        <Section title="Com quem compartilhamos">
          <p>
            <span className="text-gray-300">Provedor de prova de vida</span> — recebe o vídeo
            do seu rosto diretamente do seu navegador, para confirmar que há uma pessoa
            presente e não uma foto ou gravação.
          </p>
          <p>
            <span className="text-gray-300">Serpro (Datavalid)</span> — recebe seu CPF e a
            imagem de referência para confirmar, contra a base oficial, que o rosto é seu.
          </p>
          <p>
            <span className="text-gray-300">Serviço de busca facial</span> — recebe a imagem de
            referência para localizar ocorrências nas plataformas monitoradas.
          </p>
          <p>
            <span className="text-gray-300">Stripe</span> — processa pagamentos. Não temos
            acesso ao número do seu cartão.
          </p>
          <p>Não vendemos, alugamos nem cedemos seus dados para publicidade.</p>
        </Section>

        <Section title="Seus direitos">
          <p>
            A LGPD garante a você confirmar a existência de tratamento, acessar seus dados,
            corrigi-los, pedir anonimização ou eliminação, revogar consentimento e saber com
            quem compartilhamos.
          </p>
          <p>
            Revogar o consentimento é gratuito e vale a qualquer momento (art. 8º, §5º). Para a
            referência facial, a revogação está na sua conta e tem efeito imediato. Para os
            demais pedidos, escreva para o contato abaixo.
          </p>
        </Section>

        <Section title="Segurança">
          <p>
            O tráfego é cifrado em trânsito. Senhas são guardadas como hash. O acesso ao
            resultado de uma varredura é restrito à conta que a realizou — não há link público
            nem compartilhamento com terceiros.
          </p>
        </Section>

        <Section title="Contato do encarregado (DPO)">
          <p>
            Dúvidas sobre esta política ou pedidos relativos aos seus dados:{' '}
            <span className="text-gold">18check.online@gmail.com</span>
          </p>
        </Section>

        <div className="border-t border-white/5 pt-8 mt-12">
          <Link to="/" className="text-xs text-gold hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
