import type { Theme } from '@aws-amplify/ui-react'

/**
 * Tema do FaceLivenessDetector.
 *
 * O componente vem da Amplify com visual próprio — é a única peça de UI de
 * terceiro no app. Não dá para reconstruí-lo: ele desenha o oval de
 * enquadramento e a sequência de luz que a própria AWS usa para decidir se
 * há uma pessoa presente. Mexer nisso quebraria a detecção.
 *
 * O que dá é alinhar as cores e a tipografia ao design system, para que ele
 * não pareça uma janela de outro produto no meio do fluxo.
 *
 * Paleta blindada do projeto: gold #D4AF5F, dark #0C0C0E, DM Sans no corpo.
 */
export const amplifyLivenessTheme: Theme = {
  name: '18check-liveness',
  tokens: {
    colors: {
      background: {
        primary: { value: '#0C0C0E' },
        secondary: { value: '#141416' },
      },
      font: {
        primary: { value: '#FFFFFF' },
        secondary: { value: '#9CA3AF' },
        tertiary: { value: '#6B7280' },
      },
      brand: {
        primary: {
          10: { value: '#2A2317' },
          80: { value: '#D4AF5F' },
          90: { value: '#C49F4F' },
          100: { value: '#B48F3F' },
        },
      },
      border: {
        primary: { value: 'rgba(255,255,255,0.08)' },
      },
    },
    fonts: {
      default: {
        variable: { value: "'DM Sans', sans-serif" },
        static: { value: "'DM Sans', sans-serif" },
      },
    },
    radii: {
      small: { value: '0.5rem' },
      medium: { value: '0.75rem' },
      large: { value: '1rem' },
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: '#D4AF5F' },
          color: { value: '#000000' },
          _hover: { backgroundColor: { value: '#E0BE73' } },
        },
      },
    },
  },
}
