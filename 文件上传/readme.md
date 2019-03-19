# 文件上传

## 通过 javascript 主动上传图片

**使用例子**

```javascript

function upload(file) {
  const data = new FormData();
  data.append('file', file);
  return axios.post('/upload', data)
}

const uploader = new Uploader({
  uploadAPI: upload
})
const urls = await uploader.chooseFile();
console.log(urls);

```