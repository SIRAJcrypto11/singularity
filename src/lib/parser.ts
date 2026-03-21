/**
 * Singularity Smart Hybrid Parser V7 (Category-Aware Edition)
 * Purpose: Auto-matches transactions against user-defined categories,
 * supports multi-account financial parsing, fund transfers,
 * and sophisticated Indonesian natural language understanding.
 */

export interface Intent {
  type: 'TASK' | 'FINANCE' | 'TRANSFER' | 'CHAT' | 'SEARCH' | 'UNKNOWN';
  data: any;
  confidence: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  keywords: string[];
}

const parseTime = (timeStr: string, context: string): string => {
  const [hStr, mStr] = timeStr.split(/[:.]/);
  let hour = parseInt(hStr);
  let minute = parseInt(mStr || '0');
  const text = context.toLowerCase();
  
  // Robust Indonesian time detection
  const isPM = text.includes('malam') || text.includes('sore') || text.includes('pm') || text.includes('siang');
  const isAM = text.includes('pagi') || text.includes('subuh') || text.includes('am');
  
  if (isPM) {
    if (hour < 12) hour += 12;
    // Special case: "jam 12 malam" -> 00:00 (next day start)
    if (hour === 24 && text.includes('malam')) hour = 0; 
  } else if (isAM) {
    if (hour === 12) hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const extractMoney = (segment: string): { amount: number; query: string } | null => {
  const financeRegex = /(.+?)\s+(\d+(?:[.,]\d+)?)\s*(k|rb|jt|ribu|juta|miliar|m|jt)?/i;
  const match = segment.match(financeRegex);
  if (!match) return null;
  let amountRaw = match[2].replace(',', '.');
  let amount = parseFloat(amountRaw);
  const unit = match[3]?.toLowerCase();
  if (unit === 'k' || unit === 'rb' || unit === 'ribu') amount *= 1000;
  if (unit === 'jt' || unit === 'juta') amount *= 1000000;
  if (unit === 'm' || unit === 'miliar') amount *= 1000000000;
  return { amount: Math.floor(amount), query: match[1].trim() };
};

const resolveAccount = (text: string): string => {
  const txt = text.toLowerCase();
  if (txt.includes('bca') || txt.includes('bank')) return 'acc-bca';
  if (txt.includes('gopay') || txt.includes('e-wallet')) return 'acc-gopay';
  if (txt.includes('erp') || txt.includes('bisnis')) return 'acc-erp';
  return 'acc-main';
};

/**
 * Match input text against user-defined categories.
 * Returns the matched category or null if no match found.
 */
const matchCategory = (text: string, categories: Category[]): Category | null => {
  const lower = text.toLowerCase();
  
  // Exact name match first (highest priority)
  for (const cat of categories) {
    if (lower.includes(cat.name.toLowerCase())) {
      return cat;
    }
  }
  
  // Keyword match (second priority)
  for (const cat of categories) {
    if (cat.keywords && cat.keywords.length > 0) {
      for (const kw of cat.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return cat;
        }
      }
    }
  }
  
  return null;
};

/**
 * V7 Smart Parser — now accepts categories for auto-matching.
 * @param input User input text
 * @param categories Optional array of user-defined categories
 */
export const smartParse = (input: string, categories: Category[] = []): Intent[] => {
  const intents: Intent[] = [];
  const segments = input.split(/,|\s+dan\s+|\s+&\s+/i).map(s => s.trim()).filter(s => s.length > 0);

  for (const segment of segments) {
    const text = segment.toLowerCase();
    let parsedSomething = false;

    // --- STEP 1: Detect Transfer Hint ---
    if (text.includes('pindah') || text.includes('transfer') || text.includes('kirim')) {
      const money = extractMoney(segment);
      if (money) {
        intents.push({
          type: 'TRANSFER',
          confidence: 0.95,
          data: {
            amount: money.amount,
            accountId: resolveAccount(segment.split(/ke|pindah/i)[0]),
            toAccountId: resolveAccount(segment.split(/ke/i)[1] || ""),
            note: `V7 Transfer: ${segment}`,
            date: new Date().toISOString().split('T')[0]
          }
        });
        parsedSomething = true;
      }
    }

    // --- STEP 2: Detect List Hint ---
    const listRegex = /(?:kategori|list|label)\s+([a-zA-Z]+)/i;
    const listMatch = segment.match(listRegex);
    const listCategory = listMatch ? listMatch[1].charAt(0).toUpperCase() + listMatch[1].slice(1) : undefined;
    const cleanSegment = segment.replace(listRegex, '').trim();

    // --- STEP 3: Task Extraction ---
    const taskRegex = /(.+?)\s+jam\s+(\d+(?:[:.]\d+)?)/i;
    const taskMatch = cleanSegment.match(taskRegex);
    if (taskMatch) {
      intents.push({
        type: 'TASK',
        confidence: 0.98,
        data: {
          title: taskMatch[1].trim(),
          dueTime: parseTime(taskMatch[2], segment),
          date: text.includes('besok') ? 'Tomorrow' : 'Today',
          listCategory: listCategory || 'Personal'
        }
      });
      parsedSomething = true;
    }

    // --- STEP 4: Finance Extraction (CATEGORY-AWARE) ---
    if (!parsedSomething) {
      const financeData = extractMoney(cleanSegment);
      if (financeData) {
        const accountId = resolveAccount(segment);
        
        // Try matching against user-defined categories
        const matchedCat = matchCategory(financeData.query, categories);
        
        let categoryName: string;
        let txType: 'income' | 'expense';
        
        if (matchedCat) {
          // User-defined category matched!
          categoryName = matchedCat.name;
          txType = matchedCat.type;
        } else {
          // Fallback: keyword-based detection
          const isIncome = financeData.query.includes('gaji') || financeData.query.includes('masuk') || financeData.query.includes('pemasukan') || financeData.query.includes('penjualan');
          categoryName = financeData.query.charAt(0).toUpperCase() + financeData.query.slice(1);
          txType = isIncome ? 'income' : 'expense';
        }

        intents.push({
          type: 'FINANCE',
          confidence: matchedCat ? 1.0 : 0.85,
          data: {
            amount: financeData.amount,
            category: categoryName,
            type: txType,
            accountId: accountId,
            note: `V7: ${financeData.query}${matchedCat ? ' [auto-matched]' : ''}`
          }
        });
        parsedSomething = true;
      }
    }
  }

  return intents;
};
