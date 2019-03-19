export function downloadIamge(imgsrc, name) {
  let image = new Image();
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = function() {
    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);
    let url = canvas.toDataURL('image/png');
    let a = document.createElement('a'); 
    let event = new MouseEvent('click');
    a.download = name || 'photo'; 
    a.href = url;
    a.dispatchEvent(event);
  };
  image.src = imgsrc;
}
