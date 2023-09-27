//NOTE : This scipt will work ony when the given PDF is 1 page long, with one timetable in it

const PDFParser = require('pdf2json/pdfparser');

function parse(pdfBuffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', function (data) {
      try {
        pdfParserCallback(null, data);
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.on('pdfParser_dataError', function (err) {
      try {
        pdfParserCallback(err, null);
      } catch (err) {
        reject(err);
      }
    });

    function pdfParserCallback(err, data) {
      if (err) return reject(err);

      const myPages = [];
      const roomSchedule = {
        roomNum: "",
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
      };

      for (let p = 0; p < data.data.Pages.length; p++) {
        const page = data.data.Pages[p];
        const rows = [];
        const tableText = {}


        for (let t = 0; t < page.Texts.length; t++) {
          const text = page.Texts[t];
          let foundRow = false;

          for (let r = rows.length - 1; r >= 0; r--) {
              for (let i = 0; i < text.R.length; i++) {
                rows[r].data.push({
                  text: decodeURIComponent(text.R[i].T),
                  x: (text.x + text.w) / 2,
                  y: text.y
                });

                if(Math.round(text.x) == 14 && Math.round(text.y) == 2)
                  roomSchedule.roomNum = decodeURIComponent(text.R[i].T)

                dt = [decodeURIComponent(text.R[i].T), (text.x/12).toFixed(3)]
                if(!chkDuplicates(dt,roomSchedule) && decodeURIComponent(text.R[i].T).length > 5){
                switch (getDay(text.y / 6)) {
                    case 1:
                      roomSchedule.Mon.push(dt);
                      break;
                    case 2:
                      roomSchedule.Tue.push(dt);
                      break;
                    case 3:
                      roomSchedule.Wed.push(dt);
                      break;
                    case 4:
                      roomSchedule.Thu.push(dt);
                      break;
                    case 5:
                      roomSchedule.Fri.push(dt);
                      break;
                    case 6:
                      roomSchedule.Sat.push(dt);
                      break;
                  }
                }
              }
              foundRow = true;
          }

          if (!foundRow) {
            const row = {
              y: text.y,
              data: [],
            };

            for (let i = 0; i < text.R.length; i++) {
              row.data.push({
                text: decodeURIComponent(text.R[i].T),
                x: text.x,
                y: text.y
              });
            }

            rows.push(row);
          }
        }


        console.log(roomSchedule)
        myPages.push(roomSchedule);
      }

      const rows = [];
      console.log(myPages.length)
      resolve(rows, myPages);
    }

    pdfParser.parseBuffer(pdfBuffer);
  });
}


exports.PDFparse = parse;


function getDay(yval) {
  if (yval >= 1.2 && yval <= 1.8)
    return 1
  else if (yval > 1.8 && yval <= 2.5)
    return 2
  else if (yval > 2.5 && yval <= 3.1)
    return 3
  else if (yval > 3.1 && yval <= 3.7)
    return 4
  else if (yval > 3.7 && yval <= 4.3)
    return 5
  else if (yval > 4.3 && yval <= 5.3)
    return 6
}

function getHr(xval) {
  if (xval - Math.floor(xval) <= 0.7)
    return (Math.floor(xval))
  else
    return (Math.ceil(xval))
}

function chkDuplicates(obj1, obj2) {
  var obj1 = JSON.stringify(obj1);
  var obj2 = JSON.stringify(obj2);

  return obj2.includes(obj1);
}


