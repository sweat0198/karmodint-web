import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildContactEmails, buildQuoteEmails } from '../server/utils/email.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const sampleQuoteData = {
  quoteReference: 'KM-4821',
  customer: {
    name: 'Acme Corp',
    email: 'procurement@acme.com',
    phone: '+44 7824 810226',
    company: 'Procurement Division',
    address: '100 Business Park Drive, London, SE1 2AB',
    deliveryLocation: '100 Business Park Drive, London, SE1 2AB',
    notes: 'Access route requires tail-lift or Hiab offloading. Ground preparation completed.',
  },
  items: [
    {
      productName: 'Standard Office Cabin',
      sizeLabel: 'Premium Modular Unit',
      dimensions: '6.0m x 2.4m',
      imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
      quantity: 1,
      unitPrice: 12000,
      basePrice: 12000,
      customTotal: 14930,
      specBadges: ['High Insulation', 'Pre-wired'],
      customizations: [
        { name: 'Electrical Pack: 2x Light fittings, 4x Double sockets', quantity: 1, price: 250, iconType: 'electrical' },
        { name: 'Standard Kitchenette Unit (Sink, Base Unit, Worktop)', quantity: 1, price: 850, iconType: 'kitchen' },
        { name: 'Standard WC Sanitation Pack (Toilet, Basin, Plumbing prep)', quantity: 1, price: 1200, iconType: 'sanitary' },
        { name: '2kW Electric Wall Heater (Installed)', quantity: 1, price: 180, iconType: 'hvac' }
      ]
    }
  ]
}

const sampleContactData = {
  fullName: 'Sarah Jenkins',
  companyName: 'Bespoke Retail Parks UK',
  email: 'sarah.j@bespokeretail.co.uk',
  phone: '+44 7987 654321',
  details: 'We are planning a new retail kiosk village with 6 modular food & beverage pods across a new development site near Birmingham. Would like a site consultation and feasibility review.'
}

const { businessEmail: quoteBusiness, customerEmail: quoteCustomer } = buildQuoteEmails(
  sampleQuoteData,
  'info@karmodint.co.uk'
)

const { businessEmail: contactBusiness, customerEmail: contactCustomer } = buildContactEmails(
  sampleContactData,
  'info@karmodint.co.uk'
)

// Create interactive HTML visualizer preview
const previewViewerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Karmod International - Email Template Visualizer (Figma Exact)</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; }
    .header { background: #1e293b; padding: 16px 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .header h1 { margin: 0; font-size: 18px; color: #ffffff; display: flex; align-items: center; gap: 8px; }
    .header h1 span { color: #e31e24; }
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .tab-btn { background: #334155; color: #cbd5e1; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .tab-btn.active { background: #e31e24; color: #ffffff; }
    .tab-btn:hover:not(.active) { background: #475569; color: #ffffff; }
    .controls { display: flex; align-items: center; gap: 8px; }
    .view-btn { background: #0f172a; color: #94a3b8; border: 1px solid #334155; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }
    .view-btn.active { background: #38bdf8; color: #0f172a; font-weight: 700; border-color: #38bdf8; }
    .meta-bar { background: #1e293b; padding: 10px 24px; border-bottom: 1px solid #334155; font-size: 12px; color: #94a3b8; display: flex; gap: 24px; flex-wrap: wrap; }
    .meta-bar strong { color: #e2e8f0; }
    .preview-container { height: calc(100vh - 120px); display: flex; justify-content: center; align-items: flex-start; padding: 24px; overflow-y: auto; background: #0b1120; }
    iframe { border: none; background: #ffffff; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); transition: width 0.3s; }
    .desktop-frame { width: 760px; height: 1100px; }
    .mobile-frame { width: 375px; height: 850px; }
  </style>
</head>
<body>
  <div class="header">
    <h1><span>Karmod UK</span> Email Template Visualizer (Figma Exact)</h1>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTemplate('quote-sales')">1. Quote Request (Sales Inbox)</button>
      <button class="tab-btn" onclick="switchTemplate('quote-customer')">2. Quote Receipt (Customer)</button>
      <button class="tab-btn" onclick="switchTemplate('contact-sales')">3. Consultation (Sales Inbox)</button>
      <button class="tab-btn" onclick="switchTemplate('contact-customer')">4. Consultation (Customer)</button>
    </div>
    <div class="controls">
      <button class="view-btn active" id="btn-desktop" onclick="setView('desktop')">Desktop (760px)</button>
      <button class="view-btn" id="btn-mobile" onclick="setView('mobile')">Mobile (375px)</button>
    </div>
  </div>

  <div class="meta-bar" id="meta-bar">
    <div><strong>To:</strong> ${quoteBusiness.to.join(', ')}</div>
    <div><strong>From:</strong> ${quoteBusiness.from}</div>
    <div><strong>Subject:</strong> ${quoteBusiness.subject}</div>
  </div>

  <div class="preview-container">
    <iframe id="preview-frame" class="desktop-frame" srcdoc=""></iframe>
  </div>

  <script>
    const templates = {
      'quote-sales': {
        to: ${JSON.stringify(quoteBusiness.to.join(', '))},
        from: ${JSON.stringify(quoteBusiness.from)},
        subject: ${JSON.stringify(quoteBusiness.subject)},
        html: ${JSON.stringify(quoteBusiness.html)}
      },
      'quote-customer': {
        to: ${JSON.stringify(quoteCustomer.to.join(', '))},
        from: ${JSON.stringify(quoteCustomer.from)},
        subject: ${JSON.stringify(quoteCustomer.subject)},
        html: ${JSON.stringify(quoteCustomer.html)}
      },
      'contact-sales': {
        to: ${JSON.stringify(contactBusiness.to.join(', '))},
        from: ${JSON.stringify(contactBusiness.from)},
        subject: ${JSON.stringify(contactBusiness.subject)},
        html: ${JSON.stringify(contactBusiness.html)}
      },
      'contact-customer': {
        to: ${JSON.stringify(contactCustomer.to.join(', '))},
        from: ${JSON.stringify(contactCustomer.from)},
        subject: ${JSON.stringify(contactCustomer.subject)},
        html: ${JSON.stringify(contactCustomer.html)}
      }
    };

    let currentTemplate = 'quote-sales';

    function switchTemplate(key) {
      currentTemplate = key;
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(key));
      });
      const data = templates[key];
      document.getElementById('meta-bar').innerHTML = \`
        <div><strong>To:</strong> \${data.to}</div>
        <div><strong>From:</strong> \${data.from}</div>
        <div><strong>Subject:</strong> \${data.subject}</div>
      \`;
      document.getElementById('preview-frame').srcdoc = data.html;
    }

    function setView(mode) {
      const frame = document.getElementById('preview-frame');
      document.getElementById('btn-desktop').classList.toggle('active', mode === 'desktop');
      document.getElementById('btn-mobile').classList.toggle('active', mode === 'mobile');
      if (mode === 'mobile') {
        frame.className = 'mobile-frame';
      } else {
        frame.className = 'desktop-frame';
      }
    }

    // Initialize
    switchTemplate('quote-sales');
  </script>
</body>
</html>
`

fs.writeFileSync(path.resolve(rootDir, 'public', 'email-preview.html'), previewViewerHtml)
fs.writeFileSync(path.resolve(rootDir, 'docs', 'email-preview.html'), previewViewerHtml)
console.log('✅ Generated public/email-preview.html with Figma 4-section designs')
