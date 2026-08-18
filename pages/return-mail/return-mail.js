/* Return Mail Generator — depends on assets/js/common.js (pad, formatDateLong/Short, copyRichHTML) */

let returnMailHTML = '';
let returnMailText = '';
let returnSubject = '';


  //  RETURN MAIL


const RETURN_TO =
  'return@carrybee.com,centralsort@carrybee.com';


const RETURN_CC =
  'Moulvibazar-Barlekha@carrybee.com,'+
  'ruhin.shimul@carrybee.com,'+
  'dipto.d@carrybee.com,'+
  'transport@carrybee.com,'+
  'bhairab.sub-sort@carrybee.com';


function parseReturnData(text){

  const lines =
    text
    .split(/\r?\n/)
    .map(x=>x.trim())
    .filter(Boolean);


  const rows=[];

  let current={};


  lines.forEach(line=>{

    const ids =
      line.match(
        /\b[A-Z0-9]+\b/g
      ) || [];


    ids.forEach(token=>{

      const t =
        token.trim();


      if(
        /^R[A-Z0-9]{8,}$/i.test(t) ||
        /^C[A-Z0-9]{8,}$/i.test(t)
      ){

        if(
          current.consignment ||
          current.basket ||
          current.run
        ){

          rows.push(current);

          current={};

        }


        current.consignment=t;

      }


      else if(
        /^B[A-Z0-9]{8,}$/i.test(t)
      ){

        current.basket=t;

      }


      else if(
        /^\d{4,10}$/.test(t)
      ){

        current.run=t;

      }

    });

  });


  if(
    current.consignment ||
    current.basket ||
    current.run
  ){

    rows.push(current);

  }


  return rows;

}


function generateReturnMail(){

  const input =
    document
    .getElementById(
      'returnInput'
    )
    .value
    .trim();


  if(!input){

    alert(
      'Paste return data first.'
    );

    return;

  }


  const date =
    document
    .getElementById(
      'returnDate'
    )
    .value;


  if(!date){

    alert(
      'Select the mail date.'
    );

    return;

  }


  const rows =
    parseReturnData(
      input
    );


  if(!rows.length){

    alert(
      'No valid return parcel ID found.'
    );

    return;

  }


  const shortDate =
    formatDateShort(date);


  const longDate =
    formatDateLong(date);


  returnSubject =
    `Return Parcels Sending To central Sort from Moulvibazar-Barlekha Hub ${longDate}`;


  let tableRows='';


  rows.forEach(row=>{

    tableRows += `

      <tr>

        <td style="
          border:1px solid #d0d0d0;
          padding:5px 7px;
        ">
          ${row.consignment||''}
        </td>


        <td style="
          border:1px solid #d0d0d0;
          padding:5px 7px;
        ">
          ${row.basket||''}
        </td>


        <td style="
          border:1px solid #d0d0d0;
          padding:5px 7px;
        ">
          ${row.run||''}
        </td>

      </tr>

    `;

  });


  returnMailHTML = `

<div style="
font-family:Arial,sans-serif;
font-size:13px;
color:#111;
line-height:1.55;
">

<p>Dear Team,</p>

<p>
We are transferring the below-mentioned return parcels in 1 sack from the Moulvibazar-Barlekha Hub via Linehaul-13.1.
</p>

<p>
Detailed parcel information is provided below for your reference.
</p>


<table style="
border-collapse:collapse;
width:365px;
font-family:Arial,sans-serif;
font-size:13px;
">

<thead>

<tr>

<td colspan="3"
style="
border:1px solid #d0d0d0;
padding:7px;
background:#eeeeee;
text-align:center;
font-weight:bold;
font-size:14px;
">
${shortDate}
</td>

</tr>


<tr>

<th style="
border:1px solid #d0d0d0;
padding:6px;
background:#2563eb;
color:white;
text-align:center;
">
Consignment ID
</th>


<th style="
border:1px solid #d0d0d0;
padding:6px;
background:#2563eb;
color:white;
text-align:center;
">
Basket Id
</th>


<th style="
border:1px solid #d0d0d0;
padding:6px;
background:#2563eb;
color:white;
text-align:center;
">
RUN ID
</th>

</tr>

</thead>


<tbody>

${tableRows}

</tbody>

</table>


<p style="margin-top:18px">
--
</p>


</div>

`;


  let textRows='';


  rows.forEach(row=>{

    textRows +=
      `${row.consignment||''}\t`+
      `${row.basket||''}\t`+
      `${row.run||''}\n`;

  });


  returnMailText =
`Dear Team,
We are transferring the below-mentioned return parcels in 1 sack from the Moulvibazar-Barlekha Hub via Linehaul-13.1.
Detailed parcel information is provided below for your reference.

${shortDate}

Consignment ID\tBasket Id\tRUN ID
${textRows}

--

Best Regards,
Joy Kanto Dey
Associate
OSD Hub Operation | Moulvibazar-Barlekha Hub
CarryBee Express Ltd.
Cell: 01822140807
Email: joy.dey@carrybee.com`;


  document.getElementById(
    'returnPreview'
  ).innerHTML = `

    <div class="subject-preview">

      <b>Subject:</b>
      ${returnSubject}

      <br>

      <b>To:</b>
      ${RETURN_TO}

      <br>

      <b>CC:</b>
      ${RETURN_CC}

    </div>

    ${returnMailHTML}

  `;


  document.getElementById(
    'openReturnGmail'
  ).style.display =
    'inline-block';


  document.getElementById(
    'copyReturnBtn'
  ).style.display =
    'inline-block';

}


/* =========================================================
   RETURN GMAIL
========================================================= */

async function openReturnGmail(){

  await copyRichHTML(

    returnMailHTML,

    returnMailText,

    document.getElementById(
      'copyReturnBtn'
    )

  );


  const url =
    'https://mail.google.com/mail/u/0/?view=cm' +
    '&fs=1' +

    '&to='+
    encodeURIComponent(
      RETURN_TO
    ) +

    '&cc='+
    encodeURIComponent(
      RETURN_CC
    ) +

    '&su='+
    encodeURIComponent(
      returnSubject
    );


  window.open(
    url,
    '_blank'
  );

}

/* =========================================================
   RETURN EVENTS
========================================================= */

const returnDate =
  document.getElementById(
    'returnDate'
  );


const now =
  new Date();


returnDate.value =
  `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;


document
.getElementById(
  'generateReturnBtn'
)
.addEventListener(
  'click',
  generateReturnMail
);


document
.getElementById(
  'clearReturnBtn'
)
.addEventListener(
  'click',
  ()=>{

    document.getElementById(
      'returnInput'
    ).value='';


    document.getElementById(
      'returnPreview'
    ).innerHTML =
      '<span style="color:#98a2b3">Preview will appear here</span>';


    document.getElementById(
      'openReturnGmail'
    ).style.display='none';


    document.getElementById(
      'copyReturnBtn'
    ).style.display='none';

  }
);


document
.getElementById(
  'openReturnGmail'
)
.addEventListener(
  'click',
  openReturnGmail
);


document
.getElementById(
  'copyReturnBtn'
)
.addEventListener(
  'click',
  ()=>{

    copyRichHTML(

      returnMailHTML,

      returnMailText,

      document.getElementById(
        'copyReturnBtn'
      )

    );

  }
);
