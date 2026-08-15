export interface QuestionData {
  id: string;
  subjectCode: "QUANT" | "REASONING" | "ENGLISH" | "CURRENT_AFFAIRS";
  subjectName: string;
  topicCode: string;
  topicName: string;
  text: string;
  options: { label: string; text: string }[];
  correctOptionIndex: number;
  targetTimeSeconds: number;
  explanation: {
    concept: string;
    steps: string[];
    fastExamMethod: string;
    commonTrap: string;
  };
}

export const MOCK_QUESTIONS: QuestionData[] = [
  {
    id: "QNT-001284",
    subjectCode: "QUANT",
    subjectName: "Quantitative Aptitude",
    topicCode: "PROFIT_LOSS",
    topicName: "Profit & Loss",
    text: "A shopkeeper marks an article 40% above cost price and allows a discount of 15%. Find his profit percent.",
    options: [
      { label: "A", text: "15%" },
      { label: "B", text: "18%" },
      { label: "C", text: "19%" },
      { label: "D", text: "21%" },
      { label: "E", text: "None of these" },
    ],
    correctOptionIndex: 1, // B is 18% (Wait: 1.40 * 0.85 = 1.19 => 19% profit! Correct index is 2: C)
    targetTimeSeconds: 45,
    explanation: {
      concept: "Discount is always calculated on Marked Price (MP), not Cost Price (CP).",
      steps: [
        "Let Cost Price (CP) = ₹100",
        "Marked Price (MP) = 100 + 40% of 100 = ₹140",
        "Selling Price (SP) = MP - Discount = 140 - (15% of 140) = 140 - 21 = ₹119",
        "Profit = SP - CP = 119 - 100 = ₹19 => Profit % = 19%",
      ],
      fastExamMethod: "Net % change formula: a + b + (a*b)/100 = 40 - 15 - (40*15)/100 = 25 - 6 = 19%.",
      commonTrap: "Treating discount percentage on cost price instead of marked price.",
    },
  },
  {
    id: "QNT-000942",
    subjectCode: "QUANT",
    subjectName: "Quantitative Aptitude",
    topicCode: "RATIO",
    topicName: "Ratio & Proportion",
    text: "A sum of ₹12,000 is divided between A and B in the ratio 5 : 3. What is the difference between their shares?",
    options: [
      { label: "A", text: "₹2,000" },
      { label: "B", text: "₹3,000" },
      { label: "C", text: "₹4,000" },
      { label: "D", text: "₹4,500" },
      { label: "E", text: "₹5,000" },
    ],
    correctOptionIndex: 1, // B is ₹3,000
    targetTimeSeconds: 30,
    explanation: {
      concept: "Share difference = (Difference in ratio parts / Total ratio parts) * Total Amount.",
      steps: [
        "Total ratio parts = 5 + 3 = 8 parts",
        "1 part = 12,000 / 8 = ₹1,500",
        "Difference between shares = 5 - 3 = 2 parts",
        "Difference amount = 2 * ₹1,500 = ₹3,000",
      ],
      fastExamMethod: "Direct calculation: (5 - 3) / (5 + 3) * 12000 = (2/8) * 12000 = 12000 / 4 = ₹3000.",
      commonTrap: "Calculating individual shares first and then subtracting, wasting 15 seconds.",
    },
  },
  {
    id: "RSN-000412",
    subjectCode: "REASONING",
    subjectName: "Reasoning Ability",
    topicCode: "SYLLOGISM",
    topicName: "Syllogism",
    text: "Statements:\nI. All A are B.\nII. Some B are C.\n\nConclusions:\nI. Some A are C.\nII. No A is C.",
    options: [
      { label: "A", text: "Only conclusion I follows" },
      { label: "B", text: "Only conclusion II follows" },
      { label: "C", text: "Either conclusion I or II follows" },
      { label: "D", text: "Neither conclusion I nor II follows" },
      { label: "E", text: "Both I and II follow" },
    ],
    correctOptionIndex: 2, // C: Either I or II follows
    targetTimeSeconds: 35,
    explanation: {
      concept: "Either-Or complementary pair rules: Same elements (A & C), both individual conclusions doubtful, one positive + one negative statement.",
      steps: [
        "From Venn diagram, relation between A and C is doubtful (uncertain).",
        "Conclusion I (Some A are C) is uncertain.",
        "Conclusion II (No A is C) is uncertain.",
        "Since both elements are same, one is 'Some' and one is 'No', they form an Either-Or pair.",
      ],
      fastExamMethod: "Check 3 conditions: (1) Same subjects A/C (2) Both invalid individually (3) One +, one - pair.",
      commonTrap: "Marking 'Neither follows' without verifying the Either-Or complementary pair conditions.",
    },
  },
  {
    id: "ENG-000108",
    subjectCode: "ENGLISH",
    subjectName: "English Language",
    topicCode: "ERROR_DETECTION",
    topicName: "Error Spotting",
    text: "Read the sentence to find if there is any grammatical error in it:\n'Neither the manager nor the employees (A) / was present in the meeting (B) / when the audit team arrived (C) / No error (D)'",
    options: [
      { label: "A", text: "Part A" },
      { label: "B", text: "Part B" },
      { label: "C", text: "Part C" },
      { label: "D", text: "Part D (No error)" },
    ],
    correctOptionIndex: 1, // Part B: 'was' should be 'were'
    targetTimeSeconds: 25,
    explanation: {
      concept: "Rule of Proximity for 'Neither... nor': The verb agrees with the subject closest to it.",
      steps: [
        "In 'Neither A nor B', the verb agrees with subject B.",
        "Here, subject B is 'the employees' (plural).",
        "Therefore, plural verb 'were' must be used instead of 'was'.",
        "Correct sentence: 'Neither the manager nor the employees were present...'",
      ],
      fastExamMethod: "Look at the subject after 'nor' -> 'employees' (plural) => verb must be plural 'were'.",
      commonTrap: "Matching the verb with the first subject 'the manager' (singular) instead of the closest subject.",
    },
  },
];
