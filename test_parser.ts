import { smartParse } from './src/lib/parser';

const test = (input: string) => {
  const result = smartParse(input);
  console.log(`Input: "${input}"`);
  console.log(`Result:`, JSON.stringify(result, null, 2));
  console.log('---');
};

test("Rapat jam 10 malam");
test("Meeting jam 10:30");
test("Ngopi jam 4 sore");
test("Beli Makan 50rb");
test("Rapat jam 10:30 malam");
test("Nonton jam 21:45");
