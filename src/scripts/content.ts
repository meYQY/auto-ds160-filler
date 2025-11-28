import { FIELD_SELECTORS } from '../lib/selectors';

// Helper to wait for elements
function waitForElement(selector: string, timeout = 2000): Promise<Element | null> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// Main filling logic
async function fillField(selectorDef: any, value: string, type: 'text' | 'select' | 'radio' | 'checkbox') {
  let selector = selectorDef;
  let mappedValue = value;

  // Handle object definition with mapping
  if (typeof selectorDef === 'object' && selectorDef.selector) {
    selector = selectorDef.selector;
    if (selectorDef.mapping) {
      // Try to map the value (e.g. "CHINA" -> "CHIN")
      // Case-insensitive lookup
      const upperValue = value.toUpperCase();
      if (selectorDef.mapping[upperValue]) {
        mappedValue = selectorDef.mapping[upperValue];
      } else {
          // If exact match not found, try to match keys partially or values
          const foundKey = Object.keys(selectorDef.mapping).find(k => k.includes(upperValue) || upperValue.includes(k));
          if (foundKey) {
              mappedValue = selectorDef.mapping[foundKey];
          }
      }
    }
  }

  const element = await waitForElement(selector) as HTMLInputElement | HTMLSelectElement;
  
  if (!element) {
    console.warn(`Element not found: ${selector}`);
    return;
  }

  console.log(`Filling ${selector} with ${mappedValue} (Original: ${value})`);

  if (type === 'select') {
    element.value = mappedValue;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (type === 'radio' || type === 'checkbox') {
    // For radio/checkbox, we usually match the value attribute
    // Handle boolean mapping (true -> "Y", false -> "N" often)
    let targetVal = mappedValue;
    if (typeof mappedValue === 'boolean') {
        targetVal = mappedValue ? 'Y' : 'N'; // Common DS-160 pattern, might need refinement
    }

    if (element.value === targetVal) {
      element.click(); 
    } else {
        const radio = document.querySelector(`${selector}[value="${targetVal}"]`) as HTMLInputElement;
        if (radio) radio.click();
    }
  } else {
    element.value = mappedValue;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_FORM") {
    handleFillRequest(request.data).then(() => {
      sendResponse({ status: "success" });
    }).catch(err => {
      console.error(err);
      sendResponse({ status: "error", message: err.message });
    });
    return true; // Keep channel open
  }
});

async function handleFillRequest(data: any) {
  let currentSection = '';
  
  // Heuristics for section detection
  if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME')) {
    currentSection = 'personal_info_1';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_ddlNAT_nationality')) {
    currentSection = 'personal_info_2';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_LN1')) {
    currentSection = 'address_and_phone';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_NUM')) {
    currentSection = 'passport';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_ddlTRAVEL_PURPOSE')) {
    currentSection = 'travel';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME')) {
    currentSection = 'family';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_ddlPRESENT_OCCUPATION')) {
    currentSection = 'work_education';
  }

  if (!currentSection || !FIELD_SELECTORS[currentSection]) {
    alert("Auto DS-160 Filler: Could not detect a supported DS-160 section on this page.");
    return;
  }

  const sectionSelectors = FIELD_SELECTORS[currentSection];
  const sectionData = data[currentSection];

  if (!sectionData) {
    alert(`Auto DS-160 Filler: No data found for section ${currentSection}`);
    return;
  }

  // Iterate and fill
  for (const [key, selectorDef] of Object.entries(sectionSelectors)) {
    const value = sectionData[key];
    if (!value) continue;

    if (typeof selectorDef === 'object' && selectorDef.year) {
       // Handle Date (Split fields)
       const dateParts = value.split('-'); // Assuming YYYY-MM-DD
       if (dateParts.length === 3) {
         await fillField(selectorDef.year, dateParts[0], 'select');
         await fillField(selectorDef.month, dateParts[1], 'select'); // Month might need mapping 01->JAN
         await fillField(selectorDef.day, parseInt(dateParts[2]).toString(), 'select');
       }
    } else {
        // Determine type
        let type: any = 'text';
        let selectorStr = typeof selectorDef === 'string' ? selectorDef : selectorDef.selector;
        
        if (selectorStr.includes('ddl')) type = 'select';
        if (selectorStr.includes('rbl') || selectorStr.includes('radio')) type = 'radio';
        
        await fillField(selectorDef, value, type);
    }
  }
  
  alert("Auto DS-160 Filler: Filling completed for this section.");
}
