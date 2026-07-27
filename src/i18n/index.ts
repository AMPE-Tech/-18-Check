import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import pt from './locales/pt.json'

/* ------------------------------------------------------------------ */
/*  LANÇAMENTO EM PORTUGUÊS                                            */
/*                                                                     */
/*  Os outros 11 idiomas continuam em src/i18n/locales/, mas não são   */
/*  carregados — e é de propósito.                                     */
/*                                                                     */
/*  Eles ainda descrevem o produto anterior: busca de terceiros,        */
/*  "descubra se seu parceiro é do Job", FAQ prometendo que a pessoa    */
/*  pesquisada não fica sabendo. Com detecção pelo navegador e          */
/*  fallbackLng em 'en', qualquer visitante de fora do Brasil cairia    */
/*  direto nesse conteúdo.                                             */
/*                                                                     */
/*  Por isso: idioma fixo em pt, sem detecção automática.               */
/*                                                                     */
/*  PARA REATIVAR UM IDIOMA — traduza o locale correspondente a partir  */
/*  do pt.json atual, importe abaixo, some em `resources` e em          */
/*  `languages`. Não reative nenhum antes de traduzir: os arquivos      */
/*  existentes descrevem um produto que não existe mais.                */
/* ------------------------------------------------------------------ */

export const languages = [{ code: 'pt', label: 'Português', flag: '🇧🇷' }] as const

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
  },
  lng: 'pt',
  fallbackLng: 'pt',
  supportedLngs: ['pt'],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
