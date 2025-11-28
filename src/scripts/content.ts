import { FIELD_SELECTORS } from '../lib/selectors';

// Helper to wait for elements
function waitForElement(selector: string, timeout = 3000): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
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
      // Try one last time before giving up
      resolve(document.querySelector(selector));
    }, timeout);
  });
}

// Helper for delay
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Main filling logic
async function fillField(selectorDef: any, value: string, type: 'text' | 'select' | 'radio' | 'checkbox') {
  let selector = selectorDef;
  let mappedValue = value;

  // Handle object definition with mapping
  if (typeof selectorDef === 'object' && selectorDef !== null && 'selector' in selectorDef) {
    selector = selectorDef.selector;
    if ('mapping' in selectorDef && selectorDef.mapping) {
      const mapping = selectorDef.mapping as Record<string, string>;
      // Case-insensitive lookup
      const upperValue = value.toUpperCase();
      // 1. Try direct match
      if (mapping[upperValue]) {
        mappedValue = mapping[upperValue];
      } else {
          // 2. Fuzzy match (key includes value OR value includes key)
          const foundKey = Object.keys(mapping).find(k => 
            k.includes(upperValue) || upperValue.includes(k)
          );
          if (foundKey) {
              mappedValue = mapping[foundKey];
          }
      }
    }
  }

  // Ensure selector is a string before querying
  if (typeof selector !== 'string') {
      console.warn(`[Auto DS-160] Invalid selector type: ${typeof selector}`);
      return false;
  }

  const element = await waitForElement(selector) as HTMLInputElement | HTMLSelectElement;
  
  if (!element) {
    console.warn(`[Auto DS-160] Element not found or timed out: ${selector}`);
    return false; // Return failure
  }

  console.log(`[Auto DS-160] Filling ${selector} with ${mappedValue} (Original: ${value})`);

  // Scroll into view to ensure visibility (helps with some JS interactions)
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Small delay after scrolling
  await sleep(100);

  try {
    if (type === 'select') {
      element.value = mappedValue;
      // Force ASP.NET PostBack events
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (type === 'radio' || type === 'checkbox') {
      let targetVal = mappedValue;
      if (typeof mappedValue === 'boolean') {
          targetVal = mappedValue ? 'Y' : 'N';
      }

      // Check specifically for RadioButtonList structure often used in ASP.NET
      if (element.value === targetVal) {
        element.click(); 
      } else {
          // Fallback: try to find the input by value in the DOM if selector was a container or generic
          const radio = document.querySelector(`${selector}[value="${targetVal}"]`) as HTMLInputElement;
          if (radio) {
            radio.click();
          } else {
            // Last resort: try finding label text? (Skipping for now to keep simple)
            console.warn(`[Auto DS-160] Could not find radio option: ${targetVal}`);
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
    console.error(`[Auto DS-160] Error filling ${selector}`, e);
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
  
  // Section Detection Heuristics
  // We use "unique" field IDs to guess which page we are on
  const DETECTORS = {
    'personal_info_1': '#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME',
    'personal_info_2': '#ctl00_SiteContentPlaceHolder_FormView1_ddlNAT_nationality',
    'address_and_phone': '#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_LN1',
    'passport': '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_NUM',
    'travel': '#ctl00_SiteContentPlaceHolder_FormView1_ddlTRAVEL_PURPOSE',
    'family': '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME',
    'work_education': '#ctl00_SiteContentPlaceHolder_FormView1_ddlPRESENT_OCCUPATION',
    'security': 'input[name$="rblSECURITY_DISEASE"]' // Heuristic for security page
  };

  for (const [section, selector] of Object.entries(DETECTORS)) {
    if (document.querySelector(selector)) {
      currentSection = section;
      break;
    }
  }

  if (!currentSection || !FIELD_SELECTORS[currentSection]) {
    alert("Auto DS-160 Filler: Could not detect a supported DS-160 section on this page. Please navigate to a supported section.");
    return { status: "error", message: "Unknown section" };
  }

  const sectionSelectors = FIELD_SELECTORS[currentSection];
  const sectionData = data[currentSection];

  if (!sectionData) {
    alert(`Auto DS-160 Filler: No data found for section '${currentSection}'. Please check your input.`);
    return { status: "warning", message: "No data for section" };
  }

  let filledCount = 0;

  // Iterate and fill
  for (const [key, selectorDef] of Object.entries(sectionSelectors)) {
    const value = sectionData[key];
    if (value === undefined || value === null || value === '') continue;

    // Add delay between fields to prevent "Race Conditions" with ASP.NET PostBacks
    // This is CRITICAL for DS-160 stability
    await sleep(300); 

    // Check if selectorDef is an object with 'year', 'month', 'day' properties (for Date)
    // Using 'in' operator for type narrowing
    if (typeof selectorDef === 'object' && selectorDef !== null && 'year' in selectorDef) {
       // Handle Date (Split fields)
       // Type assertion since we checked 'year' exists, but we need to be sure it's the date structure
       const dateSelector = selectorDef as { year: string; month: string; day: string };
       
       const dateParts = value.split('-'); // Assuming YYYY-MM-DD
       if (dateParts.length === 3) {
         await fillField(dateSelector.year, dateParts[0], 'select');
         await sleep(100);
         await fillField(dateSelector.month, dateParts[1], 'select'); 
         await sleep(100);
         await fillField(dateSelector.day, parseInt(dateParts[2]).toString(), 'select');
         filledCount++;
       }
    } else {
        // Determine type
        let type: any = 'text';
        // Handle both string selector and object selector with 'selector' property
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
