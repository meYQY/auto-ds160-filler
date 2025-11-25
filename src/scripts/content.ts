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

// Main filling logic - Ported from backend/app/services/data_export.py
async function fillField(selector: string, value: string, type: 'text' | 'select' | 'radio' | 'checkbox') {
  const element = await waitForElement(selector) as HTMLInputElement | HTMLSelectElement;
  
  if (!element) {
    console.warn(`Element not found: ${selector}`);
    return;
  }

  console.log(`Filling ${selector} with ${value}`);

  if (type === 'select') {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (type === 'radio' || type === 'checkbox') {
    // For radio, the selector usually points to a group or we need to find the specific value
    if (element.value === value) {
      element.click(); 
    } else {
        // Try to find the specific radio button by value if the selector was generic
        const radio = document.querySelector(`${selector}[value="${value}"]`) as HTMLInputElement;
        if (radio) radio.click();
    }
  } else {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true })); // Important for validation trigger
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
  // Detect current page section
  // Simple heuristic: Look for specific IDs present on the page
  let currentSection = '';
  
  if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME')) {
    currentSection = 'personal_info_1';
  } else if (document.querySelector('#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_NUM')) {
    currentSection = 'passport';
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
  for (const [key, selector] of Object.entries(sectionSelectors)) {
    const value = sectionData[key];
    if (!value) continue;

    if (typeof selector === 'object' && selector.year) {
       // Handle Date (Split fields)
       const dateParts = value.split('-'); // Assuming YYYY-MM-DD
       if (dateParts.length === 3) {
         await fillField(selector.year, dateParts[0], 'select');
         await fillField(selector.month, dateParts[1], 'select'); // Note: Value might need mapping if select is by index or name
         await fillField(selector.day, parseInt(dateParts[2]).toString(), 'select');
       }
    } else if (typeof selector === 'string') {
        // Determine type (simplified)
        let type: any = 'text';
        if (selector.includes('ddl')) type = 'select';
        if (selector.includes('rbl') || selector.includes('radio')) type = 'radio';
        
        await fillField(selector, value, type);
    }
  }
  
  alert("Auto DS-160 Filler: Filling completed for this section.");
}

