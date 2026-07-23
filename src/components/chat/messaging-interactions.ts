/**
 * @fileoverview Sample interaction history data for the chat profile sidebar.
 *
 * Exports the MessagingInteractionProps type and a default array of mock past
 * interactions (title, relative time, and message excerpt) displayed in the
 * Interaction section of the messaging chat profile panel.
 */
export type MessagingInteractionProps = {
  key: string;
  title: string;
  time: string;
  message: string;
};

const messageInteractions: MessagingInteractionProps[] = [
  {
    key: "need-help",
    title: "Need Help",
    time: "2h ago",
    message:
      "Hello, I just opened my package and found that the product inside is broken. I need assistance on how to proceed with a return or exchange.",
  },
  {
    key: "cannot-login",
    title: "Cannot Login",
    time: "1w ago",
    message: "Hi, I am having trouble logging into my account. Can you help?",
  },
  {
    key: "account-issue",
    title: "Account Issue",
    time: "14 Feb",
    message:
      "I have changed my email address and need to update my account details. How can I do this securely?",
  },
];

export default messageInteractions;
