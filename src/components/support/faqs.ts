/**
 * @fileoverview FAQ entry definitions for the support page.
 *
 * Exports faqsBakerz and faqsCustomer, arrays of FAQ objects holding
 * translation keys (questionKey/answerKey) rather than hardcoded text; the
 * actual copy is resolved through next-intl in the support component.
 */
interface FAQ {
  questionKey: string;
  answerKey: string;
}

// Define the FAQs using translation keys instead of hardcoded text
const faqsBakerz: FAQ[] = [
  { questionKey: "question1", answerKey: "answer1" },
  { questionKey: "question2", answerKey: "answer2" },
  { questionKey: "question3", answerKey: "answer3" },
  { questionKey: "question4", answerKey: "answer4" },
  { questionKey: "question5", answerKey: "answer5" },
  { questionKey: "question6", answerKey: "answer6" },
  { questionKey: "question7", answerKey: "answer7" },
  { questionKey: "question8", answerKey: "answer8" },
];

const faqsCustomer: FAQ[] = [
  { questionKey: "question1", answerKey: "answer1" },
  { questionKey: "question2", answerKey: "answer2" },
  { questionKey: "question3", answerKey: "answer3" },
  { questionKey: "question4", answerKey: "answer4" },
  { questionKey: "question5", answerKey: "answer5" },
  { questionKey: "question6", answerKey: "answer6" },
  { questionKey: "question7", answerKey: "answer7" },
  { questionKey: "question8", answerKey: "answer8" },
];

export { faqsBakerz, faqsCustomer };