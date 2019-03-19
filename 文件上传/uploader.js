// interface Options {
//   uploadAPI?: (file: File)=>any; // API.uploadByQiniu(result.file); 上传文件到后端的接口
//   count?: number;
//   accept?: string;
//   minSize?: number;
//   maxSize?: number;
//   autoUpload?: boolean;
// }

const defaultOptions = {
  count: 1,
  autoUpload: true,
};

export default class Uploader {
  options = {};
  el = null;

  constructor(options) {
    this.options = { ...defaultOptions, ...options };
    this.el = this.createInput();
  }

  createInput() {
    const el = document.createElement('input');
    el.className = 'uploader-form-input';
    el.type = 'file';
    el.style.display = 'block';
    el.style.opacity = '0';
    el.style.width = '0';
    el.style.height = '0';
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.overflow = 'hidden';
    el.multiple = this.options.count > 1;
    if (this.options.accept) {
      el.accept = this.options.accept;
    }
    return el;
  }

  chooseFile() {
    let el = this.el;
    document.body.appendChild(el);
    el.click();
    return new Promise((resolve, reject) => {
      el.onchange = async (e) => {
        let files = e.target.files || [];
        files = Array.prototype.slice.call(files);
        if (files.length === 0) {
          return;
        }
        try {
          this.checkFile(files);
          // 需要对文件进行操作，例如压缩图片，可压缩图片后把处理后的图片组传给 uploadFiles
          if (this.options.autoUpload) {
            const urls = await this.uploadFiles(files);
            resolve(urls);
          } else {
            resolve(files);
          }
        } catch (err) {
          reject(err);
        }
        el.onchange = null;
        document.body.removeChild(el);
      };
    });
  }

  async uploadFiles(files) {
    const results = files.map(file => ({ file }));
    const urls = [];
    // 为保证progress事件的url是按上传顺序触发, 此处不能并行上传
    for (let result of results) {
      const url = await this.uploadFile(result);
      urls.push(url);
    }
    return urls;
  }

  uploadFile(result) {
    try {
     return this.options.uploadAPI(result.file);
    } catch (err) {
      // 处理错误
      console.log(err.message);
    }
  }

  checkFile(files) {
    const typeError = this.checkTypes(files);
    if (typeError) {
      throw new Error(typeError);
    }

    const sizeError = this.checkSize(files);
    if (sizeError) {
      throw new Error(sizeError);
    }
  }

  checkTypes(files) {
    const accept = this.options.accept;
    if (accept) {
      let fileType = '';
      if (accept.indexOf('image') !== -1) {
        fileType = 'image';
      } else if (accept.indexOf('video') !== -1) {
        fileType = 'video';
      }
      for (let file of files) {
        if (file.type.indexOf(fileType) !== 0) {
          return '上传文件类型错误!';
        }
      }
    }
    return null;
  }

  checkSize(files) {
    const options = this.options;
    for (let file of files) {
      if (options.minSize && file.size < options.minSize) {
        return `上传文件不能小于 ${options.minSize}`;
      }
      if (options.maxSize && file.size > options.maxSize) {
        return `上传文件不能小于 ${options.maxSize}`;
      }
    }
    return null;
  }
}