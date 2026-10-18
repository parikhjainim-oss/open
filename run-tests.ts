import { runTests } from './src/tests/rideLifecycle.test.ts';

console.log('Running M3 RIDE Business Rule & State Machine Tests...');
const { passed, failed, results } = runTests();

results.forEach(r => console.log(r));
console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All business rules verified successfully! ✨');
  process.exit(0);
}
