

module.exports = {
    URL_GENERATE: 'https://www.doctormoneyapps.com/connect/dashboard/view/pdf/page-generate',
    API_SERVICE: 'https://backapi.doctormoneyapps.com/service',
    API_STORAGE: 'https://storage.doctormoneyapps.com/files',
    ENDPOINT: "https://backapi.doctormoneyapps.com/a/pdf",
    API_UPLOAD_PUBLIC: "https://backapi.doctormoneyapps.com/process-files/v1/file/public",
    API_UPLOAD_PRIVATE: "https://backapi.doctormoneyapps.com/process-files/v1/file/private",
    getTmeplate: function (child) {
        return `<!DOCTYPE html>
        <html>
        
        <head>
          <meta charset="utf-8" />
          <title>Hello world!</title>
          <style>
            html {
              -webkit-print-color-adjust: exact;
            }
        
            body {
              padding: 0;
              margin: 0;
            }
        
            .page {
              width: 210mm;
              height: 296mm;
              background-repeat: no-repeat;
              background-size: contain;
              padding: 0;
              margin: 0;
              overflow: hidden;
              position: relative;
            }
        
            .drag-text {
              width: 100px;
              height: 20px;
              border-radius: 0px;
              margin: 10px;
              background-color: transparent;
              color: #000;
              touch-action: none;
              position: absolute;
              font-size: 12px;
              margin: 0;
              font-family: 'Sarabun', sans-serif;
            }
        
            .drag-image {
              width: 100px;
              height: 100px;
              border-radius: 0px;
              margin: 10px;
              background-color: transparent;
              color: #000;
              touch-action: none;
              position: absolute;
              margin: 0;
            }
        
            .drag-image img {
              width: 100%;
            }
        
            .drag-qrcode {
              width: 100px;
              height: 100px;
              border-radius: 0px;
              margin: 10px;
              background-color: transparent;
              color: #000;
              touch-action: none;
              position: absolute;
              margin: 0;
            }
        
            .drag-barcode {
              width: 100px;
              height: 100px;
              border-radius: 0px;
              margin: 10px;
              background-color: transparent;
              color: #000;
              touch-action: none;
              position: absolute;
              margin: 0;
              text-align: center;
            }

            .drag-barcode svg {
                width: 100%;
            }
        
            .drag-barcode p {
              font-family: 'Libre Barcode 39';
              font-size: 22px;
            }
        
        
            .drag-thai-card {
              width: 238px;
              height: 20px;
              border-radius: 0px;
              margin: 10px;
              background-color: transparent;
              color: #000;
              touch-action: none;
              position: absolute;
              margin: 0;
              display: flex;
            }
        
            .drag-thai-card span {
              width: 15px;
              height: 20px;
              border: 1px solid #000;
              display: block;
              text-align: center;
              margin: 0px;
              font-size: 12px;
              margin-left: -1px;
            }
        
            .drag-thai-card span:nth-child(1),
            .drag-thai-card span:nth-child(5),
            .drag-thai-card span:nth-child(10),
            .drag-thai-card span:nth-child(12) {
              margin-right: 14px;
            }
        
        
            .drag-check {
              width: 20px;
              height: 20px;
              border-radius: 0px;
              margin: 10px;
              background-color: transparent;
              color: #000;
              touch-action: none;
              position: absolute;
              margin: 0;
            }
        
            .element {
              border: 1px solid #e8ebf2;
              text-align: center;
              border-radius: 0.5rem;
              margin-bottom: 1rem;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              flex-direction: column;
              color: #424e79;
              position: relative;
            }
        
            .element::after {
              content: "";
              display: block;
              padding-top: 100%;
            }
        
            .element>div {
              position: absolute;
            }
        
            .element i {
              font-size: 20px;
            }
        
            .element p {
              font-size: 9px;
              margin-top: 5px;
              margin-bottom: 0;
            }
        
        
            .drag-text:hover,
            .drag-image:hover,
            .drag-qrcode:hover,
            .drag-barcode:hover,
            .drag-thai-card:hover,
            .drag-check:hover {
              border: 1px solid rgb(255, 102, 0);
            }
        
            .drag-text:hover::before,
            .drag-image:hover::before,
            .drag-qrcode:hover::before,
            .drag-barcode:hover::before,
            .drag-thai-card:hover::before,
            .drag-check:hover::before {
              content: attr(data-name);
              margin-right: 5px;
              position: absolute;
              top: -18px;
              background-color: rgb(255, 102, 0);
              padding: 0 5px;
              border-radius: 3px;
              left: -1px;
              color: #fff;
              font-size: 12px;
              white-space: nowrap
            }
        
            .drag-text.current,
            .drag-image.current,
            .drag-qrcode.current,
            .drag-barcode.current,
            .drag-thai-card.current,
            .drag-check.current {
              border: 1px solid rgb(0, 123, 37);
              border-radius: 3px;
            }
        
            .drag-text.current::before,
            .drag-image.current::before,
            .drag-qrcode.current::before,
            .drag-barcode.current::before,
            .drag-thai-card.current::before,
            .drag-check.current::before {
              content: attr(data-name);
              margin-right: 5px;
              position: absolute;
              top: -18px;
              background-color: rgb(0, 123, 37);
              padding: 0 5px;
              border-radius: 3px;
              left: -1px;
              color: #fff;
              font-size: 12px;
              white-space: nowrap
            }
        
            .text-left {
              text-align: left;
            }
        
            .text-center {
              text-align: center;
            }
        
            .text-right {
              text-align: right;
            }
        
            .input-name {
              display: none;
            }
        
            .input-example {
              display: none;
            }
        
            .input-text-type {
              display: none;
            }
        
            .input-text-align {
              display: none;
            }
        
            .input-text-color {
              display: none;
            }
        
            .input-text-style {
              display: none;
            }
        
            .input-text-size {
              display: none;
            }
        
            .btn-delete {
              display: none;
            }
        
            .navbar {
              background-color: #fff;
              box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);
            }
        
            .navbar-brand {
              background-color: #fff;
              border: none;
              box-shadow: none;
            }
        
            .form-check {
              padding-left: 0;
            }
        
            .form-check input {
              display: none;
            }
        
            .form-check-label {
              display: block;
              text-align: center;
              padding: 3px;
              border: 1px solid #e6edf3;
              border-radius: 5px;
              cursor: pointer;
            }
        
            .form-check input:checked+label,
            .form-check-label:hover {
              border-color: #082396;
              color: #082396;
            }
        
            #pills-page {
              height: calc(100vh - 100px);
              overflow-y: scroll;
            }
        
            #pills-custom {
              height: calc(100vh - 100px);
              overflow-y: scroll;
            }
        
            .content {
              height: calc(100vh - 74px);
              overflow-y: scroll;
            }
        
            .select2 {
              width: 100% !important;
            }
        
            .page-item {
              cursor: pointer;
            }
        
            .page-item.active,
            .page-item:hover {
              border: 1px solid #082396;
            }
          </style>
        </head>
        
        <body>
            ${child}
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script src="https://cdn.jsdelivr.net/jsbarcode/3.6.0/JsBarcode.all.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
                JsBarcode('.barcode').init();
            });
        </script>
        </body>
        </html>
        `
    }
}
