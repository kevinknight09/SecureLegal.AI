const fs = require('fs');
const path = require('path');

async function testParse() {
  const filePath = path.join(__dirname, '../../demo-contracts/Commercial_Lease_Agreement.pdf');
  const buffer = fs.readFileSync(filePath);

  const file = new Blob([buffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', file, 'Commercial_Lease_Agreement.pdf');

  const res = await fetch('http://localhost:3000/api/parse-document', {
    method: 'POST',
    body: formData
  });

  const json = await res.json();
  console.log('Status:', res.status);
  console.log('Result:', json);
}

testParse();
