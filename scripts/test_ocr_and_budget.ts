import { ParseReceiptTextUseCase } from '../src/domain/usecases/ocr/ParseReceiptTextUseCase';
import { CalculateBudgetUseCase } from '../src/domain/usecases/expense/CalculateBudgetUseCase';
import { ExpenseItem } from '../src/domain/entities/expense';

function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING OCR PARSER & BUDGET USECASES (Lê Hữu Anh Tú)');
  console.log('====================================================\n');

  const parser = new ParseReceiptTextUseCase();
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
    }
  }

  // TEST 1: Screen 07 Prototype Receipt (Cộng Cà Phê)
  console.log('--- Test 1: Cộng Cà Phê Receipt (Prototype) ---');
  const congReceipt = `CỘNG CÀ PHÊ
98 Bạch Đằng, Đà Nẵng
Date: 24/10/2026
3x Cốt Dừa Cà Phê 165,000
1x Hướng Dương 20,000
TOTAL: 185,000 VND
Cảm ơn quý khách!`;

  const res1 = parser.execute(congReceipt);
  assert(res1.merchantName.includes('CỘNG CÀ PHÊ'), `Merchant extracted: "${res1.merchantName}"`);
  assert(res1.amount === 185000, `Amount extracted: ${res1.amount} VND (expected 185,000)`);
  assert(res1.date.includes('24/10/2026') || res1.date.includes('24'), `Date extracted: "${res1.date}"`);
  assert(res1.category === 'FOOD', `Category detected: "${res1.category}" (expected FOOD)`);
  assert(res1.confidence >= 0.85, `Confidence: ${res1.confidence * 100}%`);
  assert(res1.lineItems !== undefined && res1.lineItems.length > 0, `Line items extracted: ${res1.lineItems?.length}`);

  // TEST 2: Homestay Receipt
  console.log('\n--- Test 2: An Bang Homestay Receipt ---');
  const homestayReceipt = `AN BANG HOMESTAY
Biển An Bàng, Cẩm An, Hội An
Phiếu thu tiền phòng
Ngày: 24/10/2026
2 Đêm phòng Deluxe: 1.800.000 đ
TỔNG CỘNG: 1,800,000 VND`;

  const res2 = parser.execute(homestayReceipt);
  assert(res2.merchantName.includes('AN BANG HOMESTAY'), `Merchant extracted: "${res2.merchantName}"`);
  assert(res2.amount === 1800000, `Amount extracted: ${res2.amount} VND (expected 1,800,000)`);
  assert(res2.category === 'HOMESTAY', `Category detected: "${res2.category}" (expected HOMESTAY)`);

  // TEST 3: Motorbike Rentals Receipt
  console.log('\n--- Test 3: Motorbike Rentals Receipt ---');
  const rentalReceipt = `DỊCH VỤ THUÊ XE MÁY ĐÀ NẴNG
Đ/c: 12 Nguyễn Văn Thoại, Sơn Trà
Date: Oct 24, 2026
Thuê 2 xe Honda AirBlade 650,000
THANH TOÁN: 650,000 VND`;

  const res3 = parser.execute(rentalReceipt);
  assert(res3.merchantName.includes('THUÊ XE MÁY'), `Merchant extracted: "${res3.merchantName}"`);
  assert(res3.amount === 650000, `Amount extracted: ${res3.amount} VND (expected 650,000)`);
  assert(res3.category === 'TRANSPORT', `Category detected: "${res3.category}" (expected TRANSPORT)`);

  // TEST 4: Banh Mi Phuong Hoi An (English Date format)
  console.log('\n--- Test 4: Banh Mi Phuong Hoi An ---');
  const banhMiReceipt = `BANH MI PHUONG HOI AN
02b Phan Chu Trinh, Hoi An
Date: 25/10/2026
4x Bánh mì thập cẩm 140,000
4x Trà tắc nha đam 60,000
TOTAL AMOUNT: 200,000 VND`;

  const res4 = parser.execute(banhMiReceipt);
  assert(res4.merchantName.includes('BANH MI PHUONG'), `Merchant extracted: "${res4.merchantName}"`);
  assert(res4.amount === 200000, `Amount extracted: ${res4.amount} VND (expected 200,000)`);
  assert(res4.category === 'FOOD', `Category detected: "${res4.category}"`);

  // TEST 5: Noisy Real Camera Image with UI Text Noise and Separated TOTAL line
  console.log('\n--- Test 5: Real Camera Image with UI Header Noise & Multi-line Total ---');
  const realNoisyCameraReceipt = `Receipt Scanner
AI RECEIPT OCR
CỘNG CÀ PHÊ
98 Bạch Đằng, Đà Năng
Date: 24/10/2026
3x Cốt Dừa Cà Phê 165,000
1x Hướng Dương 20,000
TOTAL:
185,000 VND
OCR Explanation: Automatically extracts merchant.
Scan Receipt`;

  const res5 = parser.execute(realNoisyCameraReceipt);
  assert(res5.merchantName.includes('CỘNG CÀ PHÊ'), `Filtered UI noise and extracted merchant: "${res5.merchantName}"`);
  assert(res5.amount === 185000, `Multi-line total extracted: ${res5.amount} VND (expected 185,000)`);
  assert(res5.date.includes('24/10/2026'), `Date extracted: "${res5.date}"`);
  assert(res5.category === 'FOOD', `Category detected: "${res5.category}"`);

  // TEST 6: Real Vietnamese Restaurant with No Diacritics and OCR Digits (e.g. 'OOO')
  console.log('\n--- Test 6: Seafood Restaurant without accents & OCR digit correction ---');
  const seafoodReceipt = `NHA HANG HAI SAN BE MAN
Lo 11 Vo Nguyen Giap, Son Tra
Ngay: 25-10-2026 19:30
1x Tom su nuong 450.OOO
1x Muc trung chien 280.OOO
TONG THANH TOAN:
730.OOO VND`;

  const res6 = parser.execute(seafoodReceipt);
  assert(res6.merchantName.includes('HAI SAN BE MAN'), `Extracted unaccented merchant: "${res6.merchantName}"`);
  assert(res6.amount === 730000, `Corrected 'OOO' to digits and extracted: ${res6.amount} VND (expected 730,000)`);
  assert(res6.category === 'FOOD', `Category detected: "${res6.category}"`);

  // TEST 7: Highlands Coffee
  console.log('\n--- Test 7: Highlands Coffee Receipt ---');
  const highlandsReceipt = `HIGHLANDS COFFEE
VTV8 Da Nang
Ngày 24/10/2026
1 Phin Sữa Đá 39,000
1 Freeze Trà Xanh 65,000
TỔNG CỘNG: 104,000 đ`;

  const res7 = parser.execute(highlandsReceipt);
  assert(res7.merchantName.includes('HIGHLANDS COFFEE'), `Merchant extracted: "${res7.merchantName}"`);
  assert(res7.amount === 104000, `Amount extracted: ${res7.amount} VND (expected 104,000)`);
  assert(res7.category === 'FOOD', `Category detected: "${res7.category}"`);

  // TEST 8: Budget and Split Bill Calculations (EXP-02)
  console.log('\n--- Test 8: Budget & Split Bill Calculations ---');
  const budgetUseCase = new CalculateBudgetUseCase();
  const testExpenses: ExpenseItem[] = [
    {
      id: 'e1',
      tripId: 'trip_1',
      merchantName: 'Cộng Cà Phê',
      date: 'Oct 24, 2026',
      amount: 185000,
      category: 'FOOD',
      isFromOCR: true,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo'],
      createdAt: 1,
      isSynced: true,
    },
    {
      id: 'e2',
      tripId: 'trip_1',
      merchantName: 'An Bang Homestay',
      date: 'Oct 24, 2026',
      amount: 1800000,
      category: 'HOMESTAY',
      isFromOCR: false,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
      createdAt: 2,
      isSynced: true,
    },
    {
      id: 'e3',
      tripId: 'trip_1',
      merchantName: 'Motorbike Rentals',
      date: 'Oct 24, 2026',
      amount: 650000,
      category: 'TRANSPORT',
      isFromOCR: false,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
      createdAt: 3,
      isSynced: true,
    },
  ];

  // 1. Initial State: 2,635,000 / 6,000,000 (43.9% => SAFE)
  const budgetSummary1 = budgetUseCase.execute(6000000, testExpenses);
  assert(budgetSummary1.totalSpent === 2635000, `Total spent: ${budgetSummary1.totalSpent}`);
  assert(budgetSummary1.status === 'SAFE', `Status is SAFE (below 80%): ${budgetSummary1.status}`);
  assert(budgetSummary1.statusColor === '#0D9488', `Status color is Teal: ${budgetSummary1.statusColor}`);

  // Split bill verification:
  // e1: 185000 / 3 = 61666.67
  // e2: 1800000 / 4 = 450000
  // e3: 650000 / 4 = 162500
  // Tú is in e2 and e3: 450000 + 162500 = 612500
  const tuShare = budgetSummary1.memberSplitSummary['Tú'];
  assert(Math.round(tuShare) === 612500, `Tú's share: ${Math.round(tuShare)} VND (expected 612,500)`);

  // 2. Warning State: Add 2,500,000 expense -> 5,135,000 / 6,000,000 (85.6% => WARNING)
  const warningExpenses: ExpenseItem[] = [
    ...testExpenses,
    {
      id: 'e4',
      tripId: 'trip_1',
      merchantName: 'Hải Sản Bé Mặn',
      date: 'Oct 25, 2026',
      amount: 2500000,
      category: 'FOOD',
      isFromOCR: true,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
      createdAt: 4,
      isSynced: true,
    },
  ];
  const budgetSummary2 = budgetUseCase.execute(6000000, warningExpenses);
  assert(budgetSummary2.totalSpent === 5135000, `Total spent: ${budgetSummary2.totalSpent}`);
  assert(budgetSummary2.status === 'WARNING', `Status is WARNING (>=80%): ${budgetSummary2.status}`);
  assert(budgetSummary2.statusColor === '#F59E0B', `Status color is Amber: ${budgetSummary2.statusColor}`);

  // 3. Exceeded State: Add another 1,500,000 -> 6,635,000 / 6,000,000 (110.6% => EXCEEDED)
  const exceededExpenses: ExpenseItem[] = [
    ...warningExpenses,
    {
      id: 'e5',
      tripId: 'trip_1',
      merchantName: 'Vé Cáp Treo Bà Nà Hills',
      date: 'Oct 26, 2026',
      amount: 1500000,
      category: 'ENTERTAINMENT',
      isFromOCR: false,
      splitMemberUids: ['Việt', 'Minh Anh', 'Bảo', 'Tú'],
      createdAt: 5,
      isSynced: true,
    },
  ];
  const budgetSummary3 = budgetUseCase.execute(6000000, exceededExpenses);
  assert(budgetSummary3.totalSpent === 6635000, `Total spent: ${budgetSummary3.totalSpent}`);
  assert(budgetSummary3.status === 'EXCEEDED', `Status is EXCEEDED (>=100%): ${budgetSummary3.status}`);
  assert(budgetSummary3.statusColor === '#FF6B6B', `Status color is Coral: ${budgetSummary3.statusColor}`);

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed!`);
  console.log('====================================================');
}

runTests();
