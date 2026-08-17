/* Shared helpers used by multiple pages: clipboard copy + date formatting */

function copyText(text,btn){

  const original =
    btn.textContent;


  const done=()=>{

    btn.textContent='✓ Copied';

    btn.classList.add('copied');


    setTimeout(()=>{

      btn.textContent=original;

      btn.classList.remove('copied');

    },1500);

  };


  if(
    navigator.clipboard &&
    navigator.clipboard.writeText
  ){

    navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(()=>{
        fallbackCopy(text,done);
      });

  }else{

    fallbackCopy(text,done);

  }

}


function fallbackCopy(text,done){

  const ta =
    document.createElement('textarea');


  ta.value=text;


  document.body.appendChild(ta);


  ta.select();


  document.execCommand('copy');


  document.body.removeChild(ta);


  done();

}

/* =========================================================
   DATE HELPERS
========================================================= */

function pad(n){

  return String(n)
    .padStart(2,'0');

}


function formatDateLong(dateStr){

  const d =
    new Date(
      dateStr+'T00:00:00'
    );


  const months=[

    'January','February','March','April',
    'May','June','July','August',
    'September','October','November','December'

  ];


  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

}


function formatDateShort(dateStr){

  const d =
    new Date(
      dateStr+'T00:00:00'
    );


  const months=[

    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'

  ];


  return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;

}


/* =========================================================
   RICH CLIPBOARD
========================================================= */

async function copyRichHTML(
  html,
  text,
  button
){

  try{

    if(
      navigator.clipboard &&
      window.ClipboardItem
    ){

      const blobHTML =
        new Blob(
          [html],
          {type:'text/html'}
        );


      const blobText =
        new Blob(
          [text],
          {type:'text/plain'}
        );


      const item =
        new ClipboardItem({

          'text/html':blobHTML,

          'text/plain':blobText

        });


      await navigator.clipboard.write([
        item
      ]);


      if(button){

        const original =
          button.textContent;


        button.textContent =
          '✓ Copied';


        setTimeout(()=>{

          button.textContent =
            original;

        },1500);

      }


      return true;

    }

  }catch(err){

    console.log(err);

  }


  fallbackCopy(
    text,
    ()=>{}
  );


  return false;

}
