function createText(data) {
    var text = [];
    text.push(data);
		return new Blob(text, {
    	type: 'text/plain'
    });
};
function downloadFile(bolbContent, fileName) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var save = document.createElement('a');
        save.href = event.target.result;
        save.target = '_blank';
        save.download = fileName || 'file.dat';
        var clicEvent = new MouseEvent('click', {
            'view': window,
                'bubbles': true,
                'cancelable': true
        });
        save.dispatchEvent(clicEvent);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    };
    reader.readAsDataURL(bolbContent);
};
function createFile(){
  var data = $("#certificate").text();
  downloadFile(createText(data), 'certificate.crt');
}
