interface Options {
  count?: number;
  accept?: string;
  minSize?: number;
  maxSize?: number;
  autoUpload?: boolean;
}
interface UploaderOption extends Options {
  count: number;
}

type UploaderServer = (file: File) => Promise<string>

export default class Uploader {
  private options: UploaderOption;
  private el: HTMLInputElement;
  private uploadServer: UploaderServer;
  private urls: string[] = []

  constructor(uploadServer: UploaderServer, options: Options) {
    this.options = { 
      count: 1,
      autoUpload: true, 
      ...options 
    };
    this.uploadServer = uploadServer;
    this.el = this.createInput();
  }

  private createInput() {
    Array.from(document.querySelectorAll('.uploader-form-input')).forEach(
      el => {
        document.body.removeChild(el);
      },
    );
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

  public chooseFile(): Promise<string[] | File[]> {
    let el = this.el;
    document.body.appendChild(el);
    el.click();

    return new Promise((resolve, reject) => {
      // 由于无法监听input file 取消事件
      el.onchange = async (e: any) => {
        let files = e.target.files || [];
        files = Array.prototype.slice.call(files);
        if (files.length === 0) {
          return;
        }
        try {
          this.checkFile(files);
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

      function onWindowBlur() {
        const checkFileCancel = async (
          repeatTime: number,
        ): Promise<any> => {
          repeatTime -= 1;
          setTimeout(() => {
            if (repeatTime > 0 && !el.files!.length) {
              return checkFileCancel(repeatTime);
            } else if (repeatTime <= 0) {
              window.removeEventListener('focus', onWindowBlur);
              resolve([]);
            }
            return;
          }, 50);
        };
        const MAX_REPEAT_TIME = 20;
        checkFileCancel(MAX_REPEAT_TIME);
      }

      window.addEventListener('focus', onWindowBlur);
    });
  }

  public onProgress(fn: (urls: string[])=>any) {
    fn(this.urls)
  }


  private async uploadFiles(files: File[]) {
    const results = files.map(file => ({ file }));
    const urls: string[] = [];
    // 为保证progress事件的url是按上传顺序触发, 此处不能并行上传
    for (let result of results) {
      const url = await this.uploadFile(result);
      urls.push(url);
    }
    return urls;
  }

  private async uploadFile(result: { file: File }) {
    return this.uploadServer(result.file);
  }

  private checkFile(files: File[]) {
    const typeError = this.checkTypes(files);
    if (typeError) {
      throw new Error(typeError);
    }

    const sizeError = this.checkSize(files);
    if (sizeError) {
      throw new Error(sizeError);
    }
  }

  private checkTypes(files: File[]) {
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


  private checkSize(files: File[]) {
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