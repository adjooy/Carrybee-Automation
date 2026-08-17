/* Payment Mail Generator — depends on assets/js/common.js (pad, copyRichHTML) */

let paymentMailHTML = '';
let paymentMailText = '';
let paymentSubject = '';


/* =========================================================
   PAYMENT MAIL
========================================================= */

function parsePaymentMessage(text){

  const result={

    amount:'',
    time:'',
    date:'',
    trx:''

  };


  /* =====================================================
     AMOUNT

     Supports:

     Your Pay Bill request of Tk 34338.0

     Amount: Tk 34338

     Amount Tk 34338
  ===================================================== */

  let match =
    text.match(
      /Pay\s+Bill\s+request\s+of\s+Tk\s*([\d,]+(?:\.\d+)?)/i
    );


  if(!match){

    match =
      text.match(
        /Amount\s*[:\-]?\s*(?:Tk\s*)?([\d,]+(?:\.\d+)?)/i
      );

  }


  if(!match){

    match =
      text.match(
        /Amount\s*[:\-]?\s*Tk\s*([\d,]+(?:\.\d+)?)/i
      );

  }


  if(match){

    result.amount =
      match[1]
      .replace(/,/g,'');

  }


  /* =====================================================
     TRANSACTION ID
  ===================================================== */

  match =
    text.match(
      /TrxID\s*[:\-]?\s*([A-Z0-9]+)/i
    );


  if(match){

    result.trx =
      match[1];

  }


  /* =====================================================
     DATE + TIME

     Example:

     processed at 10/08/26 07:35PM
  ===================================================== */

  match =
    text.match(
      /at\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i
    );


  if(match){

    result.date =
      match[1];


    result.time =
      match[2]
      .replace(/\s+/g,'');

  }


  return result;

}


function formatMoney(value){

  const n =
    Number(value||0);


  if(Number.isNaN(n))
    return value;


  return n.toLocaleString(
    'en-US',
    {
      maximumFractionDigits:0
    }
  );

}


function generatePaymentMail(){

  const input =
    document
    .getElementById(
      'paymentMessage'
    )
    .value
    .trim();


  if(!input){

    alert(
      'Paste your payment message first.'
    );

    return;

  }


  const data =
    parsePaymentMessage(input);


  if(
    !data.amount ||
    !data.trx
  ){

    alert(
      'Payment amount or Transaction ID could not be detected.'
    );

    return;

  }


  let readableDate='';


  if(data.date){

    const parts =
      data.date.split('/');


    if(parts.length===3){

      let year =
        parseInt(
          parts[2],
          10
        );


      year =
        year<50
        ?2000+year
        :1900+year;


      readableDate =
        `${year}-${pad(parts[1])}-${pad(parts[0])}`;

    }

  }


  if(!readableDate){

    const now =
      new Date();


    readableDate =
      `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;

  }


  const longDate =
    formatDateLong(
      readableDate
    );


  const amount =
    formatMoney(
      data.amount
    );


  const time =
    data.time || '';


  const method =
    'Bkash';


  paymentSubject =
    `Daily Collection Payment - ${longDate}`;


  paymentMailHTML = `

<div style="
font-family:Arial,sans-serif;
font-size:13px;
color:#111;
line-height:1.6
">

<p>Dear Concern,</p>

<p>
I hope you are doing well.
</p>

<p>
Yesterday ${longDate} I handed over the collected amounts for the following summary:
</p>

<p>
Collection Summary Date:
<b>${longDate}</b>
</p>

<table style="
border-collapse:collapse;
width:350px;
font-family:Arial,sans-serif;
font-size:13px;
">

<tr>

<th style="
border:1px solid #999;
padding:5px 8px;
text-align:left;
background:#f2f2f2
">
Particulars
</th>

<th style="
border:1px solid #999;
padding:5px 8px;
background:#f2f2f2
">
Amount (Tk)
</th>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Sum Collected
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
${amount}
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Add: Due Amount
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
0
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Less: Other Cost
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
0
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Less: Cash in Hand
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
0
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px;
font-weight:bold
">
Petty Cash Withdraw
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
0
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px;
font-weight:bold
">
Total Payable
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center;
font-weight:bold
">
${amount}
</td>

</tr>


<tr>

<td colspan="2"
style="
border:1px solid #ccc;
padding:6px;
text-align:center;
font-weight:bold;
">
Payment Details
</td>

</tr>


<tr>

<th style="
border:1px solid #ccc;
padding:5px 8px;
text-align:left;
background:#f2f2f2
">
Description
</th>

<th style="
border:1px solid #ccc;
padding:5px 8px;
background:#f2f2f2
">
Information
</th>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Amount Submitted
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
${amount}
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Payment Method
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
${method}
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px;
font-weight:bold
">
Transaction ID
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
${data.trx}
</td>

</tr>


<tr>

<td style="
border:1px solid #ccc;
padding:5px 8px
">
Submission Time
</td>

<td style="
border:1px solid #ccc;
padding:5px 8px;
text-align:center
">
${time}
</td>

</tr>

</table>

</div>

`;


  paymentMailText =
`Dear Concern,

I hope you are doing well.

Yesterday ${longDate} I handed over the collected amounts for the following summary:

Collection Summary Date: ${longDate}

Particulars\tAmount (Tk)
Sum Collected\t${amount}
Add: Due Amount\t0
Less: Other Cost\t0
Less: Cash in Hand\t0
Petty Cash Withdraw\t0
Total Payable\t${amount}

Payment Details
Description\tInformation
Amount Submitted\t${amount}
Payment Method\tBkash
Transaction ID\t${data.trx}
Submission Time\t${time}`;


  document.getElementById(
    'paymentPreview'
  ).innerHTML = `

    <div class="subject-preview">
      ${paymentSubject}
    </div>

    ${paymentMailHTML}

  `;


  document.getElementById(
    'openPaymentGmail'
  ).style.display =
    'inline-block';


  document.getElementById(
    'copyPaymentBtn'
  ).style.display =
    'inline-block';

}


/* =========================================================
   PAYMENT GMAIL
========================================================= */

async function openPaymentGmail(){

  await copyRichHTML(

    paymentMailHTML,

    paymentMailText,

    document.getElementById(
      'copyPaymentBtn'
    )

  );


  const url =
    'https://mail.google.com/mail/u/0/?view=cm' +
    '&fs=1' +
    '&su=' +
    encodeURIComponent(
      paymentSubject
    );


  window.open(
    url,
    '_blank'
  );

}

/* =========================================================
   PAYMENT EVENTS
========================================================= */

document
.getElementById(
  'generatePaymentBtn'
)
.addEventListener(
  'click',
  generatePaymentMail
);


document
.getElementById(
  'clearPaymentBtn'
)
.addEventListener(
  'click',
  ()=>{

    document.getElementById(
      'paymentMessage'
    ).value='';


    document.getElementById(
      'paymentPreview'
    ).innerHTML =
      '<span style="color:#98a2b3">Preview will appear here</span>';


    document.getElementById(
      'openPaymentGmail'
    ).style.display='none';


    document.getElementById(
      'copyPaymentBtn'
    ).style.display='none';

  }
);


document
.getElementById(
  'openPaymentGmail'
)
.addEventListener(
  'click',
  openPaymentGmail
);


document
.getElementById(
  'copyPaymentBtn'
)
.addEventListener(
  'click',
  ()=>{

    copyRichHTML(

      paymentMailHTML,

      paymentMailText,

      document.getElementById(
        'copyPaymentBtn'
      )

    );

  }
);
