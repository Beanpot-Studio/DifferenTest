import { h } from 'vue';
import EmbeddableQuiz from '../components/EmbeddableQuiz.vue';

export const quizPlugin = {
  name: 'quiz',
  level: 'block',
  start(src) {
    return src.match(/\[quiz:([^\]]+)\]/)?.index;
  },
  tokenizer(src, tokens) {
    const match = src.match(/\[quiz:([^\]]+)\]/);
    if (match) {
      return {
        type: 'quiz',
        raw: match[0],
        quizId: match[1],
        tokens: []
      };
    }
  },
  renderer(token) {
    return h(EmbeddableQuiz, { quizId: token.quizId });
  }
}; 