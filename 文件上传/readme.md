# 文件上传

## 通过 javascript 主动上传图片

**使用例子**

```javascript

function upload(file) {
  const data = new FormData();
  data.append('file', file);
  return axios.post('/upload', data)
}

const uploader = new Uploader(upload, {})
const urls = await uploader.chooseFile();
uploader.on('before', (urls)=>{
  console.log('即将上传')
})
uploader.on('progress', (urls)=>{
  console.log('正在上传')
})
uploader.on('end', (urls)=>{
  console.log('上传完成')
})
console.log(urls);

```