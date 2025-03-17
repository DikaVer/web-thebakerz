interface FAQ {
  questionKey: string;
  answerKey: string;
}

// Define the FAQs using translation keys instead of hardcoded text
const faqsBakerz: FAQ[] = [
  { questionKey: "Question 1", answerKey: "Answer 1" },
  { questionKey: "Question 2", answerKey: "Answer 2" },
  { questionKey: "Question 3", answerKey: "Answer 3" },
  { questionKey: "Question 4", answerKey: "Answer 4" },
  { questionKey: "Question 5", answerKey: "Answer 5" },
  { questionKey: "Question 6", answerKey: "Answer 6" },
  { questionKey: "Question 7", answerKey: "Answer 7" },
  { questionKey: "Question 8", answerKey: "Answer 8" },
  { questionKey: "Question 9", answerKey: "Answer 9" },
  { questionKey: "Question 10", answerKey: "Answer 10" },
];

const faqsCustomer: FAQ[] = [
  { questionKey: "Question 1", answerKey: "Answer 1" },
  { questionKey: "Question 2", answerKey: "Answer 2" },
  { questionKey: "Question 3", answerKey: "Answer 3" },
  { questionKey: "Question 4", answerKey: "Answer 4" },
  { questionKey: "Question 5", answerKey: "Answer 5" },
  { questionKey: "Question 6", answerKey: "Answer 6" },
  { questionKey: "Question 7", answerKey: "Answer 7" },
  { questionKey: "Question 8", answerKey: "Answer 8" },
  { questionKey: "Question 9", answerKey: "Answer 9" },
  { questionKey: "Question 10", answerKey: "Answer 10" },
];

export { faqsBakerz, faqsCustomer };