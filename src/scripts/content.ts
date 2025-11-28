import { FIELD_SELECTORS } from '../lib/selectors';

// Helper: Find element by partial ID match (Fuzzy Search)
function findElementByPartialId(partialId: string): HTMLElement | null {
  // 1. Try strict suffix match (common in ASP.NET: ..._tbxAPP_SURNAME)
  let el = document.querySelector(`[id$='_${partialId}']`);
  if (el) return el as HTMLElement;

  // 2. Try contains match
  el = document.querySelector(`[id*='${partialId}']`);
  if (el) return el as HTMLElement;

  // 3. Try name attribute (for radio buttons)
  el = document.querySelector(`[name*='${partialId}']`);
  if (el) return el as HTMLElement;

  return null;
}

// Helper to wait for elements with fuzzy matching
function waitForElement(partialId: string, timeout = 3000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const element = findElementByPartialId(partialId);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const el = findElementByPartialId(partialId);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      // Try one last time
      resolve(findElementByPartialId(partialId));
    }, timeout);
  });
}

// Helper for delay
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Main filling logic
async function fillField(selectorDef: any, value: string, type: 'text' | 'select' | 'radio' | 'checkbox') {
  let partialSelector = selectorDef;
  let mappedValue = value;

  // Handle object definition with mapping
  if (typeof selectorDef === 'object' && selectorDef !== null && 'selector' in selectorDef) {
    partialSelector = selectorDef.selector;
    if ('mapping' in selectorDef && selectorDef.mapping) {
      const mapping = selectorDef.mapping as Record<string, string>;
      const upperValue = value.toUpperCase();
      if (mapping[upperValue]) {
        mappedValue = mapping[upperValue];
      } else {
          const foundKey = Object.keys(mapping).find(k => 
            k.includes(upperValue) || upperValue.includes(k)
          );
          if (foundKey) {
              mappedValue = mapping[foundKey];
          }
      }
    }
  }

  if (typeof partialSelector !== 'string') return false;

  // USE FUZZY FINDER
  const element = await waitForElement(partialSelector) as HTMLInputElement | HTMLSelectElement;
  
  if (!element) {
    console.warn(`[Auto DS-160] Element not found (fuzzy): ${partialSelector}`);
    return false;
  }

  console.log(`[Auto DS-160] Filling ${element.id} with ${mappedValue}`);

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(100);

  try {
    if (type === 'select') {
      element.value = mappedValue;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (type === 'radio' || type === 'checkbox') {
      let targetVal = mappedValue;
      if (typeof mappedValue === 'boolean') targetVal = mappedValue ? 'Y' : 'N';

      // For RadioButtonList, the main element is usually a table or span. 
      // We need to find the input child with the correct value.
      // Or if we found the input directly via name match:
      if (element.tagName === 'INPUT' && (element as HTMLInputElement).value === targetVal) {
          element.click();
      } else {
          // Look for sibling/child radio with specific value
          // Common ASP.NET pattern: Name is same, ID differs
          const name = (element as HTMLInputElement).name;
          if (name) {
              const radio = document.querySelector(`input[name='${name}'][value='${targetVal}']`) as HTMLInputElement;
              if (radio) radio.click();
          }
      }
    } else {
      element.value = mappedValue;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    return true; // Success
  } catch (e) {
    console.error(`[Auto DS-160] Error filling ${partialSelector}`, e);
    return false;
  }
}

// Message Listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "FILL_FORM") {
    handleFillRequest(request.data).then((result) => {
      sendResponse(result);
    }).catch(err => {
      console.error(err);
      sendResponse({ status: "error", message: err.message });
    });
    return true; // Keep channel open
  }
});

async function handleFillRequest(data: any) {
  let currentSection = '';
  
  // FUZZY Section Detection
  const DETECTORS = {
    'personal_info_1': 'tbxAPP_SURNAME',
    'personal_info_2': 'ddlNAT_nationality',
    'address_and_phone': 'tbxAPP_ADDR_LN1',
    'passport': 'tbxPPT_NUM',
    'travel': 'ddlTRAVEL_PURPOSE',
    'family': 'tbxFATHER_SURNAME',
    'work_education': 'ddlPRESENT_OCCUPATION',
    'security': 'rblSECURITY_DISEASE'
  };

  for (const [section, partialId] of Object.entries(DETECTORS)) {
    if (findElementByPartialId(partialId)) {
      currentSection = section;
      break;
    }
  }

  if (!currentSection || !FIELD_SELECTORS[currentSection]) {
    alert("Auto DS-160 Filler: Could not detect a supported DS-160 section (Fuzzy check failed).");
    return { status: "error", message: "Unknown section" };
  }

  const sectionSelectors = FIELD_SELECTORS[currentSection];
  const sectionData = data[currentSection];

  if (!sectionData) {
    alert(`Auto DS-160 Filler: No data found for section '${currentSection}'.`);
    return { status: "warning", message: "No data for section" };
  }

  let filledCount = 0;

  for (const [key, selectorDef] of Object.entries(sectionSelectors)) {
    const value = sectionData[key];
    if (value === undefined || value === null || value === '') continue;

    await sleep(300); 

    if (typeof selectorDef === 'object' && selectorDef !== null && 'year' in selectorDef) {
       const dateSelector = selectorDef as { year: string; month: string; day: string };
       const dateParts = value.split('-'); 
       if (dateParts.length === 3) {
         await fillField(dateSelector.year, dateParts[0], 'select');
         await sleep(100);
         // DS-160 expects "1", "2", etc. for day/month, not "01", "02"
         await fillField(dateSelector.month, parseInt(dateParts[1]).toString(), 'select'); 
         await sleep(100);
         await fillField(dateSelector.day, parseInt(dateParts[2]).toString(), 'select');
         filledCount++;
       }
    } else {
        let type: any = 'text';
        let selectorStr = '';
        
        if (typeof selectorDef === 'string') {
            selectorStr = selectorDef;
        } else if (typeof selectorDef === 'object' && selectorDef !== null && 'selector' in selectorDef) {
            selectorStr = (selectorDef as any).selector;
        }

        if (selectorStr) {
            if (selectorStr.includes('ddl')) type = 'select';
            if (selectorStr.includes('rbl') || selectorStr.includes('radio')) type = 'radio';
            
            const success = await fillField(selectorDef, value, type);
            if (success) filledCount++;
        }
    }
  }
  
  const msg = `Auto DS-160 Filler: Successfully filled ${filledCount} fields in ${currentSection}.`;
  alert(msg);
  return { status: "success", message: msg };
}
