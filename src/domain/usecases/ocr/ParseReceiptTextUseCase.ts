import { ExpenseCategory } from '../../entities/expense';
import { OCRScanResult, OCRLineItem } from '../../repositories/expense_repository';

/**
 * Normalizes Vietnamese text by removing diacritics for flexible fuzzy keyword matching.
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Cleans OCR artifacts in number representations:
 * e.g., '185.OOO' -> '185.000', 'I85,000' -> '185,000'
 */
export function fixOcrDigits(str: string): string {
  if (!str) return '';
  // Replace letter 'O' or 'o' between digits or commas/dots
  let cleaned = str.replace(/(\d)[Oo](\d)/g, '$10$2');
  cleaned = cleaned.replace(/(\d)[Oo]{2,}/g, (m) => m.charAt(0) + '0'.repeat(m.length - 1));
  cleaned = cleaned.replace(/[,.][Oo]{2,}/g, (m) => m.charAt(0) + '0'.repeat(m.length - 1));
  // Replace leading 'l' or 'I' followed by digits
  cleaned = cleaned.replace(/\b[lI|](\d{2,})/g, '1$1');
  return cleaned;
}

export class ParseReceiptTextUseCase {
  /**
   * UI and metadata words to ignore when looking for merchant names or line items.
   */
  private static readonly UI_NOISE_KEYWORDS = [
    'receipt scanner',
    'ai receipt ocr',
    'ocr expense review',
    'retake',
    'verified',
    'scan receipt',
    'save expense to trip',
    'save expense',
    'explore',
    'trips',
    'profile',
    'home feed',
    'trip planner',
    'ocr explanation',
    'automatically extracts',
    'split with friends',
    'expense category',
    'merchant name',
  ];

  /**
   * Parses raw OCR text from a receipt and extracts structured data:
   * Merchant Name, Date, Total Amount, Category, Line Items, and Confidence Score.
   */
  public execute(rawText: string): OCRScanResult {
    if (!rawText || rawText.trim().length === 0) {
      return {
        merchantName: 'Hóa đơn chưa nhận diện',
        date: this.getTodayFormatted(),
        amount: 0,
        confidence: 0,
        category: 'OTHER',
        rawText: '',
      };
    }

    // Split into non-empty trimmed lines and filter out scanner UI noise
    const allLines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const lines = allLines.filter((line) => {
      const lower = line.toLowerCase();
      return !ParseReceiptTextUseCase.UI_NOISE_KEYWORDS.some((kw) =>
        lower.includes(kw)
      );
    });

    const effectiveLines = lines.length > 0 ? lines : allLines;

    const merchantName = this.extractMerchant(effectiveLines);
    const date = this.extractDate(effectiveLines, rawText);
    const amount = this.extractTotalAmount(effectiveLines, rawText);
    const category = this.detectCategory(rawText, merchantName);
    const lineItems = this.extractLineItems(effectiveLines);

    // Calculate confidence score based on real extraction quality
    let score = 0;
    if (
      merchantName &&
      merchantName !== 'Hóa đơn' &&
      merchantName !== 'Hóa đơn chưa nhận diện' &&
      merchantName !== 'Unknown Merchant'
    ) {
      score += 0.35;
    }
    if (date && date !== this.getTodayFormatted()) {
      score += 0.25;
    } else if (date) {
      score += 0.15;
    }
    if (amount > 0) {
      score += 0.35;
    }
    if (
      /total|tổng cộng|tong cong|thành tiền|thanh toan|thanh toán|phiếu tính tiền|hóa đơn/i.test(
        rawText
      )
    ) {
      score += 0.05;
    }

    const confidence = Math.min(0.99, Math.max(0.1, Number(score.toFixed(2))));

    return {
      merchantName,
      date,
      amount,
      confidence,
      category,
      rawText,
      lineItems,
    };
  }

  /**
   * Robust heuristics to detect the merchant name from receipt header lines
   */
  private extractMerchant(lines: string[]): string {
    const genericHeaders = [
      'hóa đơn',
      'hoa don',
      'hóa đơn bán lẻ',
      'hoa don ban le',
      'hóa đơn tính tiền',
      'hoa don tinh tien',
      'hóa đơn giá trị gia tăng',
      'receipt',
      'bill',
      'invoice',
      'phiếu tính tiền',
      'phieu tinh tien',
      'phiếu thanh toán',
      'phieu thanh toan',
      'phiếu thu',
      'phieu thu',
      'phiếu thu tiền',
      'gtgt',
      'vat',
      'bán lẻ',
      'ban le',
      'order',
      'khách hàng',
      'khach hang',
      'welcome',
      'xin chào',
    ];

    const merchantKeywords = [
      'cà phê',
      'ca phe',
      'coffee',
      'cafe',
      'cộng',
      'highlands',
      'phúc long',
      'starbucks',
      'the coffee house',
      'homestay',
      'hotel',
      'resort',
      'villa',
      'hostel',
      'nhà hàng',
      'nha hang',
      'restaurant',
      'quán',
      'quan',
      'bánh mì',
      'banh mi',
      'bún',
      'bun',
      'phở',
      'pho',
      'cơm',
      'com',
      'hải sản',
      'hai san',
      'thuê xe',
      'thue xe',
      'rentals',
      'rental',
      'dịch vụ',
      'dich vu',
      'bakery',
      'mart',
      'store',
      'circle k',
      'winmart',
      'family mart',
      '7-eleven',
      'gs25',
      'grab',
      'be',
      'xanh sm',
    ];

    // Priority 0: Directly look for candidate containing strong merchant keyword in first 5 lines
    for (const line of lines.slice(0, 5)) {
      const lower = line.toLowerCase().trim();
      const norm = removeVietnameseDiacritics(lower);
      if (this.isLineItem(line)) continue;
      if (genericHeaders.some((h) => lower === h || norm === h)) continue;
      if (merchantKeywords.some((kw) => norm.includes(kw))) {
        return this.cleanMerchantName(line);
      }
    }

    // Inspect the first 7 lines of the receipt
    const candidates = lines.slice(0, 7).filter((line) => {
      const lower = line.toLowerCase().trim();
      const norm = removeVietnameseDiacritics(lower);
      if (this.isLineItem(line)) return false;
      if (this.isAddressOrContact(line)) return false;
      if (this.isMetadataLine(line)) return false;
      if (genericHeaders.some((h) => lower === h || norm === h)) return false;
      return line.length >= 2;
    });

    // Priority 1: Candidate containing strong merchant keywords (accent-insensitive)
    for (const line of candidates) {
      const norm = removeVietnameseDiacritics(line);
      if (merchantKeywords.some((kw) => norm.includes(kw))) {
        return this.cleanMerchantName(line);
      }
    }

    // Priority 2: First candidate that is not a generic header
    if (candidates.length > 0) {
      return this.cleanMerchantName(candidates[0]);
    }

    // Priority 3: First non-metadata line from receipt
    for (const line of lines.slice(0, 4)) {
      if (!this.isLineItem(line) && !this.isMetadataLine(line)) {
        return this.cleanMerchantName(line);
      }
    }

    return lines[0] ? this.cleanMerchantName(lines[0]) : 'Hóa đơn';
  }

  private isLineItem(line: string): boolean {
    return (
      /^\d+x\s+/i.test(line) ||
      /\d+x?\s+[\w\sÀ-ỹ]+[\d\.,]{4,}/i.test(line) ||
      /[\d\.,]{4,}\s*(?:vnd|vnđ|đ|d)?$/i.test(line.trim())
    );
  }

  private isMetadataLine(line: string): boolean {
    const lower = line.toLowerCase().trim();
    const norm = removeVietnameseDiacritics(lower);
    return (
      /^(?:date|ngay|ngày|time|gio|giờ|ban|bàn|table|wifi|pass|thu ngan|thu ngân|nhan vien|nhân viên|cashier|stt|so hd|số hđ|ma hd|mã hđ)/i.test(
        norm
      ) ||
      /^(?:total|tong cong|tổng cộng|thanh tien|thành tiền|thanh toan|thanh toán|tien mat|tiền mặt|phai tra|phải trả)/i.test(
        norm
      )
    );
  }

  private isAddressOrContact(line: string): boolean {
    const lower = line.toLowerCase();
    const norm = removeVietnameseDiacritics(lower);

    // If it has strong merchant identifiers, do NOT mark as address
    if (
      norm.includes('banh mi') ||
      norm.includes('ca phe') ||
      norm.includes('coffee') ||
      norm.includes('homestay') ||
      norm.includes('hotel') ||
      norm.includes('thue xe') ||
      norm.includes('dich vu') ||
      norm.includes('nha hang') ||
      norm.includes('hai san') ||
      norm.includes('quan')
    ) {
      return false;
    }

    if (
      /^đ\/c|^địa chỉ|^dia chi|^address|^tel:|^sđt:|^sdt:|^đt:|^dt:|^phone:|^hotline:|^mst:|^email:/i.test(
        norm
      )
    ) {
      return true;
    }

    // Street address pattern: starts with house number e.g. "98 Bạch Đằng", "02b Phan Chu Trinh", "12 Nguyễn Văn Thoại"
    if (/^\d{1,4}[a-z]?\s+[a-zÀ-ỹ\s]+(?:đà nẵng|hội an|hoi an|da nang|quận|phường|ward|street|đường)/i.test(norm)) {
      return true;
    }

    if (
      norm.includes('phuong ') ||
      norm.includes('quan ') ||
      norm.includes('thi xa') ||
      norm.includes('son tra') ||
      norm.includes('cam an') ||
      norm.includes('hai chau') ||
      norm.includes('nguyen van thoai') ||
      norm.includes('bach dang')
    ) {
      return true;
    }

    return false;
  }

  private cleanMerchantName(name: string): string {
    return name
      .replace(/^[*#•\->\s:]+/, '')
      .replace(/[*#•\->\s:]+$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Extracts date string from lines or text
   */
  private extractDate(lines: string[], rawText: string): string {
    // 1. Textual Month Date: e.g. "Oct 24, 2026", "October 24, 2026", "24 Oct 2026"
    const englishDateRegex =
      /\b(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})|(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s+(\d{4}))\b/i;
    const engMatch = rawText.match(englishDateRegex);
    if (engMatch) {
      if (engMatch[1]) {
        const month =
          engMatch[1].charAt(0).toUpperCase() + engMatch[1].slice(1).toLowerCase();
        return `${month} ${engMatch[2]}, ${engMatch[3]}`;
      } else if (engMatch[4]) {
        const month =
          engMatch[5].charAt(0).toUpperCase() + engMatch[5].slice(1).toLowerCase();
        return `${month} ${engMatch[4]}, ${engMatch[6]}`;
      }
    }

    // 2. Vietnamese "Ngày DD tháng MM năm YYYY"
    const vnDateRegex = /ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i;
    const vnMatch = rawText.match(vnDateRegex);
    if (vnMatch) {
      return `${vnMatch[1].padStart(2, '0')}/${vnMatch[2].padStart(2, '0')}/${vnMatch[3]}`;
    }

    // 3. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (allowing optional spaces around separators)
    const dateLine = lines.find((l) => /date|ngày|ngay|time|gio|giờ/i.test(l));
    const targetText = dateLine || rawText;

    const standardDateRegex = /\b(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4}|\d{2})\b/;
    const stdMatch = targetText.match(standardDateRegex);
    if (stdMatch) {
      const day = stdMatch[1].padStart(2, '0');
      const month = stdMatch[2].padStart(2, '0');
      let year = stdMatch[3];
      if (year.length === 2) {
        year = `20${year}`;
      }
      return `${day}/${month}/${year}`;
    }

    // 4. ISO format: YYYY-MM-DD
    const isoMatch = targetText.match(/\b(\d{4})\s*[\/\-]\s*(\d{1,2})\s*[\/\-]\s*(\d{1,2})\b/);
    if (isoMatch) {
      return `${isoMatch[3].padStart(2, '0')}/${isoMatch[2].padStart(2, '0')}/${isoMatch[1]}`;
    }

    return this.getTodayFormatted();
  }

  /**
   * Extracts total payment amount with robust number parsing and keyword associations.
   */
  private extractTotalAmount(lines: string[], rawText: string): number {
    const totalKeywords = [
      'tổng cộng',
      'tong cong',
      'tổng tiền',
      'tong tien',
      'total',
      'grand total',
      'total amount',
      'thành tiền',
      'thanh tien',
      'tiền thanh toán',
      'tien thanh toan',
      'thanh toán',
      'thanh toan',
      'cộng tiền',
      'cong tien',
      'amount due',
      'tiền mặt',
      'tien mat',
      'phải trả',
      'phai tra',
    ];

    // Priority 1: Search for explicit keyword line (bottom to top)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const norm = removeVietnameseDiacritics(line);

      for (const kw of totalKeywords) {
        if (norm.includes(kw)) {
          // Check same line after keyword
          const idx = norm.indexOf(kw);
          const afterKeyword = line.substring(idx + kw.length);
          const amountInLine = this.findAmountInString(afterKeyword);
          if (amountInLine > 0) return amountInLine;

          // Check line before keyword (e.g. "185,000 TOTAL")
          const beforeKeyword = line.substring(0, idx);
          const leadingAmount = this.findAmountInString(beforeKeyword);
          if (leadingAmount > 0) return leadingAmount;

          // Check next 1-2 lines (often total amount is right below the 'TOTAL:' label)
          for (let nextIdx = i + 1; nextIdx <= Math.min(i + 2, lines.length - 1); nextIdx++) {
            const nextLineAmount = this.findAmountInString(lines[nextIdx]);
            if (nextLineAmount > 0) return nextLineAmount;
          }
        }
      }
    }

    // Priority 2: Look for numbers followed by VND, VNĐ, đ, d
    const fixedRawText = fixOcrDigits(rawText);
    const currencySuffixRegex = /([\d\s\.,]+)\s*(?:vnd|vnđ|đ|d)\b/gi;
    let match: RegExpExecArray | null;
    let highestAmount = 0;

    while ((match = currencySuffixRegex.exec(fixedRawText)) !== null) {
      const parsed = this.parseCurrencyNumber(match[1]);
      if (parsed > highestAmount && parsed < 1000000000 && parsed !== 2026 && parsed !== 2025) {
        highestAmount = parsed;
      }
    }

    if (highestAmount > 0) {
      return highestAmount;
    }

    // Priority 3: Formatted thousands numbers (e.g. 185,000 or 1,800,000 or 185.000)
    const thousandsRegex = /\b\d{1,3}(?:[,\.]\d{3})+(?!\d)/g;
    const allMatches = fixedRawText.match(thousandsRegex) || [];
    for (const m of allMatches) {
      const parsed = this.parseCurrencyNumber(m);
      if (parsed > highestAmount && parsed < 1000000000 && parsed !== 2026 && parsed !== 2025) {
        highestAmount = parsed;
      }
    }

    return highestAmount;
  }

  private findAmountInString(str: string): number {
    if (!str) return 0;
    const fixed = fixOcrDigits(str);
    // Matches patterns like "185,000 VND", "185.000đ", "185000", "1,800,000"
    const numberMatches = fixed.match(/[\d\.,\s]+/g);
    if (!numberMatches) return 0;

    for (const numStr of numberMatches) {
      const parsed = this.parseCurrencyNumber(numStr);
      // Filter out small numbers like quantity 1, 2, 3 or year 2026
      if (parsed >= 1000 && parsed < 1000000000 && parsed !== 2026 && parsed !== 2025) {
        return parsed;
      }
    }
    return 0;
  }

  private parseCurrencyNumber(str: string): number {
    if (!str) return 0;
    const cleaned = fixOcrDigits(str);
    // Remove all non-digits except commas and dots
    const digitsWithDelimiters = cleaned.replace(/[^\d.,]/g, '').trim();
    if (!digitsWithDelimiters) return 0;

    // Remove commas, dots, and spaces to get pure numeric integer
    const digitsOnly = digitsWithDelimiters.replace(/[,.\s]/g, '');
    const num = parseInt(digitsOnly, 10);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Detects the category of expense from text heuristics
   */
  private detectCategory(rawText: string, merchant: string): ExpenseCategory {
    const combined = removeVietnameseDiacritics(`${merchant} ${rawText}`);

    // 1. Accommodation / Homestay (check first because terms like 'homestay' or 'hotel' are specific)
    if (
      /homestay|hotel|khach san|resort|villa|hostel|motel|nha nghi|tien phong|phong nghi|phong deluxe|\broom\b|\bstay\b|booking|airbnb/i.test(
        combined
      )
    ) {
      return 'HOMESTAY';
    }

    // 2. Transport (specific vehicle & rental keywords)
    if (
      /thue xe|rentals|rental|xe may|motorbike|scooter|taxi|grab|be bike|be car|be app|xang|petro|ve xe|xe khach|ve tau|ve may bay|flight|airline|parking|gui xe|xanh sm/i.test(
        combined
      )
    ) {
      return 'TRANSPORT';
    }

    // 3. Entertainment (sightseeing tickets & tours)
    if (
      /ve vao cong|ve tham quan|tour|ba na|song hoai|thuyen|\bboat\b|cinema|rap chieu phim|cho dem|bao tang|museum|cong vien|park|\bticket\b|entertainment/i.test(
        combined
      )
    ) {
      return 'ENTERTAINMENT';
    }

    // 4. Food & Drink (avoid bare 'cong' matching 'tong cong', and avoid 'tra' matching 'son tra')
    // Exclude 'son tra' before testing tea
    const withoutSonTra = combined.replace(/son tra/gi, '');
    if (
      /ca phe|coffee|cafe|cong ca phe|highlands|phuc long|starbucks|the coffee house|tra sua|\btra tac\b|\btra dao\b|\btea\b|banh mi|\bpho\b|\bbun\b|\bcom\b|hai san|nha hang|restaurant|quan an|am thuc|quan nhau|lau|nuong|bbq|pizza|bakery|\bbar\b|\bpub\b|bistro|drink|food|do an/i.test(
        withoutSonTra
      )
    ) {
      return 'FOOD';
    }

    return 'OTHER';
  }

  /**
   * Extracts individual line items if present (e.g. 3x Cốt Dừa Cà Phê 165,000)
   */
  private extractLineItems(lines: string[]): OCRLineItem[] {
    const items: OCRLineItem[] = [];
    const itemPattern = /(?:(\d+)x?\s+)?([A-Za-zÀ-ỹ\s]+?)\s+([\d\.,]+)(?:\s*VND|\s*VNĐ|\s*đ)?$/i;

    for (const line of lines) {
      // Skip header and footer lines
      const norm = removeVietnameseDiacritics(line);
      if (
        /total|tong cong|thanh tien|ngay|date|dia chi|address|mst|tel|wifi|ban|table/i.test(
          norm
        )
      ) {
        continue;
      }

      const match = line.match(itemPattern);
      if (match) {
        const qty = match[1] ? parseInt(match[1], 10) : 1;
        const name = match[2].trim();
        const price = this.parseCurrencyNumber(match[3]);
        if (name.length > 2 && price >= 1000) {
          items.push({
            name,
            quantity: qty,
            amount: price,
          });
        }
      }
    }

    return items;
  }

  private getTodayFormatted(): string {
    const today = new Date();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  }
}
