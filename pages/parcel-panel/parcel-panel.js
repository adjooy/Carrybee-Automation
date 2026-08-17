/* Parcel Panel logic — depends on assets/js/common.js (copyText) */

const CATS = [

  {
    key:'assigned',
    label:'Assigned Parcel',
    cls:'c0'
  },

  {
    key:'delivered',
    label:'Delivered Parcel',
    cls:'c1'
  },

  {
    key:'hold',
    label:'Hold Parcel',
    cls:'c2'
  },

  {
    key:'rto',
    label:'RTO Parcel',
    cls:'c3'
  },

  {
    key:'exchange',
    label:'Exchange / Partial / Paid Return',
    cls:'c4'
  }

];


const CAT_COLOR = {

  assigned:'#0f766e',
  delivered:'#15803d',
  hold:'#b45309',
  rto:'#dc2626',
  exchange:'#7c3aed'

};


let rawRows = [];

let statusRules = {};


const fileInput =
  document.getElementById('fileInput');

const dropzone =
  document.getElementById('dropzone');

const fname =
  document.getElementById('fname');

const statusEl =
  document.getElementById('status');

const resetBtn =
  document.getElementById('resetBtn');


fileInput.addEventListener('change',e=>{

  if(e.target.files[0]){
    handleFile(e.target.files[0]);
  }

});


['dragover','dragenter'].forEach(ev=>{

  dropzone.addEventListener(ev,e=>{

    e.preventDefault();

    dropzone.classList.add('drag');

  });

});


['dragleave','drop'].forEach(ev=>{

  dropzone.addEventListener(ev,e=>{

    e.preventDefault();

    dropzone.classList.remove('drag');

  });

});


dropzone.addEventListener('drop',e=>{

  const file =
    e.dataTransfer.files[0];

  if(file){
    handleFile(file);
  }

});


resetBtn.addEventListener(
  'click',
  resetCSV
);


function resetCSV(){

  rawRows=[];
  statusRules={};

  fileInput.value='';

  fname.textContent=
    'No file selected';


  document.getElementById(
    'cards'
  ).innerHTML='';


  document.getElementById(
    'summary'
  ).innerHTML='';


  document.getElementById(
    'summary'
  ).style.display='none';


  document.getElementById(
    'toolbar'
  ).style.display='none';


  statusEl.style.display='none';


  document.getElementById(
    'emptyState'
  ).style.display='block';


  resetBtn.style.display='none';

}


function handleFile(file){

  fname.textContent=file.name;

  statusEl.style.display='none';


  Papa.parse(file,{

    header:true,
    skipEmptyLines:true,
    encoding:'UTF-8',


    complete:res=>{

      const rows =
        (res.data||[])
        .filter(r=>
          r['Consignment Id'] &&
          r['Consignment Id'].trim()
        );


      if(!rows.length){

        statusEl.textContent =
          'No valid parcel data found.';

        statusEl.style.display='block';

        return;

      }


      rawRows=rows;

      resetBtn.style.display=
        'inline-block';


      buildMapping();

      render();

    },


    error:err=>{

      statusEl.textContent =
        'CSV error: '+err.message;

      statusEl.style.display='block';

    }

  });

}


function guessRule(status){

  const s =
    (status||'')
    .toLowerCase()
    .trim();


  const r={

    delivered:false,
    hold:false,
    rto:false,
    exchange:false

  };


  if(!s)
    return r;


  if(s==='delivered'){

    r.delivered=true;

    return r;

  }


  if(s.includes('hold')){

    r.hold=true;

    return r;

  }


  if(
    s==='paid_return' ||
    s==='paidreturn' ||
    s.includes('exchange') ||
    s.includes('partial')
  ){

    r.delivered=true;
    r.exchange=true;

    return r;

  }


  if(
    s.includes('rto') ||
    s.includes('return_to') ||
    s.includes('undeliver') ||
    (
      s.includes('return') &&
      !s.includes('paid')
    )
  ){

    r.rto=true;

    return r;

  }


  return r;

}


function buildMapping(){

  const statuses=[

    ...new Set(

      rawRows
      .map(r=>
        (r['Order Status']||'').trim()
      )
      .filter(Boolean)

    )

  ];


  statusRules={};


  statuses.forEach(s=>{

    statusRules[s]=
      guessRule(s);

  });

}


function normName(s){

  return (s||'')
    .trim()
    .toLowerCase()
    .replace(/\s+/g,' ');

}


function rowPriority(row){

  if(row.delivered)
    return 0;

  if(row.hold)
    return 1;

  if(row.rto)
    return 2;

  return 3;

}


function groupByDA(){

  const groups={};


  rawRows.forEach(r=>{

    const rawName =
      (r['DA Name']||'').trim() ||
      'Unassigned';


    const emp =
      (r['DA Employee Id']||'').trim();


    const phone =
      (r['DA Phone']||'').trim();


    const key =
      normName(rawName);


    if(!groups[key]){

      groups[key]={

        name:rawName,
        emps:new Set(),
        phones:new Set(),
        rows:[]

      };

    }


    if(emp)
      groups[key].emps.add(emp);


    if(phone)
      groups[key].phones.add(phone);


    const cid =
      r['Consignment Id'].trim();


    const status =
      (r['Order Status']||'').trim();


    const rule =
      statusRules[status] ||
      {

        delivered:false,
        hold:false,
        rto:false,
        exchange:false

      };


    groups[key].rows.push({

      cid,
      ...rule

    });

  });


  return Object.values(groups)

    .map(g=>({

      ...g,

      emp:
        [...g.emps].join(', '),

      phone:
        [...g.phones].join(', '),

      rows:
        [...g.rows]
        .sort(
          (a,b)=>
            rowPriority(a)-
            rowPriority(b)
        )

    }))

    .sort((a,b)=>
      a.name.localeCompare(b.name)
    );

}


function daCols(da){

  return {

    assigned:
      da.rows.map(r=>r.cid),


    delivered:
      da.rows.map(r=>
        r.delivered
        ?r.cid
        :''
      ),


    hold:
      da.rows.map(r=>
        r.hold
        ?r.cid
        :''
      ),


    rto:
      da.rows.map(r=>
        r.rto
        ?r.cid
        :''
      ),


    exchange:
      da.rows.map(r=>
        r.exchange
        ?r.cid
        :''
      )

  };

}


function daCounts(da){

  const cols =
    daCols(da);


  const c={};


  CATS.forEach(cat=>{

    c[cat.key] =
      cols[cat.key]
      .filter(Boolean)
      .length;

  });


  return c;

}


function daBlockToTSV(da){

  const cols =
    daCols(da);


  const rowsN =
    da.rows.length;


  const lines=[];


  for(let i=0;i<rowsN;i++){

    lines.push(

      CATS
      .map(c=>
        cols[c.key][i]||''
      )
      .join('\t')

    );

  }


  return lines.join('\n');

}



function render(){

  const groups =
    groupByDA();


  const cardsEl =
    document.getElementById('cards');


  const emptyEl =
    document.getElementById('emptyState');


  const summaryEl =
    document.getElementById('summary');


  const toolbarEl =
    document.getElementById('toolbar');


  if(!groups.length){

    cardsEl.innerHTML='';

    emptyEl.style.display='block';

    summaryEl.style.display='none';

    toolbarEl.style.display='none';

    return;

  }


  emptyEl.style.display='none';

  summaryEl.style.display='grid';

  toolbarEl.style.display='flex';


  const totals={

    assigned:0,
    delivered:0,
    hold:0,
    rto:0,
    exchange:0

  };


  groups.forEach(g=>{

    const c =
      daCounts(g);


    CATS.forEach(cat=>{

      totals[cat.key]+=
        c[cat.key];

    });

  });


  summaryEl.innerHTML =

    CATS.map(c=>`

      <div
        class="card sum-card"
        style="--cat:${CAT_COLOR[c.key]}"
      >

        <div class="sum-number">
          ${totals[c.key]}
        </div>

        <div class="sum-label">
          ${c.label}
        </div>

      </div>

    `).join('');


  document.getElementById(
    'daCount'
  ).textContent =
    `${groups.length} DA · ${rawRows.length} parcels`;


  cardsEl.innerHTML='';


  groups.forEach(da=>{

    const cols =
      daCols(da);


    const counts =
      daCounts(da);


    const rowsN =
      da.rows.length;


    const card =
      document.createElement('div');


    card.className =
      'card da-card';


    let rowsHtml='';


    for(let i=0;i<rowsN;i++){

      rowsHtml+=`

        <tr>

          ${CATS.map(c=>`

            <td>
              ${cols[c.key][i]||''}
            </td>

          `).join('')}

        </tr>

      `;

    }


    card.innerHTML=`

      <div class="da-head">

        <div>

          <div class="da-name">
            ${da.name}
          </div>

          <div class="da-meta">

            ${da.emp||''}

            ${da.phone
              ?' · '+da.phone
              :''
            }

          </div>

        </div>


        <button class="copy-btn">
          Copy
        </button>

      </div>


      <div class="table-wrap">

        <table class="grid">

          <thead>

            <tr class="labels">

              ${CATS.map(c=>`

                <th class="${c.cls}">
                  ${c.label}
                </th>

              `).join('')}

            </tr>


            <tr class="counts">

              ${CATS.map(c=>`

                <td>
                  ${counts[c.key]}
                </td>

              `).join('')}

            </tr>

          </thead>


          <tbody>
            ${rowsHtml}
          </tbody>

        </table>

      </div>

    `;


    card
      .querySelector('.copy-btn')
      .addEventListener(
        'click',
        function(){

          copyText(
            daBlockToTSV(da),
            this
          );

        }
      );


    cardsEl.appendChild(card);

  });


  document.getElementById(
    'copyAllBtn'
  ).onclick=function(){

    const text =
      groups
      .map(da=>
        `# ${da.name}\n`+
        daBlockToTSV(da)
      )
      .join('\n\n');


    copyText(
      text,
      this
    );

  };

}


