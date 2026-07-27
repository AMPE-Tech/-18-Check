import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Termos de Uso                                                      */
/*                                                                     */
/*  MINUTA — PRECISA DE REVISÃO JURÍDICA ANTES DE PUBLICAR.            */
/*                                                                     */
/*  Descreve com precisão o que o sistema faz e o que ele recusa, e é  */
/*  isso que o torna útil como ponto de partida. Mas termos de uso são */
/*  contrato: limitação de responsabilidade, foro, regras de reembolso */
/*  e a relação com o CDC precisam de advogado.                        */
/*                                                                     */
/*  Campos a preencher: razão social, CNPJ, endereço e comarca do foro.*/
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

export default function Terms() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <span className="font-display font-bold text-base text-white">
            <span className="text-gold">[18+]</span>Check
          </span>
        </Link>

        <h1 className="font-display font-bold text-3xl text-white mb-2">Termos de Uso</h1>
        <p className="text-xs text-gray-600 mb-12">Atualizados em {UPDATED_AT}</p>

        <Section title="O que você contrata">
          <p>
            O [18+]Check procura <span className="text-gray-300">a sua própria imagem</span> em
            plataformas de conteúdo adulto e, quando encontra, ajuda você a pedir a remoção.
            Também oferece checagem de fotos e identificadores suspeitos em casos de golpe
            romântico e sextorsão.
          </p>
          <p>
            Ao criar uma conta, você concorda com estes termos. Se não concordar, não use o
            serviço.
          </p>
        </Section>

        <Section title="Só a sua imagem">
          <p>
            <span className="text-gray-300">Você não pode pesquisar outra pessoa, e o sistema
            não permite.</span> A varredura facial só é liberada depois que você prova ser a
            pessoa retratada: uma captura ao vivo confirma que há alguém presente, e esse rosto
            é comparado com o registro oficial do seu CPF.
          </p>
          <p>
            A busca usa o rosto dessa captura. Não existe campo para enviar foto de terceiro,
            nem busca por nome, telefone ou documento de outra pessoa. Isso não é uma regra de
            conduta que pedimos que você siga — é como o serviço foi construído.
          </p>
          <p>
            Tentar burlar essa verificação — usar documento alheio, apresentar foto ou gravação
            no lugar de captura ao vivo, ou automatizar o acesso — encerra sua conta sem
            reembolso, e pode configurar crime.
          </p>
        </Section>

        <Section title="Conta e elegibilidade">
          <p>
            É necessário ter 18 anos ou mais. Você é responsável pela sua senha e pelo que for
            feito na sua conta. Avise-nos se suspeitar de acesso indevido.
          </p>
          <p>
            Cada conta pertence a uma pessoa. Compartilhar acesso não faz sentido aqui: a
            verificação é biométrica e vinculada a você.
          </p>
        </Section>

        <Section title="Créditos, planos e cancelamento">
          <p>
            Uma verificação consome um crédito, cobrado quando a varredura é iniciada. Créditos
            de planos mensais não se acumulam entre ciclos, salvo indicação em contrário na
            página de planos.
          </p>
          <p>
            Você pode cancelar a assinatura a qualquer momento pelo painel, sem multa. O
            cancelamento vale para o ciclo seguinte; o período já pago segue ativo até o fim.
          </p>
          <p>
            Direito de arrependimento: compras feitas pela internet podem ser desfeitas em até 7
            dias, conforme o art. 49 do Código de Defesa do Consumidor. Créditos já utilizados
            em varreduras concluídas não são reembolsáveis, porque o serviço foi efetivamente
            prestado.
          </p>
        </Section>

        <Section title="O que prometemos — e o que não">
          <p>
            <span className="text-gray-300">Prometemos</span> executar a varredura nas
            plataformas que monitoramos, entregar o relatório do que for encontrado e enviar os
            pedidos de remoção.
          </p>
          <p>
            <span className="text-gray-300">Não prometemos</span> encontrar todo conteúdo
            existente. A internet é maior do que qualquer índice: há plataformas que não
            indexamos, conteúdo atrás de login, material alterado o suficiente para não bater
            com o seu rosto. Um resultado sem ocorrências significa que não localizamos nada —
            não que nada exista.
          </p>
          <p>
            <span className="text-gray-300">Não controlamos as plataformas.</span> O pedido de
            remoção é feito por nós, mas a decisão é delas. Algumas removem em horas, outras
            ignoram. Quando ignoram, o caminho é jurídico, e nosso suporte orienta — sem
            garantia de resultado.
          </p>
          <p>
            <span className="text-gray-300">Conteúdo removido pode reaparecer</span> em espelho,
            em outro endereço. É por isso que existe o monitoramento contínuo.
          </p>
        </Section>

        <Section title="Seus dados">
          <p>
            O tratamento dos seus dados, incluindo a captura ao vivo e a referência facial, está
            descrito na{' '}
            <Link to="/privacidade" className="text-gold hover:underline">
              Política de Privacidade
            </Link>
            , que faz parte destes termos.
          </p>
          <p>
            Em resumo: a captura vai do seu navegador direto ao serviço de verificação, o CPF é
            usado uma vez e não é guardado, e a referência facial é apagada ao fim da varredura,
            a menos que você autorize o monitoramento contínuo — autorização revogável na sua
            conta a qualquer momento.
          </p>
        </Section>

        <Section title="Suspensão e encerramento">
          <p>
            Podemos suspender ou encerrar contas que tentem burlar a verificação de identidade,
            automatizem o acesso, ou usem o serviço para finalidade diversa da contratada.
          </p>
          <p>
            Você pode encerrar sua conta quando quiser. O encerramento apaga seus dados,
            respeitados os prazos legais de guarda de registros.
          </p>
        </Section>

        <Section title="Alterações">
          <p>
            Estes termos podem mudar. Alterações relevantes serão comunicadas por e-mail com
            antecedência razoável. Se você não concordar, pode encerrar a conta antes de a
            mudança entrar em vigor.
          </p>
        </Section>

        <Section title="Contato">
          <p>
            Dúvidas, reclamações ou pedidos:{' '}
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
